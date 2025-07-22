/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout
  return ((...args: any[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(undefined, args), wait)
  }) as T
}

/**
 * 获取代码上下文
 */
export function getCodeContext(editor: any, mode: string) {
  if (!editor) return { code: '', position: { line: 0, column: 0 }, selection: '' }
  
  const model = editor.getModel()
  const position = editor.getPosition()
  const selection = editor.getSelection()
  
  return {
    code: model?.getValue() || '',
    position: {
      line: position?.lineNumber || 0,
      column: position?.column || 0
    },
    selection: selection ? model?.getValueInRange(selection) || '' : '',
    language: mode
  }
}