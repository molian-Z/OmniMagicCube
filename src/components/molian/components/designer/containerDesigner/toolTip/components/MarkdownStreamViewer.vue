<script setup lang="ts">
import { ref, defineProps, onMounted, watch, nextTick } from "vue";
import { marked } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";

const props = defineProps({
  // Markdown内容
  content: {
    type: String,
    default: "",
  },
  // 是否启用流式显示
  enableStreaming: {
    type: Boolean,
    default: true,
  },
  // 流式显示速度（毫秒/字符）
  streamSpeed: {
    type: Number,
    default: 10,
  },
  // 是否启用自动滚动
  enableAutoScroll: {
    type: Boolean,
    default: true,
  }
});

// 添加用于存储渲染后的Markdown内容
const renderedContent = ref<string>("");
// 添加用于控制流式显示的变量
const streamingComplete = ref(false);
// 添加当前显示的字符数
const currentCharCount = ref(0);
// 存储定时器ID
const streamInterval = ref<number | null>(null);
// 添加对内容容器的引用
const contentContainer = ref<HTMLElement | null>(null);
// 存储上一次的内容
const previousContent = ref<string>("");

// 配置marked选项
onMounted(() => {
  marked.setOptions({
    renderer: new marked.Renderer(),
    // 使用类型断言来解决 highlight 不在 MarkedOptions 中的问题
    highlight: function(code: string, lang: string) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    } as any,
    langPrefix: 'hljs language-',
    pedantic: false,
    gfm: true,
    breaks: true,
    sanitize: false,
    smartypants: false,
    xhtml: false
  });
  
  // 如果有初始内容，开始流式显示
  if (props.content) {
    previousContent.value = props.content;
    startStreaming(props.content);
  }
});
// 监听内容变化
watch(() => props.content, (newContent) => {
  if (newContent) {
    // 清除之前的定时器
    if (streamInterval.value !== null) {
      clearInterval(streamInterval.value);
      streamInterval.value = null;
    }
    
    // 检查内容是否完全相同
    if (newContent === previousContent.value) {
      // 内容完全相同，不需要重新流式显示
      return;
    }
    
    // 检查是否是内容追加
    if (newContent.startsWith(previousContent.value) && previousContent.value !== "") {
      // 只流式展示新增的部分
      continueStreaming(newContent);
    } else {
      // 内容完全变化，重置状态并开始新的流式显示
      startStreaming(newContent);
    }
    
    // 更新上一次的内容
    previousContent.value = newContent;
  } else {
    // 内容为空时清空显示
    renderedContent.value = "";
    streamingComplete.value = true;
    previousContent.value = "";
  }
});

// 自动滚动到底部
const scrollToBottom = () => {
  if (props.enableAutoScroll && contentContainer.value) {
    nextTick(() => {
      if (contentContainer.value) {
        contentContainer.value.scrollTop = contentContainer.value.scrollHeight;
      }
    });
  }
};

// 继续流式显示新增的内容
const continueStreaming = (newContent: string) => {
  // 将完整的新Markdown转换为HTML
  const newHtmlContent = marked.parse(newContent);
  const totalLength = typeof newHtmlContent === 'string' ? newHtmlContent.length : String(newHtmlContent).length;
  
  // 设置流式显示为未完成
  streamingComplete.value = false;
  
  // 如果不启用流式显示，直接显示全部内容
  if (!props.enableStreaming) {
    renderedContent.value = String(newHtmlContent);
    streamingComplete.value = true;
    scrollToBottom(); // 滚动到底部
    return;
  }
  
  // 使用定时器模拟流式显示，从当前字符数开始
  streamInterval.value = window.setInterval(() => {
    // 每次增加一定数量的字符
    currentCharCount.value += 1;  // 从3减少到1
    
    if (currentCharCount.value >= totalLength) {
      // 显示完成
      renderedContent.value = String(newHtmlContent);
      streamingComplete.value = true;
      scrollToBottom(); // 滚动到底部
      if (streamInterval.value !== null) {
        clearInterval(streamInterval.value);
        streamInterval.value = null;
      }
    } else {
      // 显示部分内容
      renderedContent.value = String(newHtmlContent).substring(0, currentCharCount.value);
      scrollToBottom(); // 每次更新内容后滚动到底部
    }
  }, props.streamSpeed);
};

