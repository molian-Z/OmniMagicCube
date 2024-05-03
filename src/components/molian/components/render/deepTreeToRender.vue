<script setup lang="ts">
import { defineProps } from 'vue'
import slotTemplate from './slotTemplate.vue'
import vCustomDirectives from '@molian/utils/useDirectives'
import { isIf, isFor, isShow, data2Vars } from '@molian/utils/useCore'
// import { variable } from './renderData'
const props = defineProps(<{
  modelValue: any;
  slotProps?: any;
  expandAPI?: any;
}>{
    modelValue: {
      type: Array,
      default: () => []
    },
    slotProps: {
      type: Object,
      default: () => {}
    },
    expandAPI: {
        type:Object,
         default: () => {}
    }
  })
  const newForEach = (comp:any) => {
    return data2Vars(comp.directives.for, comp.vars)
  }
</script>
<template>
  <template v-for="comp in modelValue" :key="comp.key">
    <slotTemplate :variable="comp.vars" :comp="comp" v-if="isFor(comp)"
      :key="forItem[comp.directives.for.idKey] || forIndex" v-for="(forItem, forIndex) in newForEach(comp)"
      v-show="isShow(comp)" v-on="comp.cacheOn" v-customDirectives="comp" />
    <slotTemplate :variable="comp.vars" :comp="comp" v-else-if="isIf(comp)" v-show="isShow(comp)" v-on="comp.cacheOn"
      v-customDirectives="comp" />
  </template>
</template>

<style scoped lang="scss"></style>