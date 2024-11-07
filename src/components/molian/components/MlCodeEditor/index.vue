<script lang="ts" setup>
// @ts-nocheck
import ace from "ace-builds";
import "ace-builds/src-min-noconflict/theme-dracula";
import "ace-builds/src-min-noconflict/mode-javascript";
import "ace-builds/src-min-noconflict/mode-html";
import "ace-builds/src-min-noconflict/mode-json";
import "ace-builds/src-min-noconflict/mode-css";
import "ace-builds/src-min-noconflict/ext-language_tools";
import "ace-builds/src-min-noconflict/ext-searchbox"; // 用于搜索功能
import "ace-builds/src-min-noconflict/ext-error_marker";
import "ace-builds/src-min-noconflict/ext-emmet";
import "ace-builds/src-min-noconflict/ext-elastic_tabstops_lite";
import "ace-builds/src-min-noconflict/ext-command_bar";
import "ace-builds/src-min-noconflict/ext-beautify";
import "ace-builds/src-min-noconflict/ext-options";
import "ace-builds/src-min-noconflict/ext-prompt";
import snippetsJS from "ace-builds/src-min-noconflict/snippets/javascript";
import snippetsCss from "ace-builds/src-min-noconflict/snippets/css";
import { beautify } from "ace-builds/src-min-noconflict/ext-beautify";
// import loadBeautifier, { beautifierOpts } from '@/utils/beautifierLoader'
import { compsRef } from "@molianComps/Designer/designerData";
import { useI18n } from 'vue-i18n'
defineOptions({
  name: "MlCodeEditor",
});

