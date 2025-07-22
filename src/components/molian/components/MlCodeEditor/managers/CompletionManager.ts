import * as monaco from 'monaco-editor'
import type { CompletionHandler } from '../types'
import { AICodeAssistant } from '../ai'

export class CompletionManager {
  private static instance: CompletionManager
  private providers: Map<string, monaco.IDisposable> = new Map()
  private completionHandlers: Map<string, CompletionHandler> = new Map()
  private referenceCount = 0

  private constructor() {}

  static getInstance(): CompletionManager {
    if (!CompletionManager.instance) {
      CompletionManager.instance = new CompletionManager()
    }
    return CompletionManager.instance
  }

  registerHandler(type: string, handler: CompletionHandler): void {
    this.completionHandlers.set(type, handler)
  }

  registerProvider(language: string, options: {
    triggerCharacters?: string[]
    enableAI?: boolean
    aiAssistant?: AICodeAssistant
    t?: any
  }): void {
    if (this.providers.has(language)) return

    const provider = monaco.languages.registerCompletionItemProvider(language, {
      triggerCharacters: options.triggerCharacters || ['.'],
      provideCompletionItems: async (model, position) => {
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        }

        const lineContent = model.getLineContent(position.lineNumber)
        const beforeCursor = lineContent.substring(0, position.column - 1)
        
        let suggestions: monaco.languages.CompletionItem[] = []
        
        for (const [type, handler] of this.completionHandlers) {
          const handlerSuggestions = await handler.getSuggestions({
            model,
            position,
            range,
            beforeCursor,
            word,
            language,
            enableAI: options.enableAI,
            aiAssistant: options.aiAssistant,
            t: options.t
          })
          suggestions = [...suggestions, ...handlerSuggestions]
        }

        return { suggestions }
      }
    })

    this.providers.set(language, provider)
  }

  addReference(): void {
    this.referenceCount++
  }

  removeReference(): void {
    this.referenceCount--
    if (this.referenceCount <= 0) {
      this.dispose()
    }
  }

  private dispose(): void {
    this.providers.forEach(provider => provider.dispose())
    this.providers.clear()
    this.completionHandlers.clear()
    this.referenceCount = 0
  }
}