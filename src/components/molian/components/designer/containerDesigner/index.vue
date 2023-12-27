<script setup>
import { inject, computed } from 'vue'
import {
    useCloned
} from '@vueuse/core'
import deepComps from './deepTree.vue'
import treeDir from './treeDir/index.vue'
import { modelValue, hiddenAllPanel, selectedComp, createComp } from '../designerData'
import { isDraggable, resetHover, hoverComp, hoverNodes, hoverIndex, hoverBounding, dragNodes, dragIndex, dropIndex, startDraggable, resetDraggable, useDraggable } from '../draggable'
import svgIcon from '@molianComps/svg-icon/index.vue'
const comps = inject('mlComps')
const t = inject('mlLangs')
const { onDragenter, onDragend } = useDraggable()
const { top, left, right, bottom, width, height } = hoverBounding
const currentBounding = computed(() => {
    let isWidth = 360
    if (hoverComp.value) {
        let obj = {
            left: left.value + width.value / 2 <= (isWidth / 2) ? '5px' : Number(left.value - (isWidth / 2)) + width.value / 2 + 'px',
            height: 60 + 'px',
            width: isWidth + 'px'
        }
        if (top.value < 60) {
            obj.top = top.value + height.value + 'px'
        } else {
            obj.top = top.value - 60 + 'px'
        }
        return obj
    }
})

const onDrop = function (evt) {
    const name = evt.dataTransfer.getData('compName')
    if (name) {
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

const deleteComp = function () {
    if (hoverNodes.value && hoverNodes.value) {
        hoverNodes.value.splice(hoverIndex.value, 1)
    }
    console.log(hoverNodes.value, hoverIndex.value)
    resetDraggable()
}

const onClick = function () {
    selectedComp.value = null
    resetHover()
}
</script>
<template>
    <div class="container-designer">
        <div class="container-draggable-body" @dragover.prevent @dragenter.self="onDragenter(-1,modelValue)" @drop="onDrop"
            @click.self="onClick">
            <deepComps v-model="modelValue"></deepComps>
        </div>
        <!-- 组件提示栏 -->
        <div class="drag-tips" v-if="isDraggable">{{ t('container.dropContent') }}</div>
        <!-- 组件工具栏 -->
        <div class="drag-shadow" :style="currentBounding" v-if="hoverComp">
            <div class="drag-handler" draggable="true" @dragstart="startDraggable" @dragend="onDragend">
                <svgIcon icon="move"></svgIcon>
                <span>{{ t('container.moveComp') }}</span>
            </div>
            <div class="drag-appendSlot" @click.stop="appendSlots(index)">
                <svg-icon class="svg-icon-transh" icon="appendSlot"></svg-icon>
                <span>{{ t('container.appendSlot') }}</span>
            </div>
            <div class="drag-delete" @click.stop="deleteComp(index)">
                <svg-icon class="svg-icon-transh" icon="trash"></svg-icon>
                <span>{{ t('container.deleteComp') }}</span>
            </div>
        </div>
        <div class="designer-page-delete-comp" @dragover.prevent @drop="deleteComp" v-if="hiddenAllPanel && !hoverComp">
            <svg-icon class="svg-icon-transh" icon="trash"></svg-icon>
        </div>
        <treeDir></treeDir>
    </div>
</template>

<style scoped lang="scss">
@use '../../../assets/styles/global.scss';

.container-designer {
    width: 100%;
    height: 100%;
    padding: var(--ml-pd-base);

    .container-draggable-body {
        width: 100%;
        height: 100%;
        border: 5px solid var(--ml-fill-color);
        border-radius: var(--ml-radius-xlg);
        overflow-y: auto;
        overflow-x: hidden;
    }

    .drag-tips {
        position: absolute;

    }

    .drag-shadow {
        position: absolute;
        background-color: rgba(global.$bgColor, 0.15);
        box-shadow: var(--ml-shadow-lg);
        backdrop-filter: var(--ml-bg-blur-base);
        border-radius: var(--ml-radius-lg);
        display: flex;
        justify-content: space-around;
        align-items: center;
        z-index: 100;
        user-select: none;
        padding: var(--ml-pd-lg);
        transition: var(--ml-transition-base);

        .drag-handler {
            color: var(--ml-primary-color);
            font-size: 16px;
            cursor: all-scroll;
            transition: var(--ml-transition-base);

            &:hover {
                color: var(--ml-primary-color-light-hover);
            }
        }

        .drag-appendSlot {
            color: var(--ml-primary-color);
            font-size: 16px;
            transition: var(--ml-transition-base);

            &:hover {
                color: var(--ml-primary-color-light-hover);
            }
        }

        .drag-slot {
            color: var(--ml-primary-color);
            font-size: 16px;
            cursor: pointer;
            transition: var(--ml-transition-base);

            &:hover {
                color: var(--ml-primary-color-light-hover);
            }
        }

        .drag-delete {
            color: var(--ml-danger-color);
            font-size: 16px;
            cursor: pointer;
            transition: var(--ml-transition-base);

            &:hover {
                color: var(--ml-danger-color-light-hover);
            }
        }
    }

    .designer-page-delete-comp {
        position: fixed;
        bottom: 10px;
        left: 10px;
        border-radius: var(--ml-radius-circle);
        border: 1px solid var(--color-fill-3, #E5E6EB);
        background-color: rgba(global.$bgColor, 0.15);
        box-shadow: var(--ml-shadow-lg);
        backdrop-filter: var(--ml-bg-blur-base);
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