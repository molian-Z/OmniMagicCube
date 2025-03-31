<script setup lang="ts">
import { defineProps, inject } from "vue";
import deepTreeToRender from "./DeepTreeToRender.vue";
import { parseProps } from "@molian/utils/useCore";
import vCustomDirectives from "@molian/utils/useDirectives";
import { watchThrottled } from '@vueuse/core';
import { AnimationManager } from "@molianComps/AnimationEngine/services/animation-manager";

const comps: any = inject("mlComps");
const props = defineProps(<
  {
    comp: object | any;
    expandAPI: object | any;
    slotData: {
      [key: string]: any;
    };
    interInc: any;
  }
>{
  comp: {
    type: Object,
    default: () => {},
  },
  expandAPI: {
    type: Object,
    default: () => {},
  },
  slotData: {
    type: Object,
    default: () => {},
  },
  interInc: {
    type: Object,
    default: () => {},
  },
});
const { variable, setRenderRef } = props.interInc;

// 使用 shallowRef 优化性能
const useComp = shallowRef(null);

// 优化组件监听逻辑
watchThrottled(
  () => props.comp.name,
  (newName) => {
    if (!newName) return;
    useComp.value = comps[newName]?.comp || newName;
  },
  { immediate: true, throttle: 50 }
);
const setSlots = computed(() => (slotProps: any) => {
  if (!slotProps || Object.keys(slotProps).length === 0) {
    return props.slotData || {};
  }
  return {
    ...(props.slotData || {}),
    [props.comp.id]: slotProps
  };
});

// 使用计算属性优化频繁计算的值
const parsedProps = computed(() => 
  parseProps(props.comp, comps.value, variable.value, props.expandAPI, props.slotData, 'render')
);

const componentClass = computed(() => props.comp.key);
const directiveParams = computed(() => ({
  comp: props.comp,
  $slot: props.slotData,
  variable: variable.value,
  expandAPI: props.expandAPI,
}));

const vCurrentDirectives = computed(() => 
    vCustomDirectives(directiveParams.value)
);

// 处理组件动画
const componentRef = ref<any>(null);
let animationManager: any = null;
onMounted(() => {
  if (props.comp.animations && componentRef.value) {
    const element = componentRef.value.$el || componentRef.value;
    // 创建动画管理器
    animationManager = new AnimationManager(
      element,
      props.comp.animations,
      {
        component: componentRef,
        props: parsedProps,
        variable: variable
      }
    ).init();
  }
});

onBeforeUnmount(() => {
  // 销毁动画管理器
  if (animationManager) {
    animationManager.destroy();
    animationManager = null;
  }
});

// 更新setRenderRef函数以保存组件引用
const setComponentRef = (el: any, comp: any) => {
  componentRef.value = el;
  setRenderRef(el, comp);
};

// 提供触发动画的方法
function triggerAnimation(animationType: string, animationName: string) {
  if (animationManager) {
    return animationManager.triggerAnimation(animationType, animationName);
  }
  return null;
}

// 暴露方法给父组件
defineExpose({
  triggerAnimation
});
</script>

<template>
  <component
    :id="comp.id"
    :is="useComp"
    :ref="(el: any) => setComponentRef(el, comp)"
    v-bind="parsedProps"
    :class="componentClass"
    v-currentDirectives="directiveParams"
  >
    <template
      v-for="(slotVal, slotKey) in comp.slots"
      :key="slotKey"
      #[slotKey]="slotProps"
    >
      <template v-if="slotVal && slotVal.children">
        <deepTreeToRender
          :expandAPI="expandAPI"
          :slotData="setSlots(slotProps)"
          v-model="slotVal.children"
          :interInc="interInc"
        />
      </template>
    </template>
  </component>
</template>
