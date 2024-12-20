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

const useComp = ref(null);
watchThrottled(() => props.comp.name, (newName) => {
  useComp.value = !!comps[newName] ? comps[newName].comp : newName;
}, { immediate: true, throttle: 50 });

const setSlots = (slotProps: any) => {
  const slotData = props.slotData || {}; // 确保 slotData 是对象类型
  if (slotProps && Object.keys(slotProps).length > 0) {
    return { ...slotData, [props.comp.id]: slotProps };
  } else {
    return slotData;
  }
};

const vCurrentDirectives = vCustomDirectives({
  comp: props.comp,
  $slot: props.slotData,
  variable: variable.value,
  expandAPI: props.expandAPI,
});
</script>
<template>
  <component
    :id="comp.id"
    :is="useComp"
    :ref="(el: any) => setRenderRef(el, comp)"
    v-bind="parseProps(comp, comps, variable, expandAPI, slotData, 'render')"
    :class="toKebabCase(comp.name) + '__' + comp.key"
    v-currentDirectives="{}"
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
