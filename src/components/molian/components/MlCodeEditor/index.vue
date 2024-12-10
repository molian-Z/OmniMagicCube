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
import { useI18n } from "vue-i18n";
import { completions, getHighRules } from "./tips";
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
});

const emits = defineEmits(["update:modelValue"]);

const customTips = inject("codeEditor");
const { t } = useI18n();
const aceRef = ref();
const aceEditor = shallowRef();
const codeValue = ref(props.modelValue);
const downArr = [];

watch(
  () => props.modelValue,
  (newVal, oldVal) => {
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
const setHighRules = () => {
  // 检查 customTips 是否存在并且包含 refs 和 variables
  if (customTips && customTips.refs && customTips.variable) {
    // 提取 refs 和 variables 的键
    const refsKeys = Object.keys(customTips.refs).map((key) => {
      return key.replace("$", "\\$");
    });
    const variablesKeys = Object.keys(customTips.variable).map((key) => {
      return key.replace("$", "\\$");
    });
    const customKeys =
      customTips.custom.highRules.map((key) => {
        return key.replace("$", "\\$");
      }) || [];
    // 合并 refs 和 variables 的键
    const highRules = [...refsKeys, ...variablesKeys, ...customKeys];
    // 如果高亮规则数组不为空
    if (highRules && highRules.length > 0) {
      // 获取当前编辑器的会话
      const session = aceEditor.value.session;
      // 获取当前模式的高亮规则
      const rules = session.$mode.$highlightRules.getRules();

      // 判断当前的属性规则是否与新的高亮规则一致
      if (!rules["property"] || rules["property"][0].regex !== highRules.join("|")) {
        // 如果不一致，则更新属性规则
        if (refsKeys.length > 0) {
          rules["property"].unshift({
            token: "support.function",
            regex: refsKeys.join("|"),
            caseInsensitive: true,
          });
        }
        if (variablesKeys.length > 0) {
          rules["property"].unshift(
            {
              token: "support.function",
              regex: new RegExp(`(?<=vars\\.)(${variablesKeys.join("|")})\\b(?=\\()`),
              caseInsensitive: true,
            },
            {
              token: "variable.parameter",
              regex: new RegExp(`(?<=vars\\.)(${variablesKeys.join("|")})\\b`),
              caseInsensitive: true,
            }
          );
        }
        if (customKeys.length > 0) {
          rules["property"].unshift(
            {
              token: "support.function",
              regex: new RegExp(`(?<=this\\.)(${customKeys.join("|")})\\b(?=\\()`),
              caseInsensitive: true,
            },
            {
              token: "variable.parameter",
              regex: new RegExp(`(?<=this\\.)(${customKeys.join("|")})\\b`),
              caseInsensitive: true,
            }
          );
        }
        rules["property"].unshift(...getHighRules());
      }
      // 重置高亮
      session.$mode.$tokenizer = null;
      session.bgTokenizer.setTokenizer(session.$mode.getTokenizer());
      session.bgTokenizer.start(0);
    }
  }
};

/**
 * 获取与给定代码位置相关的代码片段
 * @param code 代码数组，每个元素代表一行代码
 * @param pos 代码中的位置，包含行号和列号
 * @returns 返回包含相关代码、当前代码数组、前一个文本、当前位置和相关代码的字符串
 */
const getRelatedCode = (code: string[], pos: { row: number; column: number }) => {
  // 获取当前行的代码
  const currentLine = code[pos.row];
  // 初始化相关代码字符串
  let relatedCode = "";
  // 获取当前光标所在位置的字符
  const currentChar = currentLine[pos.column];
  // 辅助函数：获取代码块的完整代码
  /* const getCompleteBlock = (
    startLine: number,
    startColumn: number,
    blockType: "{" | "(" | "[",
    resultLine: string
  ): string => {
    let blockStart = startLine;
    let blockEnd = startLine;
    let openCount = 1;
    const closeChar = blockType === "{" ? "}" : blockType === "(" ? ")" : "]";

    // 处理起始行中的部分代码
    let resultLineContent = resultLine.slice(startColumn);
    openCount += (resultLineContent.match(new RegExp(blockType, "g")) || []).length;
    openCount -= (resultLineContent.match(new RegExp(closeChar, "g")) || []).length;

    while (openCount > 0 && blockEnd < code.length) {
      blockEnd++;
      if (blockEnd >= code.length) {
        console.warn(
          `未找到闭合字符 ${closeChar}，可能的语法错误在第 ${blockStart + 1} 行`
        );
        break;
      }
      const line = code[blockEnd];
      openCount += (line.match(new RegExp(blockType, "g")) || []).length;
      openCount -= (line.match(new RegExp(closeChar, "g")) || []).length;
    }

    // 拼接起始行的部分内容和后续行的内容
    let completeBlock = resultLine.slice(startColumn) + "\n";
    for (let i = blockStart + 1; i <= blockEnd; i++) {
      if (code[i]) {
        completeBlock += code[i] + "\n";
      }
    }
    return completeBlock;
  };

  if (currentChar === "{" || currentChar === "(" || currentChar === "[") {
    relatedCode = getCompleteBlock(pos.row, pos.column, currentChar, currentLine);
  } else {
    // 如果当前字符不是 {, (, [，则查找最近的 {, (, [ 并获取其代码块
    for (let i = pos.column - 1; i >= 0; i--) {
      const char = currentLine[i];
      if (char === "{" || char === "(" || char === "[") {
        relatedCode = getCompleteBlock(pos.row, i, char, currentLine);
        break;
      }
    }
    if (!relatedCode) {
      // 如果在当前行没有找到，则向上查找
      for (let i = pos.row - 1; i >= 0; i--) {
        const line = code[i];
        for (let j = line.length - 1; j >= 0; j--) {
          const char = line[j];
          if (char === "{" || char === "(" || char === "[") {
            relatedCode = getCompleteBlock(i, j, char, line);
            break;
          }
        }
        if (relatedCode) break;
      }
    }
  } */

  // 获取当前行的代码按点号分割并去除空格
  const currentCodeArr = currentLine.split(".").map((item) => item.trim());
  // 计算光标位置在 currentCodeArr 中的索引
  let cumulativeLength = 0;
  let cursorIndex = -1;

  for (let i = 0; i < currentCodeArr.length; i++) {
    cumulativeLength += currentCodeArr[i].length;
    if (cumulativeLength >= pos.column) {
      cursorIndex = i;
      break;
    }
    cumulativeLength++; // 加上分隔符 "."
  }
  // 获取前一个部分的文本
  const prevText = currentCodeArr[cursorIndex - 1]
    ? currentCodeArr[cursorIndex - 1].trim()
    : "";
  const currentText = currentCodeArr[cursorIndex]
    ? currentCodeArr[cursorIndex].trim()
    : "";
  return {
    code: code.join("\n"),
    currentCodeArr,
    prevText,
    currentText,
    pos,
    relatedCode,
  };
};
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
    setHighRules();
    addAutoCompletion();
  }
});

