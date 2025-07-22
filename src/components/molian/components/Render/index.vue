<script setup lang="ts">
import { defineProps, onUnmounted, defineOptions } from "vue";
import { uniqueId } from "es-toolkit/compat";
import { getVariableData } from "@molian/utils/customFunction";
import { ComponentPool } from '@molian/utils/componentPool';
import { useStyleTag, watchThrottled } from "@vueuse/core";
import renderTree from "./deeptreetorender.vue";
import { runLifecycle } from "@molian/utils/customFunction";
import { createCss } from "@molian/utils/css-generator";
import useRenderData from "./renderdata";
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
const expandAPIRef = ref({});
watchEffect(() => {
    const target = props.expandAPI || {};
    expandAPIRef.value = new Proxy(target, {
        get(target, prop) {
            if (prop === '__type') return 'render';
            return target[prop];
        }
    });
});

// 验证和补全组件数据
const modelValue:any = ref({});
const globalAttrs:any = ref({});

watch(
  () => props.globalAttrs,
  (newVal) => {
    globalAttrs.value = newVal;
    // 只在真正需要更新的时候才更新
    if (globalAttrs.value.variable !== originVariable.value) {
      originVariable.value = globalAttrs.value.variable;
      variable.value = getVariableData(globalAttrs.value.variable, expandAPIRef.value, true);
    }
    if (globalAttrs.value.lifecycle !== lifecycle.value) {
      lifecycle.value = globalAttrs.value.lifecycle;
      runLifecycle(lifecycle, variable.value, expandAPIRef.value);
    }
  },
  { 
    immediate: true,
    deep: false // 避免深度监听带来的性能开销
  }
);

// 监听组件数据变化
watchThrottled(
  () => props.modelValue,
  (newVal) => {
    // 验证和补全组件数据
    modelValue.value = newVal;
    // 更新CSS
    const newCss = createCss(modelValue.value);
    if (newCss !== css.value) {
      css.value = newCss;
    }
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
    :expandAPI="expandAPIRef"
    :interInc="interInc"
  />
</template>
