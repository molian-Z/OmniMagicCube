import type { 
  AIConfig, 
  CodeContext, 
  AICompletionItem, 
  AIAnalysisResult, 
  AIFixSuggestion 
} from '../types'
import { CacheManager } from './cache-manager'
import { RequestManager } from './request-manager'
import { ResponseParser } from './response-parser'
import { ReadonlyValidator } from './readonly-validator'

/**
 * AI代码助手核心类（重构版）
 * 提供代码分析、智能补全、错误检测和优化建议等功能
 */
export class AICodeAssistant {
  private config: AIConfig
  private isProcessing = false
  private debounceTimer: number | null = null
  
  // 各个功能模块
  private cacheManager: CacheManager
  private requestManager: RequestManager
  private responseParser: ResponseParser
  private readonlyValidator: ReadonlyValidator

  constructor(config: AIConfig) {
    this.config = config
    this.cacheManager = new CacheManager()
    this.requestManager = new RequestManager(config)
    this.responseParser = new ResponseParser()
    this.readonlyValidator = new ReadonlyValidator()
  }

  /**
   * 更新AI配置
   */
  updateConfig(config: Partial<AIConfig>): void {
    this.config = { ...this.config, ...config }
    this.requestManager.updateConfig(config)
  }

  /**
   * 获取处理状态
   */
  get processing(): boolean {
    return this.isProcessing
  }

