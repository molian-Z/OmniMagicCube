<script setup lang="ts">
import { defineProps } from 'vue'
import slotTemplate from './slotTemplate.vue'
import vCustomDirectives from '@molian/utils/useDirectives'
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
  return props.modelValue.map((item: { directives: { [x: string]: { [key: string]: any; type: string; value: (string | number)[]; }; }; }) => {
    let directivesVariable: {
      [key: string]: any;
    } = {}
    Object.keys(item.directives).forEach(key => {
      if(!item.directives[key]) return false;
      const { type, value } = item.directives[key]
      let obj = variable.value
      if (type === 'variable') {
        value.forEach((item: string | number, index: number) => {
          if (index === 0) {
            obj = obj[item].value
          } else {
            obj = obj[item]
          }
        })
      }
      directivesVariable[key] = obj
    })
    return {
      directivesVariable,
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
  console.log(directivesVariable.if)
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
    <slotTemplate :variable="variable" :comp="comp" v-if="isIf(comp) && isFor(comp)" :key="forItem[comp.directives.for.idKey] || forIndex" v-for="(forItem, forIndex) in comp.directivesVariable.for" v-show="isShow(comp)"
      v-customDirectives="comp" />
    <slotTemplate :variable="variable" :comp="comp" v-else-if="isIf(comp)" v-show="isShow(comp)"
      v-customDirectives="comp" />
  </template>
</template>

<style scoped lang="scss"></style>