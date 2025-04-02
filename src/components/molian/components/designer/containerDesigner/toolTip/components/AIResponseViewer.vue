<script setup lang="ts">
import { ref, defineProps, defineExpose, inject } from "vue";
import { useI18n } from "vue-i18n";
import { AIResponse } from "@/types/ai-response";
import {applyAIChanges} from "@molian/utils/AI/applyAIChanges";
const message = inject("mlMessage") as any;
const { t } = useI18n();
const customComps: any = inject("customComps");
const { customButton, customTag, customDivider, customCollapse, customCollapseItem } = customComps;
const props = defineProps({
  // 可以传入初始响应数据
  initialResponse: {
    type: Object as () => AIResponse.Response | null,
    default: null,
  },
});

// 响应数据
const responseData = ref<AIResponse.Response | null>(props.initialResponse);
const visible = ref(false);
// 添加应用结果状态记录
const applyResults = ref<Record<number, boolean>>({});
// 添加应用结果详情
const applyDetails = ref<Array<{index: number, success: boolean, message: string}>>([]);
// 添加是否已应用标志
const hasApplied = ref(false);
// 添加应用结果统计
const resultSummary = ref<{
  success: boolean;
  message: string;
  successCount: number;
  totalCount: number;
} | null>(null);

// 根据变更类型获取标签类型
const getTagType = (
  changeType: AIResponse.ChangeType
): "info" | "success" | "warning" | "danger" | "primary" => {
  switch (changeType) {
    case "added":
      return "success";
    case "modified":
      return "info";
    case "removed":
      return "danger";
    case "reordered":
      return "warning";
    default:
      return "primary";
  }
};

// 根据变更类型获取文本
const getChangeText = (changeType: AIResponse.ChangeType): string => {
  switch (changeType) {
    case "added":
      return t("ai.change.added", "添加");
    case "modified":
      return t("ai.change.modified", "修改");
    case "removed":
      return t("ai.change.removed", "删除");
    case "reordered":
      return t("ai.change.reordered", "重排序");
    default:
      return changeType;
  }
};

// 显示响应数据
const showResponse = (response: AIResponse.Response) => {
  responseData.value = response;
  visible.value = true;
  // 重置应用状态
  applyResults.value = {};
  applyDetails.value = [];
  resultSummary.value = null;
  hasApplied.value = false;
};

// 关闭查看器
const close = () => {
  visible.value = false;
};

// 应用变更
const applyChanges = () => {
  if (!responseData.value) return;

  try {
    // 直接调用导入的函数
    const result: any = applyAIChanges(responseData.value);
    
    // 设置已应用标志
    hasApplied.value = true;
    
    // 记录应用结果摘要
    if (typeof result === 'object') {
      resultSummary.value = {
        success: result.success,
        message: result.message,
        successCount: result.successCount,
        totalCount: result.totalCount
      };
    }
    
    // 记录每个变更的应用结果
    if (responseData.value.changes && responseData.value.changes.length > 0) {
      // 使用新的 result 格式
      if (typeof result === 'object') {
        // 保存详细信息
        applyDetails.value = result.details || [];
        
        // 更新每个变更的成功/失败状态
        responseData.value.changes.forEach((_, index) => {
          if (Array.isArray(result.successIndices)) {
            applyResults.value[index] = result.successIndices.includes(index);
          } else {
            applyResults.value[index] = false;
          }
        });
      } else {
        // 如果没有详细结果，则假设所有变更都成功
        responseData.value.changes.forEach((_, index) => {
          applyResults.value[index] = true;
        });
      }
    }
    
    if (message) {
      if (result.success) {
        message.success(t("ai.applySuccess", "已成功应用 AI 修改建议"));
      } else if (result.successCount > 0) {
        message.warning(t("ai.applyPartial", "部分 AI 修改建议应用失败"));
      } else {
        message.error(t("ai.applyError", "应用 AI 修改建议失败"));
      }
    }
  } catch (error) {
    console.error("应用 AI 变更失败:", error);
    if (message) {
      message.error(t("ai.applyError", "应用 AI 修改建议失败"));
    }
  }
};

