<script setup lang="ts">
import { defineProps, watch, onUnmounted } from 'vue'
import { getVariableData } from '@molian/utils/customFunction'
import { useCloned, useStyleTag } from '@vueuse/core'
import renderTree from './deepTreeToRender.vue'
import { runLifecycle } from '@molian/utils/customFunction'
import { createCss } from '@molian/utils/css-generator'
import { renderRef, variable } from './renderData'
import { getValue } from '@molian/utils/useCore'
const props = defineProps(<{
    modelValue: any
    globalAttrs: any
    expandAPI: any
}>{
        modelValue: {
            type: Array,
            default: () => []
        },
        globalAttrs: {
            type: Object,
            default: () => { }
        },
        expandAPI: {
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
    variable.value = getVariableData(newVal.variable, props.expandAPI)
    lifecycle.value = newVal.lifecycle
    // 执行生命周期
    runLifecycle(lifecycle, variable.value, props.expandAPI)
}, {
    immediate: true
})

watch(() => props.modelValue, (newVal) => {
    const { cloned } = useCloned(newVal)
    renderData.value = getValue(cloned.value, variable.value, props.expandAPI)
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
    <renderTree :modelValue="renderData" :expandAPI="expandAPI"></renderTree>
</template>