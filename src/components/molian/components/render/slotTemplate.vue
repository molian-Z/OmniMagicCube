<script setup lang="ts">
import { defineProps, inject } from "vue";
import deepTreeToRender from "./DeepTreeToRender.vue";
import { toKebabCase } from "@molian/utils/util";
import { parseProps } from "@molian/utils/useCore";
import vCustomDirectives from "@molian/utils/useDirectives";
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
    default: () => {}
  }
});
const { variable, setRenderRef } = props.interInc
const useComp = computed(() => {
  return !!comps[props.comp.name] ? comps[props.comp.name].comp : props.comp.name;
});

const setSlots = (slotProps: any) => {
  if (slotProps && Object.keys(slotProps).length > 0) {
    const slot = Object.assign({}, props.slotData, { [props.comp.id]: slotProps });
    return slot;
  } else {
    return props.slotData;
  }
};
const vCurrentDirectives = vCustomDirectives({ comp: props.comp, $slot: props.slotData, variable: variable.value, expandAPI: props.expandAPI })
</script>
<template>
  <component
    :id="comp.id"
    :is="useComp"
    :ref="(el: any) => setRenderRef(el, comp)"
    v-bind="parseProps(comp, comps, variable, expandAPI, slotData)"
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
