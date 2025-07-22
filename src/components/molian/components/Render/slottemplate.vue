<script setup lang="ts">
import { defineProps, inject } from "vue";
import deepTreeToRender from "./deeptreetorender.vue";
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

const componentClass = `comp_${props.comp.key}`;
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
  // 更细致的动画创建条件检查
  if (shouldCreateAnimationManager()) {
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

// 检查是否需要创建动画管理器
function shouldCreateAnimationManager(): boolean {
  // 基础条件：必须有组件引用
  if (!componentRef.value) {
    return false;
  }
  
  // 检查动画配置是否存在且有效
  if (!props.comp.animations) {
    return false;
  }
  
  // 如果animations是数组，检查是否为空
  if (Array.isArray(props.comp.animations) && props.comp.animations.length === 0) {
    return false;
  }
  
  // 如果animations是对象，检查是否有有效的动画配置
  if (typeof props.comp.animations === 'object' && !Array.isArray(props.comp.animations)) {
    const hasValidAnimations = Object.keys(props.comp.animations).some(key => {
      const animation = props.comp.animations[key];
      // 检查动画对象是否有基本的配置
      return animation && 
             (animation.keyframes || animation.duration || animation.trigger || animation.type);
    });
    
    if (!hasValidAnimations) {
      return false;
    }
  }
  
  // 检查DOM元素是否可用
  const element = componentRef.value.$el || componentRef.value;
  if (!element || !element.nodeType) {
    return false;
  }
  
  return true;
}

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