// 当组件卸载时，销毁ACE编辑器
onUnmounted(() => {
  aceEditor.value.destroy();
});

/**
 * 获取代码补全建议
 * 此函数根据自定义提示对象customTips生成代码补全建议数组
 * 它主要关注于处理refs和variables的键，将它们格式化并赋予相应的元数据，以便在代码编辑器中显示为建议
 * @returns {Array} 代码补全建议数组，每个建议包含meta、caption、value、score、mode和prefix属性
 */
const getCompletions = () => {
  // 检查customTips对象是否存在，并包含refs和variable属性
  if (customTips && customTips.refs && customTips.variable) {
    // 提取refs和variables的键，并对键进行转义处理，以防它们在代码中具有特殊含义
    const refsKeys = Object.keys(customTips.refs).map((key) => {
      return key.replace("$", "\\$");
    });
    const variablesKeys = Object.keys(customTips.variable).map((key) => {
      return key.replace("$", "\\$");
    });

    // 返回一个合并了多个子数组的新数组，包含默认补全项、处理后的refs和variables补全项，以及自定义补全项
    return [
      ...completions(t),
      ...refsKeys.map((key, index) => {
        return {
          meta: t("codeEditor.ref"),
          caption: `${key}`,
          value: key,
          score: index + 1,
          mode: "javascript",
          prefix: ["$refs", "ref"],
        };
      }),
      ...variablesKeys.map((key, index) => {
        return {
          meta:
            typeof customTips.variable[key].type === "function"
              ? t("codeEditor.varFunc")
              : t("codeEditor.var"),
          caption: customTips.variable[key].label || `${key}`,
          value: typeof customTips.variable[key].type === "function" ? `${key}()` : key,
          score: index + 1,
          mode: "javascript",
          prefix: ["vars"],
        };
      }),
      ...customTips.custom.completions,
    ];
  }
};

