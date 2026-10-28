window.__ModuleLoader__.load({
  id: '@local/plan-editor',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useCallback, useEffect, useMemo, useRef, useState } = React

    const PLUGIN_ID = '@local/plan-editor'
    const NS = 'plan-editor'
    const ADDRESS_PREFIX = 'dsh-resource://plan-studio/'
    const API_PREFIX = '/plan-studio'
    const PLAN_CARD_KIND = 'plan-studio-card'

    const zh = {
      'meta.title': '计划编辑器',
      'meta.description': '在会话中显示计划卡片，并在右侧 Markdown 编辑器中查看和修改计划。',
      'tab.title': '计划',
      'tab.untitled': '未命名计划',
      'card.badge': '计划',
      'card.open': '打开',
      'card.hint': '在侧边栏查看和编辑',
      'card.preparing': '正在准备计划…',
      'card.generating': '正在生成计划内容…',
      'card.read': '已读取计划',
      'card.list': '计划列表',
      'card.failed': '计划操作失败',
      'card.empty': '暂无内容',
      'card.tooltip': '打开计划：{title}',
      'editor.mode': '查看或编辑',
      'editor.view': '查看',
      'editor.edit': '编辑',
      'editor.discard': '撤销',
      'editor.saving': '保存中…',
      'editor.saved': '已保存',
      'editor.unsaved': '未保存',
      'editor.statusSaved': '已保存 · {time}',
      'editor.statusConflict': '有冲突',
      'editor.loading': '正在读取计划…',
      'editor.failed': '无法读取计划',
      'editor.notFound': '这份计划已不存在',
      'editor.retry': '重试',
      'editor.placeholder': '在此编写计划…',
      'editor.lines': '{count} 行',
      'editor.chars': '{count} 字符',
      'editor.conflict': '计划已在别处更新（可能是对模型的回复或另一个窗口）。',
      'editor.reload': '载入最新',
      'editor.overwrite': '仍然覆盖',
      'editor.confirmDiscard': '放弃未保存的修改？',
      'editor.saveFailed': '保存失败：{message}',
      'editor.copy': '复制',
      'editor.copied': '已复制',
      'editor.empty': '这份计划还是空的。',
      'editor.path': '计划文件',
      'find.title': '查找和替换',
      'find.placeholder': '查找',
      'find.replacePlaceholder': '替换',
      'find.matchCase': '区分大小写',
      'find.wholeWord': '全字匹配',
      'find.regex': '使用正则表达式',
      'find.prev': '上一个匹配',
      'find.next': '下一个匹配',
      'find.close': '关闭查找',
      'find.showReplace': '显示替换',
      'find.hideReplace': '隐藏替换',
      'find.replace': '替换',
      'find.replaceAll': '全部替换',
      'find.count': '{current} / {total}',
      'find.noResults': '无结果',
      'find.invalid': '正则无效',
      'open.explorer': '在文件管理器中显示',
      'open.vscode': '在 VS Code 中打开',
      'open.choose': '选择打开方式',
      'open.failed': '打开失败：{message}',
      'open.saveFailed': '计划保存失败，未打开文件',
    }

    const en = {
      'meta.title': 'plan-editor',
      'meta.description': 'Plan cards in the conversation with an editable Markdown plan sidebar.',
      'tab.title': 'Plan',
      'tab.untitled': 'Untitled plan',
      'card.badge': 'Plan',
      'card.open': 'Open',
      'card.hint': 'View and edit in the sidebar',
      'card.preparing': 'Preparing plan…',
      'card.generating': 'Generating plan content…',
      'card.read': 'Read plan',
      'card.list': 'Plan list',
      'card.failed': 'Plan action failed',
      'card.empty': 'No content yet',
      'card.tooltip': 'Open plan: {title}',
      'editor.mode': 'View or edit',
      'editor.view': 'View',
      'editor.edit': 'Edit',
      'editor.discard': 'Discard',
      'editor.saving': 'Saving…',
      'editor.saved': 'Saved',
      'editor.unsaved': 'Unsaved',
      'editor.statusSaved': 'Saved · {time}',
      'editor.statusConflict': 'Conflict',
      'editor.loading': 'Loading plan…',
      'editor.failed': 'Could not load the plan',
      'editor.notFound': 'This plan no longer exists',
      'editor.retry': 'Retry',
      'editor.placeholder': 'Write the plan here…',
      'editor.lines': '{count} lines',
      'editor.chars': '{count} chars',
      'editor.conflict': 'The plan changed elsewhere (a model update or another window).',
      'editor.reload': 'Load latest',
      'editor.overwrite': 'Overwrite anyway',
      'editor.confirmDiscard': 'Discard unsaved changes?',
      'editor.saveFailed': 'Save failed: {message}',
      'editor.copy': 'Copy',
      'editor.copied': 'Copied',
      'editor.empty': 'This plan is empty.',
      'editor.path': 'Plan file',
      'find.title': 'Find and replace',
      'find.placeholder': 'Find',
      'find.replacePlaceholder': 'Replace',
      'find.matchCase': 'Match case',
      'find.wholeWord': 'Match whole word',
      'find.regex': 'Use regular expression',
      'find.prev': 'Previous match',
      'find.next': 'Next match',
      'find.close': 'Close find',
      'find.showReplace': 'Show replace',
      'find.hideReplace': 'Hide replace',
      'find.replace': 'Replace',
      'find.replaceAll': 'Replace all',
      'find.count': '{current} of {total}',
      'find.noResults': 'No results',
      'find.invalid': 'Invalid regex',
      'open.explorer': 'Show in file manager',
      'open.vscode': 'Open in VS Code',
      'open.choose': 'Choose how to open',
      'open.failed': 'Open failed: {message}',
      'open.saveFailed': 'The plan could not be saved, so the file was not opened',
    }

    const ICON_PROPS = {
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 1.6,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      'aria-hidden': true,
      focusable: false,
    }

    function DocIcon({ size = 16 }) {
      return h('svg', { ...ICON_PROPS, width: size, height: size, viewBox: '0 0 24 24' }, [
        h('path', { key: 'a', d: 'M7 3.75h7.2L19 8.55v11.7H7z' }),
        h('path', { key: 'b', d: 'M14 3.9v4.8h4.8' }),
        h('path', { key: 'c', d: 'M9.5 12.2h6M9.5 15.2h6M9.5 18.2h3.6' }),
      ])
    }

    function LockIcon({ size = 15 }) {
      return h('svg', { ...ICON_PROPS, width: size, height: size, viewBox: '0 0 24 24' }, [
        h('rect', { key: 'a', x: 5.2, y: 10.2, width: 13.6, height: 9.6, rx: 2 }),
        h('path', { key: 'b', d: 'M8.2 10.2V7.9a3.8 3.8 0 0 1 7.6 0v2.3' }),
        h('circle', { key: 'c', cx: 12, cy: 15, r: 0.9, fill: 'currentColor', stroke: 'none' }),
      ])
    }

    function PencilIcon({ size = 15 }) {
      return h('svg', { ...ICON_PROPS, width: size, height: size, viewBox: '0 0 24 24' }, [
        h('path', { key: 'a', d: 'M4.8 19.2l4.4-1 9.1-9.1a2.3 2.3 0 0 0-3.2-3.2L6 15l-1.2 4.2z' }),
        h('path', { key: 'b', d: 'M13.8 7.1l3.1 3.1' }),
      ])
    }

    function AlertIcon({ size = 14 }) {
      return h('svg', { ...ICON_PROPS, width: size, height: size, viewBox: '0 0 24 24' }, [
        h('circle', { key: 'a', cx: 12, cy: 12, r: 8.4 }),
        h('path', { key: 'b', d: 'M12 7.7v5.2M12 16.2v.1' }),
      ])
    }

    function ChevronIcon({ size = 14 }) {
      return h('svg', { ...ICON_PROPS, width: size, height: size, viewBox: '0 0 24 24' }, [
        h('path', { key: 'a', d: 'M9.2 6.4l5.4 5.6-5.4 5.6' }),
      ])
    }

    function ChevronUpIcon({ size = 14 }) {
      return h('svg', { ...ICON_PROPS, width: size, height: size, viewBox: '0 0 24 24' }, [
        h('path', { key: 'a', d: 'M6.4 14.8l5.6-5.4 5.6 5.4' }),
      ])
    }

    function ChevronDownIcon({ size = 14 }) {
      return h('svg', { ...ICON_PROPS, width: size, height: size, viewBox: '0 0 24 24' }, [
        h('path', { key: 'a', d: 'M6.4 9.2l5.6 5.4 5.6-5.4' }),
      ])
    }

    function CloseIcon({ size = 14 }) {
      return h('svg', { ...ICON_PROPS, width: size, height: size, viewBox: '0 0 24 24' }, [
        h('path', { key: 'a', d: 'M6.5 6.5l11 11M17.5 6.5l-11 11' }),
      ])
    }

    function SearchIcon({ size = 14 }) {
      return h('svg', { ...ICON_PROPS, width: size, height: size, viewBox: '0 0 24 24' }, [
        h('circle', { key: 'a', cx: 10.5, cy: 10.5, r: 5.6 }),
        h('path', { key: 'b', d: 'M14.6 14.6L19 19' }),
      ])
    }

    function FolderIcon({ size = 15 }) {
      return h('svg', { ...ICON_PROPS, width: size, height: size, viewBox: '0 0 24 24' }, [
        h('path', { key: 'a', d: 'M3.8 7.4a1.6 1.6 0 0 1 1.6-1.6h4l1.6 1.8h6.8a1.6 1.6 0 0 1 1.6 1.6v7.4a1.6 1.6 0 0 1-1.6 1.6H5.4a1.6 1.6 0 0 1-1.6-1.6z' }),
        h('path', { key: 'b', d: 'M3.9 9.3h16.2' }),
      ])
    }

    function CodeIcon({ size = 15 }) {
      return h('svg', { ...ICON_PROPS, width: size, height: size, viewBox: '0 0 24 24' }, [
        h('path', { key: 'a', d: 'M8.2 6.8L4.6 12l3.6 5.2' }),
        h('path', { key: 'b', d: 'M15.8 6.8L19.4 12l-3.6 5.2' }),
        h('path', { key: 'c', d: 'M13.2 5.2l-2.4 13.6' }),
      ])
    }

    function OpenAppIcon({ target, size = 15 }) {
      const [failed, setFailed] = useState(false)
      if (failed) {
        return target === 'vscode' ? h(CodeIcon, { size }) : h(FolderIcon, { size })
      }
      return h('img', {
        src: `/open-in-app/icon/${target}`,
        width: size,
        height: size,
        className: 'ps-open-app-icon',
        alt: '',
        draggable: false,
        onError: () => setFailed(true),
      })
    }

    function parsePlanAddress(address) {
      if (typeof address !== 'string' || !address.startsWith(ADDRESS_PREFIX)) return undefined
      const end = address.search(/[?#]/)
      const rest = address.slice(ADDRESS_PREFIX.length, end === -1 ? undefined : end)
      const parts = rest.split('/')
      if (parts.length !== 2 || parts[0] === '' || parts[1] === '') return undefined
      try {
        return { sessionId: decodeURIComponent(parts[0]), planId: decodeURIComponent(parts[1]) }
      } catch {
        return undefined
      }
    }

    function planAddress(sessionId, planId) {
      return `${ADDRESS_PREFIX}${encodeURIComponent(sessionId)}/${encodeURIComponent(planId)}`
    }

    function openPlanIn(ctx, sessionId, planId, title) {
      try {
        ctx.sidebarRight.openResource(planAddress(sessionId, planId), { params: { title } })
      } catch (error) {
        console.warn('plan-studio: unable to open plan', error)
      }
    }

    async function requestJson(url, options) {
      const response = await fetch(url, {
        cache: 'no-store',
        credentials: 'same-origin',
        ...options,
      })
      let body
      try {
        body = await response.json()
      } catch {
        body = { ok: false, error: { code: 'bad_response', message: `HTTP ${response.status}` } }
      }
      return body
    }

    function getPlan(sessionId, planId) {
      return requestJson(`${API_PREFIX}/plan?sessionId=${encodeURIComponent(sessionId)}&planId=${encodeURIComponent(planId)}`)
    }

    function savePlan(sessionId, planId, markdown, baseRevision) {
      return requestJson(`${API_PREFIX}/save`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId, planId, markdown, baseRevision }),
      })
    }

    function openPlanFile(sessionId, planId, target) {
      return requestJson(`${API_PREFIX}/open`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId, planId, target }),
      })
    }

    function parseArgs(raw) {
      if (typeof raw !== 'string' || raw === '') return {}
      try {
        const value = JSON.parse(raw)
        return typeof value === 'object' && value !== null && !Array.isArray(value) ? value : {}
      } catch {
        return {}
      }
    }

    function argsOf(phase, block) {
      if (!block || typeof block !== 'object') return {}
      if (phase === 'result') return parseArgs(block.call ? block.call.argsRaw : '')
      if (block.args && typeof block.args === 'object' && !Array.isArray(block.args)) return block.args
      return parseArgs(block.argsRaw)
    }

    function textOfBlock(block) {
      if (!block || !Array.isArray(block.content)) return ''
      return block.content.filter((part) => part && part.type === 'text').map((part) => part.text).join('\n').trim()
    }

    function stripLead(line) {
      return line
        .replace(/^\s*>\s?/, '')
        .replace(/^\s*(?:[-*+]|\d+[.)])\s+/, '')
        .replace(/^\s*\[[ xX]\]\s+/, '')
        .replace(/^\s{0,3}#{1,6}\s+/, '')
    }

    function plainText(value) {
      return stripLead(value)
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

    function escapeRegExp(value) {
      return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    }

    function compileFindRegex(query, matchCase, wholeWord, regexMode) {
      if (query === '') return { regex: null, invalid: false }
      let source = regexMode ? query : escapeRegExp(query)
      if (wholeWord) source = `(?<!\\w)(?:${source})(?!\\w)`
      try {
        return {
          regex: new RegExp(source, `gm${matchCase ? '' : 'i'}`),
          invalid: false,
        }
      } catch {
        return { regex: null, invalid: true }
      }
    }

    function findMatches(text, regex) {
      if (regex === null) return []
      const matches = []
      regex.lastIndex = 0
      let match
      while ((match = regex.exec(text)) !== null) {
        const length = match[0].length
        if (length > 0) matches.push({ start: match.index, end: match.index + length })
        if (length === 0) {
          if (regex.lastIndex >= text.length) break
          regex.lastIndex += 1
        }
        if (matches.length >= 5000) break
      }
      return matches
    }

    function renderFindHighlights(text, matches, currentIndex, currentMarkRef) {
      if (matches.length === 0) return `${text}\n`
      const parts = []
      let last = 0
      matches.forEach((match, index) => {
        if (match.start > last) parts.push(text.slice(last, match.start))
        parts.push(h('mark', {
          key: `m${index}`,
          className: index === currentIndex ? 'ps-find-mark ps-find-mark-current' : 'ps-find-mark',
          ref: index === currentIndex ? (element) => { currentMarkRef.current = element } : undefined,
        }, text.slice(match.start, match.end)))
        last = match.end
      })
      if (last < text.length) parts.push(text.slice(last))
      parts.push('\n')
      return parts
    }

    /** Map rendered-text matches back to their source occurrences, in order. */
    function mapViewMatchesToSource(viewText, viewMatches, source) {
      const mapped = []
      let cursor = 0
      for (const match of viewMatches) {
        const needle = viewText.slice(match.start, match.end)
        if (needle === '') {
          mapped.push(undefined)
          continue
        }
        let at = source.indexOf(needle, cursor)
        if (at === -1) at = source.indexOf(needle)
        if (at === -1) {
          mapped.push(undefined)
          continue
        }
        mapped.push({ start: at, end: at + needle.length })
        cursor = at + needle.length
      }
      return mapped
    }

    /** Flatten the rendered Markdown into text nodes so view-mode finds can address DOM ranges. */
    function collectTextIndex(root) {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
      const nodes = []
      let text = ''
      let node
      while ((node = walker.nextNode()) !== null) {
        const value = node.nodeValue || ''
        if (value === '') continue
        const start = text.length
        text += value
        nodes.push({ node, start, end: text.length })
      }
      return { text, nodes }
    }

    function locateTextNode(nodes, offset, isEnd) {
      for (const entry of nodes) {
        if (isEnd ? offset > entry.start && offset <= entry.end : offset >= entry.start && offset < entry.end) return entry
      }
      if (!isEnd) {
        const last = nodes[nodes.length - 1]
        if (last !== undefined && offset === last.end) return last
      }
      return undefined
    }

    function rangeForMatch(nodes, match) {
      const startNode = locateTextNode(nodes, match.start, false)
      const endNode = locateTextNode(nodes, match.end, true)
      if (startNode === undefined || endNode === undefined) return undefined
      const range = document.createRange()
      range.setStart(startNode.node, match.start - startNode.start)
      range.setEnd(endNode.node, match.end - endNode.start)
      return range
    }

    function deriveTitle(markdown) {
      const lines = String(markdown || '').split('\n')
      let inFence = false
      let fallback = ''
      for (const line of lines) {
        if (/^\s*(```|~~~)/.test(line)) {
          inFence = !inFence
          continue
        }
        if (inFence) continue
        const match = /^\s{0,3}#\s+(.+?)\s*#*\s*$/.exec(line)
        if (match) return plainText(match[1]).slice(0, 160)
        if (fallback === '' && line.trim() !== '' && !/^---$/.test(line.trim())) {
          fallback = plainText(line)
        }
      }
      return fallback.slice(0, 120)
    }

    function derivePreview(markdown) {
      const lines = String(markdown || '').split('\n')
      const preview = []
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
        if (line.trim() === '' || /^\s{0,3}#{1,6}\s+/.test(line)) continue
        if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) continue
        if (/^\s*\|?[\s:|-]*-{3,}[\s:|-]*\|?\s*$/.test(line)) continue
        const text = plainText(line)
        if (text !== '') preview.push(text.slice(0, 220))
        if (preview.length >= 3) break
      }
      return preview
    }

    /** The first blocks of the plan body, with the H1 removed because the card already shows it. */
    function cardMarkdownBody(markdown) {
      const lines = String(markdown || '').replace(/\r\n?/g, '\n').split('\n')
      let index = 0
      if (lines[0]?.trim() === '---') {
        index = 1
        while (index < lines.length && !/^(?:---|\.\.\.)\s*$/.test(lines[index].trim())) index += 1
        index += 1
      }
      while (index < lines.length && lines[index].trim() === '') index += 1
      if (index < lines.length && /^\s{0,3}#\s+/.test(lines[index])) {
        index += 1
        while (index < lines.length && lines[index].trim() === '') index += 1
      }
      const body = []
      let size = 0
      for (; index < lines.length; index += 1) {
        const line = lines[index]
        body.push(line)
        size += line.length + 1
        if (body.length >= 18 || size > 1400) break
      }
      return body.join('\n').trim()
    }

    function formatTime(value) {
      try {
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) return ''
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      } catch {
        return ''
      }
    }

    const SAFE_LINK = /^(?:https?:|mailto:|#|\/)/i

    const CODE_ALIASES = {
      js: 'javascript',
      jsx: 'javascript',
      mjs: 'javascript',
      cjs: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      sh: 'bash',
      shell: 'bash',
      zsh: 'bash',
      'shell-session': 'bash',
      ps1: 'powershell',
      pwsh: 'powershell',
      ps: 'powershell',
      yml: 'yaml',
      jsonc: 'json',
      'c++': 'cpp',
      cxx: 'cpp',
      cc: 'cpp',
      hpp: 'cpp',
      'c#': 'csharp',
      cs: 'csharp',
      golang: 'go',
      rs: 'rust',
      htm: 'html',
      svg: 'xml',
      'objective-c': 'c',
      objc: 'c',
      scss: 'css',
      less: 'css',
      toml: 'ini',
      cfg: 'ini',
      conf: 'ini',
      patch: 'diff',
    }

    const CODE_PLAIN = new Set([
      '', 'text', 'plain', 'plaintext', 'txt', 'console', 'output', 'log', 'markdown', 'md',
    ])
    const CODE_CONSTANTS = new Set([
      'true', 'false', 'null', 'undefined', 'None', 'True', 'False', 'nil', 'NaN', 'Infinity',
      'NULL', 'nullptr', 'this', 'TRUE', 'FALSE',
    ])

    const JS_KEYWORDS = [
      'as', 'async', 'await', 'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger',
      'default', 'delete', 'do', 'else', 'export', 'extends', 'finally', 'for', 'from', 'function',
      'get', 'if', 'import', 'in', 'instanceof', 'let', 'new', 'of', 'return', 'set', 'static',
      'super', 'switch', 'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield',
      'true', 'false', 'null', 'undefined',
    ]
    const TS_KEYWORDS = JS_KEYWORDS.concat([
      'abstract', 'any', 'asserts', 'bigint', 'boolean', 'declare', 'enum', 'implements', 'infer',
      'interface', 'is', 'keyof', 'namespace', 'never', 'number', 'object', 'private', 'protected',
      'public', 'readonly', 'satisfies', 'string', 'symbol', 'type', 'unique', 'unknown',
    ])
    const C_KEYWORDS = [
      'auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do', 'double', 'else',
      'enum', 'extern', 'float', 'for', 'goto', 'if', 'inline', 'int', 'long', 'register',
      'restrict', 'return', 'short', 'signed', 'sizeof', 'static', 'struct', 'switch', 'typedef',
      'union', 'unsigned', 'void', 'volatile', 'while', 'true', 'false', 'NULL', 'nullptr',
    ]

    const CODE_KEYWORDS = {
      javascript: new Set(JS_KEYWORDS),
      typescript: new Set(TS_KEYWORDS),
      python: new Set([
        'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del',
        'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is',
        'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with',
        'yield', 'None', 'True', 'False', 'self', 'match', 'case',
      ]),
      bash: new Set([
        'if', 'then', 'else', 'elif', 'fi', 'for', 'while', 'until', 'do', 'done', 'case', 'esac',
        'function', 'in', 'select', 'time', 'coproc', 'local', 'export', 'readonly', 'declare',
        'typeset', 'unset', 'shift', 'source', 'alias', 'return', 'exit', 'break', 'continue',
        'true', 'false',
      ]),
      powershell: new Set([
        'if', 'elseif', 'else', 'foreach', 'for', 'while', 'do', 'until', 'switch', 'function',
        'filter', 'param', 'begin', 'process', 'end', 'try', 'catch', 'finally', 'throw', 'return',
        'break', 'continue', 'class', 'enum', 'using', 'import', 'export', 'in', 'trap', 'data',
        'dynamicparam', 'workflow', 'configuration', 'true', 'false', 'null',
      ]),
      json: new Set(['true', 'false', 'null']),
      yaml: new Set(['true', 'false', 'null', 'yes', 'no', 'on', 'off']),
      sql: new Set([
        'SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'UPDATE', 'DELETE', 'JOIN', 'LEFT', 'RIGHT',
        'INNER', 'OUTER', 'FULL', 'CROSS', 'ON', 'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT',
        'OFFSET', 'CREATE', 'TABLE', 'ALTER', 'DROP', 'INDEX', 'VIEW', 'VALUES', 'SET', 'AS',
        'AND', 'OR', 'NOT', 'NULL', 'IS', 'IN', 'LIKE', 'BETWEEN', 'DISTINCT', 'UNION', 'ALL',
        'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES',
        'DEFAULT', 'CONSTRAINT', 'WITH', 'RETURNING', 'ASC', 'DESC', 'GRANT', 'REVOKE', 'BEGIN',
        'COMMIT', 'ROLLBACK', 'PROCEDURE', 'FUNCTION', 'TRIGGER', 'DATABASE', 'SCHEMA', 'EXISTS',
        'IF', 'DECLARE',
      ]),
      go: new Set([
        'package', 'import', 'func', 'var', 'const', 'type', 'struct', 'interface', 'map', 'chan',
        'go', 'defer', 'select', 'case', 'default', 'switch', 'if', 'else', 'for', 'range',
        'break', 'continue', 'return', 'fallthrough', 'goto', 'nil', 'true', 'false',
      ]),
      rust: new Set([
        'as', 'async', 'await', 'break', 'const', 'continue', 'crate', 'dyn', 'else', 'enum',
        'extern', 'false', 'fn', 'for', 'if', 'impl', 'in', 'let', 'loop', 'match', 'mod', 'move',
        'mut', 'pub', 'ref', 'return', 'self', 'Self', 'static', 'struct', 'super', 'trait', 'true',
        'type', 'unsafe', 'use', 'where', 'while', 'Some', 'None', 'Ok', 'Err',
      ]),
      java: new Set([
        'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const',
        'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'final', 'finally',
        'float', 'for', 'goto', 'if', 'implements', 'import', 'instanceof', 'int', 'interface',
        'long', 'native', 'new', 'package', 'private', 'protected', 'public', 'return', 'short',
        'static', 'strictfp', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws',
        'transient', 'try', 'void', 'volatile', 'while', 'true', 'false', 'null', 'var', 'record',
        'sealed', 'permits',
      ]),
      c: new Set(C_KEYWORDS),
      cpp: new Set(C_KEYWORDS.concat([
        'alignas', 'alignof', 'and', 'and_eq', 'asm', 'bitand', 'bitor', 'bool', 'catch', 'class',
        'compl', 'concept', 'constexpr', 'const_cast', 'decltype', 'delete', 'dynamic_cast',
        'explicit', 'export', 'friend', 'mutable', 'namespace', 'new', 'noexcept', 'not', 'not_eq',
        'operator', 'or', 'or_eq', 'private', 'protected', 'public', 'reinterpret_cast', 'requires',
        'static_assert', 'static_cast', 'template', 'this', 'thread_local', 'throw', 'try',
        'typeid', 'typename', 'using', 'virtual', 'wchar_t', 'xor', 'xor_eq', 'override', 'final',
      ])),
      csharp: new Set([
        'abstract', 'as', 'base', 'bool', 'break', 'byte', 'case', 'catch', 'char', 'checked',
        'class', 'const', 'continue', 'decimal', 'default', 'delegate', 'do', 'double', 'else',
        'enum', 'event', 'explicit', 'extern', 'false', 'finally', 'fixed', 'float', 'for',
        'foreach', 'goto', 'if', 'implicit', 'in', 'int', 'interface', 'internal', 'is', 'lock',
        'long', 'namespace', 'new', 'null', 'object', 'operator', 'out', 'override', 'params',
        'private', 'protected', 'public', 'readonly', 'ref', 'return', 'sbyte', 'sealed', 'short',
        'sizeof', 'stackalloc', 'static', 'string', 'struct', 'switch', 'this', 'throw', 'true',
        'try', 'typeof', 'uint', 'ulong', 'unchecked', 'unsafe', 'ushort', 'using', 'virtual',
        'void', 'volatile', 'while', 'async', 'await', 'var', 'record', 'init', 'required', 'file',
        'global', 'partial', 'where', 'yield',
      ]),
      css: new Set(['important', 'from', 'to', 'only', 'and', 'not', 'screen', 'print']),
      html: new Set(),
      xml: new Set(),
      ini: new Set(['true', 'false', 'null', 'yes', 'no', 'on', 'off']),
    }

    function normalizeCodeLanguage(value) {
      const raw = String(value === undefined || value === null ? '' : value).trim().toLowerCase()
      return CODE_ALIASES[raw] || raw
    }

    function codeConfig(language) {
      const config = {
        lineComments: [],
        blockComments: [],
        quotes: ['"', "'"],
        triple: false,
        keywords: CODE_KEYWORDS[language] || null,
        caseInsensitive: false,
        jsonKeys: false,
        yamlKeys: false,
        iniKeys: false,
        css: false,
        markup: false,
        variables: false,
        functions: true,
        types: true,
      }
      if (language === 'javascript' || language === 'typescript') {
        config.lineComments = ['//']
        config.blockComments = [['/*', '*/']]
        config.quotes = ['"', "'", '`']
      } else if (language === 'python') {
        config.lineComments = ['#']
        config.triple = true
      } else if (language === 'bash') {
        config.lineComments = ['#']
        config.variables = true
        config.types = false
      } else if (language === 'powershell') {
        config.lineComments = ['#']
        config.blockComments = [['<#', '#>']]
        config.variables = true
        config.types = false
      } else if (language === 'json') {
        config.quotes = ['"']
        config.jsonKeys = true
        config.types = false
      } else if (language === 'yaml') {
        config.lineComments = ['#']
        config.yamlKeys = true
        config.types = false
      } else if (language === 'sql') {
        config.lineComments = ['--']
        config.blockComments = [['/*', '*/']]
        config.caseInsensitive = true
        config.types = false
      } else if (language === 'go') {
        config.lineComments = ['//']
        config.blockComments = [['/*', '*/']]
        config.quotes = ['"', "'", '`']
      } else if (language === 'rust') {
        config.lineComments = ['//']
        config.blockComments = [['/*', '*/']]
        config.quotes = ['"']
      } else if (language === 'java' || language === 'c' || language === 'cpp' || language === 'csharp') {
        config.lineComments = ['//']
        config.blockComments = [['/*', '*/']]
      } else if (language === 'css') {
        config.blockComments = [['/*', '*/']]
        config.css = true
        config.types = false
        config.functions = false
      } else if (language === 'html' || language === 'xml') {
        config.blockComments = [['<!--', '-->']]
        config.markup = true
        config.quotes = []
        config.types = false
        config.functions = false
      } else if (language === 'ini') {
        config.lineComments = ['#', ';']
        config.iniKeys = true
        config.types = false
      } else if (language !== 'diff') {
        config.types = false
        config.functions = false
      }
      return config
    }

    function scanCodeString(code, start, quote, triple) {
      const delimiter = triple ? quote.repeat(3) : quote
      let index = start + delimiter.length
      while (index < code.length) {
        if (code[index] === '\\') {
          index += 2
          continue
        }
        if (code.startsWith(delimiter, index)) return index + delimiter.length
        if (!triple && quote !== '`' && code[index] === '\n') return index
        index += 1
      }
      return code.length
    }

    function isLineKey(code, index) {
      const start = code.lastIndexOf('\n', index - 1) + 1
      return /^\s*$/.test(code.slice(start, index))
    }

    function isYamlKey(code, index) {
      const start = code.lastIndexOf('\n', index - 1) + 1
      return /^\s*(?:-\s+)?$/.test(code.slice(start, index))
    }

    function markupTagEnd(code, start) {
      let index = start + 1
      let quote = ''
      while (index < code.length) {
        const character = code[index]
        if (quote !== '') {
          if (character === '\\') {
            index += 2
            continue
          }
          if (character === quote) quote = ''
        } else if (character === '"' || character === "'") {
          quote = character
        } else if (character === '>') {
          return index + 1
        }
        index += 1
      }
      return -1
    }

    function renderMarkupTag(raw, append) {
      let index = 1
      append('<', 'punct')
      if (raw[index] === '/') {
        append('/', 'punct')
        index += 1
      }
      const name = /^[\w:-]+/.exec(raw.slice(index))
      if (name) {
        append(name[0], 'tag')
        index += name[0].length
      }
      while (index < raw.length) {
        const character = raw[index]
        if (character === ' ' || character === '\t' || character === '\n' || character === '\r') {
          let end = index + 1
          while (end < raw.length && /[\s]/.test(raw[end])) end += 1
          append(raw.slice(index, end))
          index = end
          continue
        }
        if (character === '"' || character === "'") {
          const end = scanCodeString(raw, index, character, false)
          append(raw.slice(index, end), 'string')
          index = end
          continue
        }
        if (character === '=' || character === '/' || character === '>') {
          append(character, 'punct')
          index += 1
          continue
        }
        const attribute = /^[\w:.-]+/.exec(raw.slice(index))
        if (attribute) {
          append(attribute[0], 'attr')
          index += attribute[0].length
          continue
        }
        append(character, 'punct')
        index += 1
      }
    }

    function highlightDiff(source) {
      const lines = source.split('\n')
      const nodes = []
      lines.forEach((line, index) => {
        let className
        if (/^(diff --git|index |--- |\+\+\+ |@@ )/.test(line)) className = 'ps-diff-meta'
        else if (/^\+/.test(line)) className = 'ps-diff-add'
        else if (/^-/.test(line)) className = 'ps-diff-del'
        if (className === undefined) nodes.push(line)
        else nodes.push(h('span', { key: `diff-${index}`, className: `ps-tok ${className}` }, line))
        if (index < lines.length - 1) nodes.push('\n')
      })
      return nodes
    }

    function highlightCode(value, language) {
      const source = String(value === undefined || value === null ? '' : value)
      if (source === '') return ''
      const lang = normalizeCodeLanguage(language)
      if (CODE_PLAIN.has(lang)) return source
      if (lang === 'diff') return highlightDiff(source)
      const config = codeConfig(lang)
      const nodes = []
      let index = 0
      let keyIndex = 0
      const append = (text, className) => {
        if (text === '') return
        if (className === undefined) nodes.push(text)
        else nodes.push(h('span', { key: `code-${keyIndex}`, className: `ps-tok ps-tok-${className}` }, text))
        keyIndex += 1
      }
      while (index < source.length) {
        const character = source[index]
        if (character === ' ' || character === '\t' || character === '\n' || character === '\r') {
          let end = index + 1
          while (end < source.length && /[\s]/.test(source[end])) end += 1
          append(source.slice(index, end))
          index = end
          continue
        }
        let consumed = false
        for (const pair of config.blockComments) {
          if (source.startsWith(pair[0], index)) {
            const close = source.indexOf(pair[1], index + pair[0].length)
            const end = close === -1 ? source.length : close + pair[1].length
            append(source.slice(index, end), 'comment')
            index = end
            consumed = true
            break
          }
        }
        if (consumed) continue
        for (const marker of config.lineComments) {
          if (source.startsWith(marker, index)) {
            let end = source.indexOf('\n', index)
            if (end === -1) end = source.length
            append(source.slice(index, end), 'comment')
            index = end
            consumed = true
            break
          }
        }
        if (consumed) continue
        if (config.markup && character === '<') {
          const end = markupTagEnd(source, index)
          if (end !== -1) {
            renderMarkupTag(source.slice(index, end), append)
            index = end
            continue
          }
        }
        let quoteInfo
        for (const quote of config.quotes) {
          if (config.triple && source.startsWith(quote.repeat(3), index)) {
            quoteInfo = { quote, triple: true }
            break
          }
          if (source[index] === quote) {
            quoteInfo = { quote, triple: false }
            break
          }
        }
        if (quoteInfo !== undefined) {
          const end = scanCodeString(source, index, quoteInfo.quote, quoteInfo.triple)
          let className = 'string'
          if ((config.jsonKeys || config.yamlKeys) && /^\s*:/.test(source.slice(end))) className = 'key'
          append(source.slice(index, end), className)
          index = end
          continue
        }
        if (config.variables && character === '$') {
          const variable = /^(?:\$\{[^}\n]+\}|\$[A-Za-z_][\w:]*|\$\d+)/.exec(source.slice(index))
          if (variable) {
            append(variable[0], 'variable')
            index += variable[0].length
            continue
          }
        }
        if (config.css && character === '@') {
          const atRule = /^@[\w-]+/.exec(source.slice(index))
          if (atRule) {
            append(atRule[0], 'keyword')
            index += atRule[0].length
            continue
          }
        }
        if (config.css) {
          const property = /^-?[A-Za-z][A-Za-z-]*(?=\s*:)/.exec(source.slice(index))
          if (property) {
            append(property[0], 'property')
            index += property[0].length
            continue
          }
          const color = /^#[\da-fA-F]{3,8}\b/.exec(source.slice(index))
          if (color) {
            append(color[0], 'number')
            index += color[0].length
            continue
          }
        }
        if (/[0-9]/.test(character) || (character === '.' && /[0-9]/.test(source[index + 1] || ''))) {
          const number = /^(?:0[xX][\da-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|\d[\d_]*(?:\.[\d_]*)?(?:[eE][+-]?\d+)?|\.\d[\d_]*(?:[eE][+-]?\d+)?)/.exec(source.slice(index))
          if (number) {
            append(number[0], 'number')
            index += number[0].length
            continue
          }
        }
        if (/[A-Za-z_$@]/.test(character)) {
          const wordMatch = /^[A-Za-z_$@][\w$@]*/.exec(source.slice(index))
          const word = wordMatch[0]
          const after = source.slice(index + word.length)
          const lookup = config.caseInsensitive ? word.toUpperCase() : word
          let className
          if (config.iniKeys && /^\s*=/.test(after) && isLineKey(source, index)) className = 'property'
          else if (config.yamlKeys && /^\s*:/.test(after) && isYamlKey(source, index)) className = 'key'
          else if (config.jsonKeys && /^\s*:/.test(after)) className = 'key'
          else if (CODE_CONSTANTS.has(lookup)) className = 'constant'
          else if (config.keywords !== null && config.keywords.has(lookup)) className = 'keyword'
          else if (config.functions && /^\s*\(/.test(after)) className = 'function'
          else if (/^[A-Z][A-Z0-9_]+$/.test(word)) className = 'constant'
          else if (config.types && /^[A-Z]/.test(word)) className = 'type'
          append(word, className)
          index += word.length
          continue
        }
        if ('{}[]()<>.,;:+-*/%=!&|^~?'.includes(character)) {
          append(character, 'punct')
          index += 1
          continue
        }
        append(character)
        index += 1
      }
      return nodes
    }

    function renderInline(text, keyBase) {
      const value = String(text || '')
      if (value === '') return []
      const pattern = /(`[^`\n]+`|\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*|_[^_\n]+_|~~[^~\n]+~~|\[[^\]\n]+\]\([^)\n]+\))/g
      const nodes = []
      let last = 0
      let match
      let index = 0
      while ((match = pattern.exec(value)) !== null) {
        if (match.index > last) nodes.push(value.slice(last, match.index))
        const token = match[0]
        const key = `${keyBase}-i${index}`
        index += 1
        if (token.startsWith('`')) {
          nodes.push(h('code', { key }, token.slice(1, -1)))
        } else if (token.startsWith('**') || token.startsWith('__')) {
          nodes.push(h('strong', { key }, renderInline(token.slice(2, -2), key)))
        } else if (token.startsWith('~~')) {
          nodes.push(h('del', { key }, renderInline(token.slice(2, -2), key)))
        } else if (token.startsWith('[')) {
          const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token)
          if (link) {
            const url = link[2].trim()
            if (SAFE_LINK.test(url)) {
              nodes.push(h('a', {
                key,
                href: url,
                target: url.startsWith('#') ? undefined : '_blank',
                rel: url.startsWith('#') ? undefined : 'noreferrer',
              }, renderInline(link[1], key)))
            } else {
              nodes.push(link[1])
            }
          } else {
            nodes.push(token)
          }
        } else {
          nodes.push(h('em', { key }, renderInline(token.slice(1, -1), key)))
        }
        last = match.index + token.length
      }
      if (last < value.length) nodes.push(value.slice(last))
      return nodes
    }

    const FENCE = /^\s*(`{3,}|~{3,})\s*([\w.+#-]*)(?:\s+.*)?$/
    const LIST = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/
    const HEADING = /^\s{0,3}(#{1,6})\s+(.*)$/
    const RULE = /^\s*([-*_])(\s*\1){2,}\s*$/

    function splitRow(line) {
      let text = line.trim()
      if (text.startsWith('|')) text = text.slice(1)
      if (text.endsWith('|')) text = text.slice(0, -1)
      return text.split('|').map((cell) => cell.trim())
    }

    function tableAt(lines, index) {
      if (index + 1 >= lines.length || !lines[index].includes('|')) return undefined
      if (!lines[index + 1].includes('|') && !lines[index + 1].includes('-')) return undefined
      const separator = splitRow(lines[index + 1])
      if (separator.length === 0 || !separator.every((cell) => /^:?-{3,}:?$/.test(cell))) return undefined
      return { header: splitRow(lines[index]), separator }
    }

    function isBlockStart(line, next) {
      if (line.trim() === '') return true
      if (FENCE.test(line) || HEADING.test(line) || RULE.test(line)) return true
      if (/^\s*>/.test(line)) return true
      if (LIST.test(line)) return true
      if (next !== undefined && tableAt([line, next], 0)) return true
      return false
    }

    function renderBlocks(lines, keyBase) {
      const nodes = []
      let index = 0
      let keyIndex = 0
      const nextKey = () => `${keyBase}-${keyIndex++}`
      while (index < lines.length) {
        const line = lines[index]
        if (line.trim() === '') {
          index += 1
          continue
        }

        if (index === 0 && line.trim() === '---') {
          const content = []
          index += 1
          while (index < lines.length && lines[index].trim() !== '---' && lines[index].trim() !== '...') {
            content.push(lines[index])
            index += 1
          }
          if (index < lines.length) index += 1
          nodes.push(h('pre', { key: nextKey(), className: 'ps-frontmatter' }, h('code', null, content.join('\n'))))
          continue
        }

        const fence = FENCE.exec(line)
        if (fence) {
          const marker = fence[1]
          const language = fence[2]
          const code = []
          index += 1
          while (index < lines.length && !new RegExp(`^\\s*${marker[0]}{${marker.length},}\\s*$`).test(lines[index])) {
            code.push(lines[index])
            index += 1
          }
          if (index < lines.length) index += 1
          const codeText = code.join('\n')
          nodes.push(h('pre', { key: nextKey(), 'data-lang': language || undefined }, h('code', null, highlightCode(codeText, language))))
          continue
        }

        const heading = HEADING.exec(line)
        if (heading) {
          const level = heading[1].length
          nodes.push(h(`h${level}`, { key: nextKey() }, renderInline(heading[2].replace(/\s*#+\s*$/, ''), `${keyBase}-h${keyIndex}`)))
          index += 1
          continue
        }

        if (RULE.test(line)) {
          nodes.push(h('hr', { key: nextKey() }))
          index += 1
          continue
        }

        const table = tableAt(lines, index)
        if (table) {
          const align = table.separator.map((cell) => {
            const left = cell.startsWith(':')
            const right = cell.endsWith(':')
            if (left && right) return 'center'
            if (right) return 'right'
            return 'left'
          })
          const key = nextKey()
          const rows = []
          index += 2
          while (index < lines.length && lines[index].trim() !== '' && lines[index].includes('|')) {
            rows.push(splitRow(lines[index]))
            index += 1
          }
          nodes.push(h('table', { key }, [
            h('thead', { key: 'head' }, h('tr', null, table.header.map((cell, cellIndex) => h('th', {
              key: `th${cellIndex}`,
              style: { textAlign: align[cellIndex] || 'left' },
            }, renderInline(cell, `${key}-th${cellIndex}`))))),
            h('tbody', { key: 'body' }, rows.map((row, rowIndex) => h('tr', { key: `r${rowIndex}` }, row.map((cell, cellIndex) => h('td', {
              key: `c${cellIndex}`,
              style: { textAlign: align[cellIndex] || 'left' },
            }, renderInline(cell, `${key}-r${rowIndex}c${cellIndex}`)))))),
          ]))
          continue
        }

        if (/^\s*>/.test(line)) {
          const quote = []
          while (index < lines.length && /^\s*>/.test(lines[index])) {
            quote.push(lines[index].replace(/^\s*>\s?/, ''))
            index += 1
          }
          const key = nextKey()
          nodes.push(h('blockquote', { key }, renderBlocks(quote, key)))
          continue
        }

        const list = LIST.exec(line)
        if (list) {
          const ordered = /^\d/.test(list[2])
          const start = ordered ? Number.parseInt(list[2], 10) : undefined
          const items = []
          const key = nextKey()
          while (index < lines.length) {
            const item = LIST.exec(lines[index])
            if (!item) break
            items.push({
              indent: item[1].replace(/\t/g, '  ').length,
              text: item[3],
              ordered: /^\d/.test(item[2]),
            })
            index += 1
          }
          const children = items.map((item, itemIndex) => {
            const task = /^\[([ xX])\]\s+(.*)$/.exec(item.text)
            return h('li', {
              key: `li${itemIndex}`,
              style: { marginLeft: `${Math.min(item.indent, 10) * 8}px` },
            }, task
              ? [
                h('input', { key: 'box', type: 'checkbox', checked: task[1].toLowerCase() === 'x', disabled: true, readOnly: true }),
                ...renderInline(task[2], `${key}-li${itemIndex}`),
              ]
              : renderInline(item.text, `${key}-li${itemIndex}`))
          })
          nodes.push(ordered
            ? h('ol', { key, start }, children)
            : h('ul', { key }, children))
          continue
        }

        const paragraph = [line.trim()]
        index += 1
        while (index < lines.length) {
          if (lines[index].trim() === '') break
          if (isBlockStart(lines[index], lines[index + 1])) break
          paragraph.push(lines[index].trim())
          index += 1
        }
        const key = nextKey()
        nodes.push(h('p', { key }, renderInline(paragraph.join('\n'), key)))
      }
      return nodes
    }

    const Markdown = React.memo(function Markdown({ text }) {
      const nodes = useMemo(() => renderBlocks(String(text || '').split('\n'), 'md'), [text])
      return h('div', { className: 'ps-markdown' }, nodes)
    })

    function PlanCardView({ plan, openPlan, t, pending = false }) {
      const planId = typeof plan.planId === 'string' ? plan.planId : ''
      const title = typeof plan.title === 'string' && plan.title !== '' ? plan.title : t('tab.untitled')
      const body = cardMarkdownBody(plan.markdown)
      const serverPreview = Array.isArray(plan.preview) ? plan.preview.filter((line) => typeof line === 'string' && line.trim() !== '') : []
      const preview = (serverPreview.length > 0 ? serverPreview : derivePreview(plan.markdown)).slice(0, 3)
      const canOpen = planId !== '' && pending !== true && typeof openPlan === 'function'
      const activate = canOpen ? () => openPlan(planId, title) : undefined

      return h('div', {
        className: 'ps-card',
        role: canOpen ? 'button' : undefined,
        tabIndex: canOpen ? 0 : undefined,
        'data-plan-card': planId,
        'data-open': canOpen ? 'true' : 'false',
        'aria-disabled': canOpen ? undefined : true,
        'aria-label': t('card.tooltip', { title }),
        onClick: activate,
        onKeyDown: activate === undefined ? undefined : (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            activate()
          }
        },
      }, [
        h('span', { key: 'head', className: 'ps-card-head' }, [
          h('span', { key: 'icon', className: 'ps-card-icon' }, h(DocIcon, { size: 19 })),
          h('span', { key: 'title', className: 'ps-card-title' }, title),
          h('span', { key: 'badge', className: 'ps-card-badge' }, t('card.badge')),
        ]),
        body !== ''
          ? h('div', { key: 'preview', className: 'ps-card-md' }, h(Markdown, { text: body }))
          : h('div', { key: 'preview', className: 'ps-card-preview' },
            (preview.length > 0 ? preview : [t('card.empty')]).map((line, lineIndex) => h('span', {
              key: `line${lineIndex}`,
              className: 'ps-card-line',
            }, line))),
        h('span', { key: 'foot', className: 'ps-card-foot' }, [
          h('span', { key: 'hint', className: 'ps-card-hint' }, canOpen ? t('card.hint') : t('card.generating')),
          h('span', { key: 'chev', className: 'ps-card-chevron' }, h(ChevronIcon, { size: 13 })),
        ]),
      ])
    }

    function PlanToolCard({ phase, block, t, openPlan }) {
      const args = argsOf(phase, block)
      const meta = phase === 'result' && block && block.meta && typeof block.meta === 'object' ? block.meta : undefined
      const action = typeof args.action === 'string' ? args.action : 'present'
      const failed = phase === 'result' && block && block.isError
      const planId = typeof meta?.planId === 'string' ? meta.planId : (typeof args.plan_id === 'string' ? args.plan_id : '')
      const title = (typeof meta?.title === 'string' && meta.title)
        || (typeof args.title === 'string' && args.title)
        || deriveTitle(args.markdown)
        || t('tab.untitled')

      if (failed) {
        const message = (textOfBlock(block) || (block && block.error && block.error.message) || t('card.failed')).slice(0, 400)
        return h('div', { className: 'ps-inline ps-inline-error' }, [
          h(AlertIcon, { key: 'i', size: 14 }),
          h('span', { key: 't', className: 'ps-inline-text' }, message),
        ])
      }

      if (action === 'read' || action === 'list') {
        return h('div', { className: 'ps-inline' }, [
          h(DocIcon, { key: 'i', size: 14 }),
          h('span', { key: 't', className: 'ps-inline-text' }, action === 'list' ? t('card.list') : t('card.read')),
          action === 'read' ? h('span', { key: 'n', className: 'ps-inline-title' }, title) : null,
          planId !== '' && typeof openPlan === 'function'
            ? h('button', {
              key: 'b',
              type: 'button',
              className: 'ps-inline-open',
              onClick: () => openPlan(planId, title),
            }, t('card.open'))
            : null,
        ])
      }

      if (phase === 'preparing') {
        return h('div', { className: 'ps-inline' }, [
          h(DocIcon, { key: 'i', size: 14 }),
          h('span', { key: 't', className: 'ps-inline-text' }, t('card.preparing')),
        ])
      }

      return h(PlanCardView, {
        plan: {
          planId,
          title,
          preview: meta?.preview,
          markdown: args.markdown,
        },
        openPlan,
        t,
        pending: phase !== 'result',
      })
    }

    /** Read the plan Markdown from the recorded call so the card can render a real preview. */
    function planCallData(event) {
      if (event.type !== 'tool/call') return undefined
      const data = event.data
      if (!data || data.name !== 'plan' || typeof data.callId !== 'string' || data.callId === '') return undefined
      const args = parseArgs(data.arguments)
      if (!args || args.action !== 'present' || typeof args.markdown !== 'string' || args.markdown.trim() === '') return undefined
      return {
        callId: data.callId,
        planId: typeof args.plan_id === 'string' ? args.plan_id : '',
        title: (typeof args.title === 'string' && args.title.trim() !== '' ? args.title.trim() : '') || deriveTitle(args.markdown) || 'Plan',
        preview: [],
        updatedAt: 0,
        markdown: args.markdown,
      }
    }

    /** Read the settled `plan` present result that becomes one turn-tail card. */
    function planResultData(event) {
      if (event.type !== 'tool/result') return undefined
      const data = event.data
      const meta = data && data.meta
      const callId = data && data.message && data.message.toolCallId
      if (!meta || meta.action !== 'present' || typeof meta.planId !== 'string' || meta.planId === '') return undefined
      if (typeof callId !== 'string' || callId === '') return undefined
      return {
        callId,
        planId: meta.planId,
        title: typeof meta.title === 'string' && meta.title !== '' ? meta.title : 'Plan',
        preview: Array.isArray(meta.preview) ? meta.preview.filter((line) => typeof line === 'string' && line.trim() !== '') : [],
        updatedAt: typeof meta.updatedAt === 'number' ? meta.updatedAt : 0,
        markdown: '',
      }
    }

    /** A hidden Chat card indexed by Turn so completed-Turn folding cannot hide it. */
    const planCardDefinition = {
      kind: PLAN_CARD_KIND,
      target: 'chat',
      match: (event) => {
        const call = planCallData(event)
        if (call !== undefined) return { id: call.callId, role: 'start' }
        const result = planResultData(event)
        return result === undefined ? null : { id: result.callId, role: 'start' }
      },
      start: (_context, match) => planCallData(match.event) ?? planResultData(match.event) ?? { callId: '', planId: '', title: '', preview: [], updatedAt: 0, markdown: '' },
      update: (context, match) => {
        const next = planCallData(match.event) ?? planResultData(match.event)
        if (next === undefined) return context.state
        return {
          ...context.state,
          ...next,
          markdown: next.markdown !== '' ? next.markdown : (context.state?.markdown ?? ''),
        }
      },
      buildViewNode: (context) => {
        const start = context.start ?? context.matches[0]
        const data = context.state ?? (start === undefined ? undefined : (planCallData(start.event) ?? planResultData(start.event)))
        if (data === undefined || start === undefined) return null
        return {
          key: context.key,
          kind: PLAN_CARD_KIND,
          id: context.id,
          target: 'chat',
          anchorSeq: start.event.seq,
          location: start.location,
          visibility: 'hidden',
          data,
        }
      },
    }

    function PlanTurnCards({ turn, usePlans, openPlan, t }) {
      const plans = usePlans(String(turn.turn))
      if (plans === undefined || plans.length === 0) return null
      return h('div', { className: 'ps-turn-cards', 'data-plan-turn': turn.turn }, plans.map((plan) => h(PlanCardView, {
        key: plan.callId || plan.planId,
        plan,
        openPlan,
        t,
      })))
    }

    function PlanTabTitle({ useTabInfo, t }) {
      const tab = useTabInfo()
      const params = tab.tab.navigation.params
      const title = params && typeof params.title === 'string' && params.title !== '' ? params.title : t('tab.title')
      return h('span', { className: 'ps-tab-title' }, [
        h(DocIcon, { key: 'i', size: 14 }),
        h('span', { key: 't', className: 'ps-tab-title-text' }, title),
      ])
    }

    function PlanFindBar({
      t,
      findInputRef,
      replaceInputRef,
      query,
      onQueryChange,
      onFindKeyDown,
      replacement,
      onReplacementChange,
      onReplaceKeyDown,
      replaceOpen,
      onToggleReplace,
      matchCase,
      onToggleMatchCase,
      wholeWord,
      onToggleWholeWord,
      regexMode,
      onToggleRegex,
      findCount,
      canStep,
      onPrev,
      onNext,
      onClose,
      canReplace,
      onReplaceOne,
      onReplaceAll,
    }) {
      return h('div', {
        className: 'ps-find',
        role: 'dialog',
        'aria-label': t('find.title'),
        onKeyDown: (event) => {
          if (event.key === 'Escape') {
            event.preventDefault()
            onClose()
          }
        },
      }, [
        h('div', { key: 'search-row', className: 'ps-find-row' }, [
          h('button', {
            key: 'replace-toggle',
            type: 'button',
            className: 'ps-find-chevron',
            title: replaceOpen ? t('find.hideReplace') : t('find.showReplace'),
            'aria-label': replaceOpen ? t('find.hideReplace') : t('find.showReplace'),
            'aria-expanded': replaceOpen,
            onClick: onToggleReplace,
          }, replaceOpen ? h(ChevronDownIcon, { size: 13 }) : h(ChevronIcon, { size: 13 })),
          h('div', { key: 'field', className: 'ps-find-field' }, [
            h('input', {
              key: 'query',
              ref: findInputRef,
              className: 'ps-find-input',
              value: query,
              placeholder: t('find.placeholder'),
              'aria-label': t('find.placeholder'),
              spellCheck: false,
              onChange: (event) => onQueryChange(event.target.value),
              onKeyDown: onFindKeyDown,
            }),
            h('button', {
              key: 'case',
              type: 'button',
              className: 'ps-find-toggle',
              'data-active': matchCase ? 'true' : 'false',
              title: t('find.matchCase'),
              'aria-label': t('find.matchCase'),
              'aria-pressed': matchCase,
              onClick: onToggleMatchCase,
            }, 'Aa'),
            h('button', {
              key: 'word',
              type: 'button',
              className: 'ps-find-toggle ps-find-word',
              'data-active': wholeWord ? 'true' : 'false',
              title: t('find.wholeWord'),
              'aria-label': t('find.wholeWord'),
              'aria-pressed': wholeWord,
              onClick: onToggleWholeWord,
            }, 'ab'),
            h('button', {
              key: 'regex',
              type: 'button',
              className: 'ps-find-toggle',
              'data-active': regexMode ? 'true' : 'false',
              title: t('find.regex'),
              'aria-label': t('find.regex'),
              'aria-pressed': regexMode,
              onClick: onToggleRegex,
            }, '.*'),
          ]),
          h('span', { key: 'trail', className: 'ps-find-trail ps-find-search-actions' }, [
            h('span', { key: 'count', className: 'ps-find-count', role: 'status' }, findCount),
            h('button', {
              key: 'prev',
              type: 'button',
              className: 'ps-find-icon',
              title: t('find.prev'),
              'aria-label': t('find.prev'),
              disabled: !canStep,
              onClick: onPrev,
            }, h(ChevronUpIcon, { size: 13 })),
            h('button', {
              key: 'next',
              type: 'button',
              className: 'ps-find-icon',
              title: t('find.next'),
              'aria-label': t('find.next'),
              disabled: !canStep,
              onClick: onNext,
            }, h(ChevronDownIcon, { size: 13 })),
            h('button', {
              key: 'close',
              type: 'button',
              className: 'ps-find-icon',
              title: t('find.close'),
              'aria-label': t('find.close'),
              onClick: onClose,
            }, h(CloseIcon, { size: 13 })),
          ]),
        ]),
        replaceOpen
          ? h('div', { key: 'replace-row', className: 'ps-find-row ps-find-replace-row' }, [
            h('span', { key: 'spacer', className: 'ps-find-chevron-spacer' }),
            h('div', { key: 'field', className: 'ps-find-field' }, [
              h('input', {
                key: 'replacement',
                ref: replaceInputRef,
                className: 'ps-find-input',
                value: replacement,
                placeholder: t('find.replacePlaceholder'),
                'aria-label': t('find.replacePlaceholder'),
                spellCheck: false,
                onChange: (event) => onReplacementChange(event.target.value),
                onKeyDown: onReplaceKeyDown,
              }),
            ]),
            h('span', { key: 'trail', className: 'ps-find-trail ps-find-replace-actions' }, [
              h('button', {
                key: 'replace-one',
                type: 'button',
                className: 'ps-find-replace-action',
                title: t('find.replace'),
                disabled: !canReplace,
                onClick: onReplaceOne,
              }, t('find.replace')),
              h('button', {
                key: 'replace-all',
                type: 'button',
                className: 'ps-find-replace-action',
                title: t('find.replaceAll'),
                disabled: !canReplace,
                onClick: onReplaceAll,
              }, t('find.replaceAll')),
            ]),
          ])
          : null,
      ])
    }

    function PlanEditor({ sessionId, useTabInfo, t }) {
      const tab = useTabInfo()
      const address = tab.tab.navigation.address
      const parsed = parsePlanAddress(address)
      const planId = parsed?.planId || ''
      const session = sessionId || parsed?.sessionId || ''

      const [plan, setPlan] = useState(null)
      const [draft, setDraft] = useState('')
      const [editing, setEditing] = useState(false)
      const [touched, setTouched] = useState(false)
      const [loading, setLoading] = useState(true)
      const [error, setError] = useState(null)
      const [saving, setSaving] = useState(false)
      const [saveError, setSaveError] = useState(null)
      const [conflict, setConflict] = useState(null)
      const [savedAt, setSavedAt] = useState(null)
      const [reloadKey, setReloadKey] = useState(0)
      const textareaRef = useRef(null)
      const mirrorRef = useRef(null)
      const docRef = useRef(null)
      const currentMarkRef = useRef(null)
      const findInputRef = useRef(null)
      const replaceInputRef = useRef(null)
      const viewIndexRef = useRef({ text: '', nodes: [] })
      const baseRevisionRef = useRef('')
      const [findOpen, setFindOpen] = useState(false)
      const [replaceOpen, setReplaceOpen] = useState(false)
      const [query, setQuery] = useState('')
      const [replacement, setReplacement] = useState('')
      const [matchCase, setMatchCase] = useState(false)
      const [wholeWord, setWholeWord] = useState(false)
      const [regexMode, setRegexMode] = useState(false)
      const [matchIndex, setMatchIndex] = useState(0)
      const [viewVersion, setViewVersion] = useState(0)
      const [viewRects, setViewRects] = useState([])
      const refreshViewHighlightsRef = useRef(null)
      const viewScrollRafRef = useRef(0)
      const openWrapRef = useRef(null)
      const openMenuRef = useRef(null)
      const [openMenu, setOpenMenu] = useState(false)
      const [openChoice, setOpenChoice] = useState(() => {
        try {
          return window.localStorage.getItem('plan-editor.openChoice') === 'vscode' ? 'vscode' : 'explorer'
        } catch {
          return 'explorer'
        }
      })
      const [opening, setOpening] = useState(false)
      const [openError, setOpenError] = useState('')

      const compiledFind = useMemo(
        () => compileFindRegex(query, matchCase, wholeWord, regexMode),
        [query, matchCase, wholeWord, regexMode],
      )
      const matches = useMemo(() => findMatches(draft, compiledFind.regex), [draft, compiledFind.regex])
      const viewMatches = useMemo(
        () => findMatches(viewIndexRef.current.text, compiledFind.regex),
        [viewVersion, compiledFind.regex],
      )
      const activeMatches = editing ? matches : viewMatches
      const findCount = compiledFind.invalid
        ? t('find.invalid')
        : query === ''
          ? ''
          : activeMatches.length === 0
            ? t('find.noResults')
            : t('find.count', { current: Math.min(matchIndex + 1, activeMatches.length), total: activeMatches.length })

      const dirty = touched && plan !== null && draft !== plan.markdown
      const editingRef = useRef(editing)
      const touchedRef = useRef(touched)
      const draftRef = useRef(draft)
      const undoStackRef = useRef([])
      const redoStackRef = useRef([])
      const historyKindRef = useRef('')
      const historyTimeRef = useRef(0)
      const scrollRestoreRef = useRef(null)
      editingRef.current = editing
      touchedRef.current = touched
      draftRef.current = draft

      useEffect(() => {
        if (activeMatches.length === 0) {
          if (matchIndex !== 0) setMatchIndex(0)
          return
        }
        if (matchIndex >= activeMatches.length) setMatchIndex(activeMatches.length - 1)
      }, [activeMatches, matchIndex])

      useEffect(() => {
        if (!findOpen) return
        if (activeMatches.length === 0) {
          setMatchIndex(0)
          return
        }
        const textarea = textareaRef.current
        const position = editing && textarea !== null ? textarea.selectionStart : 0
        const next = activeMatches.findIndex((match) => match.start >= position)
        setMatchIndex(next === -1 ? 0 : next)
        // Only a new query, option, or mode should jump back to the caret's neighborhood.
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [query, matchCase, wholeWord, regexMode, findOpen, editing])

      useEffect(() => {
        if (!findOpen || !editing) return
        const textarea = textareaRef.current
        const mirror = mirrorRef.current
        if (textarea === null || mirror === null) return
        mirror.scrollTop = textarea.scrollTop
        mirror.scrollLeft = textarea.scrollLeft
        const mark = currentMarkRef.current
        if (mark === null) return
        const markRect = mark.getBoundingClientRect()
        const mirrorRect = mirror.getBoundingClientRect()
        const top = mirror.scrollTop + markRect.top - mirrorRect.top
        const target = Math.max(0, top - Math.max(0, textarea.clientHeight / 3))
        textarea.scrollTop = target
        mirror.scrollTop = target
      }, [findOpen, editing, matchIndex, query, matchCase, wholeWord, regexMode])

      useEffect(() => {
        if (editing || !findOpen) {
          viewIndexRef.current = { text: '', nodes: [] }
          return
        }
        const root = docRef.current
        if (root === null) return
        viewIndexRef.current = collectTextIndex(root)
        setViewVersion((version) => version + 1)
      }, [editing, findOpen, plan, draft])

      const refreshViewHighlights = () => {
        if (editing || !findOpen) {
          setViewRects((previous) => (previous.length === 0 ? previous : []))
          return
        }
        const root = docRef.current
        const index = viewIndexRef.current
        if (root === null || index.nodes.length === 0) {
          setViewRects((previous) => (previous.length === 0 ? previous : []))
          return
        }
        if (viewMatches.length === 0) {
          setViewRects((previous) => (previous.length === 0 ? previous : []))
          return
        }
        const rootRect = root.getBoundingClientRect()
        const next = []
        for (let indexInMatches = 0; indexInMatches < viewMatches.length; indexInMatches += 1) {
          const range = rangeForMatch(index.nodes, viewMatches[indexInMatches])
          if (range === undefined) continue
          for (const rect of Array.from(range.getClientRects())) {
            if (rect.width === 0 || rect.height === 0) continue
            if (rect.bottom < rootRect.top || rect.top > rootRect.bottom) continue
            next.push({
              left: rect.left - rootRect.left,
              top: rect.top - rootRect.top,
              width: rect.width,
              height: rect.height,
              current: indexInMatches === matchIndex,
            })
          }
        }
        setViewRects(next)
      }
      refreshViewHighlightsRef.current = refreshViewHighlights

      const onViewScroll = () => {
        if (viewScrollRafRef.current !== 0) return
        viewScrollRafRef.current = requestAnimationFrame(() => {
          viewScrollRafRef.current = 0
          refreshViewHighlightsRef.current?.()
        })
      }

      useEffect(() => {
        if (editing || !findOpen) {
          setViewRects((previous) => (previous.length === 0 ? previous : []))
          return
        }
        const root = docRef.current
        const index = viewIndexRef.current
        if (root === null || index.nodes.length === 0) {
          setViewRects((previous) => (previous.length === 0 ? previous : []))
          return
        }
        const current = viewMatches[matchIndex]
        if (current !== undefined) {
          const range = rangeForMatch(index.nodes, current)
          if (range !== undefined) {
            const rect = range.getBoundingClientRect()
            const rootRect = root.getBoundingClientRect()
            if (rect.top < rootRect.top + 72 || rect.bottom > rootRect.bottom - 28) {
              root.scrollTop += rect.top - rootRect.top - root.clientHeight / 3
            }
          }
        }
        refreshViewHighlightsRef.current?.()
      }, [editing, findOpen, viewMatches, matchIndex, viewVersion])

      useEffect(() => {
        if (editing || !findOpen) return undefined
        const onResize = () => refreshViewHighlightsRef.current?.()
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
      }, [editing, findOpen])

      useEffect(() => () => {
        if (viewScrollRafRef.current !== 0) cancelAnimationFrame(viewScrollRafRef.current)
      }, [])

      useEffect(() => {
        if (!openMenu) return undefined
        const onPointerDown = (event) => {
          if (openWrapRef.current !== null && !openWrapRef.current.contains(event.target)) setOpenMenu(false)
        }
        const onKeyDown = (event) => {
          if (event.key !== 'Escape') return
          event.preventDefault()
          event.stopPropagation()
          setOpenMenu(false)
        }
        document.addEventListener('pointerdown', onPointerDown)
        document.addEventListener('keydown', onKeyDown, true)
        return () => {
          document.removeEventListener('pointerdown', onPointerDown)
          document.removeEventListener('keydown', onKeyDown, true)
        }
      }, [openMenu])

      useEffect(() => {
        if (!openMenu) return undefined
        const frame = requestAnimationFrame(() => {
          openMenuRef.current?.querySelector('button')?.focus()
        })
        return () => cancelAnimationFrame(frame)
      }, [openMenu])

      useEffect(() => {
        if (openError === '') return undefined
        const timer = setTimeout(() => setOpenError(''), 5000)
        return () => clearTimeout(timer)
      }, [openError])

      const runOpen = async (target) => {
        if (opening || saving || session === '' || planId === '') return
        setOpenMenu(false)
        setOpenError('')
        setOpening(true)
        try {
          if (dirty) {
            const saved = await persist(baseRevisionRef.current)
            if (!saved) {
              setOpenError(t('open.saveFailed'))
              return
            }
          }
          const data = await openPlanFile(session, planId, target)
          if (data === undefined || data.ok !== true) {
            const message = data && data.error && data.error.message ? data.error.message : t('editor.failed')
            throw new Error(message)
          }
          setOpenChoice(target)
          try {
            window.localStorage.setItem('plan-editor.openChoice', target)
          } catch {
            // Persistence is optional; the action still succeeded.
          }
        } catch (reason) {
          setOpenError(t('open.failed', { message: reason && reason.message ? reason.message : String(reason) }))
        } finally {
          setOpening(false)
        }
      }

      const toggleOpenMenu = () => {
        if (opening || saving) return
        setOpenError('')
        setOpenMenu((value) => !value)
      }

      useEffect(() => {
        let alive = true
        setLoading(true)
        setError(null)
        if (session === '' || planId === '') {
          setLoading(false)
          setError(t('editor.failed'))
          return () => { alive = false }
        }
        getPlan(session, planId).then((data) => {
          if (!alive) return
          if (data && data.ok && data.plan) {
            setPlan(data.plan)
            setDraft(data.plan.markdown)
            setTouched(false)
            baseRevisionRef.current = data.plan.revision
            setSavedAt(data.plan.updatedAt)
            clearHistory()
          } else {
            setError(data && data.error && data.error.code === 'not_found'
              ? t('editor.notFound')
              : (data && data.error && data.error.message) || t('editor.failed'))
          }
        }).catch((reason) => {
          if (alive) setError(reason && reason.message ? reason.message : String(reason))
        }).finally(() => {
          if (alive) setLoading(false)
        })
        return () => { alive = false }
      }, [session, planId, reloadKey])

      useEffect(() => {
        if (plan === null) return
        if (!touchedRef.current || draftRef.current === plan.markdown) {
          setTouched(false)
          setDraft(plan.markdown)
          baseRevisionRef.current = plan.revision
          return
        }
        if (plan.revision !== baseRevisionRef.current) setConflict(plan)
      }, [plan])

      useEffect(() => {
        if (session === '' || planId === '') return undefined
        let alive = true
        let timer
        const tick = async () => {
          if (!alive) return
          try {
            if (typeof document === 'undefined' || document.visibilityState !== 'hidden') {
              const data = await getPlan(session, planId)
              if (alive && data && data.ok && data.plan) {
                setPlan((previous) => {
                  if (previous === null) return data.plan
                  if (previous.revision === data.plan.revision) return previous
                  if (previous.updatedAt > data.plan.updatedAt) return previous
                  return data.plan
                })
              }
            }
          } catch {
            // The next tick retries; transient failures must not replace visible content.
          }
          if (alive) timer = setTimeout(tick, 2000)
        }
        timer = setTimeout(tick, 2000)
        return () => {
          alive = false
          clearTimeout(timer)
        }
      }, [session, planId])

      const persist = useCallback(async (baseRevision) => {
        if (session === '' || planId === '') return false
        setSaving(true)
        setSaveError(null)
        try {
          const data = await savePlan(session, planId, draft, baseRevision)
          if (data && data.ok && data.plan) {
            setPlan(data.plan)
            setDraft(data.plan.markdown)
            setTouched(false)
            baseRevisionRef.current = data.plan.revision
            setConflict(null)
            setSavedAt(data.plan.updatedAt)
            return true
          } else if (data && data.error && data.error.code === 'conflict') {
            setConflict(data.plan || plan)
          } else {
            setSaveError(data && data.error && data.error.message ? data.error.message : t('editor.failed'))
          }
          return false
        } catch (reason) {
          setSaveError(reason && reason.message ? reason.message : String(reason))
          return false
        } finally {
          setSaving(false)
        }
      }, [session, planId, draft, plan, t])

      const persistRef = useRef(persist)
      persistRef.current = persist

      useEffect(() => {
        if (!dirty || saving || conflict || saveError !== null) return undefined
        const timer = setTimeout(() => {
          void persistRef.current(baseRevisionRef.current)
        }, 1200)
        return () => clearTimeout(timer)
      }, [draft, editing, dirty, saving, conflict, saveError])

      useEffect(() => {
        const ratio = scrollRestoreRef.current
        if (ratio === null) return
        scrollRestoreRef.current = null
        requestAnimationFrame(() => {
          const root = editing ? textareaRef.current : docRef.current
          if (root === null) return
          const max = Math.max(0, root.scrollHeight - root.clientHeight)
          root.scrollTop = Math.round(ratio * max)
          if (!editing) refreshViewHighlightsRef.current?.()
        })
      }, [editing])

      const clearHistory = () => {
        undoStackRef.current = []
        redoStackRef.current = []
        historyKindRef.current = ''
        historyTimeRef.current = 0
      }

      const recordHistory = (kind) => {
        const now = Date.now()
        const previous = draftRef.current
        const coalesce = kind === 'type'
          && historyKindRef.current === 'type'
          && now - historyTimeRef.current < 800
          && undoStackRef.current.length > 0
        redoStackRef.current = []
        if (coalesce) {
          historyTimeRef.current = now
          return
        }
        const element = textareaRef.current
        undoStackRef.current.push({
          text: previous,
          start: element === null ? 0 : element.selectionStart,
          end: element === null ? 0 : element.selectionEnd,
        })
        if (undoStackRef.current.length > 100) undoStackRef.current.shift()
        historyKindRef.current = kind
        historyTimeRef.current = now
      }

      const applyHistory = (entry) => {
        setDraft(entry.text)
        setTouched(plan !== null && entry.text !== plan.markdown)
        setSaveError(null)
        historyKindRef.current = 'history'
        historyTimeRef.current = 0
        if (editingRef.current) {
          requestAnimationFrame(() => {
            const element = textareaRef.current
            if (element === null) return
            element.focus()
            const start = Math.min(entry.start, entry.text.length)
            const end = Math.min(entry.end, entry.text.length)
            element.setSelectionRange(start, end)
          })
        }
      }

      const undo = () => {
        const entry = undoStackRef.current.pop()
        if (entry === undefined) return
        const element = textareaRef.current
        redoStackRef.current.push({
          text: draftRef.current,
          start: element === null ? 0 : element.selectionStart,
          end: element === null ? 0 : element.selectionEnd,
        })
        if (redoStackRef.current.length > 100) redoStackRef.current.shift()
        applyHistory(entry)
      }

      const redo = () => {
        const entry = redoStackRef.current.pop()
        if (entry === undefined) return
        const element = textareaRef.current
        undoStackRef.current.push({
          text: draftRef.current,
          start: element === null ? 0 : element.selectionStart,
          end: element === null ? 0 : element.selectionEnd,
        })
        if (undoStackRef.current.length > 100) undoStackRef.current.shift()
        applyHistory(entry)
      }

      const setMode = (next) => {
        if (next === editing || plan === null || saving) return
        if (!next && dirty) {
          if (typeof window !== 'undefined' && !window.confirm(t('editor.confirmDiscard'))) return
          setDraft(plan.markdown)
          setTouched(false)
          baseRevisionRef.current = plan.revision
          setConflict(null)
          setSaveError(null)
          clearHistory()
        }
        const active = editing ? textareaRef.current : docRef.current
        if (active === null) {
          scrollRestoreRef.current = 0
        } else {
          const max = Math.max(0, active.scrollHeight - active.clientHeight)
          scrollRestoreRef.current = max === 0 ? 0 : active.scrollTop / max
        }
        if (next) {
          if (!touched || draft === plan.markdown) {
            setDraft(plan.markdown)
            setTouched(false)
            baseRevisionRef.current = plan.revision
          }
          setSaveError(null)
          setEditing(true)
          requestAnimationFrame(() => textareaRef.current?.focus())
        } else {
          setEditing(false)
          setTouched(false)
          setFindOpen(false)
          setReplaceOpen(false)
        }
      }

      const reloadLatest = () => {
        if (!conflict) return
        setPlan(conflict)
        setDraft(conflict.markdown)
        setTouched(false)
        baseRevisionRef.current = conflict.revision
        setConflict(null)
        setSaveError(null)
        clearHistory()
      }

      const overwrite = () => {
        if (!conflict) return
        const next = conflict
        setPlan(next)
        baseRevisionRef.current = next.revision
        setConflict(null)
        void persist(next.revision)
      }

      const discard = () => {
        if (plan === null) return
        if (!window.confirm(t('editor.confirmDiscard'))) return
        setDraft(plan.markdown)
        setTouched(false)
        baseRevisionRef.current = plan.revision
        setConflict(null)
        setSaveError(null)
        clearHistory()
      }

      const syncEditorScroll = () => {
        const textarea = textareaRef.current
        const mirror = mirrorRef.current
        if (textarea === null || mirror === null) return
        mirror.scrollTop = textarea.scrollTop
        mirror.scrollLeft = textarea.scrollLeft
      }

      const openFind = (withReplace) => {
        setFindOpen(true)
        if (withReplace) setReplaceOpen(true)
        const textarea = textareaRef.current
        if (!findOpen && textarea !== null && textarea.selectionEnd > textarea.selectionStart) {
          const selected = draft.slice(textarea.selectionStart, textarea.selectionEnd)
          if (selected !== '' && selected.length <= 200 && !selected.includes('\n')) setQuery(selected)
        }
        requestAnimationFrame(() => {
          const input = withReplace ? replaceInputRef.current : findInputRef.current
          input?.focus()
          input?.select()
        })
      }

      const closeFind = () => {
        setFindOpen(false)
        setReplaceOpen(false)
        requestAnimationFrame(() => {
          if (editing) textareaRef.current?.focus()
          else docRef.current?.focus()
        })
      }

      const stepMatch = (delta) => {
        if (activeMatches.length === 0) return
        setMatchIndex((current) => {
          const base = current >= activeMatches.length ? 0 : current
          return (base + delta + activeMatches.length) % activeMatches.length
        })
      }

      const applyReplacement = (next) => {
        recordHistory('replace')
        setDraft(next)
        setTouched(true)
        setSaveError(null)
      }

      const expandReplacement = (sourceText) => {
        if (!regexMode || compiledFind.regex === null) return replacement
        try {
          const flags = compiledFind.regex.flags.replace('g', '')
          const regex = new RegExp(compiledFind.regex.source, flags)
          if (!regex.test(sourceText)) return replacement
          return sourceText.replace(regex, replacement)
        } catch {
          return replacement
        }
      }

      const replaceOneInView = () => {
        if (viewMatches.length === 0) return
        const viewText = viewIndexRef.current.text
        const mapped = mapViewMatchesToSource(viewText, viewMatches, draft)
        let target = mapped[Math.min(matchIndex, viewMatches.length - 1)]
        if (target === undefined) {
          const fallback = matches[Math.min(matchIndex, matches.length - 1)]
          if (fallback === undefined) return
          target = { start: fallback.start, end: fallback.end }
        }
        const inserted = expandReplacement(draft.slice(target.start, target.end))
        applyReplacement(`${draft.slice(0, target.start)}${inserted}${draft.slice(target.end)}`)
      }

      const replaceAllInView = () => {
        if (viewMatches.length === 0) return
        const viewText = viewIndexRef.current.text
        const mapped = mapViewMatchesToSource(viewText, viewMatches, draft)
        const targets = mapped.filter((target) => target !== undefined).sort((left, right) => right.start - left.start)
        if (targets.length === 0) {
          if (compiledFind.regex === null) return
          const next = regexMode
            ? draft.replace(compiledFind.regex, replacement)
            : draft.replace(compiledFind.regex, () => replacement)
          applyReplacement(next)
          return
        }
        let next = draft
        for (const target of targets) {
          const inserted = expandReplacement(next.slice(target.start, target.end))
          next = `${next.slice(0, target.start)}${inserted}${next.slice(target.end)}`
        }
        applyReplacement(next)
      }

      const replaceOne = () => {
        if (!editing) {
          replaceOneInView()
          return
        }
        if (matches.length === 0) return
        const match = matches[Math.min(matchIndex, matches.length - 1)]
        if (match === undefined) return
        let inserted = replacement
        if (regexMode && compiledFind.regex !== null) {
          try {
            const flags = compiledFind.regex.flags.replace('g', '')
            inserted = draft.slice(match.start, match.end).replace(new RegExp(compiledFind.regex.source, flags), replacement)
          } catch {
            inserted = replacement
          }
        }
        recordHistory('replace')
        setDraft(`${draft.slice(0, match.start)}${inserted}${draft.slice(match.end)}`)
        setTouched(true)
        setSaveError(null)
      }

      const replaceAll = () => {
        if (!editing) {
          replaceAllInView()
          return
        }
        if (matches.length === 0 || compiledFind.regex === null) return
        const next = regexMode
          ? draft.replace(compiledFind.regex, replacement)
          : draft.replace(compiledFind.regex, () => replacement)
        recordHistory('replace')
        setDraft(next)
        setTouched(true)
        setSaveError(null)
      }

      const onFindKeyDown = (event) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          stepMatch(event.shiftKey ? -1 : 1)
          return
        }
        if (event.key === 'Escape') {
          event.preventDefault()
          closeFind()
          return
        }
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') {
          event.preventDefault()
          event.currentTarget.select()
        }
      }

      const onReplaceKeyDown = (event) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          replaceOne()
          return
        }
        if (event.key === 'Escape') {
          event.preventDefault()
          closeFind()
        }
      }

      const onPaneKeyDown = (event) => {
        if (event.defaultPrevented) return
        const target = event.target
        const textEntry = target instanceof HTMLElement && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')
        if (!textEntry && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
          event.preventDefault()
          if (event.shiftKey) redo()
          else undo()
          return
        }
        if (!textEntry && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
          event.preventDefault()
          redo()
          return
        }
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') {
          event.preventDefault()
          openFind(false)
          return
        }
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'h') {
          event.preventDefault()
          openFind(true)
          return
        }
        if (event.key === 'Escape' && findOpen) {
          event.preventDefault()
          closeFind()
        }
      }

      const onKeyDown = (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
          event.preventDefault()
          if (event.shiftKey) redo()
          else undo()
          return
        }
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
          event.preventDefault()
          redo()
          return
        }
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') {
          event.preventDefault()
          openFind(false)
          return
        }
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'h') {
          event.preventDefault()
          openFind(true)
          return
        }
        if (event.key === 'Escape' && findOpen) {
          event.preventDefault()
          closeFind()
          return
        }
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
          event.preventDefault()
          void persist(baseRevisionRef.current)
          return
        }
        if (event.key === 'Escape') {
          event.preventDefault()
          setMode(false)
          return
        }
        if (event.key === 'Tab') {
          event.preventDefault()
          const element = event.currentTarget
          const start = element.selectionStart
          const end = element.selectionEnd
          const next = `${draft.slice(0, start)}  ${draft.slice(end)}`
          recordHistory('type')
          setDraft(next)
          requestAnimationFrame(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart = start + 2
              textareaRef.current.selectionEnd = start + 2
            }
          })
        }
      }

      const findBarProps = {
        t,
        findInputRef,
        replaceInputRef,
        query,
        onQueryChange: setQuery,
        onFindKeyDown,
        replacement,
        onReplacementChange: setReplacement,
        onReplaceKeyDown,
        replaceOpen,
        onToggleReplace: () => {
          const next = !replaceOpen
          setReplaceOpen(next)
          requestAnimationFrame(() => {
            const input = next ? replaceInputRef.current : findInputRef.current
            input?.focus()
          })
        },
        matchCase,
        onToggleMatchCase: () => setMatchCase((value) => !value),
        wholeWord,
        onToggleWholeWord: () => setWholeWord((value) => !value),
        regexMode,
        onToggleRegex: () => setRegexMode((value) => !value),
        findCount,
        canStep: activeMatches.length > 0,
        onPrev: () => stepMatch(-1),
        onNext: () => stepMatch(1),
        onClose: closeFind,
        canReplace: editing ? matches.length > 0 : viewMatches.length > 0,
        onReplaceOne: replaceOne,
        onReplaceAll: replaceAll,
      }

      if (loading && plan === null) {
        return h('div', { className: 'ps-pane' }, h('div', { className: 'ps-state', role: 'status' }, t('editor.loading')))
      }

      if (error !== null && plan === null) {
        return h('div', { className: 'ps-pane' }, h('div', { className: 'ps-state ps-state-error', role: 'status' }, [
          h(AlertIcon, { key: 'i', size: 18 }),
          h('span', { key: 't' }, error),
          h('button', {
            key: 'retry',
            type: 'button',
            className: 'ps-retry',
            onClick: () => setReloadKey((value) => value + 1),
          }, t('editor.retry')),
        ]))
      }

      if (plan === null) return h('div', { className: 'ps-pane' })

      const lines = draft.split('\n').length
      const status = saving
        ? t('editor.saving')
        : saveError !== null
          ? t('editor.saveFailed', { message: saveError })
          : conflict !== null
            ? t('editor.statusConflict')
            : dirty
              ? t('editor.unsaved')
              : t('editor.statusSaved', { time: formatTime(savedAt || plan.updatedAt) })
      const openMainLabel = openChoice === 'vscode' ? t('open.vscode') : t('open.explorer')

      return h('div', { className: 'ps-pane', onKeyDown: onPaneKeyDown }, [
        h('div', { key: 'toolbar', className: 'ps-toolbar' }, [
          h('span', { key: 'heading', className: 'ps-heading' }, [
            h(DocIcon, { key: 'i', size: 15 }),
            h('span', { key: 't', className: 'ps-heading-text', title: plan.title }, plan.title || t('tab.untitled')),
          ]),
          h('span', { key: 'tools', className: 'ps-tools' }, [
            h('button', {
              key: 'find',
              type: 'button',
              className: 'ps-tool-button',
              title: t('find.title'),
              'aria-label': t('find.title'),
              onClick: () => openFind(false),
            }, h(SearchIcon, { size: 14 })),
            h('span', { key: 'seg', className: 'ps-seg', role: 'group', 'aria-label': t('editor.mode') }, [
              h('button', {
                key: 'view',
                type: 'button',
                'data-active': editing ? 'false' : 'true',
                title: t('editor.view'),
                'aria-label': t('editor.view'),
                'aria-pressed': !editing,
                disabled: saving,
                onClick: () => setMode(false),
              }, h(LockIcon, { size: 14 })),
              h('button', {
                key: 'edit',
                type: 'button',
                'data-active': editing ? 'true' : 'false',
                title: t('editor.edit'),
                'aria-label': t('editor.edit'),
                'aria-pressed': editing,
                disabled: saving,
                onClick: () => setMode(true),
              }, h(PencilIcon, { size: 14 })),
            ]),
            h('div', { key: 'open', className: 'ps-open-wrap', ref: openWrapRef, 'aria-busy': opening || saving }, [
              h('div', { key: 'split', className: 'ps-open-split' }, [
                h('button', {
                  key: 'main',
                  type: 'button',
                  className: 'ps-open-main',
                  title: openMainLabel,
                  'aria-label': openMainLabel,
                  disabled: opening || saving,
                  onClick: () => { void runOpen(openChoice) },
                }, h(OpenAppIcon, { key: openChoice, target: openChoice, size: 14 })),
                h('button', {
                  key: 'chev',
                  type: 'button',
                  className: 'ps-open-chevron',
                  title: t('open.choose'),
                  'aria-label': t('open.choose'),
                  'aria-haspopup': 'menu',
                  'aria-expanded': openMenu,
                  disabled: opening || saving,
                  onClick: toggleOpenMenu,
                }, h(ChevronDownIcon, { size: 10 })),
              ]),
              openMenu
                ? h('div', { key: 'menu', className: 'ps-open-menu', role: 'menu', 'aria-label': t('open.choose'), ref: openMenuRef }, [
                  h('button', {
                    key: 'explorer',
                    type: 'button',
                    className: 'ps-open-item',
                    role: 'menuitem',
                    onClick: () => { void runOpen('explorer') },
                  }, [
                    h('span', { key: 'i', className: 'ps-open-item-icon' }, h(OpenAppIcon, { target: 'explorer', size: 15 })),
                    h('span', { key: 'l', className: 'ps-open-item-label' }, t('open.explorer')),
                    openChoice === 'explorer' ? h('span', { key: 'c', className: 'ps-open-check', 'aria-hidden': true }, '✓') : null,
                  ]),
                  h('button', {
                    key: 'vscode',
                    type: 'button',
                    className: 'ps-open-item',
                    role: 'menuitem',
                    onClick: () => { void runOpen('vscode') },
                  }, [
                    h('span', { key: 'i', className: 'ps-open-item-icon' }, h(OpenAppIcon, { target: 'vscode', size: 15 })),
                    h('span', { key: 'l', className: 'ps-open-item-label' }, t('open.vscode')),
                    openChoice === 'vscode' ? h('span', { key: 'c', className: 'ps-open-check', 'aria-hidden': true }, '✓') : null,
                  ]),
                ])
                : null,
              openError !== ''
                ? h('div', { key: 'err', className: 'ps-open-error', role: 'status' }, openError)
                : null,
            ]),
          ]),
        ]),
        conflict !== null
          ? h('div', { key: 'conflict', className: 'ps-banner', role: 'status' }, [
            h(AlertIcon, { key: 'i', size: 14 }),
            h('span', { key: 't', className: 'ps-banner-text' }, t('editor.conflict')),
            h('button', { key: 'reload', type: 'button', className: 'ps-banner-button', onClick: reloadLatest }, t('editor.reload')),
            h('button', { key: 'over', type: 'button', className: 'ps-banner-button', onClick: overwrite }, t('editor.overwrite')),
          ])
          : null,
        saveError !== null && conflict === null
          ? h('div', { key: 'error', className: 'ps-banner ps-banner-error', role: 'status' }, [
            h(AlertIcon, { key: 'i', size: 14 }),
            h('span', { key: 't', className: 'ps-banner-text' }, t('editor.saveFailed', { message: saveError })),
            h('button', { key: 'retry', type: 'button', className: 'ps-banner-button', onClick: () => { void persist(baseRevisionRef.current) } }, t('editor.retry')),
          ])
          : null,
        h('div', { key: 'main', className: 'ps-main' }, [
          editing
            ? h('div', { key: 'editor-wrap', className: 'ps-editor-wrap' }, [
              findOpen && matches.length > 0
                ? h('div', {
                  key: 'mirror',
                  ref: mirrorRef,
                  className: 'ps-editor-mirror',
                  'aria-hidden': true,
                }, renderFindHighlights(draft, matches, matchIndex, currentMarkRef))
                : null,
              h('textarea', {
                key: 'editor',
                ref: textareaRef,
                className: 'ps-editor',
                value: draft,
                spellCheck: false,
                placeholder: t('editor.placeholder'),
                'aria-label': t('editor.edit'),
                onChange: (event) => {
                  recordHistory('type')
                  setDraft(event.target.value)
                  setTouched(true)
                  setSaveError(null)
                },
                onKeyDown,
                onScroll: syncEditorScroll,
              }),
              findOpen ? h(PlanFindBar, { ...findBarProps, key: 'edit-find' }) : null,
            ])
            : h('div', {
              key: 'doc',
              className: 'ps-doc',
              ref: docRef,
              tabIndex: -1,
              'aria-label': plan.title,
              onScroll: onViewScroll,
            }, draft.trim() === ''
              ? h('div', { className: 'ps-empty' }, t('editor.empty'))
              : h(Markdown, { text: draft })),
          !editing && findOpen && viewRects.length > 0
            ? h('div', { key: 'view-highlights', className: 'ps-view-highlights', 'aria-hidden': true },
              viewRects.map((rect, index) => h('div', {
                key: `h${index}`,
                className: rect.current ? 'ps-view-highlight ps-view-highlight-current' : 'ps-view-highlight',
                style: {
                  left: `${rect.left}px`,
                  top: `${rect.top}px`,
                  width: `${rect.width}px`,
                  height: `${rect.height}px`,
                },
              })))
            : null,
          !editing && findOpen ? h(PlanFindBar, { ...findBarProps, key: 'view-find' }) : null,
        ]),
        h('div', { key: 'status', className: 'ps-status' }, [
          h('span', { key: 'state', className: 'ps-status-state' }, status),
          h('span', { key: 'counts', className: 'ps-status-counts' }, [
            h('span', { key: 'lines' }, t('editor.lines', { count: lines })),
            h('span', { key: 'sep' }, ' · '),
            h('span', { key: 'chars' }, t('editor.chars', { count: draft.length })),
            editing && dirty
              ? h('button', { key: 'discard', type: 'button', className: 'ps-link-button', onClick: discard }, t('editor.discard'))
              : null,
          ]),
        ]),
      ])
    }

    const CSS = String.raw`
.ps-card { position:relative; display:flex; flex-direction:column; gap:7px; width:100%; box-sizing:border-box; margin:2px 0; padding:12px 14px; border:1px solid var(--dsw-alias-border-l1); border-radius:12px; background:var(--dsw-alias-bg-layer-1); color:var(--dsw-alias-label-primary); font:inherit; text-align:left; cursor:pointer; transition:border-color .15s ease, box-shadow .15s ease, background-color .15s ease; }
.ps-turn-cards { display:flex; flex-direction:column; gap:8px; margin:4px 0 2px; }
.ps-card:hover { border-color:var(--dsw-alias-border-l2); box-shadow:0 2px 10px rgba(0,0,0,.07); }
.ps-card[data-open="false"] { cursor:default; }
.ps-card:focus-visible { outline:2px solid var(--dsw-alias-state-business-primary); outline-offset:2px; }
.ps-card-head { display:flex; align-items:center; gap:10px; min-width:0; }
.ps-card-icon { display:grid; place-items:center; flex:none; width:34px; height:34px; border-radius:9px; color:var(--dsw-alias-brand-primary); background:color-mix(in srgb, var(--dsw-alias-brand-primary) 12%, transparent); }
.ps-card-title { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:14px; font-weight:600; line-height:20px; }
.ps-card-badge { flex:none; padding:1px 8px; border:1px solid var(--dsw-alias-border-l1); border-radius:999px; color:var(--dsw-alias-label-secondary); background:var(--dsw-alias-bg-layer-2); font-size:11px; line-height:17px; }
.ps-card-preview { display:flex; flex-direction:column; gap:1px; min-width:0; padding-left:44px; }
.ps-card-line { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--dsw-alias-label-secondary); font-size:12.5px; line-height:18px; }
.ps-card-md { position:relative; height:93px; overflow:hidden; padding-left:44px; }
.ps-card-md .ps-markdown { font-family:var(--dsw-font-markdown-small-font-family, var(--dsw-font-family, inherit)); font-size:var(--dsw-font-markdown-small-font-size, 12px); line-height:var(--dsw-font-markdown-small-line-height, 20px); }
.ps-card-md .ps-markdown > :first-child { margin-top:0; }
.ps-card-md .ps-markdown h1 { margin:0 0 3px; padding:0; border:0; font-size:13.5px; line-height:18px; }
.ps-card-md .ps-markdown h2, .ps-card-md .ps-markdown h3, .ps-card-md .ps-markdown h4, .ps-card-md .ps-markdown h5, .ps-card-md .ps-markdown h6 { margin:4px 0 2px; font-size:12.5px; line-height:17px; }
.ps-card-md .ps-markdown p { margin:0 0 3px; }
.ps-card-md .ps-markdown ul, .ps-card-md .ps-markdown ol { margin:0 0 3px; padding-left:18px; }
.ps-card-md .ps-markdown li { margin:0; }
.ps-card-md .ps-markdown pre { margin:0 0 3px; padding:4px 6px; border-radius:6px; }
.ps-card-md .ps-markdown pre code { font-size:11px; line-height:1.45; }
.ps-card-md .ps-markdown blockquote { margin:0 0 3px; padding:0 8px; }
.ps-card-md .ps-markdown table { display:table; width:100%; margin:0 0 3px; font-size:11px; }
.ps-card-md .ps-markdown th, .ps-card-md .ps-markdown td { padding:2px 5px; }
.ps-card-md::after { content:''; position:absolute; left:0; right:0; bottom:0; height:16px; background:linear-gradient(to bottom, transparent, var(--dsw-alias-bg-layer-1)); pointer-events:none; }
.ps-card-foot { position:absolute; right:14px; bottom:12px; display:inline-flex; align-items:center; gap:6px; max-width:calc(100% - 72px); padding:3px 8px; border:1px solid var(--dsw-alias-border-l1); border-radius:999px; background:var(--dsw-alias-bg-layer-2); color:var(--dsw-alias-label-secondary); font-size:11.5px; line-height:16px; box-shadow:0 2px 6px rgba(0,0,0,.08); opacity:0; transform:translateY(2px); transition:opacity .12s ease, transform .12s ease; pointer-events:none; }
.ps-card[data-open="true"]:hover .ps-card-foot, .ps-card[data-open="true"]:focus-visible .ps-card-foot { opacity:1; transform:none; }
.ps-card[data-open="false"] .ps-card-foot { opacity:1; transform:none; }
.ps-card-hint { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
@media (hover: none) { .ps-card[data-open="true"] .ps-card-foot { opacity:1; transform:none; } }
.ps-card-chevron { display:inline-flex; color:var(--dsw-alias-label-secondary); }
.ps-inline { display:flex; align-items:center; gap:8px; min-width:0; padding:2px 0; color:var(--dsw-alias-label-secondary); font-size:12.5px; line-height:18px; }
.ps-inline-error { color:var(--dsw-alias-state-error-primary); }
.ps-inline-text { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ps-inline-title { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--dsw-alias-label-primary); font-weight:500; }
.ps-inline-open { flex:none; appearance:none; border:0; background:transparent; color:var(--dsw-alias-brand-primary); font:inherit; cursor:pointer; padding:0 2px; }
.ps-inline-open:hover { text-decoration:underline; }
.ps-tab-title { display:inline-flex; align-items:center; gap:6px; min-width:0; }
.ps-tab-title-text { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ps-pane { display:flex; flex-direction:column; height:100%; min-height:0; background:var(--dsw-alias-bg-base); color:var(--dsw-alias-label-primary); }
.ps-toolbar { display:flex; align-items:center; gap:8px; flex:none; min-height:44px; box-sizing:border-box; padding:8px 10px 8px 14px; border-bottom:1px solid var(--dsw-alias-border-l1); }
.ps-heading { display:flex; align-items:center; gap:7px; flex:1; min-width:0; color:var(--dsw-alias-label-secondary); }
.ps-heading-text { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--dsw-alias-label-primary); font-size:12.5px; font-weight:600; }
.ps-tools { display:flex; align-items:center; gap:6px; flex:none; }
.ps-tool-button { appearance:none; display:grid; place-items:center; width:24px; height:24px; padding:0; border:0; border-radius:5px; background:transparent; color:var(--dsw-alias-label-secondary); cursor:pointer; }
.ps-tool-button:hover { background:var(--dsw-alias-bg-layer-2); color:var(--dsw-alias-label-primary); }
.ps-tool-button:focus-visible { outline:2px solid var(--dsw-alias-state-business-primary); outline-offset:-1px; }
.ps-open-wrap { position:relative; display:inline-flex; flex:none; }
.ps-open-split { display:inline-flex; align-items:stretch; height:24px; box-sizing:border-box; overflow:hidden; border:.5px solid var(--dsw-alias-border-l4, var(--dsw-alias-border-l2)); border-radius:var(--dsw-radius-sm, 6px); background:transparent; }
.ps-open-main, .ps-open-chevron { appearance:none; display:inline-flex; align-items:center; justify-content:center; padding:0; border:0; background:transparent; color:var(--dsw-alias-label-secondary); cursor:pointer; }
.ps-open-main { padding:3px 5px; color:var(--dsw-alias-label-primary); }
.ps-open-chevron { padding:3px 4px 3px 3px; border-left:.5px solid var(--dsw-alias-border-l4, var(--dsw-alias-border-l2)); }
.ps-open-main:hover:not(:disabled), .ps-open-chevron:hover:not(:disabled) { background:var(--dsw-alias-bg-layer-2); color:var(--dsw-alias-label-primary); }
.ps-open-main:focus-visible, .ps-open-chevron:focus-visible { outline:2px solid var(--dsw-alias-state-business-primary); outline-offset:-1px; }
.ps-open-main:disabled, .ps-open-chevron:disabled { cursor:default; opacity:.55; }
.ps-open-app-icon { display:block; width:14px; height:14px; object-fit:contain; }
.ps-open-menu { position:absolute; top:calc(100% + 6px); right:0; z-index:20; min-width:190px; padding:4px; border:1px solid var(--dsw-alias-border-l2); border-radius:8px; background:var(--dsw-alias-bg-overlay); box-shadow:0 8px 24px rgba(0,0,0,.18); }
.ps-open-item { appearance:none; display:flex; align-items:center; gap:8px; width:100%; padding:6px 8px; border:0; border-radius:5px; background:transparent; color:var(--dsw-alias-label-primary); font:inherit; font-size:12px; line-height:18px; text-align:left; cursor:pointer; }
.ps-open-item:hover, .ps-open-item:focus-visible { background:var(--dsw-alias-bg-layer-2); outline:none; }
.ps-open-item-icon { display:inline-flex; align-items:center; justify-content:center; flex:none; width:16px; height:16px; }
.ps-open-item-icon .ps-open-app-icon { width:15px; height:15px; }
.ps-open-item-label { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ps-open-check { flex:none; color:var(--dsw-alias-state-business-primary); font-size:12px; line-height:16px; }
.ps-open-error { position:absolute; top:calc(100% + 6px); right:0; z-index:21; max-width:240px; padding:6px 8px; border:1px solid var(--dsw-alias-state-error-primary); border-radius:6px; background:var(--dsw-alias-bg-overlay); color:var(--dsw-alias-state-error-primary); font-size:11px; line-height:16px; box-shadow:0 6px 18px rgba(0,0,0,.15); }
.ps-seg { display:inline-flex; align-items:center; padding:2px; border:1px solid var(--dsw-alias-border-l1); border-radius:999px; background:var(--dsw-alias-bg-layer-1); }
.ps-seg button { appearance:none; display:grid; place-items:center; width:28px; height:24px; padding:0; border:0; border-radius:999px; background:transparent; color:var(--dsw-alias-label-secondary); cursor:pointer; }
.ps-seg button[data-active="true"] { background:var(--dsw-alias-bg-layer-2); color:var(--dsw-alias-label-primary); box-shadow:0 1px 2px rgba(0,0,0,.12); }
.ps-seg button:focus-visible { outline:2px solid var(--dsw-alias-brand-primary); outline-offset:1px; }
.ps-seg button:disabled { cursor:default; opacity:.55; }
.ps-banner { display:flex; align-items:center; gap:8px; flex:none; padding:7px 12px; border-bottom:1px solid var(--dsw-alias-border-l1); color:var(--dsw-alias-state-warn-primary); background:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 9%, transparent); font-size:11.5px; line-height:17px; }
.ps-banner-error { color:var(--dsw-alias-state-error-primary); background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 9%, transparent); }
.ps-banner-text { flex:1; min-width:0; }
.ps-banner-button { flex:none; appearance:none; border:1px solid currentColor; border-radius:6px; padding:2px 7px; background:transparent; color:inherit; font:inherit; font-size:11px; line-height:16px; cursor:pointer; }
.ps-banner-button:hover { background:color-mix(in srgb, currentColor 10%, transparent); }
.ps-main { position:relative; flex:1; min-height:0; display:flex; flex-direction:column; overflow:hidden; }
.ps-editor-wrap { position:relative; flex:1; min-height:0; display:flex; }
.ps-editor { position:relative; z-index:1; flex:1; width:100%; box-sizing:border-box; margin:0; padding:16px 18px; border:0; outline:none; resize:none; background:transparent; color:var(--dsw-alias-label-primary); caret-color:var(--dsw-alias-brand-primary); font-family:var(--ds-font-family-code, ui-monospace, SFMono-Regular, Menlo, Consolas, "Cascadia Mono", monospace); font-size:var(--dsw-font-markdown-code-font-size, 12px); line-height:var(--dsw-font-markdown-code-line-height, 19px); tab-size:2; white-space:pre-wrap; overflow-wrap:break-word; scrollbar-gutter:stable; }
.ps-editor-mirror { position:absolute; inset:0; z-index:0; box-sizing:border-box; overflow:hidden; pointer-events:none; user-select:none; margin:0; padding:16px 18px; padding-right:calc(18px + var(--dsh-scrollbar-width, 5px)); border:0; background:transparent; color:transparent; font-family:var(--ds-font-family-code, ui-monospace, SFMono-Regular, Menlo, Consolas, "Cascadia Mono", monospace); font-size:var(--dsw-font-markdown-code-font-size, 12px); line-height:var(--dsw-font-markdown-code-line-height, 19px); tab-size:2; white-space:pre-wrap; overflow-wrap:break-word; }
.ps-find-mark { color:transparent; background:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 28%, transparent); border-radius:2px; }
.ps-find-mark-current { background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 45%, transparent); }
.ps-find { position:absolute; top:6px; right:6px; z-index:6; width:min(360px, calc(100% - 12px)); display:flex; flex-direction:column; gap:4px; padding:5px; border:1px solid var(--dsw-alias-border-l2); border-radius:7px; background:var(--dsw-alias-bg-layer-1); box-shadow:0 8px 24px rgba(0,0,0,.28); }
.ps-find-row { display:flex; align-items:center; gap:4px; min-width:0; }
.ps-find-trail { flex:none; width:118px; display:flex; align-items:center; gap:4px; justify-content:flex-start; }
.ps-find-search-actions { justify-content:flex-start; }
.ps-find-chevron { flex:none; display:grid; place-items:center; width:20px; height:24px; padding:0; border:0; border-radius:4px; background:transparent; color:var(--dsw-alias-label-secondary); cursor:pointer; }
.ps-find-chevron:hover { background:var(--dsw-alias-bg-layer-2); color:var(--dsw-alias-label-primary); }
.ps-find-chevron:focus-visible { outline:2px solid var(--dsw-alias-state-business-primary); outline-offset:-1px; }
.ps-find-chevron-spacer { flex:none; width:20px; height:24px; }
.ps-find-field { display:flex; align-items:center; flex:1; min-width:0; height:24px; padding:0 2px; border:1px solid var(--dsw-alias-border-l1); border-radius:5px; background:var(--dsw-alias-bg-layer-2); }
.ps-find-field:focus-within { border-color:var(--dsw-alias-state-business-primary); }
.ps-find-input { flex:1; min-width:0; height:22px; box-sizing:border-box; padding:0 4px; border:0; background:transparent; color:var(--dsw-alias-label-primary); font:inherit; font-size:12px; outline:none; }
.ps-find-icon { flex:none; display:grid; place-items:center; width:20px; height:24px; padding:0; border:0; border-radius:4px; background:transparent; color:var(--dsw-alias-label-secondary); cursor:pointer; }
.ps-find-icon:hover:not(:disabled) { background:var(--dsw-alias-bg-layer-2); color:var(--dsw-alias-label-primary); }
.ps-find-icon:focus-visible { outline:2px solid var(--dsw-alias-state-business-primary); outline-offset:-1px; }
.ps-find-icon:disabled { opacity:.4; cursor:default; }
.ps-find-toggle { flex:none; display:grid; place-items:center; min-width:20px; height:20px; padding:0 3px; border:1px solid transparent; border-radius:4px; background:transparent; color:var(--dsw-alias-label-secondary); font:inherit; font-size:10.5px; font-weight:500; cursor:pointer; }
.ps-find-toggle:hover { background:var(--dsw-alias-bg-layer-2); color:var(--dsw-alias-label-primary); }
.ps-find-toggle[data-active="true"] { background:var(--dsw-alias-state-business-tertiary); color:var(--dsw-alias-state-business-primary); border-color:color-mix(in srgb, var(--dsw-alias-state-business-primary) 30%, transparent); }
.ps-find-toggle:focus-visible { outline:2px solid var(--dsw-alias-state-business-primary); outline-offset:-1px; }
.ps-find-word { text-decoration:underline; text-underline-offset:2px; }
.ps-find-count { flex:none; box-sizing:border-box; min-width:46px; padding:0 6px; color:var(--dsw-alias-label-secondary); font-size:10.5px; font-variant-numeric:tabular-nums; text-align:center; white-space:nowrap; }
.ps-find-replace-action { flex:none; height:20px; padding:0 6px; border:1px solid var(--dsw-alias-border-l1); border-radius:4px; background:var(--dsw-alias-bg-layer-2); color:var(--dsw-alias-label-secondary); font:inherit; font-size:10.5px; cursor:pointer; }
.ps-find-replace-action:hover:not(:disabled) { background:var(--dsw-alias-bg-layer-1); color:var(--dsw-alias-label-primary); }
.ps-find-replace-action:disabled { opacity:.4; cursor:default; }
.ps-find-replace-action:focus-visible { outline:2px solid var(--dsw-alias-state-business-primary); outline-offset:1px; }
.ps-editor::placeholder { color:var(--dsw-alias-label-secondary); opacity:.7; }
.ps-doc { flex:1; overflow:auto; padding:16px 20px 40px; outline:none; }
.ps-view-highlights { position:absolute; inset:0; z-index:2; pointer-events:none; overflow:hidden; }
.ps-view-highlight { position:absolute; border-radius:2px; background:rgba(234, 179, 8, .38); }
.ps-view-highlight-current { background:rgba(59, 130, 246, .55); }
.ps-empty { color:var(--dsw-alias-label-secondary); font-size:12.5px; }
.ps-status { display:flex; align-items:center; justify-content:space-between; gap:10px; flex:none; padding:6px 12px; border-top:1px solid var(--dsw-alias-border-l1); color:var(--dsw-alias-label-secondary); font-size:11px; line-height:16px; }
.ps-status-counts { display:inline-flex; align-items:center; gap:2px; flex:none; }
.ps-link-button { appearance:none; border:0; background:transparent; color:var(--dsw-alias-brand-primary); font:inherit; font-size:11px; cursor:pointer; padding:0 0 0 8px; }
.ps-link-button:hover { text-decoration:underline; }
.ps-state { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; height:100%; box-sizing:border-box; padding:24px; color:var(--dsw-alias-label-secondary); font-size:12.5px; line-height:19px; text-align:center; }
.ps-state-error { color:var(--dsw-alias-state-error-primary); }
.ps-retry { appearance:none; border:1px solid var(--dsw-alias-border-l1); border-radius:7px; padding:4px 10px; background:var(--dsw-alias-bg-layer-1); color:var(--dsw-alias-label-primary); font:inherit; font-size:12px; cursor:pointer; }
.ps-markdown { overflow-wrap:anywhere; color:var(--dsw-alias-label-primary); font-family:var(--dsw-font-markdown-base-font-family, var(--dsw-font-family, inherit)); font-size:var(--dsw-font-markdown-base-font-size, var(--dsh-content-font-size, 14px)); line-height:var(--dsw-font-markdown-base-line-height, 1.7); }
.ps-markdown > :first-child { margin-top:0; }
.ps-markdown h1, .ps-markdown h2, .ps-markdown h3, .ps-markdown h4, .ps-markdown h5, .ps-markdown h6 { margin:18px 0 8px; }
.ps-markdown h1 { margin-top:0; padding-bottom:8px; border-bottom:1px solid var(--dsw-alias-border-l1); font:var(--dsw-font-markdown-h1); }
.ps-markdown h2 { font:var(--dsw-font-markdown-h2); }
.ps-markdown h3 { font:var(--dsw-font-markdown-h3); }
.ps-markdown h4, .ps-markdown h5, .ps-markdown h6 { font:var(--dsw-font-markdown-h4); }
.ps-markdown strong { font-weight:var(--dsw-font-markdown-base-strong-font-weight, 600); }
.ps-markdown p { margin:0 0 10px; white-space:pre-wrap; }
.ps-markdown ul, .ps-markdown ol { margin:0 0 10px; padding-left:22px; }
.ps-markdown li { margin:2px 0; }
.ps-markdown li > p { margin:0; }
.ps-markdown code { padding:1px 4px; border:1px solid var(--dsw-alias-border-l1); border-radius:4px; background:var(--dsw-alias-bg-layer-2); font-family:var(--dsw-font-markdown-code-font-family, var(--ds-font-family-code, monospace)); font-size:var(--dsw-font-markdown-code-font-size, 0.92em); line-height:var(--dsw-font-markdown-code-line-height, normal); }
.ps-markdown pre { margin:0 0 12px; padding:10px 12px; overflow:auto; border:1px solid var(--dsw-alias-border-l1); border-radius:8px; background:var(--shiki-background, var(--dsw-alias-markdown-code-block, var(--dsw-alias-bg-layer-1))); }
.ps-markdown pre code { padding:0; border:0; background:transparent; color:var(--shiki-foreground, var(--dsw-alias-label-primary)); font-family:var(--dsw-font-markdown-code-block-font-family, var(--ds-font-family-code, monospace)); font-size:var(--dsw-font-markdown-code-block-font-size, var(--dsh-code-font-size, 11px)); line-height:var(--dsw-font-markdown-code-block-line-height, calc(19px + var(--dsh-code-font-delta, 0px))); }
.ps-tok-comment { color:var(--shiki-token-comment, var(--dsw-alias-label-secondary)); font-style:italic; }
.ps-tok-keyword { color:var(--shiki-token-keyword, var(--dsw-alias-state-business-primary)); }
.ps-tok-string { color:var(--shiki-token-string-expression, var(--shiki-token-string, var(--dsw-alias-state-success-primary))); }
.ps-tok-number { color:var(--shiki-token-constant, var(--dsw-alias-state-warn-primary)); }
.ps-tok-constant { color:var(--shiki-token-constant, var(--dsw-alias-state-warn-primary)); }
.ps-tok-function { color:var(--shiki-token-function, var(--dsw-alias-state-business-primary)); }
.ps-tok-type { color:var(--shiki-token-function, var(--dsw-alias-state-warn-primary)); }
.ps-tok-property { color:var(--shiki-token-constant, var(--dsw-alias-state-business-primary)); }
.ps-tok-key { color:var(--shiki-token-keyword, var(--dsw-alias-state-business-primary)); }
.ps-tok-punct { color:var(--shiki-token-punctuation, var(--dsw-alias-label-secondary)); }
.ps-tok-variable { color:var(--shiki-foreground, var(--dsw-alias-label-primary)); }
.ps-tok-tag { color:var(--shiki-token-string-expression, var(--dsw-alias-state-success-primary)); }
.ps-tok-attr { color:var(--shiki-token-function, var(--dsw-alias-state-warn-primary)); }
.ps-diff-add { color:var(--dsw-alias-state-success-primary); }
.ps-diff-del { color:var(--dsw-alias-state-error-primary); }
.ps-diff-meta { color:var(--shiki-token-comment, var(--dsw-alias-label-secondary)); }
.ps-markdown .ps-frontmatter { color:var(--dsw-alias-label-secondary); }
.ps-markdown blockquote { margin:0 0 12px; padding:2px 12px; border-left:2px solid var(--dsw-alias-border-l2); color:var(--dsw-alias-label-secondary); }
.ps-markdown blockquote p:last-child { margin-bottom:0; }
.ps-markdown hr { margin:16px 0; border:0; border-top:1px solid var(--dsw-alias-border-l1); }
.ps-markdown a { color:var(--dsw-alias-brand-primary); text-decoration:none; }
.ps-markdown a:hover { text-decoration:underline; }
.ps-markdown table { display:block; max-width:100%; margin:0 0 12px; overflow:auto; border-collapse:collapse; font-family:var(--dsw-font-markdown-table-font-family, var(--dsw-font-family, inherit)); font-size:var(--dsw-font-markdown-table-font-size, var(--dsh-content-font-size-secondary, 13px)); line-height:var(--dsw-font-markdown-table-line-height, calc(22px + var(--dsh-content-font-delta-secondary, 0px))); }
.ps-markdown th, .ps-markdown td { padding:5px 8px; border:1px solid var(--dsw-alias-border-l1); text-align:left; }
.ps-markdown th { background:var(--dsw-alias-bg-layer-2); font-family:var(--dsw-font-markdown-table-head-font-family, var(--dsw-font-family, inherit)); font-size:var(--dsw-font-markdown-table-head-font-size, var(--dsh-content-font-size-secondary, 13px)); line-height:var(--dsw-font-markdown-table-head-line-height, calc(22px + var(--dsh-content-font-delta-secondary, 0px))); font-weight:var(--dsw-font-markdown-table-head-font-weight, 600); }
.ps-markdown input[type="checkbox"] { margin:0 4px 0 0; vertical-align:middle; }
`

    return {
      inject: ['slots', 'locale', 'sidebarRight', 'sidebarRightTabs', 'sessions', 'uiConversation'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'plan-studio: locale')
        const t = ctx.locale.bind(NS)

        ctx.effect(() => {
          if (typeof document === 'undefined') return undefined
          const existing = document.querySelector('style[data-plan-studio]')
          if (existing) existing.remove()
          const tag = document.createElement('style')
          tag.dataset.planStudio = 'true'
          tag.dataset.plugin = PLUGIN_ID
          tag.textContent = CSS
          document.head.appendChild(tag)
          return () => tag.remove()
        }, 'plan-studio: styles')

        ctx.effect(() => ctx.uiConversation.events.register(planCardDefinition), 'plan-studio: chat card definition')

        ctx.effect(() => ctx.sidebarRightTabs.register({
          id: PLUGIN_ID,
          kind: 'plan-studio',
          patterns: ['dsh-resource://plan-studio/**'],
          priority: 'extension',
          canOpen: (address) => parsePlanAddress(address) !== undefined,
          title: () => t('tab.title'),
        }), 'plan-studio: sidebar tab type')

        ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({
          name: 'tool.call.toolview',
          key: 'plan',
          locale: NS,
          inject: (sessionId) => ({
            openPlan: (planId, title) => openPlanIn(ctx, sessionId, planId, title),
          }),
        }, PlanToolCard))

        ctx.slots.inject('conversation.chat.turnTail', () => ctx.slots.register({
          name: 'conversation.chat.turnTail',
          id: PLUGIN_ID,
          order: 10,
          locale: NS,
          inject: (sessionId) => {
            const binding = ctx.sessions.binding(sessionId)
            if (binding === undefined) throw new Error(`plan-studio: unknown session "${sessionId}"`)
            const chat = ctx.uiConversation.binding(binding).target('chat')
            return {
              openPlan: (planId, title) => openPlanIn(ctx, sessionId, planId, title),
              keyedHooks: {
                plans: (turn) => {
                  const snapshot = chat.getSnapshot()
                  if (snapshot === undefined) throw new Error('plan-studio: Chat target is unavailable')
                  return snapshot.nodes.turnDataSource(Number(turn), PLAN_CARD_KIND)
                },
              },
            }
          },
        }, PlanTurnCards))

        ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register({
          name: 'sidebar.right.pane.tab',
          key: PLUGIN_ID,
          locale: NS,
        }, PlanEditor))

        ctx.slots.inject('sidebar.right.pane.tab.title', () => ctx.slots.register({
          name: 'sidebar.right.pane.tab.title',
          key: PLUGIN_ID,
          locale: NS,
        }, PlanTabTitle))
      },
    }
  },
})
