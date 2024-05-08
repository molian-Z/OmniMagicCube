<script lang="ts" setup>
import { ref, inject } from 'vue'
import { clearCanvas, modelValue, globalAttrs } from '@molianComps/designer/designerData'
import svgIcon from '@molianComps/svg-icon/index.vue'
import create from '@molianComps/designer/globalDesigner/global-panel/create.vue'
import device from '@molianComps/designer/globalDesigner/global-panel/device.vue'
import setting from '@molianComps/designer/globalDesigner/global-panel/setting.vue'
import render from '@molianComps/render/index.vue'
const customComps: any = inject('customComps')
const { customPopup, customDialog } = customComps
const t: any = inject('mlLangs')

const showRenderDialog = ref(false)

</script>

<template>
  <div class="toolBar-right-container">
    <!-- 清空画布 -->
    <div class="toolBar-right-item" @click="clearCanvas">
      <svg-icon class="toolBar-right-icon" icon="clearCanvas"></svg-icon>
      {{ t('container.clearCanvas') }}
    </div>
    <!-- 预览功能 -->
    <div class="toolBar-right-item" @click="showRenderDialog = true">
      <svg-icon class="toolBar-right-icon" icon="preview"></svg-icon>
      {{ t('container.preview') }}
    </div>
    <!-- 设备功能 -->
    <customPopup width="360px">
      <div class="toolBar-right-item">
        <svg-icon class="toolBar-right-icon" icon="device"></svg-icon>
        {{ t('container.device') }}
      </div>
      <template #content>
        <device></device>
      </template>
    </customPopup>
    <!-- 生成功能 -->
    <customPopup width="220px">
      <div class="toolBar-right-item">
        <svg-icon class="toolBar-right-icon" icon="create"></svg-icon>
        {{ t('container.import/export') }}
      </div>
      <template #content>
        <create></create>
      </template>
    </customPopup>
    <!-- 全局设置 -->
    <customPopup width="220px">
      <div class="toolBar-right-item">
        <svg-icon class="toolBar-right-icon" icon="globalSetting"></svg-icon>
        {{ t('container.globalSetting') }}
      </div>
      <template #content>
        <setting></setting>
      </template>
    </customPopup>
    <slot></slot>
    <customDialog appendToBody header="效果预览" width="1200px" :close-on-click-modal="false"
      @escKeydown="showRenderDialog = false" @closeBtnClick="showRenderDialog = false"
      v-model:visible="showRenderDialog" destroyOnClose>
      <render :modelValue="modelValue" :globalAttrs="globalAttrs" />
    </customDialog>
  </div>
</template>

<style lang="scss" scoped>
.toolBar-right-container {
  display: flex;
  align-items: center;

  .toolBar-right-item {
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: var(--ml-transition-base);
    color: var(--ml-primary-color);
    margin-right: var(--ml-pd-lg);

    .toolBar-right-icon {
      cursor: pointer;
      width: 30px;
      height: 30px;
      font-size: 30px;
      transition: var(--ml-transition-base);
      fill: var(--ml-primary-color);
      margin: 0;
    }

    &:hover {
      opacity: .7;
    }
  }
}
</style>