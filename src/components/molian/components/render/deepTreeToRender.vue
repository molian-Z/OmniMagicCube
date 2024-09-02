<script setup lang="ts">
import { defineProps, computed } from "vue";
import slotTemplate from "./SlotTemplate.vue";
import vCustomDirectives from "@molian/utils/useDirectives";
import { isIf, isFor, isShow, data2Vars, getValue } from "@molian/utils/useCore";
import { variable, originVariable } from "./renderData";
const props = defineProps(<
  {
    modelValue: any;
    expandAPI?: any;
    slotData: {
      [key: string]: any;
    };
  }
>{
  modelValue: {
    type: Array,
    default: () => [],
  },
  expandAPI: {
    type: Object,
    default: () => {},
  },
  slotData: {
    type: Object,
    default: () => {},
  },
});
const renderData = computed(() => {
  return getValue(props.modelValue, variable.value, props.expandAPI, props.slotData, originVariable.value);
});
const newForEach = (comp: any) => {
  return data2Vars(comp.directives.for, variable.value);
};
</script>
<template>
  <template v-for="comp in renderData" :key="comp.key">
    <slotTemplate
      :comp="comp"
      :expandAPI="expandAPI"
      :slotData="slotData"
      v-if="isFor(comp)"
      :key="forItem[comp.directives.for.idKey] || forIndex"
      v-for="(forItem, forIndex) in newForEach(comp)"
      v-show="isShow(comp)"
      v-on="comp.cacheOn"
      v-customDirectives="{ comp, $slot: slotData }"
    />
    <slotTemplate
      :comp="comp"
      :expandAPI="expandAPI"
      :slotData="slotData"
      v-else-if="isIf(comp)"
      v-show="isShow(comp)"
      v-on="comp.cacheOn"
      v-customDirectives="{ comp, $slot: slotData }"
    />
  </template>
</template>
