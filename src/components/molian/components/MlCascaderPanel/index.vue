<script setup lang="ts">
import { defineOptions, defineProps, inject, useAttrs } from "vue";
defineOptions({
  name: "MlCascaderPanel",
  inheritAttrs: false,
})

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  options:{
    type: Array,
    default: () => []
  },
})

const attrs = useAttrs()
const cmtdAttrs = computed(() =>{
    const newAttrs:any = {}
    Object.keys(attrs).forEach((key:string) =>{
        newAttrs[key] = attrs[key]
    })
    return newAttrs
})
const t: any = inject("mlLangs")
const customComps: any = inject("customComps")
const { customInput } = customComps
</script>

<template>
    <div class="ml-cascader-panel" :class="attrs.class">
      <customInput v-bind="cmtdAttrs">
        <template #suffix>
          <span class="suffix-tag">
              <svg-icon icon="ic-arraw"></svg-icon>
          </span>
        </template>
      </customInput>
    </div>
  </template>
  
  <style lang="scss" scoped>
  .ml-cascader {
    line-height: (var(--ml-line-height), 32px);
  }
  </style>
  