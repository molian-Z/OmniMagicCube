<script setup lang="ts">
import { ref, inject } from 'vue'
import {
    useCloned, useElementSize
} from '@vueuse/core'
import deepComps from './deepTreeToDesigner.vue'
import toolTip from './toolTip/index.vue'
import toolBar from './toolBar/index.vue'
import { modelValue, selectedComp, createComp, screenRatioInfo } from '../designerData'
import { resetHover, dragNodes, dragIndex, dropIndex, resetDraggable, onDragenter } from '../draggable'
import { calculateRatio, scaleCalculate } from '@molian/utils/util'
const comps: any = inject('mlComps')
const t: any = inject('mlLangs')
const containerRef = ref()
const onDrop = function (evt: any) {
    const name = evt.dataTransfer.getData('compName')
    const isCreate = evt.dataTransfer.getData('isCreate')
    if (!!isCreate) {
        const { cloned } = useCloned(createComp(comps.value[name]))
        if (dropIndex.value !== null) {
            modelValue.value.splice(dropIndex.value, 0, cloned.value)
        } else {
            modelValue.value.push(cloned.value)
        }
    } else {
        let moveComp = dragNodes.value?.splice(dragIndex.value, 1)[0]
        if (moveComp) {
            modelValue.value.splice(dropIndex.value, 0, moveComp)
        }
    }
    resetDraggable()
}

const onClick = function () {
    selectedComp.value = null
    resetHover()
}
const containerSize = useElementSize(containerRef)
const layoutSize = computed(() => {
    const { width, height, rotate } = screenRatioInfo.value
    const elWidth = containerSize.width
    const elHeight = containerSize.height
    const { heightRatio, widthRatio } = calculateRatio(!!rotate ? height : width, !!rotate ? width : height)
    const divisorX = Math.floor(elWidth.value / widthRatio)
    const divisorY = Math.floor(elHeight.value / heightRatio)
    let newDivisor = divisorX < divisorY ? divisorX : divisorY
    return {
        autoDivisor: newDivisor,
        width: newDivisor * widthRatio,
        height: newDivisor * heightRatio,
        widthRatio,
        heightRatio
    }
})

// 按比例更新Cover背景
const getCoverStyle = function (cover: { left: any; width: any; top: any; height: any; borderRadius: any }) {
    const { left, width, top, height, borderRadius } = cover
    const { rotate } = screenRatioInfo.value
    if (!!rotate) {
        const widthAndHeight = scaleCalculate(screenRatioInfo.value.width, screenRatioInfo.value.height, height, width, layoutSize.value.height, layoutSize.value.width)
        const leftAndTop = scaleCalculate(screenRatioInfo.value.width, screenRatioInfo.value.height, top, left, layoutSize.value.height, layoutSize.value.width)
        return {
            borderRadius: [borderRadius[3], borderRadius[1], borderRadius[0], borderRadius[2]].map((item: string) => item + 'px').join(' '),
            top: leftAndTop.y - 2.5 + 'px',
            height: widthAndHeight.y - 2.5 + 'px',
            right: leftAndTop.x + 'px',
            width: widthAndHeight.x + 'px'
        }
    } else {
        const widthAndHeight = scaleCalculate(screenRatioInfo.value.width, screenRatioInfo.value.height, width, height, layoutSize.value.width, layoutSize.value.height)
        const leftAndTop = scaleCalculate(screenRatioInfo.value.width, screenRatioInfo.value.height, left, top, layoutSize.value.width, layoutSize.value.height)
        return {
            borderRadius: borderRadius.map((item: string) => item + 'px').join(' '),
            left: leftAndTop.x - 2.5 + 'px',
            width: widthAndHeight.x - 2.5 + 'px',
            top: leftAndTop.y + 'px',
            height: widthAndHeight.y + 'px'
        }
    }
}

const confirmDropContainer = async() =>{
   onDragenter(-1, modelValue, null, modelValue)
}
</script>
<template>
    <div class="container-designer" @click="onClick">
        <div class="container-body">
            <toolBar class="container-toolbar" >
                <template v-slot:left>
                    <slot name="toolbar-left"></slot>
                </template>
                <template v-slot:center>
                    <slot name="toolbar-center"></slot>
                </template>
                <template v-slot:right>
                    <slot name="toolbar-right"></slot>
                </template>
            </toolBar>
            <div class="container-main" ref="containerRef">
                <div class="container-draggable-body"
                    :style="{ width: layoutSize.width + 'px', height: layoutSize.height + 'px' }" @dragover.prevent
                    @dragenter.self="confirmDropContainer" @drop="onDrop">
                    <deepComps v-model="modelValue"></deepComps>
                    <div class="container-draggable-cover" :style="getCoverStyle(item)" :key="index"
                        v-for="(item, index) in screenRatioInfo.coverBackground"
                        v-if="!!screenRatioInfo.coverBackground && screenRatioInfo.coverBackground.length > 0"></div>
                </div>
            </div>
        </div>
        <!-- 组件提示栏 -->
        <!-- <div class="drag-tips" v-if="isDraggable">{{ t('container.dropContent') }}</div> -->
        <!-- 组件工具栏 -->
        <toolTip></toolTip>
    </div>
</template>

<style scoped lang="scss">
@use '../../../assets/styles/global.scss';

.container-designer {
    width: 100%;
    height: 100%;
    flex:1;

    .container-body {
        height: 100%;
        width: 100%;

        .container-toolbar {
            height: 42px;
        }

        .container-main {
            height: calc(100% - 42px);
            width: 100%;
            position: relative;
            padding: var(--ml-pd-lg);
        }
    }

    .container-draggable-body {
        border: 5px solid var(--ml-fill-color);
        border-radius: var(--ml-radius-xlg);
        overflow-y: auto;
        overflow-x: hidden;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        transition: var(--ml-transition-base);
    }

    .container-draggable-cover {
        background-color: black;
        position: absolute;
        z-index: 1001;
    }

    .drag-tips {
        position: absolute;

    }

    .designer-page-delete-comp {
        position: fixed;
        bottom: 10px;
        left: 10px;
        border-radius: var(--ml-radius-circle);
        border: 1px solid var(--color-fill-3, #E5E6EB);
        background-color: rgba(global.$bgColor, 0.15);
        box-shadow: var(--ml-shadow-lg);
        backdrop-filter: saturate(150%) var(--ml-bg-blur-base);
        display: flex;
        justify-content: center;
        align-items: center;
        width: 68px;
        height: 68px;


        .svg-icon-transh {
            color: var(--ml-danger-color);
            font-size: 26px;
        }
    }
}
</style>