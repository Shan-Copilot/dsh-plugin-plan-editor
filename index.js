/**
 * Plan Editor — host half.
 *
 * Owns the `plan` tool, the plan document store, and the small same-origin HTTP
 * surface the editable sidebar tab uses to load and save a plan. Plan documents
 * live under `$DSH_HOME/plans/plan-studio/<sessionId>/<planId>.md`; the session
 * log records every generated plan through the tool call, while user edits are
 * saved back to the same Markdown file so the next `plan` read sees them.
 */
import { createHash } from 'node:crypto'
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, appendFileSync } from 'node:fs'
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, basename, join } from 'node:path'

const PLUGIN_ID = '@local/plan-editor'
const TOOL_NAME = 'plan'
const ROUTE_PREFIX = '/plan-studio'
const MAX_MARKDOWN_BYTES = 512 * 1024
const SESSION_ID = /^[A-Za-z0-9_-]{1,160}$/
const PLAN_ID = /^[a-z0-9][a-z0-9-]{0,79}$/

const FOCUS_SCRIPT = `param(
  [string]$Title = '',
  [string]$ClassName = '',
  [int]$Fallback = 0
)
$code = @'
using System;
using System.Runtime.InteropServices;
using System.Text;
public class PlanEditorFocus {
  public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
  [DllImport("user32.dll")] private static extern bool EnumWindows(EnumWindowsProc callback, IntPtr lParam);
  [DllImport("user32.dll")] private static extern bool IsWindowVisible(IntPtr hWnd);
  [DllImport("user32.dll")] private static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);
  [DllImport("user32.dll")] private static extern int GetClassName(IntPtr hWnd, StringBuilder text, int count);
  [DllImport("user32.dll")] private static extern bool SetForegroundWindow(IntPtr hWnd);
  [DllImport("user32.dll")] private static extern bool ShowWindow(IntPtr hWnd, int command);
  [DllImport("user32.dll")] private static extern void keybd_event(byte key, byte scan, uint flags, UIntPtr extra);
  public static string Activate(string title, string className, bool fallback) {
    IntPtr match = IntPtr.Zero;
    IntPtr first = IntPtr.Zero;
    EnumWindows((window, _) => {
      if (!IsWindowVisible(window)) return true;
      var kind = new StringBuilder(256);
      GetClassName(window, kind, 256);
      if (kind.ToString() != className) return true;
      if (first == IntPtr.Zero) first = window;
      var text = new StringBuilder(512);
      GetWindowText(window, text, 512);
      if (title.Length == 0 || text.ToString().IndexOf(title, StringComparison.OrdinalIgnoreCase) >= 0) {
        match = window;
        return false;
      }
      return true;
    }, IntPtr.Zero);
    IntPtr target = match != IntPtr.Zero ? match : (fallback ? first : IntPtr.Zero);
    if (target == IntPtr.Zero) return "none";
    keybd_event(0x12, 0, 0, UIntPtr.Zero);
    ShowWindow(target, 9);
    SetForegroundWindow(target);
    keybd_event(0x12, 0, 2, UIntPtr.Zero);
    return "ok";
  }
}
'@
Add-Type -TypeDefinition $code
$result = [PlanEditorFocus]::Activate($Title, $ClassName, ($Fallback -ne 0))
Write-Output $result
`

/** Services that must exist before this plugin activates. */
export const inject = ['tools']

