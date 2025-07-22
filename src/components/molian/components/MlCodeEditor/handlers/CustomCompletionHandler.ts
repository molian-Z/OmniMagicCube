import * as monaco from 'monaco-editor'
import type { CompletionHandler } from '../types'

interface CustomCompletion {
  caption?: string
  value?: string
  meta?: string
  score?: number
  mode?: string
  prefix?: string[]
  snippetStr?: string
  // 兼容 tips.ts 的格式
  label?: string
  kind?: monaco.languages.CompletionItemKind
  insertText?: string
  detail?: string
  sortText?: string
}

interface CustomTipsData {
  highRules?: string[]
  completions?: CustomCompletion[]
}

export class CustomCompletionHandler implements CompletionHandler {
  constructor(private customTips: CustomTipsData) {}

  async getSuggestions(context: {
    beforeCursor: string
    range: monaco.IRange
    t?: any
  }): Promise<monaco.languages.CompletionItem[]> {
    const { beforeCursor, range, t } = context
    
    // 检查 completions 是否存在
    if (!this.customTips?.completions) {
      return []
    }
    
    // 过滤出匹配当前前缀的补全项
    const matchedCompletions = this.customTips.completions.filter(item => {
      if (!item) return false
      
      // 如果没有 prefix，则始终显示
      if (!item.prefix || item.prefix.length === 0) return true
      
      return item.prefix.some(prefix => {
        if (!prefix) return false
        // 检查前缀是否匹配
        if (prefix === 'this') {
          return beforeCursor.endsWith('this.')
        }
        // 可以添加其他前缀的匹配规则
        return beforeCursor.endsWith(prefix+'.')
      })
    })

    if (matchedCompletions.length === 0) return []

    return matchedCompletions.map((item, index) => {
      if (!item) return null

      // 兼容 tips.ts 的格式
      if (item.label) {
        return {
          label: item.label || '',
          kind: item.kind || monaco.languages.CompletionItemKind.Property,
          insertText: item.insertText || item.label || '',
          detail: item.detail || '',
          sortText: item.sortText || String(index).padStart(4, '0'),
          range
        }
      }
      
      // 原有的格式
      return {
        label: (item.caption || ''),
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: item.value || '',
        detail: item.meta || '引用',
        sortText: String(item.score || index).padStart(4, '0'),
        range,
        documentation: {
          value: [
            '```javascript',
            item.snippetStr || item.value || '',
            '```',
            '',
            item.meta || ''
          ].join('\n')
        }
      }
    }).filter(Boolean) as monaco.languages.CompletionItem[]
  }
} 