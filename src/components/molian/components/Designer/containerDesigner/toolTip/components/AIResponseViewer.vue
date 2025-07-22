<script setup lang="ts">
import { useI18n } from "vue-i18n";
import MarkdownStreamViewer from "./MarkdownStreamViewer.vue";
import { parseMarkdownChanges } from "@molian/utils/AI/markdownParser";
import { modelValue } from "@molianComps/Designer/designerData";
const message = inject("mlMessage") as any;
const { t } = useI18n();
const customComps: any = inject("customComps");
const { customButton, customDivider } = customComps;

// 响应数据 - 可以是字符串或对象
const responseData = ref("");
const visible = ref(false);
// 是否已应用标志
const hasApplied = ref(false);
// 应用结果
const applyResult = ref({
  success: false,
  message: "",
  details: [] as Array<{ path: string; success: boolean; message: string }>,
});

// 添加一个控制是否启用流式显示的变量
const enableStreaming = ref(true);

// 显示响应数据
const showResponse = (response: any) => {
  if (!visible.value) {
    enableStreaming.value = true;
    visible.value = true;
    hasApplied.value = false;
    applyResult.value = {
      success: false,
      message: "",
      details: [],
    };
  }
  if (typeof response === "string") {
    responseData.value = response;
  } else {
    if (response.isDone) {
      enableStreaming.value = false; // 当isDone为true时，禁用流式动画
      responseData.value = response.data;
    } else if (response.isStreaming) {
      responseData.value += response.data;
    } else {
      responseData.value = response.data;
    }
  }
};

// 关闭查看器
const close = () => {
  visible.value = false;
};

// 应用AI建议
const applyChanges = () => {
  if (!responseData.value) return;

  try {
    const markdownContent = responseData.value;

    const changes = parseMarkdownChanges(markdownContent);
    const newModelValue = JSON.parse(JSON.stringify(modelValue.value));
    const { details, successCount } = applyAllChanges(newModelValue, changes);
    modelValue.value = newModelValue;

    hasApplied.value = true;
    applyResult.value = {
      success: successCount === changes.length,
      message:
        successCount === changes.length
          ? t("ai.applySuccess", "已成功应用 AI 修改建议")
          : successCount > 0
          ? t("ai.applyPartial", `已应用 ${successCount}/${changes.length} 项修改`)
          : t("ai.applyError", "应用 AI 修改建议失败"),
      details,
    };

    if (message) {
      if (applyResult.value.success) {
        message.success(t("ai.applySuccess", "已成功应用 AI 修改建议"));
      } else if (successCount > 0) {
        message.warning(
          t("ai.applyPartial", `已应用 ${successCount}/${changes.length} 项修改`)
        );
      } else {
        message.error(t("ai.applyError", "应用 AI 修改建议失败"));
      }
    }
  } catch (error: any) {
    console.error("应用AI建议失败:", error);
    hasApplied.value = true;
    applyResult.value = {
      success: false,
      message: t("ai.applyError", "应用 AI 修改建议失败"),
      details: [
        {
          path: "解析错误",
          success: false,
          message: error.message,
        },
      ],
    };
    if (message) {
      message.error(t("ai.applyError", "应用 AI 修改建议失败"));
    }
  }
};

// 批量应用变更并收集结果
function applyAllChanges(model: Record<string, any>, changes: any[]) {
  const details = [];
  let successCount = 0;
  for (const change of changes) {
    try {
      const result: any = applyChangeToModel(model, change);
      if (result.success) {
        successCount++;
        details.push({
          path: change.identifier || "未指定",
          success: true,
          message: `成功应用变更: ${change.identifier || "未指定"}`,
        });
      } else {
        details.push({
          path: change.identifier || "未指定",
          success: false,
          message: `应用变更失败: ${result.message}`,
        });
      }
    } catch (err: any) {
      details.push({
        path: change.identifier || "未指定",
        success: false,
        message: `应用变更出错: ${err.message}`,
      });
    }
  }
  return { details, successCount };
}