const props = defineProps({
  modelValue: {
    type: String,
    //required: true
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  mode: {
    type: String,
    default: "javascript",
    optionItems: ["javascript", "html", "json", "css"],
  },
  userWorker: {
    type: Boolean,
    default: true,
  },
  maxLines: {
    type: Number,
    default: 20,
  },
  highRules: {
    type: Array,
    defalt: () => [],
  },
  refsData: {
    type: Array,
    default: () => [],
  },
  completions: {
    type: [Array, Function],
    default: () => [],
  },
  snippetsData: {
    type: [Array, Function],
    default: () => [],
  },
});

const emits = defineEmits(["update:modelValue"]);

const customTips = inject('codeEditor')
const { t } = useI18n()
const aceRef = ref();
const aceEditor = shallowRef();
const codeValue = ref(props.modelValue);
const downArr = [];

watch(() => props.modelValue, (newVal, oldVal) => {
    if (newVal !== oldVal) {
      codeValue.value = newVal;
      // aceEditor.value.setValue(newVal)
    }
  }
);

/**
 * 获取Ace编辑器的内容
 *
 * 此函数用于从Ace编辑器实例中获取当前的文本内容
 * 它通过调用Ace编辑器的getValue方法来实现
 *
 * @return {string} 当前Ace编辑器中的文本内容
 */
const getValue = () => {
  return aceEditor.value.getValue();
};

/**
 * 设置Ace编辑器的值
 *
 * 该函数的作用是将新的值设置到Ace编辑器中，并对编辑器的会话进行美化
 * 它通过操作Ace编辑器的会话来更新编辑器内部的内容，并使用beautify函数来提升代码的视觉呈现
 *
 * @param {string} newValue - 要设置到Ace编辑器的新代码内容
 */
const setValue = (newValue) => {
  // 获取Ace编辑器的会话，并设置其值为newValue
  aceEditor.value.getSession().setValue(newValue);
  // 对Ace编辑器的会话进行代码美化
  beautify(aceEditor.value.session);
};

/**
 * 获取编辑器的注释
 *
 * 此函数用于从ACE编辑器实例中获取当前所有行的注释信息
 * 它通过调用编辑器的getSession().getAnnotations()方法来实现
 *
 * @returns {Array} 返回一个包含所有行注释的数组，每个注释对象包含行号、类型、文本等内容
 */
const getEditorAnnotations = () => {
  return aceEditor.value.getSession().getAnnotations();
};

/**
 * 处理键盘按下事件的函数
 *
 * @param {KeyboardEvent} e - 键盘事件对象
 * 此函数旨在处理键盘按下事件，仅当按键的键码在16到18之间时（即Shift、Ctrl、Alt键），
 * 如果这些键中任一键尚未被按下（即不在downArr数组中），则将其键码添加到downArr数组中
 */
const keyDown = (e) => {
  // 判断按键键码是否在16到18之间
  if (e.keyCode >= 16 && e.keyCode <= 18) {
    // 如果当前按键不在downArr数组中，则将其键码添加到数组中
    if (downArr.indexOf(e.keyCode) === -1) {
      downArr.push(e.keyCode);
    }
  }
};
// 定义一个键释放事件处理函数
const keyUp = (e) => {
  // 当Ctrl键(键码17)被按下且K键(键码75)被释放时，将输入框的值设置为初始值
  if (downArr[0] === 17 && e.keyCode === 75) {
    setValue(props.modelValue);
  }
  // 当释放的键为Shift(键码16)、Ctrl(键码17)或Alt(键码18)时，从downArr数组中移除相应的键码
  if (e.keyCode >= 16 && e.keyCode <= 18) {
    if (downArr.indexOf(e.keyCode) > -1) {
      downArr.splice(downArr.indexOf(e.keyCode), 1);
    }
  }
};

/**
 * 将字符串中的每个大写字母前添加短横线并转换为小写
 * @param {string} str - 需要处理的字符串
 * @returns {string} - 处理后的字符串，如果原字符串为空则返回空字符串
 */
const getLowerCase = (str: string) => {
  // 将字符串转换为字符数组
  var arr = str.split("");
  // 使用循环遍历字符串
  str = arr.map((item, index) => {
    // 检查当前字符是否为大写
    if (item.toUpperCase() === item) {
      // 如果是第一个字符，直接转换为小写
      if (index === 0) {
        return item.toLowerCase();
      } else {
        // 如果不是第一个字符，在转换为小写前添加短横线
        return "-" + item.toLowerCase();
      }
    } else {
      // 如果是小写或非字母字符，不做处理
      return item;
    }
  });
  // 将处理后的字符数组重新拼接成字符串
  return str.join("");
};

/**
 * 将带有连字符的单词转换为驼峰式大写字符串
 * 例如，将"hello-world"转换为"HelloWorld"
 *
 * @param {string} str - 带有连字符的单词
 * @returns {string} - 驼峰式大写字符串
 */
const getUpperCase = (str: string) => {
  // 定义一个正则表达式，用于匹配所有连字符后面的第一个字符
  const reg = /-(.)/g;
  // 使用正则表达式替换字符串中的匹配部分
  // 对于每个匹配到的部分，如果它是第一个字符，则不转换；否则，转换为大写
  return str.replace(reg, (fullMatch, g1, index) => {
    if (index === 0) return g1;
    return g1.toUpperCase();
  });
};

/**
 * 设置高亮规则
 *
 * @param {Array} highRules - 高亮提示的规则数组
 */
const setHighRules = (highRules) => {
  // 如果高亮规则数组不为空
  if (highRules && highRules.length > 0) {
    // 获取当前编辑器的会话
    const session = aceEditor.value.session;
    // 获取当前模式的高亮规则
    const rules = session.$mode.$highlightRules.getRules();
    // 判断当前的属性规则是否与新的高亮规则一致
    if (rules["property"][0].regex !== highRules.join("|")) {
      // 如果不一致，则更新属性规则
      rules["property"].unshift({
        token: "support.function",
        regex: highRules.join("|"),
        caseInsensitive: true,
      });
    }
    // 当出现无效项目时应采用下列方案
    /* for (const stateName in rules) {
      // TODO: 处理无效项目的逻辑
    } */
    // 重置高亮
    session.$mode.$tokenizer = null;
    session.bgTokenizer.setTokenizer(session.$mode.getTokenizer());
    session.bgTokenizer.start(0);
  }
};

const getRelatedCode = (code: string[], pos: { row: number, column: number }) => {
    // 获取当前行的代码
    const currentLine = code[pos.row];
    // 初始化相关代码字符串
    let relatedCode = '';

    // // 辅助函数：获取代码块的完整代码
    // const getCompleteBlock = (startLine: number, startColumn: number, blockType: '{' | '(' | '[', resultLine:string): string => {
    //     let blockStart = startLine;
    //     let blockEnd = startLine;
    //     let openCount = 1;
    //     const closeChar = blockType === '{' ? '}' : blockType === '(' ? ')' : ']';

    //     // 处理起始行中的部分代码
    //     let resultLineContent = resultLine.slice(startColumn);
    //     openCount += (resultLineContent.match(new RegExp(blockType, 'g')) || []).length;
    //     openCount -= (resultLineContent.match(new RegExp(closeChar, 'g')) || []).length;

    //     while (openCount > 0 && blockEnd < code.length) {
    //         blockEnd++;
    //         if (blockEnd >= code.length) {
    //             console.warn(`未找到闭合字符 ${closeChar}，可能的语法错误在第 ${blockStart + 1} 行`);
    //             break;
    //         }
    //         const line = code[blockEnd];
    //         openCount += (line.match(new RegExp(blockType, 'g')) || []).length;
    //         openCount -= (line.match(new RegExp(closeChar, 'g')) || []).length;
    //     }

    //     // 拼接起始行的部分内容和后续行的内容
    //     let completeBlock = resultLine.slice(startColumn) + '\n';
    //     for (let i = blockStart + 1; i <= blockEnd; i++) {
    //         if(code[i]) {
    //             completeBlock += code[i] + '\n';
    //         }
    //     }
    //     return completeBlock;
    // };

    // // 获取当前光标所在位置的字符
    // const currentChar = currentLine[pos.column];
    // if (currentChar === '{' || currentChar === '(' || currentChar === '[') {
    //     relatedCode = getCompleteBlock(pos.row, pos.column, currentChar, currentLine);
    // } else {
    //     // 如果当前字符不是 {, (, [，则查找最近的 {, (, [ 并获取其代码块
    //     for (let i = pos.column - 1; i >= 0; i--) {
    //         const char = currentLine[i];
    //         if (char === '{' || char === '(' || char === '[') {
    //             relatedCode = getCompleteBlock(pos.row, i, char, currentLine);
    //             break;
    //         }
    //     }
    //     if (!relatedCode) {
    //         // 如果在当前行没有找到，则向上查找
    //         for (let i = pos.row - 1; i >= 0; i--) {
    //             const line = code[i];
    //             for (let j = line.length - 1; j >= 0; j--) {
    //                 const char = line[j];
    //                 if (char === '{' || char === '(' || char === '[') {
    //                     relatedCode = getCompleteBlock(i, j, char, line);
    //                     break;
    //                 }
    //             }
    //             if (relatedCode) break;
    //         }
    //     }
    // }

    // 获取当前行的代码按点号分割并去除空格
    const currentCodeArr = currentLine.split('.').map(item => item.trim());
    // 获取前一个部分的文本
    const prevText = currentCodeArr[currentCodeArr.length - 2] ? currentCodeArr[currentCodeArr.length - 2].replace(/ /g, '') : null;
    return {
        code: code.join('\n'),
        currentCodeArr,
        prevText,
        pos,
        relatedCode,
    }
}
// 在组件挂载后执行的函数
onMounted(() => {
  // 根据传入的模式设置代码片段URL
  if (props.mode === "javascript") {
    ace.config.setModuleUrl(`ace/mode/snippetsUrl`, snippetsJS);
  } else if (props.mode === "css") {
    ace.config.setModuleUrl(`ace/mode/snippetsUrl`, snippetsCss);
  } else if (props.mode === "json") {
    // 可以处理JSON模式的默认设置
  }

  // 加载美化的扩展模块
  ace.config.loadModule("ace/ext/beautify", function (module) {
    // 扩展加载后的处理逻辑
  });

  // 初始化ACE编辑器
  aceEditor.value = ace.edit(aceRef.value, {
    maxLines: props.maxLines, // 最大行数，超过会自动出现滚动条
    minLines: 5, // 最小行数，还未到最大行数时，编辑器会自动伸缩大小
    fontSize: 14, // 编辑器内字体大小
    theme: "ace/theme/dracula", // 默认设置的主题
    mode: "ace/mode/" + props.mode, // 默认设置的语言模式
    tabSize: 4, // 制表符设置为4个空格大小
    readOnly: props.readonly,
    highlightActiveLine: true,
    value: codeValue.value,
    mergeUndoDeltas: "always",
    useSoftTabs: true,
    useWrapMode: true,
    useElasticTabstops: true,
    highlightGutterLine: true,
    fadeFoldWidgets: true,
    showPrintMargin: false,
    enableLinking: true,
    spellcheck: true,
  });

  // 对编辑器的代码进行美化
  beautify(aceEditor.value.session);

  // 设置编辑器的自动提示和代码片段功能
  aceEditor.value.setOptions({
    enableBasicAutocompletion: true,
    enableSnippets: true, // 设置代码片段提示
    enableLiveAutocompletion: true, // 设置自动提示
    enableChromevoxEnhancements: true,
    enableLinking: true,
  });

  // 如果没有传入用户自定义的worker，则使用编辑器的默认worker
  if (!props.userWorker) {
    aceEditor.value.getSession().setUseWorker(props.userWorker);
    aceEditor.value.getSession().on("changeAnnotation", function () {
      const annotations = editor.getSession().getAnnotations();
      // annotations 是包含错误信息的数组
      // 你可以遍历这个数组并处理错误提示
      console.log(annotations);
    });
  }

  // 编辑时同步数据
  aceEditor.value.getSession().on("change", (ev) => {
    emits("update:modelValue", aceEditor.value.getValue());
  });

  // 如果是javascript模式，添加自动完成功能
  if (props.mode === "javascript" && !!customTips) {
    addAutoCompletion();
  }
});

// 当组件卸载时，销毁ACE编辑器
onUnmounted(() => {
  aceEditor.value.destroy();
});
const addAutoCompletion = () => {
  setHighRules(customTips.highRules);
  let langTools = ace.require("ace/ext/language_tools");
  langTools.addCompleter({
    getCompletions: (editor, session, pos, prefix, callback) => {
      if (prefix.length === 0) {
        return callback(null, []);
      } else {
        const currentRelatedCode = getRelatedCode(session.doc.$lines, pos);
        const { prevText } = currentRelatedCode;
        if (prevText !== null && session.$modeId !== "ace/mode/html") {
          if (!session.doc.$lines[pos.row].substr(pos.column)) {
            let data = [];
            if (typeof customTips.completions === "object" && Array.isArray(customTips.completions)) {
                callback(null,customTips.completions.filter((item) => {
                    return (
                    item.appendTo.findIndex((fitem) => {
                        return prevText.startsWith(fitem) || prevText.endsWith(fitem);
                    }) > -1
                    );
                }))
            } else if (typeof customTips.completions === "function") {
              customTips.completions(currentRelatedCode, callback);
            }
            return
          } else if (session.doc.$lines[pos.row].substr(pos.column).indexOf(")") > -1) {
            // 此处显示应获取所有refs数据
            // 本地直接获取
            const refsData = Object.keys(compsRef).map(key => {
                return {
                    caption: key,
                    meta: t('basic.refField'),
                    value: key,
                    score: 1001,
                }
            })
            return callback(null, refsData);
          }
        } else if (session.doc.$lines[pos.row].indexOf(".") === -1 && session.$modeId !== "ace/mode/html") {
          // 模板数据
          let data = [];
          if (
            typeof customTips.snippetsData === "object" &&
            Array.isArray(customTips.snippetsData)
          ) {
            callback(null, customTips.snippetsData.filter((item) => {
              return session.$modeId === "ace/mode/" + item.mode;
            }))
          } else if (typeof snippetsData === "function") {
            customTips.snippetsData(item.mode, currentRelatedCode, callback);
          }
          return
        }
      }
    },
  });
};

defineExpose({
  setValue,
  getValue,
  setHighRules,
});
</script>

<template>
  <div class="ace-container">
    <div
      class="ace-editor"
      ref="aceRef"
      @contextmenu="onContextMenu"
      @keydown="keyDown"
      @keyup="keyUp"
    ></div>
  </div>
</template>

<style lang="scss" scoped>
.ace-editor {
  min-height: 300px;
}
</style>
