import * as monaco from 'monaco-editor'
import { ref } from 'vue'
import type { EditorProps } from '../types'

export function useReadonlyRegions(props: EditorProps) {
  const readonlyDecorations = ref<string[]>([])
  const headerLines = ref(0)
  const footerLines = ref(0)
  const isInitialized = ref(false)
  const originalContent = ref('')

  /**
   * 设置只读区域
   */
  const setupReadonlyRegions = (editor: monaco.editor.IStandaloneCodeEditor): void => {
    if (!editor || !props.readonlyRegions) return
    
    const model = editor.getModel()
    if (!model) return
    
    // 清除之前的装饰
    if (readonlyDecorations.value.length > 0) {
      editor.removeDecorations(readonlyDecorations.value)
      readonlyDecorations.value = []
    }
    
    const decorations: monaco.editor.IModelDeltaDecoration[] = []
    let currentContent = model.getValue()
    let newContent = currentContent
    let contentChanged = false
    
    // 处理头部只读区域
    if (props.readonlyRegions.header?.content) {
      const headerContent = props.readonlyRegions.header.content
      const headerLinesCount = props.readonlyRegions.header.lines || headerContent.split('\n').length
      headerLines.value = headerLinesCount
      
      // 只在首次初始化或内容确实不包含头部时添加
      if (!isInitialized.value || !currentContent.startsWith(headerContent)) {
        // 避免重复添加：先移除可能存在的头部内容
        const lines = currentContent.split('\n')
        const headerContentLines = headerContent.split('\n')
        let shouldAdd = true
        
        if (lines.length >= headerContentLines.length) {
          const existingHeader = lines.slice(0, headerContentLines.length).join('\n')
          if (existingHeader === headerContent) {
            shouldAdd = false
          }
        }
        
        if (shouldAdd) {
          newContent = headerContent + '\n' + currentContent
          contentChanged = true
        }
      }
      
      // 添加头部只读装饰
      decorations.push({
        range: new monaco.Range(1, 1, headerLinesCount, model.getLineMaxColumn(headerLinesCount)),
        options: {
          isWholeLine: true,
          className: 'readonly-region-header',
          glyphMarginClassName: 'readonly-glyph',
          hoverMessage: { value: '此区域为只读区域，不可编辑' },
          stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
        }
      })
    }
    
    // 处理底部只读区域
    if (props.readonlyRegions.footer?.content) {
      const footerContent = props.readonlyRegions.footer.content
      const footerLinesCount = props.readonlyRegions.footer.lines || footerContent.split('\n').length
      footerLines.value = footerLinesCount
      
      // 只在首次初始化或内容确实不包含底部时添加
      if (!isInitialized.value || !currentContent.endsWith(footerContent)) {
        // 避免重复添加：先检查是否已存在底部内容
        const lines = currentContent.split('\n')
        const footerContentLines = footerContent.split('\n')
        let shouldAdd = true
        
        if (lines.length >= footerContentLines.length) {
          const existingFooter = lines.slice(-footerContentLines.length).join('\n')
          if (existingFooter === footerContent) {
            shouldAdd = false
          }
        }
        
        if (shouldAdd) {
          newContent = newContent + '\n' + footerContent
          contentChanged = true
        }
      }
      
      // 重新计算总行数（因为可能添加了头部内容）
      const totalLines = newContent.split('\n').length
      const footerStartLine = totalLines - footerLinesCount + 1
      
      // 添加底部只读装饰
      decorations.push({
        range: new monaco.Range(footerStartLine, 1, totalLines, newContent.split('\n')[totalLines - 1].length + 1),
        options: {
          isWholeLine: true,
          className: 'readonly-region-footer',
          glyphMarginClassName: 'readonly-glyph',
          hoverMessage: { value: '此区域为只读区域，不可编辑' },
          stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
        }
      })
    }
    
    // 如果内容发生变化，更新模型
    if (contentChanged) {
      model.setValue(newContent)
    }
    
    // 应用装饰
    if (decorations.length > 0) {
      readonlyDecorations.value = editor.deltaDecorations([], decorations)
    }
    
    // 标记为已初始化
    isInitialized.value = true
    originalContent.value = newContent
  }

  /**
   * 检查位置是否在只读区域
   */
  const isInReadonlyRegion = (position: monaco.Position, editor?: monaco.editor.IStandaloneCodeEditor): boolean => {
    const lineNumber = position.lineNumber
    
    // 检查是否在头部只读区域
    if (headerLines.value > 0 && lineNumber <= headerLines.value) {
      return true
    }
    
    // 检查是否在底部只读区域
    if (footerLines.value > 0) {
      const model = editor?.getModel()
      if (model) {
        const totalLines = model.getLineCount()
        const footerStartLine = totalLines - footerLines.value + 1
        if (lineNumber >= footerStartLine) {
          return true
        }
      }
    }
    
    return false
  }

  /**
   * 检查编辑操作是否涉及只读区域
   */
  const isEditInReadonlyRegion = (changes: monaco.editor.IModelContentChange[], editor: monaco.editor.IStandaloneCodeEditor): boolean => {
    for (const change of changes) {
      const startPos = new monaco.Position(change.range.startLineNumber, change.range.startColumn)
      const endPos = new monaco.Position(change.range.endLineNumber, change.range.endColumn)
      
      if (isInReadonlyRegion(startPos, editor) || isInReadonlyRegion(endPos, editor)) {
        return true
      }
      
      // 检查变化范围内的所有行
      for (let line = change.range.startLineNumber; line <= change.range.endLineNumber; line++) {
        const pos = new monaco.Position(line, 1)
        if (isInReadonlyRegion(pos, editor)) {
          return true
        }
      }
    }
    return false
  }

  /**
   * 恢复只读区域内容
   */
  const restoreReadonlyContent = (editor: monaco.editor.IStandaloneCodeEditor): void => {
    const model = editor.getModel()
    if (!model || !originalContent.value) return
    
    // 获取当前内容
    const currentContent = model.getValue()
    const currentLines = currentContent.split('\n')
    const originalLines = originalContent.value.split('\n')
    
    let newLines = [...currentLines]
    
    // 恢复头部只读区域
    if (headerLines.value > 0 && props.readonlyRegions?.header?.content) {
      const headerContentLines = props.readonlyRegions.header.content.split('\n')
      for (let i = 0; i < headerLines.value && i < headerContentLines.length; i++) {
        newLines[i] = headerContentLines[i]
      }
    }
    
    // 恢复底部只读区域
    if (footerLines.value > 0 && props.readonlyRegions?.footer?.content) {
      const footerContentLines = props.readonlyRegions.footer.content.split('\n')
      const startIndex = newLines.length - footerLines.value
      for (let i = 0; i < footerLines.value && i < footerContentLines.length; i++) {
        if (startIndex + i >= 0) {
          newLines[startIndex + i] = footerContentLines[i]
        }
      }
    }
    
    // 确保可编辑区域至少有一行
    const editableStartIndex = headerLines.value
    const editableEndIndex = newLines.length - footerLines.value - 1
    
    if (editableStartIndex > editableEndIndex) {
      // 如果没有可编辑区域，在头部和底部之间插入一个空行
      const insertIndex = headerLines.value
      newLines.splice(insertIndex, 0, '')
    } else {
      // 检查可编辑区域是否为空
      const editableLines = newLines.slice(editableStartIndex, editableEndIndex + 1)
      const hasContent = editableLines.some(line => line.trim().length > 0)
      
      if (!hasContent && editableLines.length === 0) {
        // 如果可编辑区域完全为空，添加一个空行
        newLines.splice(editableStartIndex, 0, '')
      } else if (!hasContent && editableLines.length === 1 && editableLines[0] === '') {
        // 如果只有一个空行，保持不变（这是最小可编辑状态）
      }
    }
    
    const newContent = newLines.join('\n')
    if (newContent !== currentContent) {
      model.setValue(newContent)
    }
  }

  /**
   * 重置初始化状态
   */
  const resetInitialization = (): void => {
    isInitialized.value = false
    originalContent.value = ''
  }

  /**
   * 获取第一个可编辑位置
   */
  const getFirstEditablePosition = (editor: monaco.editor.IStandaloneCodeEditor): monaco.Position => {
    const model = editor.getModel()
    if (!model) return new monaco.Position(1, 1)
    
    const totalLines = model.getLineCount()
    
    // 如果有头部只读区域，返回头部之后的第一行
    if (headerLines.value > 0) {
      const editableLineNumber = Math.min(headerLines.value + 1, totalLines)
      return new monaco.Position(editableLineNumber, 1)
    }
    
    // 如果只有底部只读区域，返回第一行
    return new monaco.Position(1, 1)
  }
  
  /**
   * 获取最后一个可编辑位置
   */
  const getLastEditablePosition = (editor: monaco.editor.IStandaloneCodeEditor): monaco.Position => {
    const model = editor.getModel()
    if (!model) return new monaco.Position(1, 1)
    
    const totalLines = model.getLineCount()
    
    // 如果有底部只读区域，返回底部之前的最后一行
    if (footerLines.value > 0) {
      const editableLineNumber = Math.max(totalLines - footerLines.value, 1)
      const lineContent = model.getLineContent(editableLineNumber)
      return new monaco.Position(editableLineNumber, lineContent.length + 1)
    }
    
    // 如果只有头部只读区域，返回最后一行
    const lineContent = model.getLineContent(totalLines)
    return new monaco.Position(totalLines, lineContent.length + 1)
  }
  
  /**
   * 将光标移动到最近的可编辑位置
   */
  const moveCursorToEditableArea = (editor: monaco.editor.IStandaloneCodeEditor, attemptedPosition?: monaco.Position): void => {
    const model = editor.getModel()
    if (!model) return
    
    let targetPosition: monaco.Position
    
    if (attemptedPosition && isInReadonlyRegion(attemptedPosition, editor)) {
      // 如果尝试的位置在只读区域，智能选择最近的可编辑位置
      if (attemptedPosition.lineNumber <= headerLines.value) {
        // 在头部只读区域，移动到头部之后
        targetPosition = getFirstEditablePosition(editor)
      } else {
        // 在底部只读区域，移动到底部之前
        targetPosition = getLastEditablePosition(editor)
      }
    } else {
      // 默认移动到第一个可编辑位置
      targetPosition = getFirstEditablePosition(editor)
    }
    
    editor.setPosition(targetPosition)
    editor.focus()
  }

  return {
    readonlyDecorations,
    headerLines,
    footerLines,
    setupReadonlyRegions,
    isInReadonlyRegion,
    isEditInReadonlyRegion,
    restoreReadonlyContent,
    resetInitialization,
    getFirstEditablePosition,
    getLastEditablePosition,
    moveCursorToEditableArea
  }
}