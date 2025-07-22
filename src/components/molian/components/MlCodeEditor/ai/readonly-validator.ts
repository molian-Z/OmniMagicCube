/**
 * 只读区域验证器
 * 负责验证和修复只读区域的完整性
 */
export class ReadonlyValidator {
  /**
   * 验证AI生成的代码是否破坏了只读区域
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
    if (!readonlyRegions) {
      return { isValid: true, errors: [] }
    }

    const errors: string[] = []
    const originalLines = originalCode.split('\n')
    const newLines = newCode.split('\n')
    
    // 验证头部只读区域
    if (readonlyRegions.header?.content) {
      const headerLines = readonlyRegions.header.lines || readonlyRegions.header.content.split('\n').length
      const originalHeader = originalLines.slice(0, headerLines).join('\n')
      const newHeader = newLines.slice(0, headerLines).join('\n')
      
      if (originalHeader !== newHeader) {
        errors.push('头部只读区域被意外修改')
      }
    }
    
    // 验证底部只读区域
    if (readonlyRegions.footer?.content) {
      const footerLines = readonlyRegions.footer.lines || readonlyRegions.footer.content.split('\n').length
      const originalFooter = originalLines.slice(-footerLines).join('\n')
      const newFooter = newLines.slice(-footerLines).join('\n')
      
      if (originalFooter !== newFooter) {
        errors.push('底部只读区域被意外修改')
      }
    }
    
    // 如果有错误，尝试修正
    let correctedCode = newCode
    if (errors.length > 0) {
      correctedCode = this.repairReadonlyRegions(originalCode, newCode, readonlyRegions)
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      correctedCode: errors.length > 0 ? correctedCode : undefined
    }
  }
  
  /**
   * 修复被破坏的只读区域
   */
  private repairReadonlyRegions(originalCode: string, newCode: string, readonlyRegions: any): string {
    const originalLines = originalCode.split('\n')
    const newLines = newCode.split('\n')
    
    let repairedLines = [...newLines]
    
    // 修复头部
    if (readonlyRegions.header?.content) {
      const headerLines = readonlyRegions.header.lines || readonlyRegions.header.content.split('\n').length
      const originalHeader = originalLines.slice(0, headerLines)
      repairedLines.splice(0, headerLines, ...originalHeader)
    }
    
    // 修复底部
    if (readonlyRegions.footer?.content) {
      const footerLines = readonlyRegions.footer.lines || readonlyRegions.footer.content.split('\n').length
      const originalFooter = originalLines.slice(-footerLines)
      repairedLines.splice(-footerLines, footerLines, ...originalFooter)
    }
    
    return repairedLines.join('\n')
  }
}