/**
 * 获取代码片段
 *
 * 该函数生成一个包含可使用的代码片段数组，用于辅助编码
 * 它主要处理与自定义提示相关的数据，包括refs和variables
 * @returns {Array} 包含代码片段的对象数组
 */
const getSnippet = () => {
  // 检查customTips及其属性refs和variable是否存在
  if (customTips && customTips.refs && customTips.variable) {
    // 处理variables，将键中的$符号进行转义
    const variablesKeys = Object.keys(customTips.variable).map((key) => {
      return key.replace("$", "\\$");
    });

    // 初始化用于存储refs数据的数组
    const refData = [];

    // 遍历refs，生成对每个组件的操作代码片段
    Object.keys(customTips.refs).forEach((key, index) => {
      const currentRef = customTips.refs[key];

      // 生成对当前组件进行操作的代码片段
      refData.push({
        score: index + 1,
        completerId: "snippetCompleter",
        mode: "javascript",
        meta: key, // t("codeEditor.ref"),
        caption: t("codeEditor.getRef", { key }),
        snippet: `//${t("codeEditor.getRef", { key })}\nthis.\\$refs.${key}`,
      });

      // 遍历组件的属性，生成对属性的操作代码片段
      Object.keys(currentRef).forEach((childKey, childIndex) => {
        if (typeof currentRef[childKey] === "function") {
          // 如果属性是函数，生成调用函数的代码片段
          const tabs = extractArgsFromString(currentRef[childKey].toString())
            .map((str, strIndex) => {
              return `\${${strIndex + 1}:${str}}`;
            })
            .join(",");
          refData.push({
            score: index + 1,
            completerId: "snippetCompleter",
            mode: "javascript",
            meta: key, // t("codeEditor.refFunction"),
            caption: t("codeEditor.useRefFunction", { childKey }),
            snippet: `//${t("codeEditor.useRefFunction", {
              key,
              childKey,
            })}\nthis.\\$refs.${key}.${childKey}(${tabs})`,
          });
        } else {
          // 如果属性不是函数，生成获取属性值的代码片段
          refData.push({
            score: index + 1,
            completerId: "snippetCompleter",
            mode: "javascript",
            meta: key,// t("codeEditor.refVars"),
            caption: t("codeEditor.getRefVars", { childKey }),
            snippet: `//${t("codeEditor.getRefVars", {
              key,
              childKey,
            })}\nthis.\\$refs.${key}.${childKey}`,
          });
        }
      });
    });

    // 返回包含refs代码片段、variables代码片段和自定义代码片段的数组
    return [
      ...refData,
      ...variablesKeys.map((key, index) => {
        return {
          meta:
            typeof customTips.variable[key].type === "function"
              ? t("codeEditor.useVarFunc")
              : t("codeEditor.useVar"),
          caption: customTips.variable[key].label || `${key}`,
          completerId: "snippetCompleter",
          snippet: typeof customTips.variable[key].type === "function" ? `this.vars.${key}()` : `this.vars.${key}`,
          score: index + 1,
          mode: "javascript",
        };
      }),
      ...customTips.custom.snippets,
    ];
  }
};

/**
 * 从函数字符串中提取参数
 *
 * 该函数旨在解析以字符串形式提供的函数定义，并提取出其参数列表
 * 它需要处理两种函数定义格式：普通函数和箭头函数
 *
 * @param {string} funcStr 函数定义的字符串形式
 * @returns {string[]} 返回函数的参数列表
 */
const extractArgsFromString = (funcStr) => {
  let args = [];
  // 先判断是否是箭头函数，提取参数部分的字符串
  if (funcStr.trim().startsWith("(")) {
    funcStr = funcStr.split("=>")[0].trim().replace(/\(|\)/g, "").trim();
  } else {
    funcStr = funcStr.split("(")[1].split(")")[0].trim();
  }
  // 按逗号分割参数部分字符串
  const paramStrArr = funcStr.split(",");
  for (let paramStr of paramStrArr) {
    paramStr = paramStr.trim();
    const indexOfEqual = paramStr.indexOf("=");
    // 处理参数默认值情况
    if (indexOfEqual !== -1) {
      args.push(paramStr.slice(0, indexOfEqual).trim());
    } else {
      args.push(paramStr);
    }
  }
  return args;
};

