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
    comp: any;
  }
>{
  comp: {
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
    v-bind="parseProps(comp, comps, variable)"
    :class="toKebabCase(comp.name) + '__' + comp.key"
  >
    <template
      v-for="(slotVal, slotKey) in comp.slots"
      :key="slotKey"
      #[slotKey]="slotProps"
    >
      <template v-if="slotVal && slotVal.children">
        <template v-if="JSON.stringify(slotProps) !== '{}'">
          <deepTreeToRender v-model="slotVal.children" :slotProps="slotProps" />
        </template>
        <deepTreeToRender v-else v-model="slotVal.children" />
      </template>
    </template>
  </component>
</template>
