<script lang="ts" setup>
import { ref, inject } from 'vue'
import { clearCanvas, modelValue, globalAttrs } from '@molianComps/Designer/designerData'
import svgIcon from '@molianComps/SvgIcon/index.vue'
import create from '@molianComps/Designer/globalDesigner/global-panel/create.vue'
import device from '@molianComps/Designer/globalDesigner/global-panel/device.vue'
import setting from '@molianComps/Designer/globalDesigner/global-panel/setting.vue'
import render from '@/components/molian/components/Render/index.vue'
import {useI18n} from 'vue-i18n'
const {t} = useI18n()
const customComps: any = inject('customComps')
const { customPopup, customDialog } = customComps

const showRenderDialog = ref(false)

const renderCode = () => {
    return JSON.parse(JSON.stringify(modelValue.value))
}

</script>

<template>
  <div class="toolBar-right-container">
    <!-- 清空画布 -->
    <div class="toolBar-right-item" @click="clearCanvas">
      <svg-icon class="toolBar-right-icon" icon="clearCanvas"></svg-icon>
      <div class="toolBar-right-text">{{ t('container.clearCanvas') }}</div>
    </div>
    <!-- 预览功能 -->
    <div class="toolBar-right-item" @click="showRenderDialog = true">
      <svg-icon class="toolBar-right-icon" icon="preview"></svg-icon>
      <div class="toolBar-right-text">{{ t('container.preview') }}</div>
    </div>
    <!-- 设备功能 -->
    <customPopup width="360px">
      <div class="toolBar-right-item">
        <svg-icon class="toolBar-right-icon" icon="device"></svg-icon>
        <div class="toolBar-right-text">{{ t('container.device') }}</div>
      </div>
      <template #content>
        <device></device>
      </template>
    </customPopup>
    <!-- 生成功能 -->
    <customPopup width="220px">
      <div class="toolBar-right-item">
        <svg-icon class="toolBar-right-icon" icon="create"></svg-icon>
        <div class="toolBar-right-text">{{ t('container.import/export') }}</div>
      </div>
      <template #content>
        <create></create>
      </template>
    </customPopup>
    <!-- 全局设置 -->
    <customPopup width="220px">
      <div class="toolBar-right-item">
        <svg-icon class="toolBar-right-icon" icon="globalSetting"></svg-icon>
        <div class="toolBar-right-text">{{ t('container.globalSetting') }}</div>
      </div>
      <template #content>
        <setting></setting>
      </template>
    </customPopup>
    <slot></slot>
    <customDialog appendToBody header="效果预览" width="1200px" :close-on-click-modal="false"
      @escKeydown="showRenderDialog = false" @closeBtnClick="showRenderDialog = false"
      v-model:visible="showRenderDialog" destroyOnClose>
      <render :modelValue="renderCode()" :expandAPI="{test:()=>{}}" :globalAttrs="globalAttrs" />
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

    .toolBar-right-text{
        text-wrap: nowrap;
    }

    &:hover {
      opacity: .7;
    }
  }
}
</style>