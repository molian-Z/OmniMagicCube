<script setup lang="ts">
import { watch, onMounted, onUnmounted, nextTick, inject, ref } from "vue";
import { useI18n } from "vue-i18n";
import { completions } from "./tips";
import type { EditorProps, CustomTips } from "./types";
import { CompletionManager } from "./managers/CompletionManager";
import { RefsCompletionHandler } from "./handlers/RefsCompletionHandler";
import { VariablesCompletionHandler } from "./handlers/VariablesCompletionHandler";
import { AICompletionHandler } from "./handlers/AICompletionHandler";
import { CustomCompletionHandler } from "./handlers/CustomCompletionHandler";
import AIStatusBar from "./components/AIStatusBar.vue";
import AISuggestions from "./components/AISuggestions.vue";
import AIQuestionPanel from "./components/AIQuestionPanel.vue";

// 导入组合式函数
import { useMonacoEditor } from "./composables/useMonacoEditor";
import { useAIFeatures } from "./composables/useAIFeatures";
import { useReadonlyRegions } from "./composables/useReadonlyRegions";
import { useKeyboardEvents } from "./composables/useKeyboardEvents";
import { debounce, getCodeContext } from "./utils/helpers";

defineOptions({
  name: "MlCodeEditor",
});

const props = withDefaults(defineProps<EditorProps>(), {
  readonly: false,
  mode: "javascript",
  userWorker: true,
  maxLines: 20,
  enableAI: false,
  aiApiKey: "83b7f6d5a8344728bc19861a8d183650.riIZCoIs5AwvhYHl",
  aiModel: "glm-4-flash-250414",
  readonlyRegions: () => ({}),
});

const emits = defineEmits<{
  "update:modelValue": [value: string];
  "ai-suggestion": [suggestion: string];
  error: [error: Error];
}>();

const customTips = inject<CustomTips>("codeEditor");
const { t } = useI18n();
const showQuestionPanel = ref(false);
const completionManager = CompletionManager.getInstance();

// 使用组合式函数
const {
  editorRef,
  monacoEditor,
  codeValue,
  getValue,
  setValue,
  getEditorAnnotations,
  createEditor,
  destroyEditor,
} = useMonacoEditor(props, emits);

const getContext = () => getCodeContext(monacoEditor.value, props.mode);

const {
  aiAssistant,
  isAIProcessing,
  aiSuggestions,
  aiFeatures,
  initAIAssistant,
  analyzeCodeWithAI,
  getOptimizationSuggestions,
  smartRefactor,
  triggerAICompletion,
  applySuggestion,
  destroyAI,
} = useAIFeatures(props, emits, getContext);

const {
  setupReadonlyRegions,
  isInReadonlyRegion,
  moveCursorToEditableArea,
  isEditInReadonlyRegion,
  restoreReadonlyContent,
  resetInitialization,
  getFirstEditablePosition,
  getLastEditablePosition,
  headerLines,
  footerLines,
} = useReadonlyRegions(props);

const { registerEditorKeyboardEvents, registerAICommands } = useKeyboardEvents(
  props,
  setValue,
  () => triggerAICompletion(monacoEditor.value),
  analyzeCodeWithAI,
  getOptimizationSuggestions,
  getFirstEditablePosition,
  getLastEditablePosition,
  headerLines,
  footerLines
);

// 防抖的AI分析
const debounceAnalyze = debounce(async () => {
  if (aiFeatures.errorDetection) {
    // 这里需要从useAIFeatures中导出detectAndFixErrors
  }
}, 1000);

// 监听modelValue变化
watch(
  () => props.modelValue,
  (newVal: any, oldVal) => {
    if (newVal !== oldVal && newVal !== monacoEditor.value?.getValue()) {
      if (props.mode === "json") {
        codeValue.value = newVal || {};
      } else {
        if (typeof newVal !== "string") {
          codeValue.value = newVal.toString() || "";
        } else {
          codeValue.value = newVal || "";
        }
      }
      monacoEditor.value?.setValue(codeValue.value || "");
    }
  },
  { immediate: true }
);

// 监听只读区域配置变化
watch(
  () => props.readonlyRegions,
  () => {
    if (monacoEditor.value) {
      // 重置初始化状态，允许重新设置只读区域
      resetInitialization();
      nextTick(() => {
        setupReadonlyRegions(monacoEditor.value!);
      });
    }
  },
  { deep: true }
);

/**
 * 初始化编辑器
 */
