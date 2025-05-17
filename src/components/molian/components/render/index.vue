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
import { validateComponentTree, validateGlobalAttrs } from "@/components/molian/utils/componentCore";
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
const validatedModelValue = ref(validateComponentTree(props.modelValue));
const validatedGlobalAttrs = ref(validateGlobalAttrs(props.globalAttrs));

watch(
  () => props.globalAttrs,
  (newVal) => {
    validatedGlobalAttrs.value = validateGlobalAttrs(newVal);
    // 只在真正需要更新的时候才更新
    if (validatedGlobalAttrs.value.variable !== originVariable.value) {
      originVariable.value = validatedGlobalAttrs.value.variable;
      variable.value = getVariableData(validatedGlobalAttrs.value.variable, expandAPIRef.value, true);
    }
    if (validatedGlobalAttrs.value.lifecycle !== lifecycle.value) {
      lifecycle.value = validatedGlobalAttrs.value.lifecycle;
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
    validatedModelValue.value = validateComponentTree(newVal);
    
    // 更新CSS
    const newCss = createCss(validatedModelValue.value);
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
    :modelValue="validatedModelValue"
    :expandAPI="expandAPIRef"
    :interInc="interInc"
  />
</template>
