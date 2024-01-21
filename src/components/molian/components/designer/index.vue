<script setup lang="ts">
import { defineProps } from 'vue'
import { hiddenAllPanel, selectedComp } from './designerData'
import globalTool from './globalTool/index.vue'
import cssDesigner from './cssDesigner/index.vue'
import containerDesigner from './containerDesigner/index.vue'
import compsDesigner from './compsDesigner/index.vue'
import optionsDesigner from './optionsDesigner/index.vue'
import actionDesigner from './actionDesigner/index.vue'
import globalDesigner from './globalDesigner/index.vue'
import treeDir from './tools/treeDir/index.vue'
import aiIm from './tools/aiIm/index.vue'
defineProps({
    width: {
        type: String,
        default: '100vw'
    },
    height: {
        type: String,
        default: '100vh'
    }
})
</script>
<template>
    <div class="designer-page" :style="{ width, height }">
        <div :style="`display:${hiddenAllPanel ? 'none' : 'block'};`">
            <globalTool></globalTool>
            <css-designer></css-designer>
            <options-designer></options-designer>
            <actionDesigner></actionDesigner>
            <global-designer></global-designer>
            <comps-designer :style="`display:${selectedComp ? 'none' : 'block'}`"></comps-designer>
        </div>
        <container-designer></container-designer>
        <treeDir></treeDir>
        <ai-im></ai-im>
    </div>
</template>
<style lang="scss">
.designer-page {
    *,
    *:before,
    *:after {
        box-sizing: border-box;
    }
}</style>