// 应用单个变更到模型
function applyChangeToModel(
  model: Record<string, any>,
  change: { identifier: string; type: string; value: any; language: string }
) {
  try {
    if (change.language === "json") {
      return applyJsonChange(model, change);
    } else {
      return applyNonJsonChange(model, change);
    }
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

// 处理JSON格式的变更
function applyJsonChange(
  model: Record<string, any>,
  change: { identifier: string; value: any }
) {
  try {
    const valueObj =
      typeof change.value === "string" ? JSON.parse(change.value) : change.value;
    if (change.identifier && change.identifier.trim() !== "") {
      const applied = recursiveApplyByIdentifier(model, change.identifier, valueObj);
      if (applied) return { success: true };
    }
    mergeToRoot(model, valueObj);
    return { success: true };
  } catch (err: any) {
    return { success: false, message: `JSON解析失败: ${err.message}` };
  }
}

// 递归查找并应用变更（支持深度组件数组）
function recursiveApplyByIdentifier(
  obj: any,
  identifier: string,
  valueObj: any
): boolean {
  if (!obj || typeof obj !== "object") return false;
  // 1. 组件数组递归
  if (Array.isArray(obj)) {
    let applied = false;
    for (let i = 0; i < obj.length; i++) {
      if (obj[i] && (obj[i].id === identifier || obj[i].name === identifier)) {
        obj[i] = deepMerge(obj[i], valueObj);
        applied = true;
      } else {
        applied = recursiveApplyByIdentifier(obj[i], identifier, valueObj) || applied;
      }
    }
    return applied;
  }
  // 2. 当前对象直接匹配
  if (obj.id === identifier || obj.name === identifier) {
    Object.assign(obj, deepMerge(obj, valueObj));
    return true;
  }
  // 3. 递归子属性
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      if (recursiveApplyByIdentifier(obj[key], identifier, valueObj)) {
        return true;
      }
    }
  }
  return false;
}

// 合并到根级别
function mergeToRoot(model: Record<string, any>, valueObj: Record<string, any>) {
  Object.keys(valueObj).forEach((key) => {
    if (typeof valueObj[key] === "object" && valueObj[key] !== null) {
      if (!model[key]) {
        model[key] = Array.isArray(valueObj[key])
          ? [...valueObj[key]]
          : { ...valueObj[key] };
      } else {
        model[key] = deepMerge(model[key], valueObj[key]);
      }
    } else {
      model[key] = valueObj[key];
    }
  });
}

// 处理非JSON格式的变更
function applyNonJsonChange(model: Record<string, any>, change: any) {
  if (!model.aiSuggestions) {
    model.aiSuggestions = [];
  }
  model.aiSuggestions.push({
    type: change.type,
    identifier: change.identifier,
    language: change.language,
    content: change.value,
  });
  return { success: true };
}

// 深度合并对象
function deepMerge(target: any, source: any) {
  if (source === null || source === undefined) return target;
  if (target === null || target === undefined) {
    return Array.isArray(source) ? [...source] : { ...source };
  }
  const output = Array.isArray(target) ? [...target] : { ...target };
  Object.keys(source).forEach((key) => {
    const sourceValue = source[key];
    if (typeof sourceValue === "object" && sourceValue !== null) {
      if (Array.isArray(sourceValue)) {
        output[key] = [...sourceValue];
      } else if (
        typeof output[key] === "object" &&
        output[key] !== null &&
        !Array.isArray(output[key])
      ) {
        output[key] = deepMerge(output[key], sourceValue);
      } else {
        output[key] = sourceValue;
      }
    } else {
      output[key] = sourceValue;
    }
  });
  return output;
}

defineExpose({
  showResponse,
  close,
});
</script>