/** Host plugin body. */
export function apply(ctx) {
  const planService = createPlanService()

  ctx.effect(
    () => ctx.tools.register(createPlanTool(planService)),
    'plan-editor: plan tool',
  )

  ctx.inject(['systemPrompt'], (promptCtx) => {
    promptCtx.effect(
      () => promptCtx.systemPrompt.section({
        name: 'tool:plan-editor',
        order: 2500,
        text: [
          '## Plan documents',
          '',
          'When the user asks you to draft, revise, or present a plan (an implementation plan, design, roadmap, proposal, migration outline, or checklist), call the `plan` tool instead of pasting the whole plan into chat.',
          '',
          '- `action: "present"` creates or updates the plan card. Pass the complete Markdown in `markdown`, starting with a single `# Title`. Pass `plan_id` from an earlier result to revise that exact plan; omit it to create a plan for a new title.',
          '- `action: "read"` returns the current Markdown. Omit `plan_id` to read the most recently updated plan in this session. Use it before responding whenever the user says they edited the plan or asks you to review their changes.',
          '- `action: "list"` lists the session\'s plans when you need an id.',
          '',
          'The plan appears as a card in the conversation and opens in the right sidebar Markdown editor. The user can edit it there; those edits are written back to the plan document, so read before revising. Keep the H1 title stable unless the user asks to rename it. After presenting a plan, summarize it briefly in chat and invite the user to edit it there; do not repeat the whole plan. This workflow is for discussion documents; when the session is in plan mode, the approval flow still uses `exit_plan_mode`.',
        ].join('\n'),
      }),
      'plan-editor: prompt section',
    )
  })

  ctx.inject(['webServer'], (webCtx) => {
    webCtx.effect(
      () => webCtx.webServer.register({
        kind: 'prefix',
        path: ROUTE_PREFIX,
        handler: (req, res) => handlePlanRequest(planService, req, res),
      }),
      'plan-editor: http route',
    )
  })
}

