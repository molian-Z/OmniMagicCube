<script setup lang="ts">
import { defineProps, computed } from 'vue'
import slotTemplate from './slotTemplate.vue'
import vCustomDirectives from '@molian/utils/useDirectives'
import { getCurrentOn, getVariableData } from '@molian/utils/customFunction'
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

const value = computed(() => {
  return props.modelValue.map((item: { directives: { [x: string]: { [x: string]: any; type: any; value: any } }; on: { [x: string]: any }; nativeOn: { [x: string]: any } }) => {
    let directivesVariable: {
      [key: string]: any;
    } = {}
    Object.keys(item.directives).forEach(key => {
      if (!item.directives[key]) return false;
      directivesVariable[key] = getVariableData(item.directives[key], variable)
    })
    return {
      directivesVariable,
      cacheOn: getCurrentOn({ on: item.on, nativeOn: item.nativeOn }, variable),
      ...item
    }
  })
})
const isFor = (comp: { directivesVariable: any; }) => {
  const { directivesVariable } = comp
  if (!directivesVariable.for) {
    return false
  }
  return !!directivesVariable.for
}

const isIf = (comp: { directivesVariable: any; }) => {
  const { directivesVariable } = comp
  if (!directivesVariable.if && directivesVariable.if !== false || directivesVariable.if === true) {
    return true
  }
  return !!directivesVariable.if
}

const isShow = (comp: { directivesVariable: any; }) => {
  const { show } = comp.directivesVariable || null
  if (!show && show !== false || show === true) {
    return true
  }
  return !!show
}
</script>
<template>
  <template v-for="comp in value" :key="comp.key">
    <slotTemplate :variable="variable" :comp="comp" v-if="isIf(comp) && isFor(comp)"
      :key="forItem[comp.directives.for.idKey] || forIndex" v-for="(forItem, forIndex) in comp.directivesVariable.for"
      v-show="isShow(comp)" v-on="comp.cacheOn" v-customDirectives="comp" />
    <slotTemplate :variable="variable" :comp="comp" v-else-if="isIf(comp)" v-show="isShow(comp)" v-on="comp.cacheOn"
      v-customDirectives="comp" />
  </template>
</template>

<style scoped lang="scss"></style>