// 流式显示Markdown内容
const startStreaming = (content: string) => {
  // 先将Markdown转换为HTML
  const htmlContent = marked.parse(content);
  // 确保htmlContent是字符串类型
  const htmlString = String(htmlContent);
  
  // 解析HTML标签
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const elements = Array.from(doc.body.childNodes);
  
  // 重置计数器
  currentCharCount.value = 0;
  renderedContent.value = "";
  streamingComplete.value = false;
  
  // 如果不启用流式显示，直接显示全部内容
  if (!props.enableStreaming) {
    renderedContent.value = htmlString;
    streamingComplete.value = true;
    scrollToBottom();
    return;
  }
  
  // 逐个元素添加
  let elementIndex = 0;
  const totalElements = elements.length;
  
  // 使用定时器模拟流式显示
  streamInterval.value = window.setInterval(() => {
    if (elementIndex < totalElements) {
      // 添加一个完整的元素
      const element = elements[elementIndex];
      const tempDiv = document.createElement('div');
      tempDiv.appendChild(element.cloneNode(true));
      renderedContent.value += tempDiv.innerHTML;
      
      elementIndex++;
      scrollToBottom();
    } else {
      // 显示完成
      renderedContent.value = htmlString;
      streamingComplete.value = true;
      scrollToBottom();
      if (streamInterval.value !== null) {
        clearInterval(streamInterval.value);
        streamInterval.value = null;
      }
    }
  }, props.streamSpeed * 10); // 增加时间间隔，因为每次添加的是一个完整元素
};

// 组件卸载时清除定时器
onMounted(() => {
  return () => {
    if (streamInterval.value !== null) {
      clearInterval(streamInterval.value);
      streamInterval.value = null;
    }
  };
});
</script>

<template>
  <div class="markdown-stream-viewer" ref="contentContainer">
    <!-- 使用v-html显示渲染后的Markdown内容 -->
    <div v-html="renderedContent" class="markdown-body"></div>
    
    <!-- 显示打字光标效果，当流式显示未完成时 -->
    <span v-if="!streamingComplete" class="typing-cursor">|</span>
  </div>
</template>

<style lang="scss" scoped>
.markdown-stream-viewer {
  position: relative;
  max-height: 60vh; /* 设置最大高度 */
  overflow-y: auto; /* 启用垂直滚动 */
  padding: 16px;
  
  .markdown-body {
    font-size: 14px;
    line-height: 1.6;
    color: #333;
    
    :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
      line-height: 1.25;
    }
    
    :deep(h1) {
      font-size: 2em;
      border-bottom: 1px solid #eaecef;
      padding-bottom: 0.3em;
    }
    
    :deep(h2) {
      font-size: 1.5em;
      border-bottom: 1px solid #eaecef;
      padding-bottom: 0.3em;
    }
    
    :deep(p) {
      margin-top: 0;
      margin-bottom: 16px;
    }
    
    :deep(code) {
      padding: 0.2em 0.4em;
      margin: 0;
      font-size: 85%;
      background-color: rgba(27, 31, 35, 0.05);
      border-radius: 3px;
    }
    
    :deep(pre) {
      padding: 16px;
      overflow: auto;
      font-size: 85%;
      line-height: 1.45;
      background-color: #f6f8fa;
      border-radius: 3px;
      margin-bottom: 16px;
      
      code {
        padding: 0;
        margin: 0;
        background-color: transparent;
        border-radius: 0;
      }
    }
    
    :deep(ul), :deep(ol) {
      padding-left: 2em;
      margin-top: 0;
      margin-bottom: 16px;
    }
    
    :deep(blockquote) {
      padding: 0 1em;
      color: #6a737d;
      border-left: 0.25em solid #dfe2e5;
      margin: 0 0 16px 0;
    }
    
    :deep(table) {
      display: block;
      width: 100%;
      overflow: auto;
      margin-top: 0;
      margin-bottom: 16px;
      border-spacing: 0;
      border-collapse: collapse;
      
      th, td {
        padding: 6px 13px;
        border: 1px solid #dfe2e5;
      }
      
      tr {
        background-color: #fff;
        border-top: 1px solid #c6cbd1;
      }
      
      tr:nth-child(2n) {
        background-color: #f6f8fa;
      }
    }
  }
  
  .typing-cursor {
    display: inline-block;
    width: 2px;
    height: 1.2em;
    background-color: #333;
    margin-left: 2px;
    vertical-align: middle;
    animation: blink 1s step-end infinite;
  }
  
  @keyframes blink {
    from, to {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
  }
}
</style>