/** Build the model-facing `plan` tool without depending on harness packages. */
function createPlanTool(planService) {
  const planSummaryProperties = {
    planId: { type: 'string' },
    title: { type: 'string' },
    path: { type: 'string' },
    revision: { type: 'string' },
    updatedAt: { type: 'number' },
  }

  return {
    name: TOOL_NAME,
    description: 'Create, read, or list a Markdown plan document displayed as an interactive card in the conversation and editable in the right sidebar. Use action "present" with complete Markdown whenever the user asks for a plan or plan revision; use action "read" before answering when the user says they edited the plan. Plans are stored per session and survive reloads.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        action: {
          type: 'string',
          enum: ['present', 'read', 'list'],
          description: 'present: create/update and show a card; read: return current Markdown; list: list this session\'s plans.',
        },
        markdown: {
          type: 'string',
          description: 'Complete plan Markdown for action "present". Start with a single "# Title" heading.',
        },
        title: {
          type: 'string',
          description: 'Optional fallback title when the Markdown has no H1 heading. Prefer putting the title in the Markdown.',
        },
        plan_id: {
          type: 'string',
          description: 'Existing plan id to update or read. Omit to create a new plan (present) or read the latest plan (read).',
        },
      },
      required: ['action'],
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          action: { type: 'string' },
          planId: { type: 'string' },
          title: { type: 'string' },
          path: { type: 'string' },
          revision: { type: 'string' },
          updatedAt: { type: 'number' },
          markdown: { type: 'string' },
          preview: { type: 'array', items: { type: 'string' } },
          plans: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: planSummaryProperties,
              required: ['planId', 'title', 'path', 'revision', 'updatedAt'],
            },
          },
        },
        required: ['action'],
      },
      render(args, value) {
        if (value.action === 'present') {
          return [{
            type: 'text',
            text: `Plan saved: ${JSON.stringify(value.title)} (plan_id: ${value.planId}, path: ${value.path}). The user sees a plan card and can edit it in the sidebar. Use action "read" to review their edits.`,
          }]
        }
        if (value.action === 'read') {
          return [{
            type: 'text',
            text: `Plan ${JSON.stringify(value.title)} (plan_id: ${value.planId}, revision: ${value.revision})\n\n${value.markdown ?? ''}`,
          }]
        }
        const plans = value.plans ?? []
        return [{
          type: 'text',
          text: plans.length === 0
            ? 'No plans exist in this session yet.'
            : ['Plans in this session:', ...plans.map((plan) => `- ${plan.title} (plan_id: ${plan.planId}, updated: ${new Date(plan.updatedAt).toISOString()})`)].join('\n'),
        }]
      },
      presentationMeta(_args, value) {
        const meta = { action: value.action }
        if (value.planId !== undefined) meta.planId = value.planId
        if (value.title !== undefined) meta.title = value.title
        if (value.path !== undefined) meta.path = value.path
        if (value.updatedAt !== undefined) meta.updatedAt = value.updatedAt
        if (value.preview !== undefined) meta.preview = value.preview
        return meta
      },
    },
    async execute(args, exec) {
      const agent = exec.agent
      if (agent === undefined) throw new Error('plan: this tool requires an active session')
      const depth = agent.session.header.delegationDepth
      if (typeof depth === 'number' && depth > 0) {
        throw new Error('plan: plan documents belong to the top-level session; a delegated subagent cannot own one')
      }
      const sessionId = agent.session.id
      if (!SESSION_ID.test(sessionId)) throw new Error('plan: the session id is not addressable')

      const action = typeof args.action === 'string' ? args.action : 'present'
      if (action === 'present') {
        if (typeof args.markdown !== 'string' || args.markdown.trim().length === 0) {
          throw new Error('plan: action "present" requires non-empty markdown')
        }
        if (Buffer.byteLength(args.markdown, 'utf8') > MAX_MARKDOWN_BYTES) {
          throw new Error(`plan: markdown exceeds the ${MAX_MARKDOWN_BYTES} byte limit`)
        }
        const markdown = normalizeMarkdown(args.markdown)
        const explicitTitle = typeof args.title === 'string' ? args.title.trim() : ''
        const title = deriveTitle(markdown) || explicitTitle || 'Untitled plan'
        const planId = typeof args.plan_id === 'string' && args.plan_id !== ''
          ? assertPlanId(args.plan_id)
          : generatedPlanId(sessionId, title)
        const plan = await planService.write(sessionId, planId, markdown)
        return {
          action: 'present',
          planId: plan.planId,
          title: plan.title,
          path: plan.path,
          revision: plan.revision,
          updatedAt: plan.updatedAt,
          preview: plan.preview,
        }
      }

      if (action === 'read') {
        const requested = typeof args.plan_id === 'string' && args.plan_id !== ''
          ? assertPlanId(args.plan_id)
          : undefined
        const plan = requested === undefined
          ? await planService.latest(sessionId)
          : await planService.read(sessionId, requested)
        if (plan === undefined) {
          throw new Error(requested === undefined
            ? 'plan: no plan exists in this session yet'
            : `plan: no plan named "${requested}" exists in this session`)
        }
        return {
          action: 'read',
          planId: plan.planId,
          title: plan.title,
          path: plan.path,
          revision: plan.revision,
          updatedAt: plan.updatedAt,
          markdown: plan.markdown,
        }
      }

      if (action === 'list') {
        const plans = await planService.list(sessionId)
        return {
          action: 'list',
          plans: plans.map((plan) => ({
            planId: plan.planId,
            title: plan.title,
            path: plan.path,
            revision: plan.revision,
            updatedAt: plan.updatedAt,
          })),
        }
      }

      throw new Error('plan: action must be "present", "read", or "list"')
    },
  }
}

