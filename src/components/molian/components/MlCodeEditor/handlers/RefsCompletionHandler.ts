import type { CompletionHandler } from '../types'
import type { CustomTips } from '../types'
import * as monaco from 'monaco-editor'
export class RefsCompletionHandler implements CompletionHandler {
  constructor(private customTips: CustomTips) {}

  async getSuggestions(context: {
    beforeCursor: string
    range: monaco.IRange
    t?: any
  }): Promise<monaco.languages.CompletionItem[]> {
    const { beforeCursor, range, t } = context
    const refsKeys = Object.keys(this.customTips)
    
    if (!beforeCursor.endsWith('$refs.')) return []

    return refsKeys.map((key, index) => ({
      label: key.replace("$", "\\$"),
      kind: monaco.languages.CompletionItemKind.Reference,
      insertText: key.replace("$", "\\$"),
      detail: t?.("codeEditor.ref") || '引用',
      sortText: String(index).padStart(4, '0'),
      range
    }))
  }
} 