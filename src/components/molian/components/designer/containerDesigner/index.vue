<script setup lang="ts">
import { inject } from 'vue'
import {
    useCloned
} from '@vueuse/core'
import deepComps from './deepTreeToDesigner.vue'
import treeDir from './treeDir/index.vue'
import aiIm from './aiIm/index.vue'
import toolTip from './toolTip/index.vue'
import { modelValue, hiddenAllPanel, selectedComp, createComp } from '../designerData'
import { isDraggable, resetHover, hoverComp, hoverNodes, hoverIndex, dragNodes, dragIndex, dropIndex, resetDraggable, useDraggable } from '../draggable'
import svgIcon from '@molianComps/svg-icon/index.vue'
const comps:any = inject('mlComps')
const t:any = inject('mlLangs')
const { onDragenter } = useDraggable(null, null, null)

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

const deleteComp = function () {
    if (hoverNodes.value && hoverNodes.value) {
        hoverNodes.value.splice(hoverIndex.value, 1)
    }
    resetDraggable()
}

const onClick = function () {
    selectedComp.value = null
    resetHover()
}
</script>
<template>
    <div class="container-designer">
        <div class="container-draggable-body" @dragover.prevent @dragenter.self="onDragenter(-1, modelValue)" @drop="onDrop"
            @click.self="onClick">
            <deepComps v-model="modelValue"></deepComps>
        </div>
        <!-- 组件提示栏 -->
        <div class="drag-tips" v-if="isDraggable">{{ t('container.dropContent') }}</div>
        <!-- 组件工具栏 -->
        <toolTip :deleteComp="deleteComp"></toolTip>
        <div class="designer-page-delete-comp" @dragover.prevent @drop="deleteComp" v-if="hiddenAllPanel && !hoverComp">
            <svg-icon class="svg-icon-transh" icon="trash"></svg-icon>
        </div>
        <treeDir></treeDir>
        <ai-im></ai-im>
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