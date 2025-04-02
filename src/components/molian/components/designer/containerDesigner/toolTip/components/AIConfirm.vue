<script setup lang="ts">
import { ref, defineExpose, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import AI_PROMPT_TEMPLATE from '@molianComps/Designer/AIPrompt/AIRequest.md?raw'
import AIResponseViewer from './AIResponseViewer.vue';
const customComps: any = inject("customComps");
const { customButton, customInput } = customComps;
const { t } = useI18n();

// 组件状态
const visible = ref(false);
const loading = ref(false);
const inputValue = ref("");
const currentComponent = ref<any>(null);
const responseViewer = ref<InstanceType<typeof AIResponseViewer> | null>(null);

// 打开对话框
const open = (component: any) => {
  currentComponent.value = component;
  visible.value = true;
  inputValue.value = "";

  // 聚焦输入框
  nextTick(() => {
    const inputEl = document.querySelector(".ai-input input");
    if (inputEl) {
      (inputEl as HTMLInputElement).focus();
    }
  });
};

// 关闭对话框
const close = () => {
  visible.value = false;
  inputValue.value = "";
  currentComponent.value = null;
};

/**
 * 生成 AI 请求的 Prompt
 * @param component 组件信息
 * @param userPrompt 用户输入的提示
 * @returns 格式化后的 Prompt
 */
 // 生成 AI 请求的 Prompt
const generateAIPrompt = (component: any, userPrompt: string): string => {
  // 处理组件数据，提取关键信息并限制大小
  const componentData = prepareComponentData(component);
  return AI_PROMPT_TEMPLATE
    .replace('{{componentId}}', component.id)
    .replace('{{componentName}}', component.name)
    .replace('{{componentData}}', JSON.stringify(componentData))
    .replace('{{userPrompt}}', userPrompt)
    .replace('{{requestId}}', Date.now().toString())
    .replace('{{timestamp}}', Date.now().toString());
}

// 准备组件数据，提取关键信息并限制大小
const prepareComponentData = (component: any, depth = 0): any => {
  if (!component) return {};
  // 限制递归深度，避免 token 爆炸
  if (depth > 2) return { id: component.id, name: component.name, note: "已达到最大深度限制" };
  
  // 创建组件数据的简化版本
  const simplifiedData: any = {
    id: component.id,
    key: component.key,
    name: component.name,
    subTitle: component.subTitle,
    attrs: component.attrs,
    css: component.css,
    directives: component.directives,
  };
  
  // 处理插槽信息，但限制深度和大小
  if (component.slots) {
    simplifiedData.slots = {};
    
    // 遍历所有插槽
    Object.keys(component.slots).forEach(slotName => {
      const slot = component.slots[slotName];
      simplifiedData.slots[slotName] = {
        allowComps: slot.allowComps,
      };
      
      // 如果有子组件，递归处理
      if (slot.children && Array.isArray(slot.children)) {
        simplifiedData.slots[slotName].children = slot.children.map((child: any) => 
          prepareComponentData(child, depth + 1)
        );
      }
    });
  }
  
  // 添加动画信息
  if (component.animations) {
    simplifiedData.animations = component.animations;
  }
  
  return simplifiedData;
}

// 发送数据
const sendData = async () => {
  if (!inputValue.value.trim()) return;

  try {
    loading.value = true;
    
    // 构建发送的数据
    const data = {
      type: "ai-request",
      component: {
        id: currentComponent.value.id,
        name: currentComponent.value.name,
      },
      // 生成格式化的 prompt
      prompt: generateAIPrompt(currentComponent.value, inputValue.value),
      timestamp: Date.now(),
    };
    // 使用自定义事件 + 回调函数
    const responsePromise = new Promise((resolve) => {
      // 创建自定义事件对象
      const event = new CustomEvent("ai-request", {
        detail: {
          data,
          callback: (response: any) => {
            // 回调函数接收响应
            resolve(response);
          },
        },
      });

      // 分发事件
      window.dispatchEvent(event);
    });

    // 等待响应
    const response: any = await responsePromise;
    
    // 显示响应查看器
    if (responseViewer.value) {
      responseViewer.value.showResponse(response);
    }

    // 清空输入并关闭当前输入框
    inputValue.value = "";
    visible.value = false;
  } catch (error) {
    console.error("AI请求发送失败:", error);
  } finally {
    loading.value = false;
  }
};

// 处理键盘事件
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendData();
  } else if (e.key === "Escape") {
    e.preventDefault();
    close();
  }
};

// 暴露方法给父组件
defineExpose({
  open,
  close,
});
</script>

<template>
  <div v-if="visible" class="ai-confirm-wrapper" @click.stop>
    <div class="ai-confirm-container">
      <i class="ai-icon">AI</i>
      <customInput
        v-model="inputValue"
        class="ai-input"
        :placeholder="t('ai.placeholder', '请输入您想要的操作或问题...')"
        clearable
        @keydown="(e: Event) => handleKeyDown(e as KeyboardEvent)"
      />
      <customButton
        theme="primary"
        :loading="loading"
        @click="sendData"
        :disabled="!inputValue.trim()"
        class="send-button"
      >
        {{
          loading
            ? t('ai.processing', '处理中...')
            : t('ai.send', '发送')
        }}
      </customButton>
    </div>
    <!-- 使用 Teleport 将遮罩层传送到 body 元素下 -->
    <Teleport to="body">
      <div class="ai-backdrop" @click="close"></div>
    </Teleport>
  </div>
  
  <!-- 添加响应查看器组件 -->
  <AIResponseViewer ref="responseViewer" />
</template>

<style lang="scss" scoped>
.ai-confirm-wrapper {
  position: absolute;
  top: -55px;
  left: 0;
  width: 100%;
  z-index: 2001;
}

.ai-confirm-container {
  background-color: rgba(255, 255, 255, 0.15);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  backdrop-filter: saturate(150%) var(--ml-bg-blur-base);
  border-radius: 20px;
  padding: 5px;
  width: 550px;
  display: flex;
  align-items: center;
  animation: ai-popup 0.2s ease-out;
  position: relative;
  z-index: 2;
}

.ai-input {
  flex: 1;
  padding: 0 var(--ml-pd-base);
  :deep(.el-input__wrapper) {
    background-color: transparent;
    padding: 1px var(--ml-pd-base);
  }

  :deep(.el-input__inner) {
    height: 32px;
    color: #333;
  }
}

.ai-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7b4ed8, #a27def);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

/* 移除不需要的关闭图标样式 */

.send-button {
  border-radius: 16px;
  height: 32px;
  padding: 0 15px;
  background-color: #7b4ed8;
  border-color: #7b4ed8;

  &:hover,
  &:focus {
    background-color: #9370db;
    border-color: #9370db;
  }
}

@keyframes ai-popup {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

<style>
/* 添加透明遮罩样式 */
.ai-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}
</style>
