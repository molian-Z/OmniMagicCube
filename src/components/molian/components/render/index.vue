<script setup lang="ts">
import { defineProps, watch, onUnmounted } from 'vue'
import { useCloned, useStyleTag } from '@vueuse/core'
import renderTree from './deepTreeToRender.vue'
import { asyncFunction } from '@molian/utils/asyncFunction'
import { createCss } from '@molian/utils/css-generator'
import { renderRef, variable } from './renderData'
const props = defineProps(<{
  modelValue: any
  globalAttrs: any
}>{
    modelValue: {
      type: Array,
      default: () => []
    },
    globalAttrs: {
      type: Object,
      default: () => { }
    }
  })
// 渲染数据
const renderData = ref<Ref[]>([])
// 生命周期
const lifecycle = ref<{ [key: string]: any }>({})
// 注册css
const {
  id,
  css,
  load,
  unload,
  isLoaded,
} = useStyleTag('')

watch(() => props.globalAttrs, (newVal) => {
  const { cloned } = useCloned(newVal)
  variable.value = cloned.value.variable
  lifecycle.value = cloned.value.lifecycle
}, {
  immediate: true
})

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

defineExpose({
  renderRef,
  variable
})
</script>

<template>
  <renderTree :modelValue="renderData"></renderTree>
</template>