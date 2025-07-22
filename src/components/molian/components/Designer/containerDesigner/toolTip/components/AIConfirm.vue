<script setup lang="ts">
import { useI18n } from "vue-i18n";
import AI_PROMPT_TEMPLATE from '@molianComps/Designer/AIPrompt/UnifiedPrompt.md?raw'
import AIResponseViewer from './AIResponseViewer.vue';
import {useUI} from '@molian/utils/UIMap'
import { useWindowSize } from '@vueuse/core'
const customComps: any = inject("customComps");
const { customButton, customInput } = customComps;
const { t } = useI18n();

// 组件状态
const visible = ref(false);
const loading = ref(false);
const inputValue = ref("");
const currentComponent = ref<any>(null);
const responseViewer = ref<InstanceType<typeof AIResponseViewer> | null>(null);

// 获取窗口尺寸
const { height: windowHeight } = useWindowSize();

// 创建对确认框容器的引用
const confirmWrapperRef = ref<HTMLElement | null>(null);
const confirmContainerRef = ref<HTMLElement | null>(null);

// 计算位置样式
const positionStyle = ref({
  top: 'auto',
  bottom: '100%',
  left: '0',
  transform: 'none'
});

// 计算并更新组件位置
const updatePosition = () => {
  if (!confirmWrapperRef.value || !confirmContainerRef.value) return;
  
  const wrapperRect = confirmWrapperRef.value.parentElement?.getBoundingClientRect();
  const containerRect = confirmContainerRef.value.getBoundingClientRect();
  
  if (!wrapperRect) return;
  
  // 计算上方和下方的可用空间
  const spaceAbove = wrapperRect.top;
  const spaceBelow = windowHeight.value - wrapperRect.bottom;
  
  // 容器高度
  const containerHeight = containerRect.height;
  
  // 默认显示在上方，需要的空间
  const neededSpace = containerHeight + 10; // 10px 的间距
  
  // 如果上方空间不足，但下方空间足够，则显示在下方
  if (spaceAbove < neededSpace && spaceBelow >= neededSpace) {
    positionStyle.value = {
      top: '100%',
      bottom: 'auto',
      left: '0',
      transform: 'none'
    };
  } 
  // 如果上方空间足够，则显示在上方
  else if (spaceAbove >= neededSpace) {
    positionStyle.value = {
      top: 'auto',
      bottom: '100%',
      left: '0',
      transform: 'none'
    };
  }
  // 如果上下都不够，但上方空间更大，则显示在上方并调整位置
  else if (spaceAbove > spaceBelow) {
    positionStyle.value = {
      top: `-${spaceAbove}px`,
      bottom: 'auto',
      left: '0',
      transform: 'none'
    };
  }
  // 如果上下都不够，但下方空间更大，则显示在下方并调整位置
  else {
    positionStyle.value = {
      top: '100%',
      bottom: 'auto',
      left: '0',
      transform: 'none'
    };
  }
};

// 监听可见性变化，更新位置
watch(visible, (newValue) => {
  if (newValue) {
    nextTick(() => {
      updatePosition();
    });
  }
});

// 监听窗口大小变化，更新位置
watch(windowHeight, () => {
  if (visible.value) {
    updatePosition();
  }
});

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
    // 计算位置
    updatePosition();
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
  // 将 userPrompt 传递给 prepareComponentData 以便进行上下文感知的数据准备
  const componentData = prepareComponentData(component, 0, true, userPrompt);
  return AI_PROMPT_TEMPLATE
    .replace(/{{componentId}}/g, component.id)
    .replace(/{{componentName}}/g, component.name)
    .replace(/{{componentData}}/g, JSON.stringify(componentData))
    .replace(/{{componentLib}}/g, useUI.value)
    .replace(/{{userPrompt}}/g, userPrompt)
    .replace(/{{requestId}}/g, Date.now().toString())
    .replace(/{{timestamp}}/g, Date.now().toString());
}

