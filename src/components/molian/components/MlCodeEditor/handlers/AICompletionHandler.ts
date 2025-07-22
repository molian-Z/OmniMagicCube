import * as monaco from 'monaco-editor'
import type { CompletionHandler } from '../types'
import { AICodeAssistant } from '../ai'

export class AICompletionHandler implements CompletionHandler {
  async getSuggestions(context: {
    model: monaco.editor.ITextModel
    position: monaco.Position
    range: monaco.IRange
    language: string
    enableAI?: boolean
    aiAssistant?: AICodeAssistant
  }): Promise<monaco.languages.CompletionItem[]> {
    const { model, position, range, language, enableAI, aiAssistant } = context
    
    if (!enableAI || !aiAssistant) return []

    try {
      const aiContext = {
        code: model.getValue(),
        position: { line: position.lineNumber, column: position.column },
        selection: '',
        language
      }
      
      const aiSuggestions = await aiAssistant.getCompletions(aiContext)
      return aiSuggestions.map((item, index) => ({
        label: item.label,
        kind: monaco.languages.CompletionItemKind.Text,
        insertText: item.insertText,
        detail: `🤖 AI: ${item.detail}`,
        documentation: item.documentation,
        sortText: `ai_${String(index).padStart(4, '0')}`,
        range
      }))
    } catch (error) {
      console.error('AI补全失败:', error)
      return []
    }
  }
}