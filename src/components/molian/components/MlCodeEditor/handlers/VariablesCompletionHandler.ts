import * as monaco from 'monaco-editor'
import type { CompletionHandler } from '../types'

interface VariableItem {
  caption: string
  value: string
  meta: string
  type?: string
  test?: string
}

export class VariablesCompletionHandler implements CompletionHandler {
  constructor(private variables: Record<string, VariableItem>) {}

  async getSuggestions(context: {
    beforeCursor: string
    range: monaco.IRange
    t?: any
  }): Promise<monaco.languages.CompletionItem[]> {
    const { beforeCursor, range, t } = context
    
    // 检查是否以 vars. 结尾
    if (!beforeCursor.endsWith('vars.')) return []
    
    // 检查 variables 是否存在
    if (!this.variables) return []

    return Object.entries(this.variables)
      .filter(([_, item]) => item && typeof item === 'object')
      .map(([key, item]) => ({
        label: item.caption || key,
        kind: monaco.languages.CompletionItemKind.Variable,
        insertText: item.type === 'function' ? `${key}()` : key,
        detail: item.meta || '变量',
        sortText: '0000',
        range,
        documentation: {
          value: [
            '```javascript',
            item.test || item.value || key,
            '```',
            '',
            item.meta || ''
          ].join('\n')
        }
      }))
  }
} 