/**
 * 根据用户输入过滤补全建议
 *
 * 此函数的目的是从一个数据数组中过滤出符合条件的补全建议它根据当前输入文本和前一个输入文本
 * 来决定哪些项应该被显示作为补全建议这个过程涉及到检查每一项的标题是否以当前输入文本开始，
 * 并且如果前一个输入文本存在，还会检查每一项的前缀是否匹配前一个输入文本
 *
 * @param data 包含补全建议项的数组每一项都应该有`caption`和`prefix`属性
 * @param prevText 前一个输入文本，用于判断补全建议是否应该基于前一个输入状态
 * @param currentText 当前输入文本，用于判断补全建议是否应该基于当前输入状态
 * @returns 返回一个过滤后的数组，只包含那些符合条件的补全建议
 */
const filterCompletion = (data: any[], { prevText, currentText }: any) => {
  // 过滤补全建议
  return data.filter((item) => {
    // 检查当前项的标题是否以当前输入文本开始
    const captionStartsWithCurrentText = item.caption.startsWith(currentText);

    // 如果没有前一个输入文本，仅根据当前输入文本过滤
    if (!prevText && !item.prefix) {
      return captionStartsWithCurrentText;
    }

    // 如果前缀是数组，则检查其中是否有一个元素与前一个输入文本匹配
    if (Array.isArray(item.prefix)) {
      return (
        item.prefix.some((prefixItem) => prevText === prefixItem) &&
        captionStartsWithCurrentText
      );
    } else {
      // 如果前缀不是数组，直接与前一个输入文本比较
      return prevText === item.prefix && captionStartsWithCurrentText;
    }
  });
};

/**
 * 添加自动补全功能
 * 该函数为ACE编辑器添加自动补全功能，包括基本代码补全和代码片段补全
 */
const addAutoCompletion = () => {
  // 加载ACE编辑器的语言工具模块
  let languageTools = ace.require("ace/ext/language_tools");
  // 获取代码补全数据
  const completionData = getCompletions();
  // 获取代码片段数据
  const snippetData = getSnippet();
  // 初始化缓存的关联代码变量
  let cachedRelatedCode = null;

  // 添加一个补全器
  languageTools.addCompleter({
    /**
     * 获取补全建议
     * @param {Object} editor - 编辑器实例
     * @param {Object} session - 会话实例
     * @param {Object} position - 光标位置
     * @param {string} prefix - 光标前的字符
     * @param {Function} callback - 回调函数，用于返回补全建议
     */
    getCompletions: (editor, session, position, prefix, callback) => {
      // 如果前缀长度为0，直接返回空数组
      if (prefix.length === 0) {
        return callback(null, []);
      } else {
        try {
          // 检查是否需要更新缓存的关联代码
          if (
            !cachedRelatedCode ||
            cachedRelatedCode.position.row !== position.row ||
            cachedRelatedCode.position.column !== position.column
          ) {
            cachedRelatedCode = {
              position,
              ...getRelatedCode(session.doc.$lines, position),
            };
          }
          // 获取缓存的关联代码中的前文文本
          const { prevText } = cachedRelatedCode;
          // 如果是JavaScript模式且前文文本存在，则返回过滤后的补全数据
          if (session.$modeId === "ace/mode/javascript") {
            if (!!prevText) {
              callback(null, filterCompletion(completionData, cachedRelatedCode));
            } else {
              // 模板数据
              const data = snippetData;
              // 如果模板数据存在，则返回模板数据
              if (data.length > 0) {
                callback(null, data);
              }
              return;
            }
          }
        } catch (error) {
          // 捕获异常并打印错误信息
          console.error("Error in getCompletions:", error);
          // 调用回调函数报告错误
          callback(error, []);
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
.ace_function_arguments {
  color: #868cff;
  font-weight: bold;
}

:deep(.ace_paren) {
  color: #868cff;
}
</style>
