<script setup lang="ts">
import { defineProps, computed, reactive, watch, ref, onUnmounted } from 'vue'
import { useCloned, useStyleTag } from '@vueuse/core'
import renderTree from './deepTreeToRender.vue'
import {asyncFunction} from '@molian/utils/asyncFunction'
import { createCss } from '@molian/utils/css-generator'
const props = defineProps(<{
  modelValue: any
}>{
    modelValue: {
      type: Array,
      default: () => []
    }
  })

// 数据变量
const variables = reactive({})
// 全局变量
// 渲染数据
const renderData = ref<Ref[]>([])

// 全局组件Ref
const compsRef:{
  [key:string]:any
} = reactive({})
const setRef = (el: any, comp: any) => {
  compsRef[comp.key] = el
}

// 注册css
// const globalCss = computed(()=>{
//   return createCss(renderData.value)
// })
const {
  id,
  css,
  load,
  unload,
  isLoaded,
} = useStyleTag('')

console.log(id)
watch(() => props.modelValue, (newVal) => {
  const { cloned } = useCloned(newVal)
  renderData.value = cloned.value
  css.value = createCss(cloned.value)
}, {
  immediate: true
})

onUnmounted(() => {
  unload()
})
</script>

<template>
  <renderTree :modelValue="renderData" :variables="variables" :setRef="setRef"></renderTree>
</template>