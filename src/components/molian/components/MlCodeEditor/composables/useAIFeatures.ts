import { ref, reactive } from 'vue'
import { AICodeAssistant } from '../ai'
import type { EditorProps, AICompletionItem, CodeContext, AIAnalysisResult } from '../types'

interface AIFeatures {
  autoComplete: boolean
  codeAnalysis: boolean
  errorDetection: boolean
  codeOptimization: boolean
  smartRefactoring: boolean
}

export function useAIFeatures(props: EditorProps, emits: any, getCodeContext: () => CodeContext) {
  const aiAssistant = ref<AICodeAssistant>()
  const isAIProcessing = ref(false)
  const aiSuggestions = ref<AICompletionItem[]>([])
  
  // AI功能状态
  const aiFeatures = reactive<AIFeatures>({
    autoComplete: true,
    codeAnalysis: true,
    errorDetection: true,
    codeOptimization: true,
    smartRefactoring: true
  })

  /**
   * 初始化AI助手
   */
  const initAIAssistant = (): void => {
    if (props.aiApiKey) {
      aiAssistant.value = new AICodeAssistant({
        apiKey: props.aiApiKey,
        model: props.aiModel || 'gpt-3.5-turbo',
        language: props.mode || 'plaintext'
      })
    }
  }

  /**
   * AI代码分析
   */
  const analyzeCodeWithAI = async (): Promise<AIAnalysisResult | null> => {
    if (!props.enableAI || !aiAssistant.value) return null
    
    try {
      isAIProcessing.value = true
      const context = getCodeContext()
      const result = await aiAssistant.value.analyzeCode(context.code, context.language)
      return result
    } catch (error) {
      console.error('AI分析失败:', error)
      emits('error', error as Error)
      return null
    } finally {
      isAIProcessing.value = false
    }
  }

  /**
   * AI代码补全
   */
  const getAICompletions = async (context: CodeContext): Promise<AICompletionItem[]> => {
    if (!props.enableAI || !aiAssistant.value) return []
    
    try {
      const suggestions = await aiAssistant.value.getCompletions(context)
      aiSuggestions.value = suggestions
      return suggestions
    } catch (error) {
      console.error('AI补全失败:', error)
      return []
    }
  }

  /**
   * AI代码优化建议
   */
  const getOptimizationSuggestions = async (): Promise<string[]> => {
    if (!props.enableAI || !aiAssistant.value) return []
    
    try {
      const context = getCodeContext()
      return await aiAssistant.value.optimizeCode(context.code, context.language)
    } catch (error) {
      console.error('AI优化建议失败:', error)
      return []
    }
  }

  /**
   * AI错误检测和修复建议
   */
  const detectAndFixErrors = async (): Promise<void> => {
    if (!props.enableAI || !aiAssistant.value) return
    
    try {
      const context = getCodeContext()
      const result = await aiAssistant.value.detectAndFixErrors(context.code, context.language)
      
      if (result.fixes.length > 0) {
        result.fixes.forEach(fix => {
          emits('ai-suggestion', fix.description)
        })
      }
    } catch (error) {
      console.error('AI错误检测失败:', error)
    }
  }

  /**
   * 智能重构
   */
  /**
   * 智能重构
   */
  const smartRefactor = async (refactorType: string, setValue: (value: string) => void): Promise<void> => {
    if (!props.enableAI || !aiAssistant.value) return
    
    try {
      const context = getCodeContext()
      const result = await aiAssistant.value.refactorCode(
        context.code,
        refactorType as any,
        { language: context.language }
      )
      
      if (result.refactoredCode) {
        setValue(result.refactoredCode)
        
        // 验证设置是否成功
        console.log('AI重构完成，新代码长度:', result.refactoredCode.length)
      }
    } catch (error) {
      console.error('智能重构失败:', error)
    }
  }

  /**
   * 应用AI建议
   */
  const applySuggestion = async (suggestion: AICompletionItem, setValue: (value: string) => void) => {
    if (!aiAssistant.value) return
    try {
      const context = getCodeContext()
      const result = await aiAssistant.value.applySuggestion(context.code, {
        line: context.position.line,
        column: context.position.column,
        type: 'fix',
        action: suggestion.insertText,
        newText: suggestion.insertText
      }, context.language)
      
      if (result.success) {
        setValue(result.newCode)
        
        // 验证设置是否成功
        console.log('AI建议应用完成，新代码长度:', result.newCode.length)
      }
    } catch (error) {
      console.error('应用建议失败:', error)
    }
  }

  /**
   * 触发AI补全
   */
  const triggerAICompletion = async (editor: any): Promise<void> => {
    const context = getCodeContext()
    const aiCompletions = await getAICompletions(context)
    
    if (aiCompletions.length > 0 && editor) {
      editor.trigger('ai', 'editor.action.triggerSuggest', {})
    }
  }

  /**
   * 销毁AI助手
   */
  const destroyAI = () => {
    aiAssistant.value?.destroy()
  }

  return {
    aiAssistant,
    isAIProcessing,
    aiSuggestions,
    aiFeatures,
    initAIAssistant,
    analyzeCodeWithAI,
    getAICompletions,
    getOptimizationSuggestions,
    detectAndFixErrors,
    smartRefactor,
    triggerAICompletion,
    applySuggestion,
    destroyAI
  }
}