/** Plan document store over one DSH home. */
function createPlanService() {
  return {
    async write(sessionId, planId, markdown) {
      const dir = sessionDir(sessionId)
      await mkdir(dir, { recursive: true })
      const file = join(dir, `${assertPlanId(planId)}.md`)
      await writeFile(file, markdown, 'utf8')
      const info = await stat(file)
      return describe(sessionId, planId, markdown, info.mtimeMs)
    },
    async read(sessionId, planId) {
      const file = planPath(sessionId, planId)
      try {
        const markdown = await readFile(file, 'utf8')
        const info = await stat(file)
        return describe(sessionId, planId, markdown, info.mtimeMs)
      } catch (error) {
        if (error instanceof Error && error.code === 'ENOENT') return undefined
        throw error
      }
    },
    async latest(sessionId) {
      const plans = await this.list(sessionId)
      return plans[0]
    },
    async list(sessionId) {
      const dir = sessionDir(sessionId)
      let entries
      try {
        entries = await readdir(dir, { withFileTypes: true })
      } catch (error) {
        if (error instanceof Error && error.code === 'ENOENT') return []
        throw error
      }
      const plans = []
      for (const entry of entries) {
        if (!entry.isFile() || !entry.name.endsWith('.md')) continue
        const planId = entry.name.slice(0, -3)
        if (!PLAN_ID.test(planId)) continue
        const plan = await this.read(sessionId, planId)
        if (plan !== undefined) plans.push(plan)
      }
      plans.sort((left, right) => right.updatedAt - left.updatedAt || left.planId.localeCompare(right.planId))
      return plans
    },
  }
}

/** Describe one stored plan. */
function describe(sessionId, planId, markdown, updatedAt) {
  return {
    planId,
    title: deriveTitle(markdown) || 'Untitled plan',
    path: planPath(sessionId, planId),
    markdown,
    revision: createHash('sha256').update(markdown, 'utf8').digest('hex').slice(0, 20),
    updatedAt,
    preview: buildPreview(markdown),
  }
}

/** Absolute plan directory under DSH_HOME. */
function plansRoot() {
  const home = process.env.DSH_HOME || join(homedir(), '.dsh')
  return join(home, 'plans', 'plan-studio')
}

function sessionDir(sessionId) {
  if (!SESSION_ID.test(sessionId)) throw new Error('plan: invalid session id')
  return join(plansRoot(), sessionId)
}

function planPath(sessionId, planId) {
  return join(sessionDir(sessionId), `${assertPlanId(planId)}.md`)
}

function assertPlanId(planId) {
  if (!PLAN_ID.test(planId)) {
    throw new Error(`plan: invalid plan id ${JSON.stringify(planId)}; expected lowercase letters, digits, and hyphens`)
  }
  return planId
}

/** Stable ASCII id for a title within a session. */
function generatedPlanId(sessionId, title) {
  const slug = title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
  const hash = createHash('sha1')
    .update(`${sessionId}\n${title}`, 'utf8')
    .digest('hex')
    .slice(0, 8)
  return `${slug || 'plan'}-${hash}`
}

/** Normalize line endings without changing authored content. */
function normalizeMarkdown(markdown) {
  return markdown.replace(/\r\n?/g, '\n')
}

/** First H1 outside frontmatter and fenced code, else the first content line. */
function deriveTitle(markdown) {
  const lines = markdown.split('\n')
  let inFence = false
  let index = 0
  if (lines[0]?.trim() === '---') {
    index = 1
    while (index < lines.length && lines[index].trim() !== '---' && lines[index].trim() !== '...') index += 1
    index += 1
  }
  for (; index < lines.length; index += 1) {
    const line = lines[index]
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue
    const heading = /^\s{0,3}#\s+(.+?)\s*#*\s*$/.exec(line)
    if (heading !== null) return cleanTitle(heading[1]) || 'Untitled plan'
  }
  let fallbackInFence = false
  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) {
      fallbackInFence = !fallbackInFence
      continue
    }
    if (fallbackInFence || /^\s*---\s*$/.test(line)) continue
    const candidate = cleanTitle(stripInline(line))
    if (candidate !== '' && !/^[-*_]+$/.test(candidate)) return candidate.slice(0, 120)
  }
  return ''
}