const initEditor = (): void => {
  // 初始化AI助手
  initAIAssistant();

  // 注册补全处理器
  if (customTips) {
    completionManager.registerHandler("refs", new RefsCompletionHandler(customTips.refs));
    completionManager.registerHandler(
      "variables",
      new VariablesCompletionHandler(customTips.variable)
    );
    completionManager.registerHandler(
      "innerTips",
      new CustomCompletionHandler({ completions: completions(t) })
    );
    completionManager.registerHandler(
      "custom",
      new CustomCompletionHandler(customTips.custom)
    );
    if (props.enableAI) {
      completionManager.registerHandler("ai", new AICompletionHandler());
    }

    // 注册补全提供者
    completionManager.registerProvider(props.mode, {
      triggerCharacters: ["."],
      enableAI: props.enableAI,
      aiAssistant: aiAssistant.value,
      t,
    });
  }

  // 创建编辑器，传入只读区域检查器
  createEditor(
    (value: string) => {
      emits("update:modelValue", value);

      // AI实时分析（防抖）
      if (props.enableAI && aiFeatures.codeAnalysis) {
        debounceAnalyze();
      }
    },
    {
      isEditInReadonlyRegion,
      restoreReadonlyContent,
      isInReadonlyRegion,
      moveCursorToEditableArea,
    }
  );

  if (monacoEditor.value) {
    // 注册键盘事件
    registerEditorKeyboardEvents(monacoEditor.value);

    // 注册AI命令
    registerAICommands(monacoEditor.value, (type: string) =>
      smartRefactor(type, setValue)
    );

    // 设置只读区域
    nextTick(() => {
      setupReadonlyRegions(monacoEditor.value!);
    });
  }
};

// 组件挂载后初始化编辑器
onMounted(() => {
  nextTick(() => {
    completionManager.addReference();
    initEditor();
  });
});

// 组件卸载时销毁编辑器
onUnmounted(() => {
  completionManager.removeReference();
  destroyEditor();
  destroyAI();
});

// 暴露方法
defineExpose({
  setValue,
  getValue,
  getEditorAnnotations,
  analyzeCodeWithAI,
  getOptimizationSuggestions,
  smartRefactor: (type: string) => smartRefactor(type, setValue),
  triggerAICompletion: () => triggerAICompletion(monacoEditor.value),
});
</script>

<template>
  <div class="monaco-container">
    <!-- AI状态指示器 -->
    <AIStatusBar
      :enableAI="props.enableAI"
      :is-processing="isAIProcessing"
      :ai-features="aiFeatures"
      @toggle-feature="(feature) => (aiFeatures[feature] = !aiFeatures[feature])"
      @ask-question="showQuestionPanel = true"
    />

    <div class="monaco-editor" ref="editorRef"></div>

    <!-- AI建议面板 -->
    <AISuggestions
      :suggestions="aiSuggestions"
      @apply-suggestion="(suggestion) => applySuggestion(suggestion, setValue)"
    />

    <!-- AI问答面板 -->
    <AIQuestionPanel
      v-model:visible="showQuestionPanel"
      v-model:is-processing="isAIProcessing"
      :ai-assistant="aiAssistant"
      :codeContext="getContext()"
      @error="(error) => emits('error', error)"
      @apply-code="setValue"
    />
  </div>
</template>

<style lang="scss" scoped>
.monaco-container {
  width: 100%;
  height: 100%;
  min-height: 300px;
  position: relative;
}

.monaco-editor {
  width: 100%;
  height: calc(100% - 33px);
  min-height: 300px;
}

// Monaco Editor 自定义样式
:deep(.monaco-editor) {
  .suggest-widget {
    z-index: 10000;
  }

  .parameter-hints-widget {
    z-index: 10000;
  }

  // AI补全项样式
  .monaco-list-row[aria-label*="🤖"] {
    background: rgba(76, 175, 80, 0.1);
    border-left: 3px solid #4caf50;
  }

  // 只读区域样式
  :deep(.readonly-region-header),
  :deep(.readonly-region-footer) {
    background-color: #f5f5f5 !important;
    border-left: 3px solid #ff6b6b !important;
    position: relative;
    cursor: not-allowed !important;
    
    &::before {
      content: '🔒';
      position: absolute;
      left: -20px;
      color: #ff6b6b;
      font-size: 12px;
    }
  }

  :deep(.readonly-glyph) {
    background-color: #ff6b6b !important;
    width: 3px !important;
  }

  // 只读区域内的文本不可选择
  :deep(.readonly-region-header *),
  :deep(.readonly-region-footer *) {
    user-select: none !important;
    pointer-events: none !important;
  }
}
</style>
