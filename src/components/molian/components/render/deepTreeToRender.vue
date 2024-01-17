<script setup lang="ts">
import { defineProps } from 'vue'
import slotTemplate from './slotTemplate.vue'
import vCustomDirectives from '@molian/utils/useDirectives'
import { isIf, isFor, isShow, getValue } from '@molian/utils/useCore'
import { variable } from './renderData'
const props = defineProps(<{
  modelValue: any;
  slotProps?: any;
}>{
    modelValue: {
      type: Array,
      default: () => []
    },
    slotProps: {
      type: Object,
      default: () => { }
    }
  })

const value = getValue(props.modelValue, variable)
</script>
<template>
  <template v-for="comp in value" :key="comp.key">
    <slotTemplate :variable="variable" :comp="comp" v-if="isFor(comp)"
      :key="forItem[comp.directives.for.idKey] || forIndex" v-for="(forItem, forIndex) in comp.directivesVariable.for"
      v-show="isShow(comp)" v-on="comp.cacheOn" v-customDirectives="comp" />
    <slotTemplate :variable="variable" :comp="comp" v-else-if="isIf(comp)" v-show="isShow(comp)" v-on="comp.cacheOn"
      v-customDirectives="comp" />
  </template>
</template>

<style scoped lang="scss"></style>