  /**
   * 代码智能补全
   */
  async getCompletions(
    context: CodeContext,
    prefix: string = ''
  ): Promise<AICompletionItem[]> {
    const payload = {
      action: 'completion',
      context,
      prefix,
      language: context.language || 'javascript'
    }
    
    const cacheKey = this.cacheManager.getCacheKey('completion', payload)
    
    if (this.cacheManager.isCacheValid(cacheKey)) {
      return this.cacheManager.getFromCache(cacheKey)
    }

    try {
      this.isProcessing = true
      
      const response = await this.requestManager.makeRequest(cacheKey, payload)
      const completions = this.responseParser.parseCompletions(response)
      this.cacheManager.setCache(cacheKey, completions)
      
      return completions
    } catch (error) {
      console.error('AI补全失败:', error)
      return []
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * 代码分析和错误检测
   */
  async analyzeCode(
    code: string,
    language: string = 'javascript'
  ): Promise<AIAnalysisResult> {
    const payload = {
      action: 'analyze',
      code,
      language
    }
    
    const cacheKey = this.cacheManager.getCacheKey('analysis', payload)
    
    if (this.cacheManager.isCacheValid(cacheKey)) {
      return this.cacheManager.getFromCache(cacheKey)
    }

    try {
      this.isProcessing = true
      
      const response = await this.requestManager.makeRequest(cacheKey, payload)
      const analysis = this.responseParser.parseAnalysis(response)
      this.cacheManager.setCache(cacheKey, analysis)
      
      return analysis
    } catch (error) {
      console.error('代码分析失败:', error)
      return {
        errors: [],
        suggestions: [],
        optimizations: [],
        complexity: { score: 0, description: '分析失败' }
      }
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * 获取错误修复建议
   */
  async getFixSuggestions(
    context: CodeContext,
    errorMessage: string
  ): Promise<AIFixSuggestion[]> {
    const payload = {
      action: 'fix',
      context,
      error: errorMessage
    }
    
    const cacheKey = this.cacheManager.getCacheKey('fix', payload)

    try {
      this.isProcessing = true
      
      const response = await this.requestManager.makeRequest(cacheKey, payload)
      return this.responseParser.parseFixSuggestions(response)
    } catch (error) {
      console.error('获取修复建议失败:', error)
      return []
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * 代码优化建议
   */
  async optimizeCode(
    code: string,
    language: string = 'javascript'
  ): Promise<string[]> {
    const payload = {
      action: 'optimize',
      code,
      language
    }
    
    const cacheKey = this.cacheManager.getCacheKey('optimize', payload)

    try {
      this.isProcessing = true
      
      const response = await this.requestManager.makeRequest(cacheKey, payload)
      return this.responseParser.parseOptimizations(response)
    } catch (error) {
      console.error('代码优化失败:', error)
      return []
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * 防抖处理的代码分析
   */
  analyzeCodeDebounced(
    code: string,
    language: string = 'javascript',
    delay: number = 1000
  ): Promise<AIAnalysisResult> {
    return new Promise((resolve) => {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer)
      }
      
      this.debounceTimer = window.setTimeout(async () => {
        const result = await this.analyzeCode(code, language)
        resolve(result)
      }, delay)
    })
  }

  /**
   * 获取优化建议
   */
  async getOptimizationSuggestions(
    code: string,
    language: string = 'javascript'
  ): Promise<Array<{
    type: 'performance' | 'readability' | 'maintainability' | 'security'
    line: number
    column: number
    message: string
    suggestion: string
    priority: 'high' | 'medium' | 'low'
  }>> {
    const payload = {
      action: 'getOptimizations',
      code,
      language
    }
    
    const cacheKey = this.cacheManager.getCacheKey('optimization', payload)
    
    if (this.cacheManager.isCacheValid(cacheKey)) {
      return this.cacheManager.getFromCache(cacheKey)
    }

    try {
      this.isProcessing = true
      
      const response = await this.requestManager.makeRequest(cacheKey, payload)
      const suggestions = this.responseParser.parseOptimizationSuggestions(response)
      this.cacheManager.setCache(cacheKey, suggestions)
      
      return suggestions
    } catch (error) {
      console.error('获取优化建议失败:', error)
      return []
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * 检测并修复错误
   */
  async detectAndFixErrors(
    code: string,
    language: string = 'javascript'
  ): Promise<{
    errors: Array<{
      line: number
      column: number
      message: string
      severity: 'error' | 'warning' | 'info'
      rule?: string
    }>
    fixes: Array<{
      line: number
      column: number
      originalText: string
      fixedText: string
      description: string
    }>
    fixedCode?: string
  }> {
    const payload = {
      action: 'detectAndFix',
      code,
      language
    }
    
    const cacheKey = this.cacheManager.getCacheKey('detectAndFix', payload)

    try {
      this.isProcessing = true
      
      const response = await this.requestManager.makeRequest(cacheKey, payload)
      return this.responseParser.parseDetectionAndFixes(response)
    } catch (error) {
      console.error('错误检测和修复失败:', error)
      return {
        errors: [],
        fixes: [],
        fixedCode: code
      }
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * 代码重构
   */
  async refactorCode(
    code: string,
    refactorType: 'extract-function' | 'extract-variable' | 'inline' | 'rename' | 'simplify' | 'modernize',
    options?: {
      targetName?: string
      startLine?: number
      endLine?: number
      language?: string
      readonlyRegions?: any
    }
  ): Promise<{
    refactoredCode: string
    changes: Array<{
      type: string
      description: string
      startLine: number
      endLine: number
      originalText: string
      newText: string
    }>
    explanation: string
  }> {
    const payload = {
      action: 'refactor',
      code,
      refactorType,
      options: options || {},
      language: options?.language || 'javascript',
      readonlyRegions: options?.readonlyRegions
    }
    
    const cacheKey = this.cacheManager.getCacheKey('refactor', payload)

    try {
      this.isProcessing = true
      
      const response = await this.requestManager.makeRequest(cacheKey, payload)
      
      return {
        refactoredCode: response.refactoredCode || code,
        changes: response.changes || [],
        explanation: response.explanation || '重构完成'
      }
    } catch (error) {
      console.error('代码重构失败:', error)
      return {
        refactoredCode: code,
        changes: [],
        explanation: '重构失败'
      }
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * 应用建议
   */
  async applySuggestion(
    code: string,
    suggestion: {
      line: number
      column: number
      type: 'fix' | 'optimization' | 'refactor'
      action: string
      newText?: string
      startLine?: number
      endLine?: number
    },
    language: string = 'javascript',
    readonlyRegions?: any
  ): Promise<{
    success: boolean
    newCode: string
    appliedChanges: Array<{
      line: number
      column: number
      originalText: string
      newText: string
      description: string
    }>
    message: string
  }> {
    const payload = {
      action: 'applySuggestion',
      code,
      suggestion,
      language,
      readonlyRegions
    }
    
    const cacheKey = this.cacheManager.getCacheKey('applySuggestion', payload)

    try {
      this.isProcessing = true
       
      const response = await this.requestManager.makeRequest(cacheKey, payload)
      const result = this.responseParser.parseApplySuggestionResult(response)
      
      // 验证只读区域
      if (readonlyRegions && result.success) {
        const readonlyValidator = new ReadonlyValidator()
        const validation = readonlyValidator.validateReadonlyRegions(
          code,
          result.newCode,
          readonlyRegions
        )
        
        if (!validation.isValid) {
          console.warn('检测到只读区域被修改，正在自动修复:', validation.errors)
          
          // 使用修复后的代码
          if (validation.correctedCode) {
            result.newCode = validation.correctedCode
            result.message += ` (已自动修复只读区域: ${validation.errors.join(', ')})`
          } else {
            // 如果无法修复，返回失败
            return {
              success: false,
              newCode: code,
              appliedChanges: [],
              message: `应用建议失败: 建议会破坏只读区域 - ${validation.errors.join(', ')}`
            }
          }
        }
      }
      
      return result
    } catch (error: any) {
      console.error('应用建议失败:', error)
      return {
        success: false,
        newCode: code,
        appliedChanges: [],
        message: `应用建议失败: ${error.message}`
      }
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * 批量应用建议
   */
  async applyMultipleSuggestions(
    code: string,
    suggestions: Array<{
      line: number
      column: number
      type: 'fix' | 'optimization' | 'refactor'
      action: string
      newText?: string
      startLine?: number
      endLine?: number
    }>,
    language: string = 'javascript'
  ): Promise<{
    success: boolean
    newCode: string
    appliedChanges: Array<{
      line: number
      column: number
      originalText: string
      newText: string
      description: string
    }>
    failedSuggestions: Array<{
      suggestion: any
      error: string
    }>
  }> {
    let currentCode = code
    const appliedChanges: any[] = []
    const failedSuggestions: any[] = []
    
    // 按行号倒序排列，避免行号偏移问题
    const sortedSuggestions = suggestions.sort((a, b) => b.line - a.line)
    
    for (const suggestion of sortedSuggestions) {
      try {
        const result = await this.applySuggestion(currentCode, suggestion, language)
        if (result.success) {
          currentCode = result.newCode
          appliedChanges.push(...result.appliedChanges)
        } else {
          failedSuggestions.push({
            suggestion,
            error: result.message
          })
        }
      } catch (error: any) {
        failedSuggestions.push({
          suggestion,
          error: error.message
        })
      }
    }
    
    return {
      success: failedSuggestions.length === 0,
      newCode: currentCode,
      appliedChanges,
      failedSuggestions
    }
  }

  /**
   * 向AI提问
   */
  async askQuestion(
    question: string,
    context?: {
      code?: string
      language?: string
      selection?: string
    }
  ): Promise<{
    answer: string
    code?: string
    explanation?: string
  }> {
    const payload = {
      action: 'ask',
      question,
      context: context || {}
    }
    
    const cacheKey = this.cacheManager.getCacheKey('ask', payload)

    try {
      this.isProcessing = true
      
      const response = await this.requestManager.makeRequest(cacheKey, payload)
      
      return {
        answer: response.answer || '',
        code: response.code,
        explanation: response.explanation
      }
    } catch (error) {
      console.error('AI问答失败:', error)
      throw error
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * 验证只读区域
   */
  validateReadonlyRegions(
    originalCode: string,
    newCode: string,
    readonlyRegions?: any
  ): {
    isValid: boolean
    errors: string[]
    correctedCode?: string
  } {
    return this.readonlyValidator.validateReadonlyRegions(originalCode, newCode, readonlyRegions)
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cacheManager.clearCache()
  }

  /**
   * 清除特定操作的缓存
   */
  clearActionCache(action: string): void {
    this.cacheManager.clearActionCache(action)
  }

  /**
   * 销毁实例
   */
  destroy(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
    this.cacheManager.clearCache()
    this.requestManager.destroy()
  }
}

/**
 * 创建AI代码助手实例的工厂函数
 */
export function createAICodeAssistant(config: AIConfig): AICodeAssistant {
  return new AICodeAssistant(config)
}

/**
 * AI代码助手单例管理器
 */
export class AICodeAssistantManager {
  private static instance: AICodeAssistant | null = null
  
  static getInstance(config?: AIConfig): AICodeAssistant {
    if (!this.instance && config) {
      this.instance = new AICodeAssistant(config)
    }
    return this.instance!
  }
  
  static updateConfig(config: Partial<AIConfig>): void {
    if (this.instance) {
      this.instance.updateConfig(config)
    }
  }
  
  static destroy(): void {
    if (this.instance) {
      this.instance.destroy()
      this.instance = null
    }
  }
}

// 为了向后兼容，也可以导出别名
export { AICodeAssistant as AIAssistant }