// 准备组件数据，提取关键信息并限制大小
const prepareComponentData = (component: any, depth = 0, isRoot = true, userPrompt?: string): any => {
  if (!component) return {};
  
  // 示例：根组件或浅层组件允许更大的深度或更多信息
  // 可以根据 userPrompt 的内容动态调整最大深度，例如，如果用户要求详细分析，可以适当增加深度
  const maxDepth = isRoot ? 3 : 2; // 保持一个基础限制，但可以更灵活
  
  if (depth > maxDepth) {
    // 对于超出深度的组件，提供更有用的摘要信息
    let childrenSummary = "子组件细节已简化";
    if (component.slots) {
      const totalChildren = Object.values(component.slots).reduce((acc: number, slot: any) => acc + (slot?.children?.length || 0), 0);
      if (totalChildren > 0) {
        childrenSummary = `${totalChildren} 个子组件 (细节已简化)`;
      }
    }
    return {
      id: component.id,
      name: component.name,
      note: `已达到最大处理深度 (${maxDepth})。${childrenSummary}`,
      componentType: component.name, // 保留组件类型
      // 可以考虑添加少量关键属性的摘要，如果适用
      // simplifiedAttrs: component.attrs ? Object.keys(component.attrs).slice(0,2).join(', ') + '...' : undefined
    };
  }
  
  // 创建组件数据的简化版本
  const simplifiedData: any = {
    id: component.id,
    name: component.name,
    subTitle: component.subTitle, // 考虑是否总是需要，或根据 userPrompt
    // directives: component.directives, // 通常可以简化或在特定任务时才包含
  };

  // 根据用户意图 (userPrompt) 智能包含属性和样式
  // 这部分逻辑可以根据实际需求变得更复杂
  let includeAttrs = true;
  let includeCss = true;

  if (userPrompt) {
    const promptLower = userPrompt.toLowerCase();
    // 示例：如果用户明确提到“布局”但没提到“样式”，可能不需要完整的CSS细节
    if (promptLower.includes("布局") && !promptLower.includes("样式")) {
      // simplifiedData.css = { note: "CSS细节已简化，聚焦布局。" }; // 可以发送部分关键CSS或摘要
      // includeCss = false; // 或者完全不发送，取决于AI对摘要的理解能力
    }
    // 示例：如果用户明确提到“颜色”或“字体”，则确保CSS被包含
    if (promptLower.includes("颜色") || promptLower.includes("字体") || promptLower.includes("外观")) {
      includeCss = true;
    }
  }

  if (includeAttrs && component.attrs) {
    simplifiedData.attrs = component.attrs; // 考虑对 attrs 内容也进行筛选或摘要
  }
  if (includeCss && component.css) {
    simplifiedData.css = component.css; // 考虑对 css 内容也进行筛选或摘要
  }
  
  // 处理插槽信息
  if (component.slots) {
    simplifiedData.slots = {};
    Object.keys(component.slots).forEach(slotName => {
      const slot = component.slots[slotName];
      if (slot && slot.children && slot.children.length > 0) {
        simplifiedData.slots[slotName] = {
          // 递归调用时传递 userPrompt，以便子组件也能进行上下文感知的数据准备
          children: slot.children.map((child: any) => prepareComponentData(child, depth + 1, false, userPrompt))
        };
      } else {
        simplifiedData.slots[slotName] = { children: [] };
      }
    });
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
      prompt: generateAIPrompt(currentComponent.value, inputValue.value),
      timestamp: Date.now(),
      stream: true // 添加流式传输标志
    };

    // 使用自定义事件 + 回调函数
    const responsePromise = new Promise((resolve) => {
      // 创建自定义事件对象
      const event = new CustomEvent("ai-request", {
        detail: {
          data,
          callback: (response: any) => {
            // 处理流式响应
            if (response.isStreaming) {
              // 实时显示响应
              if (responseViewer.value) {
                responseViewer.value.showResponse(response);
              }

              // 如果是流式结束，则resolve
              if (response.isDone) {
                resolve(response.data);
              }
            } else {
              // 普通一次性响应
              resolve(response);
            }
          },
          callbackReason:(response: any) => {
            // 处理流式响应
            if (response.isStreaming) {
              // 实时显示响应
              if (responseViewer.value) {
                responseViewer.value.showResponse(response);
              }

              // 如果是流式结束，则resolve
              if (response.isDone) {
                resolve(response.data);
              }
            } else {
              // 普通一次性响应
              resolve(response.data);
            }
          }
        },
      });

      // 分发事件
      window.dispatchEvent(event);
    });

    // 等待响应完成
    const finalResponse:any = await responsePromise;
    // 显示最终响应
    if (responseViewer.value) {
      responseViewer.value.showResponse(finalResponse);
    }

    // 清空输入并关闭当前输入框
    inputValue.value = "";
    visible.value = false;
  } catch (error:any) {
    console.error("AI请求发送失败:", error);
    // 显示错误信息
    if (responseViewer.value) {
      responseViewer.value.showResponse({
        success: false,
        requestId: -1,
        error: error.message,
        message: "AI请求处理失败",
      });
    }
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
  <div v-if="visible" 
       class="ai-confirm-wrapper" 
       ref="confirmWrapperRef"
       :style="positionStyle"
       @click.stop>
    <div class="ai-confirm-container" ref="confirmContainerRef">
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
  width: 100%;
  z-index: 2001;
  /* 移除固定的 bottom 和 margin-bottom，改为使用 JavaScript 动态计算 */
}

.ai-confirm-container {
  background-color: var(--ml-bg-color);
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
  margin: 10px 0; /* 添加上下边距 */
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
