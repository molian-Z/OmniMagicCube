<script setup lang="ts">
import { defineProps, onUnmounted, defineOptions } from "vue";
import { uniqueId } from "es-toolkit/compat";
import { getVariableData } from "@molian/utils/customFunction";
import { ComponentPool } from '@molian/utils/componentPool';
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

// 创建全局组件池实例
const componentPool = new ComponentPool(50);
provide('componentPool', componentPool);
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
    // 只在真正需要更新的时候才更新
    if (newVal.variable !== originVariable.value) {
      originVariable.value = newVal.variable;
      variable.value = getVariableData(newVal.variable, props.expandAPI, true);
    }
    if (newVal.lifecycle !== lifecycle.value) {
      lifecycle.value = newVal.lifecycle;
      runLifecycle(lifecycle, variable.value, props.expandAPI);
    }
  },
  { 
    immediate: true,
    deep: false // 避免深度监听带来的性能开销
  }
);
watchThrottled(
  () => props.modelValue,
  (newVal) => {
    // 可以考虑只更新变化的部分 CSS
    const newCss = createCss(newVal);
    if (newCss !== css.value) {
      css.value = newCss;
    }
  },
  { immediate: true, throttle: 50 } // 根据实际情况调整节流时间
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
