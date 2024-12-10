<script setup lang="ts">
import { defineProps, watch, onUnmounted, defineOptions, render } from "vue";
import { throttle } from "lodash-es";
import { getVariableData } from "@molian/utils/customFunction";
import { useStyleTag } from "@vueuse/core";
import renderTree from "./DeepTreeToRender.vue";
import { runLifecycle } from "@molian/utils/customFunction";
import { createCss } from "@molian/utils/css-generator";
import useRenderData from "./renderData";
defineOptions({
    name: "Render",
})

const props = defineProps(<
  {
    modelValue: any;
    globalAttrs: any;
    expandAPI: any;
  }
>{
  modelValue: {
    type: Array,
    default: () => [],
  },
  globalAttrs: {
    type: Object,
    default: () => {},
  },
  expandAPI: {
    type: Object,
    default: () => {},
  },
});

// 生命周期
const lifecycle = ref<{ [key: string]: any }>({});
// 注册css
const { css, unload } = useStyleTag('',{
    id: 'omni-magic-cube-render',
});
const interInc = useRenderData()
const { renderRef, variable, originVariable } = interInc
watch(
  () => props.globalAttrs,
  (newVal) => {
    originVariable.value = newVal.variable;
    variable.value = getVariableData(newVal.variable, props.expandAPI, true);
    lifecycle.value = newVal.lifecycle;
    runLifecycle(lifecycle, variable.value, props.expandAPI);
  },
  { immediate: true }
);
const throttledCreateCss = throttle((newVal: any) => {
  css.value = createCss(newVal);
}, 300);
watch(
  () => props.modelValue,
  (newVal) => {
    throttledCreateCss(newVal);
  },
  { immediate: true }
);
onUnmounted(() => {
  unload();
});

defineExpose({
  renderRef,
  variable,
});
</script>

<template>
  <renderTree
    :modelValue="modelValue"
    :expandAPI="expandAPI"
    :interInc="interInc"
  ></renderTree>
</template>
