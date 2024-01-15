<template>
  <div class="ace-container">
    <div class="ace-editor" ref="ace" @contextmenu="onContextMenu" @keydown="keyDown" @keyup="keyUp"></div>
  </div>
</template>

<script lang="ts">
// @ts-nocheck
import ace from 'ace-builds'
import 'ace-builds/src-min-noconflict/theme-dracula'
import 'ace-builds/src-min-noconflict/mode-javascript'
import 'ace-builds/src-min-noconflict/mode-html'
import 'ace-builds/src-min-noconflict/mode-css'
import 'ace-builds/src-min-noconflict/ext-language_tools'
import workerJavascriptUrl from "ace-builds/src-min-noconflict/worker-javascript?url";
import snippetsUrl from "ace-builds/src-min-noconflict/snippets/javascript";
import { beautify } from 'ace-builds/src-min-noconflict/ext-beautify';
// import loadBeautifier, { beautifierOpts } from '@/utils/beautifierLoader'
// import {
//   snippetData,
//   completions,
//   highRules
// } from '@/utils/ace-editor-data'
// const ACE_BASE_PATH = 'ace'
export default {
  name: 'CodeEditor',
  props: {
    modelValue: {
      type: String,
      //required: true
    },
    readonly: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: 'javascript'
    },
    userWorker: { //是否开启语法检查，默认开启
      type: Boolean,
      default: true
    },

  },
  unmounted() {
    this.aceEditor.destroy()
  },
  emits: ['update:modelValue'],
  mounted() {
    // ace.config.set('basePath', ACE_BASE_PATH)
    ace.config.setModuleUrl('ace/mode/javascript_worker', workerJavascriptUrl);
    ace.config.setModuleUrl('ace/mode/snippetsUrl', snippetsUrl);
    this.aceEditor = ace.edit(this.$refs.ace, {
      maxLines: 20, // 最大行数，超过会自动出现滚动条
      minLines: 5, // 最小行数，还未到最大行数时，编辑器会自动伸缩大小
      fontSize: 14, // 编辑器内字体大小
      theme: 'ace/theme/dracula', // 默认设置的主题
      mode: 'ace/mode/'+this.mode, // 默认设置的语言模式
      useWorker: this.userWorker,
      tabSize: 4, // 制表符设置为4个空格大小
      readOnly: this.readonly,
      highlightActiveLine: true,
      value: this.codeValue,
      mergeUndoDeltas: 'always',
      useSoftTabs: true,
      useWrapMode: true,
      highlightGutterLine: false,
      fadeFoldWidgets: true,
      showPrintMargin: false
    })
    beautify(this.aceEditor.session)
    this.aceEditor.setOptions({
      enableBasicAutocompletion: true,
      enableSnippets: true, // 设置代码片段提示
      enableLiveAutocompletion: true, // 设置自动提示
    })
    /* const innerText = this.$parent.$el.innerText
    if(innerText.indexOf('onFormCreated') > -1 || innerText.indexOf('onFormMounted') > -1 || innerText.indexOf('onFormDataChange') > -1){
      completData.push(...snippetsData.map(item =>{
        return {
          ...item,
          snippet:item.snippet.replace('.getFormRef()','')
        }
      }))
    }else{} */
    //编辑时同步数据
    this.aceEditor.getSession().on('change', (ev) => {
      this.$emit('update:modelValue', this.aceEditor.getValue())
    })
    this.downArr = []
  },
  data() {
    return {
      aceEditor: null,
      codeValue: this.modelValue,
    }
  },
  watch: {
    //
  },
  methods: {
    keyDown(e) {
      if (e.keyCode >= 16 && e.keyCode <= 18) {
        if (this.downArr.indexOf(e.keyCode) === -1) {
          this.downArr.push(e.keyCode)
        }
      }
    },
    keyUp(e) {
      if (this.downArr[0] === 17 && e.keyCode === 75) {
        this.formatCode()
      }
      if (e.keyCode >= 16 && e.keyCode <= 18) {
        if (this.downArr.indexOf(e.keyCode) > -1) {
          this.downArr.splice(this.downArr.indexOf(e.keyCode), 1)
        }
      }
    },

    getLowerCase(str) {
      var arr = str.split('')
      //使用循环遍历字符串
      str = arr.map((item, index) => {
        if (item.toUpperCase() === item) {
          //使用toUpperCase()方法检测当前字符是否为大写
          if (index === 0) {
            return item.toLowerCase();
          } else {
            return '-' + item.toLowerCase();
          }
          //大写就在前面加上-，并用toLowerCase()将当前字符转为小写
        } else {
          return item;
        }
      })
      return str.join('')
    },

    getUpperCase(str) {
      const reg = /-(.)/g;
      return str.replace(reg, (fullMatch, g1, index) => {
        if (index === 0) return g1;
        return g1.toUpperCase();
      });
    },

    // addAutoCompletion(ace) {
    //   const {
    //     codeSnippetData,
    //     codeHighRules,
    //     codeCompletions
    //   } = this.getDesignerConfig()

    //   //设置高亮提示
    //   const session = this.aceEditor.session
    //   const rules = session.$mode.$highlightRules.getRules()
    //   const realHighRules = [...highRules, ...codeHighRules ? codeHighRules : []]
    //   //设置提示
    //   let acData = [
    //     ...completions,
    //     ...codeCompletions ? codeCompletions : []
    //   ]
    //   const methods = [{
    //     meta: '',
    //     data: renderRef.methods,
    //     caption: '$r'
    //   }, {
    //     meta: '',
    //     data: fieldMixin.methods,
    //     caption: '$f'
    //   }, {
    //     meta: '',
    //     data: containerMixin.methods,
    //     caption: '$c'
    //   }]
    //   methods.forEach(methodItem => {
    //     for (let key in methodItem.data) {
    //       const method = methodItem.data[key].toString()
    //       const methodName = method.substr(0, method.indexOf('(')).replace(/ /g, '')
    //       const index = acData.findIndex(item => {
    //         return item.caption.indexOf(methodName) > -1
    //       })
    //       if (index > -1) {
    //         acData[index] = {
    //           meta: methodItem.meta,
    //           caption: methodItem.caption + ' ' + key,
    //           score: 1001,
    //           appendTo: ['this', 'getFormRef', 'self', 'getParentFormRef', 'getChildFormRef'],
    //           value: method.substr(0, method.indexOf('{')).replace(/ /g, ''),
    //           ...acData[index],
    //         }
    //       } else {
    //         acData.push({
    //           meta: methodItem.meta,
    //           caption: methodItem.caption + ' ' + key,
    //           value: method.substr(0, method.indexOf('{')).replace(/ /g, ''),
    //           score: 1001,
    //           appendTo: ['this', 'getFormRef', 'self', 'getParentFormRef', 'getChildFormRef']
    //         })
    //       }
    //       realHighRules.push(key)
    //     }
    //   })
    //   if (rules['property'][0].regex !== realHighRules.join('|')) {
    //     rules['property'].unshift({
    //       token: 'support.function',
    //       regex: realHighRules.join('|'),
    //       caseInsensitive: true,
    //     });
    //   }
    //   //当出现无效项目时应采用下列方案
    //   /* for (const stateName in rules) {

    //   } */

    //   // 重置高亮
    //   session.$mode.$tokenizer = null;
    //   session.bgTokenizer.setTokenizer(session.$mode.getTokenizer());
    //   session.bgTokenizer.start(0);


    //   //设置Ref提示
    //   const refsData = []
    //   const refList = this.getDesigner().formWidget.widgetRefList
    //   for (let key in refList) {
    //     //const ref = refList[key]
    //     refsData.push({
    //       caption: key,
    //       meta: "Ref字段",
    //       value: key,
    //       score: 1001
    //     })
    //   }
    //   //设置代码段提示
    //   let snippetsData = [...snippetData, ...codeSnippetData ? codeSnippetData.map(item => {
    //     return {
    //       "score": 1000,
    //       "completerId": "snippetCompleter",
    //       "meta": "代码块",
    //       ...item,
    //     }
    //   }) : []]

    //   //获取已注册组件
    //   const comps = this.$root.$.appContext.components
    //   const registerCompsName = Object.keys(comps).filter(item => {
    //     return item.endsWith('editor') === false && item.indexOf(':') === -1 && item.endsWith('-widget') ===
    //       false && item.endsWith('Widget') === false && item.startsWith('el-icon') === false
    //   }).map((item, index) => {
    //     const tab = ["${1:}", "${2:}"]
    //     const realItem = this.getLowerCase(item)
    //     return {
    //       "score": 1000 + index,
    //       "completerId": "snippetCompleter",
    //       "mode": "html",
    //       "meta": "组件",
    //       "caption": realItem,
    //       "snippet": `<${realItem} ${tab[0]}>${tab[1]}</${realItem}>`
    //     }
    //   })

    //   let langTools = ace.require('ace/ext/language_tools')
    //   langTools.addCompleter({
    //     getCompletions: ((editor, session, pos, prefix, callback) => {
    //       if (prefix.length === 0) {
    //         return callback(null, []);
    //       } else {
    //         let completData = []
    //         const lastTextArr = session.doc.$lines[pos.row].split('.')
    //         const prevText = lastTextArr[lastTextArr.length - 2] ? lastTextArr[lastTextArr
    //           .length - 2].replace(/ /g, '') : null
    //         if (prevText !== null && session.$modeId !== 'ace/mode/html') {
    //           if (!session.doc.$lines[pos.row].substr(pos.column)) {
    //             completData.push(...acData.filter(item => {
    //               return item.appendTo.findIndex(fitem => {
    //                 return prevText.startsWith(fitem) || prevText.endsWith(fitem)
    //               }) > -1
    //             }))
    //           } else if (session.doc.$lines[pos.row].substr(pos.column).indexOf(')') > -1) {
    //             completData = refsData
    //           }
    //         } else if (session.$modeId === 'ace/mode/html') {
    //           const startTag = session.doc.$lines[pos.row].indexOf('<') > -1
    //           const endTag = session.doc.$lines[pos.row].indexOf('>') > -1
    //           if (startTag || endTag) {
    //             let tagName = session.doc.$lines[pos.row].substring(startTag)
    //             tagName = tagName.substring(0, tagName.indexOf(' '))
    //             const comp = comps[this.getUpperCase(tagName)] || comps[this.getUpperCase(tagName).charAt(0).toUpperCase() + this.getUpperCase(tagName).slice(1)]
    //             if (tagName && comp && session.doc.$lines[pos.row].charAt(pos.column) !== '"') {
    //               const props = Object.keys(comp.props).map((item, index) => {
    //                 const tab = ["${1:}", "${2:}"]
    //                 const realItem = this.getLowerCase(item)
    //                 return {
    //                   "score": 1000 + index,
    //                   "completerId": "snippetCompleter",
    //                   "mode": "html",
    //                   "meta": "属性",
    //                   "caption": realItem,
    //                   "snippet": `:${realItem}="${tab[0]}"`
    //                 }
    //               })
    //                completData.push(...props)
    //             }
    //           } else {
    //             completData.push(...registerCompsName)
    //           }
    //         }
    //         if (session.doc.$lines[pos.row].indexOf('.') === -1 && session.$modeId !== 'ace/mode/html') {
    //           completData.push(...snippetsData.filter(item => {
    //             return session.$modeId === 'ace/mode/' + item.mode
    //           }))
    //         }
    //         return callback(null, completData);
    //       }
    //     })
    //   })
    // },

    getEditorAnnotations() {
      return this.aceEditor.getSession().getAnnotations()
    },

    setValue(newValue) {
      this.aceEditor.getSession().setValue(newValue)
    },

    // formatCode() {
    //   let data
    //   loadBeautifier(beautifier =>{
    //     if (this.mode === 'json') {
    //       data = JSON.parse(this.modelValue)
    //     } else if (this.mode === 'css') {
    //       data = beautifier.css(this.modelValue, beautifierOpts.css)
    //     } else if (this.mode == 'javascript') {
    //       data = beautifier.js(this.modelValue, beautifierOpts.js)
    //     }else if (this.mode === 'html'){
    //       data = beautifier.html(this.modelValue)
    //     }
    //   })
    //   this.setValue(data)
    // },
  }
}
</script>

<style lang="scss" scoped>
.ace-editor {
  min-height: 300px;
  // border-radius: var(--el-border-radius-base);
}
</style>