// 获取应用结果详情
const getApplyDetail = (index: number) => {
  return applyDetails.value.find(detail => detail.index === index);
};

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
              <!-- 操作说明 -->
              <div class="ai-message">{{ responseData.message }}</div>

              <!-- 修改类型 -->
              <div class="ai-modification-type">
                <customTag type="info" effect="plain">
                  {{
                    responseData.modificationType === "single"
                      ? t("ai.singleModification", "单一修改")
                      : t("ai.multipleModification", "多项修改")
                  }}
                </customTag>
                
                <!-- 添加应用结果摘要 -->
                <div v-if="hasApplied && resultSummary" class="ai-result-summary">
                  <customTag :type="resultSummary.success ? 'success' : 'warning'" effect="dark">
                    {{ resultSummary.message }}
                  </customTag>
                </div>
              </div>

              <!-- 详细说明列表 -->
              <div class="ai-details">
                <customDivider>{{ t("ai.details", "详细说明") }}</customDivider>
                <ul>
                  <li v-for="(detail, index) in responseData.details" :key="index">
                    {{ detail }}
                  </li>
                </ul>
              </div>

              <!-- 变更记录 -->
              <div class="ai-changes">
                <customDivider>{{ t("ai.changes", "变更记录") }}</customDivider>
                <customCollapse>
                  <customCollapseItem
                    v-for="(change, index) in responseData.changes"
                    :key="index"
                    :name="index"
                  >
                    <template #title>
                      <div class="collapse-title">
                        <div>
                            <customTag :type="getTagType(change.type)" effect="dark">
                            {{ getChangeText(change.type) }}
                            </customTag>
                            <span class="change-path">{{ change.path }}</span>
                        </div>
                        <!-- 添加应用结果标签 -->
                        <customTag 
                          v-if="hasApplied"
                          :type="applyResults[index] ? 'success' : 'danger'" 
                          effect="light"
                          class="apply-result-tag"
                        >
                          {{ applyResults[index] ? t("ai.applySuccess", "应用成功") : t("ai.applyFailed", "应用失败") }}
                        </customTag>
                      </div>
                    </template>
                    <div class="change-content">
                      <template v-if="change.type === 'modified'">
                        <div class="change-from">
                          <div class="change-label">
                            {{ t("ai.from", "原始值") }}:
                          </div>
                          <pre>{{ JSON.stringify(change.from, null, 2) }}</pre>
                        </div>
                        <div class="change-to">
                          <div class="change-label">{{ t("ai.to", "新值") }}:</div>
                          <pre>{{ JSON.stringify(change.to, null, 2) }}</pre>
                        </div>
                      </template>

                      <template v-else-if="change.type === 'added'">
                        <div class="change-value">
                          <div class="change-label">
                            {{ t("ai.value", "添加的值") }}:
                          </div>
                          <pre>{{ JSON.stringify(change.value, null, 2) }}</pre>
                        </div>
                      </template>

                      <template v-else-if="change.type === 'removed'">
                        <div class="change-original-value">
                          <div class="change-label">
                            {{ t("ai.originalValue", "被删除的值") }}:
                          </div>
                          <pre>{{ JSON.stringify(change.originalValue, null, 2) }}</pre>
                        </div>
                      </template>

                      <template v-else-if="change.type === 'reordered'">
                        <div class="change-from">
                          <div class="change-label">
                            {{ t("ai.from", "原始顺序") }}:
                          </div>
                          <pre>{{ JSON.stringify(change.from, null, 2) }}</pre>
                        </div>
                        <div class="change-to">
                          <div class="change-label">{{ t("ai.to", "新顺序") }}:</div>
                          <pre>{{ JSON.stringify(change.to, null, 2) }}</pre>
                        </div>
                      </template>
                      
                      <!-- 显示应用结果详情 -->
                      <div v-if="hasApplied && getApplyDetail(index)" class="change-result-detail">
                        <div class="change-label">{{ t("ai.applyResult", "应用结果") }}:</div>
                        <div class="result-message" :class="{ 'success': applyResults[index], 'failed': !applyResults[index] }">
                          {{ getApplyDetail(index)?.message }}
                        </div>
                      </div>
                    </div>
                  </customCollapseItem>
                </customCollapse>
              </div>
            </div>

            <div v-else class="ai-no-response">
              {{ t("ai.noResponse", "暂无响应数据") }}
            </div>
            <!-- 操作按钮 -->
            <div class="ai-actions">
                <customButton @click="close">{{ t("ai.cancel", "取消") }}</customButton>
                <customButton theme="primary" @click="applyChanges" :disabled="hasApplied">
                  {{ hasApplied ? t("ai.applied", "已应用修改") : t("ai.apply", "应用修改") }}
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

.ai-message {
  font-size: 16px;
  margin-bottom: 16px;
  color: #333;
}

.ai-modification-type {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-result-summary {
  margin-left: auto;
}

.ai-details {
  margin-bottom: 24px;

  ul {
    padding-left: 20px;

    li {
      margin-bottom: 8px;
      color: #555;
    }
  }
}

.ai-changes {
  margin-bottom: 24px;

  .collapse-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-right: var(--ml-pd-base);
    width: 100%;

    .change-path {
      margin-left: 8px;
      color: #666;
      font-weight: bold;
      font-size: 14px;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .apply-result-tag {
      margin-left: 8px;
    }
  }

  .change-content {
    padding: 8px;
    background-color: #f9f9f9;
    border-radius: 4px;

    .change-label {
      font-weight: bold;
      margin-bottom: 4px;
      color: #555;
    }

    pre {
      margin: 0;
      padding: 8px;
      background-color: #f1f1f1;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 12px;
      line-height: 1.4;
      white-space: pre-wrap;
      word-break: break-word;
      max-height: 300px;
    }

    .change-from,
    .change-value,
    .change-original-value {
      margin-bottom: 12px;
    }
    
    .change-result-detail {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px dashed #ddd;
      
      .result-message {
        padding: 6px 10px;
        border-radius: 4px;
        font-size: 13px;
        
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
</style>
