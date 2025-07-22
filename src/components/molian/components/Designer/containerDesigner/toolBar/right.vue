<script setup lang="ts">
import { ref, inject, computed, onMounted, onUnmounted } from 'vue'
import { clearCanvas, modelValue, globalAttrs } from '@molianComps/Designer/designerData'
import svgIcon from '@molianComps/SvgIcon/index.vue'
import create from '@molianComps/Designer/globalDesigner/globalPanel/create.vue'
import device from '@molianComps/Designer/globalDesigner/globalPanel/device.vue'
import setting from '@molianComps/Designer/globalDesigner/globalPanel/setting.vue'
import render from '@/components/molian/components/Render/index.vue'
import {useI18n} from 'vue-i18n'
const {t} = useI18n()
const customComps: any = inject('customComps')
const { customPopup, customDialog } = customComps

const showRenderDialog = ref(false)

const renderCode = () => {
    return JSON.parse(JSON.stringify(modelValue.value))
}

// 添加响应式宽度检测
const containerWidth = ref(0)
const isCompactMode = computed(() => containerWidth.value < 1000) // 从800调整到1000
const isMinimalMode = computed(() => containerWidth.value < 750)   // 从600调整到750
const isUltraCompactMode = computed(() => containerWidth.value < 500) // 新增超紧凑模式

// 监听容器宽度变化
const updateWidth = () => {
  const container = document.querySelector('.toolBar')
  if (container) {
    containerWidth.value = container.clientWidth
  }
}

onMounted(() => {
  updateWidth()
  window.addEventListener('resize', updateWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWidth)
})

</script>

<template>
  <div class="toolBar-right-container" :class="{
    'compact-mode': isCompactMode,
    'minimal-mode': isMinimalMode,
    'ultra-compact-mode': isUltraCompactMode
  }">
    <!-- 清空画布 -->
    <div class="toolBar-right-item" @click="clearCanvas" 
         :title="isMinimalMode ? t('container.clearCanvas') : ''">
      <svg-icon class="toolBar-right-icon" icon="clearCanvas"></svg-icon>
      <div class="toolBar-right-text" v-show="!isMinimalMode">{{ t('container.clearCanvas') }}</div>
    </div>
    <!-- 预览功能 -->
    <div class="toolBar-right-item" @click="showRenderDialog = true"
         :title="isMinimalMode ? t('container.preview') : ''">
      <svg-icon class="toolBar-right-icon" icon="preview"></svg-icon>
      <div class="toolBar-right-text" v-show="!isMinimalMode">{{ t('container.preview') }}</div>
    </div>
    <!-- 设备功能 -->
    <customPopup width="360px">
      <div class="toolBar-right-item" :title="isMinimalMode ? t('container.device') : ''">
        <svg-icon class="toolBar-right-icon" icon="device"></svg-icon>
        <div class="toolBar-right-text" v-show="!isMinimalMode">{{ t('container.device') }}</div>
      </div>
      <template #content>
        <device></device>
      </template>
    </customPopup>
    <!-- 生成功能 - 在超紧凑模式下可能需要隐藏 -->
    <customPopup width="220px" v-show="!isUltraCompactMode">
      <div class="toolBar-right-item" :title="isMinimalMode ? t('container.import/export') : ''">
        <svg-icon class="toolBar-right-icon" icon="create"></svg-icon>
        <div class="toolBar-right-text" v-show="!isMinimalMode">{{ t('container.import/export') }}</div>
      </div>
      <template #content>
        <create></create>
      </template>
    </customPopup>
    <!-- 全局设置 -->
    <customPopup width="220px">
      <div class="toolBar-right-item" :title="isMinimalMode ? t('container.globalSetting') : ''">
        <svg-icon class="toolBar-right-icon" icon="globalSetting"></svg-icon>
        <div class="toolBar-right-text" v-show="!isMinimalMode">{{ t('container.globalSetting') }}</div>
      </div>
      <template #content>
        <setting></setting>
      </template>
    </customPopup>
    <slot :mini="isMinimalMode"></slot>
    <customDialog appendToBody header="效果预览" width="1200px" :close-on-click-modal="false"
      @escKeydown="showRenderDialog = false" @closeBtnClick="showRenderDialog = false"
      v-model:visible="showRenderDialog" destroyOnClose>
      <div class="render-container"> 
        <render :modelValue="renderCode()" :expandAPI="{test:()=>{}}" :globalAttrs="globalAttrs" />
      </div>
    </customDialog>
  </div>
</template>

<style lang="scss" scoped>
.toolBar-right-container {
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  overflow: hidden; // 防止溢出
  flex-wrap: wrap; // 允许换行
  max-height: 80px; // 限制最大高度为两行

  :deep(.toolBar-right-item) {
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: var(--ml-transition-base);
    color: var(--ml-primary-color);
    margin-right: var(--ml-pd-lg);
    margin-bottom: 4px; // 添加底部间距，为换行做准备
    position: relative;
    flex-shrink: 0; // 防止压缩

    .toolBar-right-icon {
      cursor: pointer;
      width: 30px;
      height: 30px;
      font-size: 30px;
      transition: var(--ml-transition-base);
      fill: var(--ml-primary-color);
      margin: 0;
    }

    .toolBar-right-text {
      text-wrap: nowrap;
      margin-left: 4px;
      transition: all 0.3s ease;
      font-size: 16px;
    }

    &:hover {
      opacity: .7;
    }
  }

  // 紧凑模式样式 (< 1000px)
  &.compact-mode {
    :deep(.toolBar-right-item) {
      margin-right: calc(var(--ml-pd-lg) * 0.6); // 进一步减少间距
      
      .toolBar-right-text {
        font-size: 14px;
        margin-left: 2px; // 减少文字间距
      }
    }
  }

  // 最小模式样式 (< 750px)
  &.minimal-mode {
    flex-wrap: wrap; // 确保在最小模式下可以换行
    align-content: flex-start; // 内容从顶部开始排列
    
    :deep(.toolBar-right-item) {
      margin-right: calc(var(--ml-pd-lg) * 0.4); // 更小间距
      margin-bottom: 2px; // 减少行间距
    }
  }

  // 超紧凑模式样式 (< 500px)
  &.ultra-compact-mode {
    flex-wrap: wrap; // 强制换行
    align-content: flex-start;
    max-height: 70px; // 在超紧凑模式下稍微减少高度
    
    :deep(.toolBar-right-item) {
      margin-right: calc(var(--ml-pd-lg) * 0.3); // 最小间距
      margin-bottom: 1px; // 最小行间距
      
      .toolBar-right-icon {
        width: 24px; // 在超紧凑模式下减小图标尺寸
        height: 24px;
        font-size: 24px;
      }
    }
  }
}

.render-container {
  height: 60vh;
  overflow: auto;
}
</style>