function cleanTitle(value) {
  return value
    .replace(/[*_~`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160)
}

/** Short plain-text preview of the Markdown body. */
function buildPreview(markdown) {
  const lines = markdown.split('\n')
  const preview = []
  let inFence = false
  let index = 0
  if (lines[0]?.trim() === '---') {
    index = 1
    while (index < lines.length && lines[index].trim() !== '---' && lines[index].trim() !== '...') index += 1
    index += 1
  }
  for (; index < lines.length && preview.length < 3; index += 1) {
    const line = lines[index]
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue
    if (line.trim() === '' || /^\s{0,3}#{1,6}\s+/.test(line)) continue
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) continue
    if (/^\s*\|?[\s:|-]*-{3,}[\s:|-]*\|?\s*$/.test(line)) continue
    const text = stripInline(line
      .replace(/^\s*>\s?/, '')
      .replace(/^\s*(?:[-*+]|\d+[.)])\s+/, '')
      .replace(/^\s*\[[ xX]\]\s+/, ''))
    if (text !== '') preview.push(text.slice(0, 220))
  }
  return preview
}

function stripInline(value) {
  return value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Same-origin JSON surface for the sidebar editor. */
async function handlePlanRequest(planService, req, res) {
  try {
    if (!isSameOrigin(req)) return respond(res, 403, { ok: false, error: { code: 'forbidden', message: 'cross-origin plan access is not allowed' } })
    const url = new URL(req.url ?? '/', 'http://localhost')
    const querySessionId = url.searchParams.get('sessionId') ?? ''

    if (req.method === 'GET' && url.pathname === `${ROUTE_PREFIX}/plan`) {
      if (!SESSION_ID.test(querySessionId)) return respond(res, 400, { ok: false, error: { code: 'invalid_session', message: 'missing or invalid sessionId' } })
      const planId = url.searchParams.get('planId') ?? ''
      if (!PLAN_ID.test(planId)) return respond(res, 400, { ok: false, error: { code: 'invalid_plan', message: 'missing or invalid planId' } })
      const plan = await planService.read(querySessionId, planId)
      if (plan === undefined) return respond(res, 404, { ok: false, error: { code: 'not_found', message: 'plan not found' } })
      return respond(res, 200, { ok: true, plan })
    }

    if (req.method === 'GET' && url.pathname === `${ROUTE_PREFIX}/list`) {
      if (!SESSION_ID.test(querySessionId)) return respond(res, 400, { ok: false, error: { code: 'invalid_session', message: 'missing or invalid sessionId' } })
      return respond(res, 200, { ok: true, plans: (await planService.list(querySessionId)).map(({ markdown: _markdown, ...plan }) => plan) })
    }

    if (req.method === 'POST' && url.pathname === `${ROUTE_PREFIX}/save`) {
      const contentType = String(req.headers['content-type'] ?? '')
      if (!/^application\/json(?:;|$)/i.test(contentType)) {
        return respond(res, 415, { ok: false, error: { code: 'unsupported_media_type', message: 'expected application/json' } })
      }
      const body = await readJson(req)
      const sessionId = typeof body.sessionId === 'string' && body.sessionId !== '' ? body.sessionId : querySessionId
      if (!SESSION_ID.test(sessionId)) return respond(res, 400, { ok: false, error: { code: 'invalid_session', message: 'missing or invalid sessionId' } })
      const planId = typeof body.planId === 'string' ? body.planId : ''
      if (!PLAN_ID.test(planId)) return respond(res, 400, { ok: false, error: { code: 'invalid_plan', message: 'missing or invalid planId' } })
      if (typeof body.markdown !== 'string') return respond(res, 400, { ok: false, error: { code: 'invalid_markdown', message: 'markdown must be a string' } })
      if (Buffer.byteLength(body.markdown, 'utf8') > MAX_MARKDOWN_BYTES) return respond(res, 413, { ok: false, error: { code: 'too_large', message: 'markdown is too large' } })
      const markdown = normalizeMarkdown(body.markdown)
      const current = await planService.read(sessionId, planId)
      if (current === undefined) return respond(res, 404, { ok: false, error: { code: 'not_found', message: 'plan not found' } })
      const baseRevision = typeof body.baseRevision === 'string' ? body.baseRevision : ''
      if (baseRevision !== '' && baseRevision !== current.revision) {
        return respond(res, 409, { ok: false, error: { code: 'conflict', message: 'the plan changed since it was loaded' }, plan: current })
      }
      const plan = await planService.write(sessionId, planId, markdown)
      return respond(res, 200, { ok: true, plan })
    }

    if (req.method === 'POST' && url.pathname === `${ROUTE_PREFIX}/open`) {
      const contentType = String(req.headers['content-type'] ?? '')
      if (!/^application\/json(?:;|$)/i.test(contentType)) {
        return respond(res, 415, { ok: false, error: { code: 'unsupported_media_type', message: 'expected application/json' } })
      }
      const body = await readJson(req)
      const sessionId = typeof body.sessionId === 'string' && body.sessionId !== '' ? body.sessionId : querySessionId
      if (!SESSION_ID.test(sessionId)) return respond(res, 400, { ok: false, error: { code: 'invalid_session', message: 'missing or invalid sessionId' } })
      const planId = typeof body.planId === 'string' ? body.planId : ''
      if (!PLAN_ID.test(planId)) return respond(res, 400, { ok: false, error: { code: 'invalid_plan', message: 'missing or invalid planId' } })
      const target = body.target === 'explorer' || body.target === 'vscode' ? body.target : ''
      if (target === '') return respond(res, 400, { ok: false, error: { code: 'invalid_target', message: 'target must be "explorer" or "vscode"' } })
      const plan = await planService.read(sessionId, planId)
      if (plan === undefined) return respond(res, 404, { ok: false, error: { code: 'not_found', message: 'plan not found' } })
      try {
        await launchPlanPath(plan.path, target)
      } catch (error) {
        return respond(res, 500, {
          ok: false,
          error: { code: 'launch_failed', message: error instanceof Error ? error.message : String(error) },
        })
      }
      return respond(res, 200, { ok: true, target })
    }

    return respond(res, 404, { ok: false, error: { code: 'unknown_route', message: 'unknown plan-studio route' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return respond(res, 500, { ok: false, error: { code: 'internal', message } })
  }
}

async function launchPlanPath(filePath, target) {
  if (target === 'explorer') return revealPlanPath(filePath)
  if (target !== 'vscode') throw new Error(`unsupported open target: ${target}`)

  if (process.platform === 'win32') {
    const candidates = [
      process.env.LOCALAPPDATA ? join(process.env.LOCALAPPDATA, 'Programs', 'Microsoft VS Code', 'Code.exe') : '',
      process.env.ProgramFiles ? join(process.env.ProgramFiles, 'Microsoft VS Code', 'Code.exe') : '',
      process.env['ProgramFiles(x86)'] ? join(process.env['ProgramFiles(x86)'], 'Microsoft VS Code', 'Code.exe') : '',
    ].filter((candidate) => candidate !== '')
    const executable = candidates.find((candidate) => existsSync(candidate))
    if (executable !== undefined) {
      await launchDetached(executable, ['--new-window', filePath])
      await focusVSCode(filePath)
      return
    }
    if (commandExists('code')) {
      await launchDetached('cmd.exe', ['/d', '/s', '/c', 'code', '--new-window', filePath], true)
      await focusVSCode(filePath)
      return
    }
    throw new Error('VS Code was not found (Code.exe or the "code" command)')
  }

  if (process.platform === 'darwin') {
    const app = '/Applications/Visual Studio Code.app'
    if (existsSync(app)) return launchDetached('open', ['-a', 'Visual Studio Code', filePath])
    if (commandExists('code')) return launchDetached('code', ['--new-window', filePath])
    throw new Error('VS Code was not found (Visual Studio Code.app or the "code" command)')
  }

  if (commandExists('code')) return launchDetached('code', ['--new-window', filePath])
  throw new Error('VS Code was not found (the "code" command)')
}

async function focusVSCode(filePath) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await delay(500)
    if (await activateWindow(basename(filePath), 'Chrome_WidgetWin_1', false)) return
  }
}

async function revealPlanPath(filePath) {
  if (process.platform === 'win32') {
    await launchDetached('explorer.exe', [`/select,${filePath}`])
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await delay(500)
      if (await activateWindow(basename(dirname(filePath)), 'CabinetWClass', true)) return
    }
    return
  }
  if (process.platform === 'darwin') {
    await launchDetached('open', ['-R', filePath])
    return
  }
  await launchDetached('xdg-open', [dirname(filePath)])
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function activateWindow(title, className, allowFallback) {
  const root = join(plansRoot(), '..', '..')
  const scriptPath = join(root, 'plan-editor-focus.ps1')
  const logPath = join(root, 'plan-editor-focus.log')
  try {
    await writeFile(scriptPath, FOCUS_SCRIPT, 'utf8')
  } catch {
    return false
  }
  return new Promise((resolve) => {
    let child
    try {
      child = spawn('powershell.exe', [
        '-NoProfile',
        '-NonInteractive',
        '-ExecutionPolicy',
        'Bypass',
        '-File',
        scriptPath,
        '-Title',
        String(title),
        '-ClassName',
        String(className),
        '-Fallback',
        allowFallback ? '1' : '0',
      ], {
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
      })
    } catch {
      resolve(false)
      return
    }
    let output = ''
    let failure = ''
    child.stdout?.on('data', (chunk) => { output += chunk })
    child.stderr?.on('data', (chunk) => { failure += chunk })
    child.once('error', () => resolve(false))
    child.once('exit', () => {
      if (failure !== '' || output.trim() !== 'ok') {
        try {
          appendFileSync(logPath, `${new Date().toISOString()} title=${JSON.stringify(title)} class=${className} fallback=${allowFallback} out=${JSON.stringify(output.trim())} err=${JSON.stringify(failure.trim())}\n`, 'utf8')
        } catch {
          // Focus logging is diagnostic only.
        }
      }
      resolve(output.trim() === 'ok')
    })
  })
}

function commandExists(command) {
  const finder = process.platform === 'win32' ? 'where.exe' : 'which'
  try {
    return spawnSync(finder, [command], { stdio: 'ignore', windowsHide: true }).status === 0
  } catch {
    return false
  }
}

function launchDetached(command, args, hideWindow = false) {
  return new Promise((resolve, reject) => {
    let child
    try {
      child = spawn(command, args, { detached: true, stdio: 'ignore', windowsHide: hideWindow })
    } catch (error) {
      reject(error)
      return
    }
    let settled = false
    child.once('error', (error) => {
      if (settled) return
      settled = true
      reject(error)
    })
    child.once('spawn', () => {
      if (settled) return
      settled = true
      child.unref()
      resolve()
    })
  })
}

function isSameOrigin(req) {
  const site = req.headers['sec-fetch-site']
  if (typeof site === 'string' && site !== 'same-origin' && site !== 'none') return false
  const origin = req.headers.origin
  if (typeof origin !== 'string' || origin === '') return true
  try {
    return new URL(origin).host === req.headers.host
  } catch {
    return false
  }
}

async function readJson(req) {
  const expected = Number(req.headers['content-length'] ?? 0)
  if (Number.isFinite(expected) && expected > MAX_MARKDOWN_BYTES + 4096) throw new Error('request body is too large')
  const chunks = []
  let total = 0
  for await (const chunk of req) {
    total += chunk.length
    if (total > MAX_MARKDOWN_BYTES + 4096) throw new Error('request body is too large')
    chunks.push(chunk)
  }
  const text = Buffer.concat(chunks).toString('utf8')
  if (text.trim() === '') return {}
  const value = JSON.parse(text)
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error('request body must be a JSON object')
  return value
}

function respond(res, status, body) {
  const payload = JSON.stringify(body)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
    'cache-control': 'no-store',
  })
  res.end(payload)
  return undefined
}

/** Exported for tests and diagnostics. */
export const internals = {
  PLUGIN_ID,
  TOOL_NAME,
  ROUTE_PREFIX,
  deriveTitle,
  buildPreview,
  generatedPlanId,
  plansRoot,
}
