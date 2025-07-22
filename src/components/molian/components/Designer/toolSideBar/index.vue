<script setup lang="ts">
import globalTool from '@molianComps/Designer/globalTool/index.vue'
import cssDesigner from '@molianComps/Designer/cssDesigner/index.vue'
import optionsDesigner from '@molianComps/Designer/optionsDesigner/index.vue'
import actionDesigner from '@molianComps/Designer/actionDesigner/index.vue'
// import AIContent from './AIContent.vue'
import { globalMenu } from '@molianComps/Designer/designerData'

const currentComponent = computed(() => {
    if (globalMenu.value === 'style') {
        return cssDesigner
    } else if (globalMenu.value === 'option') {
        return optionsDesigner
    }else if (globalMenu.value === 'action'){
        return actionDesigner
    }
    return ''
})

</script>

<template>
    <div class="toolSideBar" @click.stop>
        <div class="toolSideBar__header">
            <globalTool></globalTool>
        </div>
        <div class="toolSideBar__body">
            <div class="toolSideBar__body-content">
                <transition name="fade">
                    <keep-alive>
                        <component :is="currentComponent" />
                    </keep-alive>
                </transition>
            </div>
            <!-- <div class="toolSideBar__body-footer">
                <AIContent></AIContent>
            </div> -->
        </div>
    </div>
</template>

<style lang="scss" scoped>
.toolSideBar {
    height: 100%;
    box-shadow: -1px 0px 2px rgba(0, 0, 0, 0.07), -1px 0 1px rgba(0, 0, 0, 0.05);
    width: 320px;

    .toolSideBar__header {
        background-color: var(--ml-bg-color);
        position: relative;
        z-index: 1;
    }

    .toolSideBar__body {
        display: flex;
        align-items: center;
        flex-direction: column;
        height: calc(100% - 58px);

        .toolSideBar__body-content {
            overflow: auto;
            width: 100%;
            flex: 1;
        }

        .toolSideBar__body-footer {
            position: relative;
            z-index: 2;
            margin-top: var(--ml-mg-base);
            width: 100%;
            background-color: var(--ml-bg-color);
        }
    }
}
</style>