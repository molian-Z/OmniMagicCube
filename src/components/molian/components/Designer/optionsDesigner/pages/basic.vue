<script setup lang="ts">
import { defineOptions, inject, computed } from "vue";
import { selectedComp } from "../../designerData";
import { useI18n } from "vue-i18n";
import { useSafeComponentUpdate } from "../composables/useSafeDebounce";
import { useErrorHandler } from "../composables/useErrorHandler";
import type { ComponentData } from "../types";

const { t } = useI18n();
defineOptions({
  name: "basicComp",
});
const customComps: any = inject("customComps");
const { customInput } = customComps;
const comps:any = inject('mlComps')
const { withErrorHandling, error } = useErrorHandler();

// 计算属性：当前组件数据
const currentComponent = computed<ComponentData | null>(() => selectedComp.value);

/**
 * 计算属性用于获取和设置悬浮元素的副标题
 * 它根据悬浮元素的存在及其属性来决定显示的副标题
 */
const hoverSubTitle = computed({
  /**
   * 获取副标题
   * 优先使用悬浮元素直接关联的副标题，如果未定义，则尝试从指令中获取
   * @returns {string} 悬浮元素的副标题或指令中定义的文本值，如果没有找到则返回空字符串
   */
  get() {
    // 检查悬浮元素是否存在及其副标题属性
    if (selectedComp.value && (selectedComp.value.subTitle || selectedComp.value.subTitle === "")) {
        return selectedComp.value.subTitle;
    }
    // 如果悬浮元素存在且包含特定指令，则使用指令中定义的文本值作为副标题
    if (
      selectedComp.value &&
      selectedComp.value.directives &&
      selectedComp.value.directives.text &&
      selectedComp.value.directives.text.type === "string" &&
      !!selectedComp.value.directives.text.value
    ) {
      return selectedComp.value.directives.text.value;
    }
    // 如果以上条件都不满足，返回空字符串
    return "";
  },
  /**
   * 设置副标题
   * 直接在悬浮元素上设置副标题属性
   * @param {string} val 要设置的副标题值
   */
  set(val) {
    updateComponentAttribute('subTitle', val);
  },
});

// 更新组件属性的方法
const updateComponentAttribute = async (attrName: string, value: any) => {
  return withErrorHandling(async () => {
    if (!currentComponent.value) {
      throw new Error('没有选中的组件');
    }
    
    if (attrName === 'subTitle') {
      currentComponent.value.subTitle = value;
      
      // 如果组件有 bindSubTitle 属性，同时更新相关属性
      const props = comps.value[currentComponent.value.name]?.props;
      if(props) {
        Object.keys(props).forEach(key => {
          if(props[key].bindSubTitle) {
            if(currentComponent.value.attrs[key]) {
              currentComponent.value.attrs[key].value = value;
            }
          }
        });
      }
    } else {
      (currentComponent.value as any)[attrName] = value;
    }
  }, `更新组件${attrName}属性失败`);
};

/**
 * 监听hoverSubTitle值的变化，当值变化时，更新相关组件的属性值
 * 使用安全防抖Hook，确保在组件切换时不会错误地更新其他组件
 */
useSafeComponentUpdate(
    hoverSubTitle,
    'subTitle',
    updateComponentAttribute,
    selectedComp,
    300
);

</script>
<template>
  <div class="basic-list">
    <template v-if="selectedComp">
      <div class="data2form-item">
        <div class="data2form-item__label">{{ t("options.id") }}</div>
        <div class="data2form-item__input">
          <customInput size="small" v-model="selectedComp.id" />
        </div>
        <div style="width: 24px"></div>
      </div>
      <div class="data2form-item">
        <div class="data2form-item__label">{{ t("options.key") }}</div>
        <div class="data2form-item__input">
          <customInput size="small" v-model="selectedComp.key" />
        </div>
        <div style="width: 24px"></div>
      </div>
      <div class="data2form-item">
        <div class="data2form-item__label">{{ t("options.subTitle") }}</div>
        <div class="data2form-item__input">
          <customInput size="small" v-model="hoverSubTitle" />
        </div>
        <div style="width: 24px"></div>
      </div>
      <div class="data2form-item">
        <div class="data2form-item__label">{{ t("options.currentComponent") }}</div>
        <div class="data2form-item__input">
          <customInput size="small" readonly v-model="selectedComp.name" />
        </div>
        <div style="width: 24px"></div>
      </div>
    </template>
  </div>
</template>
