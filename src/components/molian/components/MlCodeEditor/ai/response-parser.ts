import type { AICompletionItem, AIAnalysisResult, AIFixSuggestion } from '../types'

/**
 * 响应解析器
 * 负责解析AI API的各种响应格式
 */
export class ResponseParser {
  /**
   * 解析AI响应内容
   */
  parseAIResponse(content: string): any {
    // 移除可能的 Markdown 代码块标记
    const cleanContent = content
      .replace(/```json\n?/g, '')  // 移除开头的 ```json
      .replace(/```\n?/g, '')      // 移除结尾的 ```
      .trim()
    
    try {
      return JSON.parse(cleanContent)
    } catch (error) {
      console.error('解析清理后的内容失败:', error)
      throw error
    }
  }

  /**
   * 解析补全结果
   */
  parseCompletions(response: any): AICompletionItem[] {
    try {
      return response.completions || []
    } catch {
      return []
    }
  }

  /**
   * 解析分析结果
   */
  parseAnalysis(response: any): AIAnalysisResult {
    try {
      return {
        errors: response.errors || [],
        suggestions: response.suggestions || [],
        optimizations: response.optimizations || [],
        complexity: response.complexity || { score: 0, description: '未知' }
      }
    } catch {
      return {
        errors: [],
        suggestions: [],
        optimizations: [],
        complexity: { score: 0, description: '解析失败' }
      }
    }
  }

  /**
   * 解析修复建议
   */
  parseFixSuggestions(response: any): AIFixSuggestion[] {
    try {
      return response.fixes || []
    } catch {
      return []
    }
  }

  /**
   * 解析优化建议
   */
  parseOptimizations(response: any): string[] {
    try {
      return response.optimizations || []
    } catch {
      return []
    }
  }

  /**
   * 解析优化建议详情
   */
  parseOptimizationSuggestions(response: any): Array<{
    type: 'performance' | 'readability' | 'maintainability' | 'security'
    line: number
    column: number
    message: string
    suggestion: string
    priority: 'high' | 'medium' | 'low'
  }> {
    try {
      return response.suggestions || []
    } catch {
      return []
    }
  }

  /**
   * 解析错误检测和修复结果
   */
  parseDetectionAndFixes(response: any): {
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
  } {
    try {
      return {
        errors: response.errors || [],
        fixes: response.fixes || [],
        fixedCode: response.fixedCode
      }
    } catch {
      return {
        errors: [],
        fixes: [],
        fixedCode: undefined
      }
    }
  }

  /**
   * 解析应用建议结果
   */
  parseApplySuggestionResult(response: any): {
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
  } {
    try {
      return {
        success: response.success || false,
        newCode: response.newCode || '',
        appliedChanges: response.appliedChanges || [],
        message: response.message || '操作完成'
      }
    } catch {
      return {
        success: false,
        newCode: '',
        appliedChanges: [],
        message: '解析结果失败'
      }
    }
  }
}