<template>
  <teleport to="body">
    <Transition name="ai-viewer-fade">
      <div v-if="visible" class="ai-response-viewer">
        <Transition name="ai-viewer-slide">
          <div v-if="visible" class="ai-response-container">
            <div class="ai-response-header">
              <div class="ai-icon">AI</div>
              <div class="ai-title">{{ t("ai.responseTitle", "AI 修改建议") }}</div>
              <div class="ai-close" @click="close">×</div>
            </div>

            <div v-if="responseData" class="ai-response-content">
              <!-- Markdown内容展示 -->
              <div class="ai-markdown-content">
                <MarkdownStreamViewer
                  enableAutoScroll
                  :enableStreaming="enableStreaming"
                  :content="responseData"
                />
              </div>

              <!-- 应用结果展示 -->
              <div v-if="hasApplied" class="ai-result-summary">
                <customDivider>{{ t("ai.resultSummary", "应用结果") }}</customDivider>
                <div
                  :class="['summary-message', applyResult.success ? 'success' : 'failed']"
                >
                  {{ applyResult.message }}
                </div>

                <!-- 显示详细结果 -->
                <div
                  v-if="applyResult.details && applyResult.details.length > 0"
                  class="result-details"
                >
                  <customDivider>{{ t("ai.resultDetails", "详细结果") }}</customDivider>
                  <div
                    v-for="(detail, index) in applyResult.details"
                    :key="index"
                    :class="['detail-item', detail.success ? 'success' : 'failed']"
                  >
                    <div class="detail-path">{{ detail.path }}</div>
                    <div class="detail-message">{{ detail.message }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="ai-no-response">
              {{ t("ai.noResponse", "暂无响应数据") }}
            </div>

            <!-- 操作按钮 -->
            <div class="ai-actions">
              <customButton @click="close">{{ t("ai.cancel", "取消") }}</customButton>
              <customButton theme="primary" @click="applyChanges" :disabled="hasApplied">
                {{
                  hasApplied ? t("ai.applied", "已应用修改") : t("ai.apply", "应用修改")
                }}
              </customButton>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </teleport>
</template>

<style lang="scss" scoped>
/* 添加过渡动画样式 */
.ai-viewer-fade-enter-active,
.ai-viewer-fade-leave-active {
  transition: opacity 0.3s ease;
}

.ai-viewer-fade-enter-from,
.ai-viewer-fade-leave-to {
  opacity: 0;
}

.ai-viewer-slide-enter-active,
.ai-viewer-slide-leave-active {
  transition: all 0.3s ease;
}

.ai-viewer-slide-enter-from,
.ai-viewer-slide-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

.ai-response-viewer {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9001;
  width: 100vw;
  height: 100vh;
}

.ai-response-container {
  width: 900px;
  max-width: 90vw;
  max-height: 90vh;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ai-response-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  background: linear-gradient(135deg, #7b4ed8, #a27def);
  color: white;
}

.ai-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: white;
  color: #7b4ed8;
  font-size: 12px;
  font-weight: bold;
  margin-right: 12px;
}

.ai-title {
  flex: 1;
  font-size: 16px;
  font-weight: bold;
}

.ai-close {
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
  padding: 4px;
}

.ai-response-content {
  padding: 16px;
  overflow-y: auto;
  flex: 1;
  max-height: 60vh;
}

.ai-result-summary {
  margin-top: 20px;

  .summary-message {
    padding: 12px;
    border-radius: 4px;
    margin-top: 8px;

    &.success {
      background-color: rgba(103, 194, 58, 0.1);
      color: #67c23a;
    }

    &.failed {
      background-color: rgba(245, 108, 108, 0.1);
      color: #f56c6c;
    }
  }
}

.ai-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: var(--ml-pd-lg);
}

.ai-no-response {
  padding: 24px;
  text-align: center;
  color: #999;
}

/* 保留一些基本样式 */
.ai-markdown-content {
  margin-bottom: 24px;
}

.result-details {
  margin-top: 16px;

  .detail-item {
    padding: 8px 12px;
    margin-bottom: 8px;
    border-radius: 4px;

    &.success {
      background-color: rgba(103, 194, 58, 0.1);
    }

    &.failed {
      background-color: rgba(245, 108, 108, 0.1);
    }

    .detail-path {
      font-weight: bold;
      margin-bottom: 4px;
    }

    .detail-message {
      font-size: 0.9em;
    }
  }
}
</style>
