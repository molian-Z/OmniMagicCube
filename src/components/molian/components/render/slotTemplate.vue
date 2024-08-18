<script setup lang="ts">
import { defineProps, inject } from "vue";
import deepTreeToRender from "./DeepTreeToRender.vue";
import { setRenderRef } from "./renderData";
import { toKebabCase } from "@molian/utils/util";
import { parseProps } from '@molian/utils/useCore';
import { variable } from './renderData';
const comps: any = inject("mlComps");
const props = defineProps(<
  {
    comp: object | any;
    expandAPI: object | any;
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
});
const useComp = computed(() => {
  return !!comps[props.comp.name] ? comps[props.comp.name].comp : props.comp.name;
});
</script>
<template>
  <component
    :id="comp.id"
    :is="useComp"
    :ref="(el: any) => setRenderRef(el, comp)"
    v-bind="parseProps(comp, comps, variable, expandAPI)"
    :class="toKebabCase(comp.name) + '__' + comp.key"
  >
    <template
      v-for="(slotVal, slotKey) in comp.slots"
      :key="slotKey"
      #[slotKey]="slotProps"
    >
      <template v-if="slotVal && slotVal.children">
          <deepTreeToRender :expandAPI="expandAPI" v-model="slotVal.children" :slotProps="slotProps" />
      </template>
    </template>
  </component>
</template>
