import * as monaco from 'monaco-editor'
import type { EditorProps } from '../types'

export function useMonacoEditor(props: EditorProps, emits: any) {
  const editorRef = ref<HTMLDivElement>()
  const monacoEditor = shallowRef<monaco.editor.IStandaloneCodeEditor>()
  const codeValue = ref('')
  const isRestoringContent = ref(false)

  /**
   * 获取语言映射
   */
  const getLanguage = (mode: string): string => {
    const languageMap: Record<string, string> = {
      javascript: 'javascript',
      html: 'html',
      json: 'json',
      css: 'css'
    }
    return languageMap[mode] || 'javascript'
  }

  /**
   * 获取编辑器的内容
   */
  const getValue = (): string => {
    return monacoEditor.value?.getValue() || ''
  }

  /**
   * 设置编辑器的值
   */
  const setValue = (newValue: string): void => {
    isRestoringContent.value = true
    
    // 更新编辑器内容
    monacoEditor.value?.setValue(newValue || '')
    
    // 更新内部状态
    codeValue.value = newValue || ''
    
    // 触发双向绑定更新 - 确保父组件能收到更新
    emits('update:modelValue', newValue || '')
    
    // 格式化代码
    monacoEditor.value?.getAction('editor.action.formatDocument')?.run()
    
    setTimeout(() => {
      isRestoringContent.value = false
    }, 100)
  }

  /**
   * 获取编辑器的错误标记
   */
  const getEditorAnnotations = (): monaco.editor.IMarkerData[] => {
    const model = monacoEditor.value?.getModel()
    if (!model) return []
    return monaco.editor.getModelMarkers({ resource: model.uri })
  }

  /**
   * 创建编辑器实例
   */
  const createEditor = (
    onContentChange?: (value: string) => void,
    readonlyRegionChecker?: {
      isEditInReadonlyRegion: (changes: monaco.editor.IModelContentChange[], editor: monaco.editor.IStandaloneCodeEditor) => boolean
      restoreReadonlyContent: (editor: monaco.editor.IStandaloneCodeEditor) => void
      moveCursorToEditableArea: (editor: monaco.editor.IStandaloneCodeEditor, position?: monaco.Position) => void
      isInReadonlyRegion: (position: monaco.Position, editor: monaco.editor.IStandaloneCodeEditor) => boolean
    }
  ) => {
    if (!editorRef.value) return

    monacoEditor.value = monaco.editor.create(editorRef.value, {
      value: codeValue.value,
      language: getLanguage(props.mode || 'javascript'),
      theme: 'vs-dark',
      fontSize: 14,
      readOnly: props.readonly,
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      lineNumbers: 'on',
      glyphMargin: true,
      folding: true,
      lineDecorationsWidth: 10,
      lineNumbersMinChars: 3,
      renderLineHighlight: 'all',
      selectOnLineNumbers: true,
      roundedSelection: false,
      cursorStyle: 'line',
      cursorWidth: 2,
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
      tabSize: 4,
      insertSpaces: true,
      detectIndentation: false,
      trimAutoWhitespace: true,
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: 'on',
      acceptSuggestionOnCommitCharacter: true,
      quickSuggestions: {
        other: true,
        comments: false,
        strings: false
      },
      quickSuggestionsDelay: 100,
      parameterHints: {
        enabled: true
      },
      autoClosingBrackets: 'always',
      autoClosingQuotes: 'always',
      autoSurround: 'languageDefined',
      formatOnPaste: true,
      formatOnType: true,
    })

    // 监听内容变化
    if (onContentChange || readonlyRegionChecker) {
      monacoEditor.value.onDidChangeModelContent((e) => {
        // 如果正在恢复内容，跳过检查
        if (isRestoringContent.value) {
          return
        }
    
        // 检查是否在只读区域进行编辑
        if (readonlyRegionChecker && readonlyRegionChecker.isEditInReadonlyRegion(e.changes, monacoEditor.value!)) {
          // 检查是否是全选删除操作（删除大量内容）
          const isLargeDelete = e.changes.some(change => {
            const deletedLength = change.rangeLength
            const totalLength = monacoEditor.value!.getValue().length + deletedLength
            // 如果删除的内容超过总内容的50%，认为是全选删除
            return deletedLength > totalLength * 0.5
          })
          
          // 对于非全选删除操作，检查是否会导致可编辑区域完全为空（防止死循环）
          if (!isLargeDelete) {
            const model = monacoEditor.value!.getModel()
            if (model) {
              const currentContent = model.getValue()
              const lines = currentContent.split('\n')
              const headerLines = props.readonlyRegions?.header?.content?.split('\n').length || 0
              const footerLines = props.readonlyRegions?.footer?.content?.split('\n').length || 0
              
              // 计算可编辑区域的行数
              const editableStartLine = headerLines
              const editableEndLine = lines.length - footerLines - 1
              const editableLines = lines.slice(editableStartLine, editableEndLine + 1)
              
              // 只有当前可编辑区域已经很少内容时才检查是否会变空
              const currentEditableContent = editableLines.join('\n').trim()
              if (currentEditableContent.length <= 10) { // 只有当可编辑内容很少时才进行保护
                const wouldBeEmpty = e.changes.some(change => {
                  // 检查是否删除操作会导致可编辑区域只剩空行
                  return change.rangeLength > 0 && currentEditableContent.length === 0
                })
                
                // 如果删除会导致可编辑区域为空，阻止操作
                if (wouldBeEmpty) {
                  isRestoringContent.value = true
                  
                  setTimeout(() => {
                    readonlyRegionChecker.restoreReadonlyContent(monacoEditor.value!)
                    // 将光标移动到可编辑区域
                    readonlyRegionChecker.moveCursorToEditableArea(monacoEditor.value!)
                    isRestoringContent.value = false
                  }, 0)
                  return
                }
              }
            }
          }
          
          if (isLargeDelete) {
            // 对于全选删除，先触发内容变化回调，再恢复只读区域
            isRestoringContent.value = true
            
            setTimeout(() => {
              readonlyRegionChecker.restoreReadonlyContent(monacoEditor.value!)
              // 将光标移动到可编辑区域
              readonlyRegionChecker.moveCursorToEditableArea(monacoEditor.value!)
              isRestoringContent.value = false
              
              // 在恢复后再次触发内容变化回调
              if (onContentChange) {
                const value = monacoEditor.value!.getValue()
                onContentChange(value)
              }
            }, 0)
          } else {
            // 普通编辑操作，阻止编辑并恢复内容
            isRestoringContent.value = true
            
            setTimeout(() => {
              readonlyRegionChecker.restoreReadonlyContent(monacoEditor.value!)
              // 将光标移动到可编辑区域
              readonlyRegionChecker.moveCursorToEditableArea(monacoEditor.value!)
              isRestoringContent.value = false
            }, 0)
            return
          }
        }
    
        // 正常的内容变化处理
        if (onContentChange) {
          const value = monacoEditor.value!.getValue()
          onContentChange(value)
        }
      })
      
      // 监听光标位置变化，防止光标停留在只读区域
      monacoEditor.value.onDidChangeCursorPosition((e) => {
        if (readonlyRegionChecker && !isRestoringContent.value) {
          const position = e.position
          if (readonlyRegionChecker.isInReadonlyRegion(position, monacoEditor.value!)) {
            // 延迟移动光标，避免与其他操作冲突
            setTimeout(() => {
              if (!isRestoringContent.value) {
                readonlyRegionChecker.moveCursorToEditableArea(monacoEditor.value!, position)
              }
            }, 10)
          }
        }
      })
      
      // 监听按键事件，特别处理回车键
      monacoEditor.value.onKeyDown((e) => {
        if (readonlyRegionChecker) {
          const position = monacoEditor.value!.getPosition()
          if (position && readonlyRegionChecker.isInReadonlyRegion(position, monacoEditor.value!)) {
            // 在只读区域按任何键都阻止
            e.preventDefault()
            e.stopPropagation()
            
            // 将光标移动到可编辑区域
            readonlyRegionChecker.moveCursorToEditableArea(monacoEditor.value!, position)
            return
          }
          
          // 特别处理回车键，确保不会在只读区域创建新行
          if (e.keyCode === monaco.KeyCode.Enter) {
            const selection = monacoEditor.value!.getSelection()
            if (selection) {
              const startPos = new monaco.Position(selection.startLineNumber, selection.startColumn)
              const endPos = new monaco.Position(selection.endLineNumber, selection.endColumn)
              
              if (readonlyRegionChecker.isInReadonlyRegion(startPos, monacoEditor.value!) || 
                  readonlyRegionChecker.isInReadonlyRegion(endPos, monacoEditor.value!)) {
                e.preventDefault()
                e.stopPropagation()
                readonlyRegionChecker.moveCursorToEditableArea(monacoEditor.value!, startPos)
                return
              }
            }
          }
        }
      })
    }
  }

  /**
   * 销毁编辑器
   */
  const destroyEditor = () => {
    monacoEditor.value?.dispose()
  }

  return {
    editorRef,
    monacoEditor,
    codeValue,
    getValue,
    setValue,
    getEditorAnnotations,
    createEditor,
    destroyEditor
  }
}