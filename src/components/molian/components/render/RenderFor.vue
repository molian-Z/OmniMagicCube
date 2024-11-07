<script lang="ts" setup>
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
const getOn = (item: any, index:number) => {
    return getCurrentOn({ on: props.comp.on, nativeOn: props.comp.nativeOn }, variable.value, originVariable.value, createSlot(item,index, props.comp, props.slotData), props.expandAPI)
}
</script>

<template>
  <template
    v-for="(item, index) in modelValue"
    :key="item[comp.directives.for.idKey] || index"
  >
    <slot :slotData="createSlot(item, index, comp, slotData)" :cacheOn="getOn(item, index)"></slot>
  </template>
</template>

<style></style>
