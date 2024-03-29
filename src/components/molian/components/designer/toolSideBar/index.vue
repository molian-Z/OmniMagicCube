<script setup lang="ts">
import globalTool from '@molianComps/designer/globalTool/index.vue'
import cssDesigner from '@molianComps/designer/cssDesigner/index.vue'
import optionsDesigner from '@molianComps/designer/optionsDesigner/index.vue'
import AIContent from './AIContent.vue'
import { globalMenu } from '@molianComps/designer/designerData'

const currentComponent = computed(() => {
  if (globalMenu.value === 'style') {
    return cssDesigner
  } else if (globalMenu.value === 'option') {
    return optionsDesigner
  }
  return ''
})

</script>

<template>
  <div class="toolSideBar">
    <div class="toolSideBar__header">
      <globalTool></globalTool>
    </div>
    <div class="toolSideBar__body">
      <div class="toolSideBar__body-content">
        <transition name="fade">
          <component :is="currentComponent"></component>
        </transition>
      </div>
      <div class="toolSideBar__body-footer">
        <AIContent></AIContent>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.toolSideBar {
  height: 100%;
  border-left: 1px solid var(--ml-border-color);
  width: 330px;

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