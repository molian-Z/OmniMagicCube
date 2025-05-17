<script lang="ts" setup>
import { memoize } from "es-toolkit";
import { getCurrentOn } from '@molian/utils/customFunction'
import { createSlot } from "@molian/utils/useCore";
const props = defineProps({
  comp: {
    type: Object,
    default: () => {},
  },
  slotData: {
    type: Object,
    default: () => {},
  },
  expandAPI: {
    type: Object,
    default: () => {},
  },
  modelValue: {
    type: Array,
    default: () => [],
  },
  interInc: {
    type: Object,
    default: () => {}
  }
})
const { variable, originVariable } = props.interInc
// 优化 memoize 函数的缓存键生成
const getOn = memoize((item: any, index: number) => {
  return getCurrentOn(
    { 
      on: props.comp.on, 
      nativeOn: props.comp.nativeOn 
    }, 
    variable.value, 
    originVariable.value, 
    createSlot(item, index, props.comp, props.slotData), 
    props.expandAPI
  );
});
const idKey = computed(() => props.comp.directives.for.idKey);
</script>

<template>
  <template
    v-for="(item, index) in modelValue"
    :key="item[idKey] || index"
  >
    <slot
      v-memo="[idKey ? (item as any)?.[idKey.value] : undefined, getOn(item, index)]"
      :slotData="createSlot(item, index, comp, slotData)"
      :cacheOn="getOn(item, index)"
    ></slot>
  </template>
</template>

<style></style>
