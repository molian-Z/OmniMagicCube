<script setup lang="ts">
import { defineProps, inject } from "vue";
import deepTreeToRender from "./DeepTreeToRender.vue";
import { toKebabCase } from "@molian/utils/util";
import { parseProps } from "@molian/utils/useCore";
import vCustomDirectives from "@molian/utils/useDirectives";
import { watchThrottled } from '@vueuse/core';

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

const componentClass = computed(() => 
  `${toKebabCase(props.comp.name)}__${props.comp.key}`
);
const directiveParams = computed(() => ({
  comp: props.comp,
  $slot: props.slotData,
  variable: variable.value,
  expandAPI: props.expandAPI,
}));

const vCurrentDirectives = computed(() => 
  vCustomDirectives(directiveParams.value)
);
</script>
<template>
  <component
    :id="comp.id"
    :is="useComp"
    :ref="(el: any) => setRenderRef(el, comp)"
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
