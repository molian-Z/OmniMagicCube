import * as monaco from 'monaco-editor'
import type { AICodeAssistant } from './ai'

// 在现有接口基础上添加只读区域配置
export interface EditorProps {
  modelValue?: string
  readonly?: boolean
  mode?: 'javascript' | 'html' | 'json' | 'css'
  userWorker?: boolean
  maxLines?: number
  enableAI?: boolean
  aiApiKey?: string
  aiModel?: string
  // 新增：上下只读区域配置
  readonlyRegions?: {
    header?: {
      content: string
      lines?: number
    }
    footer?: {
      content: string
      lines?: number
    }
  }
}

export interface CustomTips {
  refs: any
  variable: any
  custom: {
    highRules: string[]
    completions: Array<{
      caption: string
      value: string
      meta: string
      score?: number
    }>
  }
}

export interface CodeContext {
  code: string
  position: {
    line: number
    column: number
  }
  selection: string
  language?: string
}

export interface AICompletionItem {
  label: string
  insertText: string
  detail: string
  documentation?: string
  kind?: string
}

export interface AIAnalysisResult {
  errors: Array<{
    line: number
    column: number
    message: string
    severity: 'error' | 'warning' | 'info'
  }>
  suggestions: string[]
  optimizations: string[]
  complexity: {
    score: number
    description: string
  }
}

export interface AIFixSuggestion {
  line: number
  column: number
  suggestion: string
  fix: string
}

export interface AIConfig {
  apiKey: string
  model: string
  language: string
  baseURL?: string
}

export interface AIFeatures {
  autoComplete: boolean
  codeAnalysis: boolean
  errorDetection: boolean
  codeOptimization: boolean
  smartRefactoring: boolean
}

export interface CompletionHandler {
  getSuggestions(context: {
    model: monaco.editor.ITextModel
    position: monaco.Position
    range: monaco.IRange
    beforeCursor: string
    word: { word: string, startColumn: number, endColumn: number }
    language: string
    enableAI?: boolean
    aiAssistant?: AICodeAssistant
    t?: any
  }): Promise<monaco.languages.CompletionItem[]>
}