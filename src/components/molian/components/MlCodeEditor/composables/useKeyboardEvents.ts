import * as monaco from 'monaco-editor'
import { ref } from 'vue'
import type { EditorProps } from '../types'

export function useKeyboardEvents(
  props: EditorProps,
  setValue: (value: string) => void,
  triggerAICompletion: () => Promise<void>,
  analyzeCodeWithAI: () => Promise<any>,
  getOptimizationSuggestions: () => Promise<string[]>,
  getFirstEditablePosition?: (editor: monaco.editor.IStandaloneCodeEditor) => monaco.Position,
  getLastEditablePosition?: (editor: monaco.editor.IStandaloneCodeEditor) => monaco.Position,
  headerLines?: any,
  footerLines?: any
) {
  const downArr = ref<number[]>([])

  /**
   * 处理键盘按下事件
   */
  const handleKeyDown = (e: KeyboardEvent): void => {
    if (e.keyCode >= 16 && e.keyCode <= 18) {
      if (downArr.value.indexOf(e.keyCode) === -1) {
        downArr.value.push(e.keyCode)
      }
    }
    
    // AI快捷键
    if (props.enableAI) {
      // Ctrl+Space: 触发AI补全
      if (e.ctrlKey && e.code === 'Space') {
        e.preventDefault()
        triggerAICompletion()
      }
      
      // Ctrl+Shift+A: AI代码分析
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyA') {
        e.preventDefault()
        analyzeCodeWithAI()
      }
      
      // Ctrl+Shift+O: 优化建议
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyO') {
        e.preventDefault()
        getOptimizationSuggestions()
      }
    }
  }

  /**
   * 处理键盘释放事件
   */
  const handleKeyUp = (e: KeyboardEvent): void => {
    // Ctrl+K 重置为初始值
    if (downArr.value[0] === 17 && e.keyCode === 75) {
      setValue(props.modelValue || '')
    }
    if (e.keyCode >= 16 && e.keyCode <= 18) {
      const index = downArr.value.indexOf(e.keyCode)
      if (index > -1) {
        downArr.value.splice(index, 1)
      }
    }
  }

  /**
   * 选择所有可编辑内容（排除只读区域）
   */
  const selectAllEditableContent = (editor: monaco.editor.IStandaloneCodeEditor): void => {
    if (!props.readonlyRegions || (!headerLines && !footerLines)) {
      // 如果没有只读区域，使用默认的全选
      editor.trigger('keyboard', 'editor.action.selectAll', {})
      return
    }

    const model = editor.getModel()
    if (!model) return

    let startPosition: monaco.Position
    let endPosition: monaco.Position

    if (getFirstEditablePosition && getLastEditablePosition) {
      startPosition = getFirstEditablePosition(editor)
      endPosition = getLastEditablePosition(editor)
    } else {
      // 备用逻辑：手动计算可编辑区域
      const totalLines = model.getLineCount()
      const headerLinesCount = headerLines || 0
      const footerLinesCount = footerLines || 0
      const editableStartLine = headerLinesCount + 1
      const editableEndLine = totalLines - footerLinesCount
      
      if (editableStartLine > editableEndLine) {
        // 没有可编辑区域
        return
      }
      
      startPosition = new monaco.Position(editableStartLine, 1)
      const lastEditableLineContent = model.getLineContent(editableEndLine)
      endPosition = new monaco.Position(editableEndLine, lastEditableLineContent.length + 1)
    }

    // 设置选择范围
    const selection = new monaco.Selection(
      startPosition.lineNumber,
      startPosition.column,
      endPosition.lineNumber,
      endPosition.column
    )
    
    editor.setSelection(selection)
    editor.focus()
  }

  /**
   * 注册编辑器键盘事件
   */
  const registerEditorKeyboardEvents = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editor.onKeyDown((e: monaco.IKeyboardEvent) => {
      handleKeyDown(e as unknown as KeyboardEvent)
    })
    editor.onKeyUp((e: monaco.IKeyboardEvent) => {
      handleKeyUp(e as unknown as KeyboardEvent)
    })
    
    // 注册Ctrl+A命令来选择所有可编辑内容
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyA, () => {
        selectAllEditableContent(editor)
    })
  }

  /**
   * 注册AI命令
   */
  const registerAICommands = (
    editor: monaco.editor.IStandaloneCodeEditor,
    smartRefactor: (type: string) => Promise<void>
  ) => {
    if (!props.enableAI) return

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI, () => {
      analyzeCodeWithAI()
    })
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyR, () => {
      smartRefactor('general')
    })
  }

  return {
    downArr,
    handleKeyDown,
    handleKeyUp,
    registerEditorKeyboardEvents,
    registerAICommands,
    selectAllEditableContent
  }
}