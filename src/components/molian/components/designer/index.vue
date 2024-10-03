<script setup lang="ts">
import {useI18n} from 'vue-i18n'
import "@molian/assets/styles/global.scss";
import { defineProps, inject } from "vue";
import fullLoadingComps from "@molianComps/Loading/full-loading-1.vue";
import {
  hiddenAllPanel,
  selectedComp,
  modelValue,
  globalAttrs,
  useKeys,
} from "./designerData";
import globalTool from "./globalTool/index.vue";
import cssDesigner from "./cssDesigner/index.vue";
import containerDesigner from "./containerDesigner/index.vue";
import toolRightSideBar from "./toolSideBar/index.vue";
import compsDesigner from "./compsDesigner/index.vue";
import optionsDesigner from "./optionsDesigner/index.vue";
import actionDesigner from "./actionDesigner/index.vue";
import globalDesigner from "./globalDesigner/index.vue";
import treeDir from "./tools/treeDir/index.vue";
// import aiIm from "./tools/aiIm/index.vue";
import { setting } from "@molian/utils/defaultData";
import { conciseJs } from "@molian/utils/js-generator";
import { conciseCss, restoreCss } from "@molian/utils/css-generator";
defineProps({
  width: {
    type: String,
    default: "100vw",
  },
  height: {
    type: String,
    default: "100vh",
  },
});
const { t } = useI18n()
const message = inject("mlMessage");
useKeys(message, t);
const setData = (data: any) => {
  modelValue.value = restoreCss(data.modelValue);
  Object.keys(data.globalAttrs).forEach((key: string) => {
    globalAttrs[key] = Object.assign({}, data.globalAttrs[key]);
  });
};

const getData = (concise = true) => {
  if (concise) {
    return {
      globalAttrs,
      modelValue: conciseJs(conciseCss(modelValue.value)),
    };
  } else {
    return {
      globalAttrs,
      modelValue: modelValue.value,
    };
  }
};

defineExpose({
  setData,
  getData,
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
      <comps-designer :style="`display:${selectedComp ? 'none' : 'block'}`"  v-if="!!setting.immerseLeftMode" />
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
      <template v-slot:toolbarRight>
        <slot name="toolbarRight"></slot>
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
</style>
