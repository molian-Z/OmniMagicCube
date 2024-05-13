<script setup lang="ts">
import { ref, onMounted, watch, defineExpose, defineOptions, defineProps } from 'vue'
import * as echarts from 'echarts'

const modules = import.meta.glob('./model/*.ts', { eager: true })
const typeMap = ref<any>({})
defineOptions({
    name: "MlEcharts",
})
const props = defineProps({
    type: {
        type: String,
        default: 'bar',
        optionItems: ['bar', 'line', 'pie', 'gauge']
    },
    modelValue: {
        type: [Object, Array],
        default: () => {
            return []
        }
    },
    width:{
        type: String,
        default: '100%'
    },
    height:{
        type: String,
        default: '150px'
    },
    xAxisType:{
        type: String,
        default: 'category',
        optionItems: ['category', 'value', 'time', 'log'],
        hidden: function(attrs:any){
            return ['bar', 'line'].indexOf(attrs.type.value) === -1
        }
    },
    yAxisType:{
        type: String,
        default: 'value',
        optionItems: ['category', 'value', 'time', 'log'],
        hidden: function(attrs:any){
            return ['bar', 'line'].indexOf(attrs.type.value) === -1
        }
    },
    axisData:{
        type:Array,
        default: () => [],
        hidden: function(attrs:any){
            return ['bar', 'line'].indexOf(attrs.type.value) === -1
        }
    },
    showTooltip:{
        type: Boolean,
        default: true
    },
    showXAxis:{
        type: Boolean,
        default: true,
        hidden: function(attrs:any){
            return ['bar', 'line'].indexOf(attrs.type.value) === -1
        }
    },
    showYAxis:{
        type: Boolean,
        default: true,
        hidden: function(attrs:any){
            return ['bar', 'line'].indexOf(attrs.type.value) === -1
        }
    },
    showBackground:{
        type: Boolean,
        default: true,
        hidden: function(attrs:any){
            return ['bar', 'line'].indexOf(attrs.type.value) === -1
        }
    },
    barWidth:{
        type: Number,
        default: 6,
        hidden: function(attrs:any){
            return ['bar'].indexOf(attrs.type.value) === -1
        }
    },
    borderRadius:{
        type: Number,
        default: 0,
        hidden: function(attrs:any){
            return ['bar'].indexOf(attrs.type.value) === -1
        }
    },
    isCircle:{
        type: Boolean,
        default: false,
        hidden: function(attrs:any){
            return ['pie'].indexOf(attrs.type.value) === -1
        }
    },
    isStack:{
        type: Boolean,
        default: false,
        hidden: function(attrs:any){
            return ['bar', 'line'].indexOf(attrs.type.value) === -1
        }
    },
    selectedColor:{
        type:String,
        default:'colors1',
        optionItems: ['colors1', 'colors2', 'colors3', 'colors4', 'colors5']
    }, 
    options:{
        type:Object,
        default: () => {
            return {}
        }
    },
})

const echartDom = ref()
let echartData:any = {}
onMounted(() => {
    for (const file in modules) {
        const modulesName = file.replace('./model/', '').replace('.ts', '')
        const res: any = modules[file]
        if (!!res.default) {
            typeMap.value[modulesName] = res.default
        }
    }
    echartData = echarts.init(echartDom.value)
    watch(() => props, (newVal) => {
        setData(newVal)
    }, {
        immediate: true,
        deep:true
    })
})
const setData = (data: any) => {
    nextTick(() => {
        echartData.setOption(typeMap.value[props.type](data))
    })
}

defineExpose({
    echartDom,
    echartData
})
</script>

<template>
    <div ref="echartDom" :style="{width: `${props.width}`, height: `${props.height}`}" />
</template>