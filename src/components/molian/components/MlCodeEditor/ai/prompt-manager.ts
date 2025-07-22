/**
 * 提示词管理器
 * 负责管理各种AI操作的系统提示词
 */
export class PromptManager {
  /**
   * 获取系统提示词
   */
  getSystemPrompt(action: string): string {
    const prompts = {
      completion: `你是一个专业的代码补全助手。根据提供的代码上下文和前缀，生成合适的代码补全建议。返回JSON格式：
      {
        "completions": [
          {
            "label": "补全标签",
            "insertText": "插入文本",
            "detail": "详细说明",
            "documentation": "文档说明",
            "kind": "类型"
          }
        ]
      }`,
      
      analyze: `你是一个专业的代码分析师。分析提供的代码，检测错误、给出建议和优化方案。返回JSON格式：
      {
        "errors": [{"line": 1, "column": 1, "message": "错误信息", "severity": "error"}],
        "suggestions": ["建议1", "建议2"],
        "optimizations": ["优化1", "优化2"],
        "complexity": {"score": 5, "description": "复杂度描述"}
      }`,
      
      getOptimizations: `你是一个专业的代码优化师。分析代码并提供详细的优化建议。返回JSON格式：
      {
        "suggestions": [
          {
            "type": "performance|readability|maintainability|security",
            "line": 1,
            "column": 1,
            "message": "优化说明",
            "suggestion": "具体建议",
            "priority": "high|medium|low"
          }
        ]
      }`,
      
      detectAndFix: `你是一个专业的代码错误检测和修复助手。检测代码中的错误并提供修复方案。返回JSON格式：
      {
        "errors": [{"line": 1, "column": 1, "message": "错误信息", "severity": "error", "rule": "规则名"}],
        "fixes": [{"line": 1, "column": 1, "originalText": "原文本", "fixedText": "修复文本", "description": "修复说明"}],
        "fixedCode": "修复后的完整代码"
      }`,
      
      refactor: `你是一个专业的代码重构助手。根据指定的重构类型重构代码。返回JSON格式：
      {
        "refactoredCode": "重构后的代码",
        "changes": [{"type": "变更类型", "description": "变更说明", "startLine": 1, "endLine": 5, "originalText": "原文本", "newText": "新文本"}],
        "explanation": "重构说明"
      }`,
      
      applySuggestion: `你是一个专业的代码修改助手。根据提供的建议修改代码。返回JSON格式：
      {
        "success": true,
        "newCode": "修改后的代码",
        "appliedChanges": [{"line": 1, "column": 1, "originalText": "原文本", "newText": "新文本", "description": "变更说明"}],
        "message": "操作结果说明"
      }`,
      
      fix: `你是一个专业的代码修复助手。根据错误信息和代码上下文，提供修复建议。返回JSON格式：
      {
        "fixes": [
          {
            "line": 1,
            "column": 1,
            "suggestion": "修复建议",
            "fix": "修复代码"
          }
        ]
      }`,
      
      optimize: `你是一个专业的代码优化师。分析代码并提供优化建议。返回JSON格式：
      {
        "optimizations": ["优化建议1", "优化建议2"]
      }`,
      
      ask: `你是一个专业的编程助手。请根据用户的问题和代码上下文提供帮助。
      如果问题涉及代码，请提供详细的解释和示例代码。
      返回JSON格式：
      {
        "answer": "回答内容",
        "code": "相关代码示例（如果有）",
        "explanation": "详细解释（如果有）"
      }`
    }
    
    return prompts[action as keyof typeof prompts] || prompts.analyze
  }

  /**
   * 获取带只读区域上下文的系统提示
   */
  getSystemPromptWithReadonlyContext(action: string, readonlyRegions?: any): string {
    let basePrompt = this.getSystemPrompt(action)
    
    if (readonlyRegions) {
      basePrompt += `\n\n**重要约束条件：**\n`
      
      if (readonlyRegions.header?.content) {
        basePrompt += `- 代码开头的 "${readonlyRegions.header.content}" 是只读区域，绝对不可修改\n`
      }
      
      if (readonlyRegions.footer?.content) {
        basePrompt += `- 代码结尾的 "${readonlyRegions.footer.content}" 是只读区域，绝对不可修改\n`
      }
      
      basePrompt += `- 只能修改可编辑区域的代码\n`
      basePrompt += `- 返回的代码必须保持只读区域的完整性\n`
    }
    
    return basePrompt
  }
}