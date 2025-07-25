<script setup lang="ts">
import "@molian/assets/styles/global.scss";
import { defineProps, inject } from "vue";
import { currentRegComps, parseSlot, slotsMap } from "@molian/utils/compsConfig";
import { useI18n } from "vue-i18n";
import fullLoadingComps from "@molianComps/Loading/full-loading-1.vue";
import {
  hiddenAllPanel,
  selectedComp,
  modelValue,
  globalAttrs,
  useKeys,
  compsRefs,
} from "./designerData";
import globalTool from "./globalTool/index.vue";
import cssDesigner from "./cssDesigner/index.vue";
import containerDesigner from "./containerDesigner/index.vue";
import toolRightSideBar from "./toolSideBar/index.vue";
import compsDesigner from "./compsDesigner/index.vue";
import optionsDesigner from "./optionsDesigner/index.vue";
import actionDesigner from "./actionDesigner/index.vue";
import globalDesigner from "./globalDesigner/index.vue";
import treeDir from "./tools/TreeDir/index.vue";
import { validateComponentTree, validateGlobalAttrs } from "@molian/utils/componentCore";
// import aiIm from "./tools/aiIm/index.vue";
import { setting } from "@molian/utils/defaultData";
import { conciseJs } from "@molian/utils/js-generator";
import { conciseCss, restoreCss } from "@molian/utils/css-generator";
import { getSelectedAIData, getAIPrompt, updateFromAI } from "@molian/utils/AI/designerForAi";
import AIRequest from '@molian/utils/AI/AIRequest';

defineOptions({
  name: "MolianDesigner",
})
const props = defineProps({
  width: {
    type: String,
    default: "100vw",
  },
  height: {
    type: String,
    default: "100vh",
  },
  customEditorData: {
    type: Object,
    default: () => {
      return {
        highRules: [],
        completions: [
          {
            meta: "全局属性",
            caption: `$dp`,
            value: `$dp()`,
            score: 9999,
            mode: "javascript",
            prefix: ["this"],
            snippetStr: "this.$dp.({\n${1:test},${2:hello},\n})",
          },
          {
            meta: "全局函数",
            caption: `$edit`,
            value: `$edit()`,
            score: 9999,
            mode: "javascript",
            prefix: ["this"],
            snippetStr: "this.$edit.({\n${1:test},${2:hello},\n})",
          },
        ]
      };
    },
  },
  expandAPI: {
    type: Object,
    default: () => {},
  },
  aiRequest: {
    type: Function,
    default: null,
  },
});
const { t } = useI18n();
const message:any = inject("mlMessage");
const comps: any = inject("mlComps");
const currentExpandAPI = computed(() => {
  return {
    ...props.expandAPI,
    __type: 'designer',
  };
});
provide('mlExpandAPI', currentExpandAPI.value);
useKeys(message, t);
/**
 * 设置数据函数，用于更新组件的模型值和全局属性
 * @param {any} data - 包含模型值和全局属性的对象
 */
const setData = (data: any) => {
  if (!!data) {
    // 验证和补全全局属性
    const validatedGlobalAttrs = validateGlobalAttrs(data.globalAttrs || {});
    
    // 更新全局属性
    for (let key in validatedGlobalAttrs) {
      if (Object.prototype.hasOwnProperty.call(validatedGlobalAttrs, key)) {
        const element = validatedGlobalAttrs[key];
        globalAttrs[key] = element;
      }
    }
    
    // 验证和补全组件数据
    const restoredModelValue = restoreCss(data.modelValue || []);
    modelValue.value = validateComponentTree(restoredModelValue);
  }
};

/**
 * 根据参数决定返回原始数据或处理后的数据
 *
 * 此函数用于根据传入的参数决定是否对数据进行处理如果需要处理数据，
 * 则使用 conciseJs 函数处理 modelValue 的值，并且可以处理自定义组件的值
 * 如果不需要处理数据，则直接返回原始的 modelValue 值
 *
 * @param {boolean} concise - 指示是否需要对数据进行处理默认为 true
 * @returns {Object} - 包含 globalAttrs 和 modelValue 属性的对象
 */
const getData = (concise = true) => {
  if (concise) {
    // 当需要处理数据时，返回包含处理后的 modelValue 和 globalAttrs 的对象
    return {
      globalAttrs,
      modelValue: conciseJs(conciseCss(modelValue.value), comps.value),
    };
  } else {
    // 当不需要处理数据时，直接返回包含原始 modelValue 和 globalAttrs 的对象
    return {
      globalAttrs,
      modelValue: modelValue.value,
    };
  }
};

/**
 * 合并现有的slots映射
 * @param {IDefaultSlotsMap} appendSlotsMap - 新的slots映射，用于扩展或更新当前组件的slots
 */
const setSlotsMap = (appendSlotsMap: IDefaultSlotsMap) => {
  // 遍历新的slots映射的每一个键值对
  Object.keys(appendSlotsMap).forEach((key) => {
    // 解析每个组件的slots，以适应当前组件的使用
    const useSlots = parseSlot(appendSlotsMap[key]);
    // 将解析后的slots合并到当前组件的slots中
    Object.keys(useSlots).forEach((sKey) => {
      currentRegComps.value[key].slots[sKey] = useSlots[sKey];
    });
    // 将新的slots映射添加到全局的slotsMap中
    slotsMap.value[key] = appendSlotsMap[key];
  });
};

const codeEditorTips = reactive({
  variable: computed(() => globalAttrs.variable),
  refs: compsRefs,
  selectedComp,
  custom: props.customEditorData,
});

provide("codeEditor", codeEditorTips);
AIRequest(props.aiRequest);
defineExpose({
  setData,
  getData,
  setSlotsMap,
  getSelectedAIData,
  getAIPrompt,
  updateFromAI,
});
</script>
<template>
  <div class="designer-page" :style="{ width, height }">
    <div :style="`display:${hiddenAllPanel ? 'none' : 'block'};`">
      <template v-if="!!setting.immerseRightMode">
        <globalTool></globalTool>
        <css-designer></css-designer>
        <options-designer></options-designer>
        <action-designer></action-designer>
        <global-designer></global-designer>
      </template>
      <comps-designer
        :style="`display:${selectedComp ? 'none' : 'block'}`"
        v-if="!!setting.immerseLeftMode"
      />
      <template v-else="!setting.immerseLeftMode">
        <transition name="slide2Width">
          <comps-designer />
        </transition>
      </template>
    </div>
    <container-designer>
      <template v-slot:toolbarLeft>
        <slot name="toolbarLeft"></slot>
      </template>
      <template v-slot:toolbarCenter>
        <slot name="toolbarCenter"></slot>
      </template>
      <template v-slot:toolbarRight="scoped">
        <slot name="toolbarRight" v-bind="scoped"></slot>
      </template>
    </container-designer>
    <transition name="slide2Width">
      <toolRightSideBar v-if="!setting.immerseRightMode" />
    </transition>
    <treeDir></treeDir>
    <!-- <ai-im></ai-im> -->
    <fullLoadingComps></fullLoadingComps>
  </div>
</template>
<style lang="scss">
// @use '../../assets/styles/global.scss';
.designer-page {
  display: flex;
  *,
  *:before,
  *:after {
    box-sizing: border-box;
  }
}
.designer-page * {
  scrollbar-width: none;
}
</style>
