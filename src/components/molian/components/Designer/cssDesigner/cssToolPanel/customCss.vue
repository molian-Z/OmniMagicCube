<script setup lang="ts">
import { ref, inject, computed, watch, nextTick, onMounted } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { selectedComp, updateSelectedCompCss } from "@molianComps/Designer/designerData";
import CodeEditor from "@molianComps/MlCodeEditor/index.vue";
import { useI18n } from "vue-i18n";

// 导入 highlight.js 核心包和 CSS 语言支持
import hljs from "highlight.js/lib/core";
import cssLang from "highlight.js/lib/languages/css";
import "highlight.js/styles/github.css";
// 注册需要的语言
hljs.registerLanguage("css", cssLang);

const { t } = useI18n();
const customComps: any = inject("customComps");
const { customDialog } = customComps;
const codeRef = ref<any>();
const css = ref<any>({ customCss: `` });
const dialogVisible = ref(false);

// 添加预览容器的引用
const previewRef = ref<HTMLElement | null>(null);

const currentValue = computed(() => {
  try {
    return css.value.customCss;
  } catch (error) {
    return ``;
  }
});

const highlightCode = () => {
  if (!previewRef.value) {
    console.warn("previewRef not found");
    return;
  }

  const codeElement = previewRef.value.querySelector("code");
  if (!codeElement) {
    console.warn("code element not found");
    return;
  }

  const content = currentValue.value || "/* 暂无CSS代码 */";

  // 清除之前的高亮
  codeElement.removeAttribute("data-highlighted");
  codeElement.className = "hljs language-css";
  codeElement.textContent = content;

  try {
    hljs.highlightElement(codeElement);
  } catch (error) {
    console.error("Highlight.js error:", error);
  }
};

// 增加延迟和错误处理
watch(
  () => selectedComp.value,
  (newVal: any) => {
    if (newVal) {
      css.value = newVal.css;
    } else {
      css.value = { customCss: `` };
    }
    if (!!codeRef.value) {
      codeRef.value.setValue(css.value.customCss);
    }
    // 增加更长的延迟确保DOM完全更新
    setTimeout(() => {
      highlightCode();
    }, 100);
  },
  {
    immediate: true,
  }
);

// currentValue监听器
watch(currentValue, () => {
  // 使用setTimeout而不是nextTick，确保DOM完全更新
  setTimeout(() => {
    highlightCode();
  }, 50);
});

const debouncedFn = useDebounceFn((val) => {
  if (selectedComp.value) {
    try {
      updateSelectedCompCss('customCss', val);
      // 数据更新后延迟重新高亮
      setTimeout(() => {
        highlightCode();
      }, 100);
    } catch (error) {
      console.error("Error updating CSS:", error);
    }
  }
}, 500);

onMounted(() => {
  // 确保组件完全挂载后再执行高亮
  setTimeout(() => {
    highlightCode();
  }, 200);
});

const setData = (val: any) => {
  debouncedFn(val);
};

const openEditDialog = () => {
  dialogVisible.value = true;
};

const closeEditDialog = () => {
  dialogVisible.value = false;
};

// 组件挂载后进行高亮
onMounted(() => {
  nextTick(() => {
    highlightCode();
  });
});

</script>

<template>
  <div class="css-panel">
    <div class="css-panel__header">
      <span class="css-panel__title">{{ t("css.customCssObj.title") }}</span>
      <div class="css-panel__actions">
        <el-button type="primary" size="small" @click="openEditDialog" :disabled="!selectedComp">
          {{ t("options.edit") }}
        </el-button>
      </div>
    </div>
    <div class="css-panel__body">
      <div class="css-panel__row">
        <div class="css-panel__code-wrapper">
          <!-- 使用highlight.js进行语法高亮的预览 -->
          <div class="css-panel__preview" ref="previewRef">
            <pre><code></code></pre>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑对话框 -->
    <customDialog
      appendToBody
      :close-on-click-modal="false"
      @escKeydown="dialogVisible = false"
      @closeBtnClick="dialogVisible = false"
      destroyOnClose
      v-model="dialogVisible"
      :title="t('options.edit') + t('css.customCssObj.title')"
      width="80%"
      :before-close="closeEditDialog"
    >
      <div class="dialog-editor-wrapper">
        <codeEditor
          ref="codeRef"
          mode="css"
          :readonly-regions="{
            header: {
              content: `#${selectedComp && selectedComp.id || ''}{`,
              lines: 1,
            },
            footer: {
              content: '}',
              lines: 1,
            },
          }"
          class="dialog-code-editor"
          :modelValue="currentValue"
          @update:modelValue="setData"
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeEditDialog">{{ t("options.cancel") }}</el-button>
          <el-button type="primary" @click="closeEditDialog">{{
            t("options.confirm")
          }}</el-button>
        </span>
      </template>
    </customDialog>
  </div>
</template>

<style lang="scss" scoped>
.css-panel {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  &__title {
    font-weight: 500;
    color: var(--ml-text-color-primary);
  }

  &__code-wrapper {
    width: 100%;
    height: 200px;
  }

  &__preview {
    width: 100%;
    height: 100%;
    border-radius: var(--ml-radius-base);
    overflow: auto;
    border: 1px solid var(--ml-border-color);
    background: var(--ml-bg-color-page);
    padding: 8px;

    pre {
      margin: 0;
      font-size: 12px;
      line-height: 1.4;
      height: 100%;
      overflow: auto;

      code {
        font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
        font-size: 12px;
        line-height: 1.4;
        white-space: pre;
        word-break: normal;
        overflow-wrap: normal;

        // 确保highlight.js样式正确应用
        &.hljs {
          background: transparent;
          padding: 0;
        }
      }
    }
  }

  &__code-editor {
    width: 100%;
    height: 100%;
    border-radius: var(--ml-radius-base);
    overflow: hidden;
    border: 1px solid var(--ml-border-color);
  }
}

.dialog-editor-wrapper {
  height: 400px;

  .dialog-code-editor {
    width: 100%;
    height: 100%;
    border-radius: var(--ml-radius-base);
    overflow: hidden;
    border: 1px solid var(--ml-border-color);
  }
}

// 覆盖highlight.js的一些样式以适应当前主题
:deep(.css-panel__preview) {
  .hljs {
    display: block;
    overflow-x: auto;
    padding: 0;
    background: transparent;
    color: var(--ml-text-color-primary);

    // CSS特定的语法高亮
    &.language-css {
      font-weight: bold;
      font-size: 14px;
    }

    .hljs-selector-class {
      font-weight: bold;
      font-size: 16px;
    }

    .hljs-selector-tag {
      color: var(--ml-error-color);
      font-weight: bold;
      font-size: 14px;
    }

    .hljs-attribute {
      color: var(--ml-primary-color);
      font-weight: bold;
    }

    .hljs-number,
    .hljs-string {
      color: var(--ml-text-color-primary);
      font-weight: bold;
    }

    .hljs-built_in {
      color: var(--ml-warning-color);
    }
  }
}
</style>
