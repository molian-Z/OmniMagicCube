<script setup lang="ts">
import { defineProps, onUnmounted, defineOptions } from "vue";
import { uniqueId } from "es-toolkit/compat";
import { getVariableData } from "@molian/utils/customFunction";
import { useStyleTag, watchThrottled } from "@vueuse/core";
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
    id: uniqueId('omc-r_'),
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
watchThrottled(
  () => props.modelValue,
  (newVal) => {
    css.value = createCss(newVal);
  },
  { immediate: true, throttle: 50 }
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
