<script setup lang="ts">
import svgIcon from '@molianComps/SvgIcon/index.vue'
import toolBarRight from './right.vue'
import { undo, redo, canRedo, canUndo } from '@molianComps/Designer/designerData'

const runUndo = () => {
  if (!!canUndo.value) undo()
}

const runRedo = () => {
  if (!!canRedo.value) redo()
}
</script>

<template>
  <div class="toolBar" @click.stop>
    <div class="toolBar-left">
      <svg-icon class="logo" icon="project_icon-Cube"></svg-icon>
      <div>
        <div class="logo-title">
          无界魔方
        </div>
        <div class="logo-desc">
          Omni Magic Cube
        </div>
      </div>
      <div class="designer-history">
        <div>
          <svg-icon :class="['css-svg-icon', !canUndo && 'disabled']" icon="undo" @click="runUndo"></svg-icon>
        </div>
        <div>
          <svg-icon :class="['css-svg-icon', !canRedo && 'disabled']" icon="undo" style="transform: rotateY(180deg);"
            @click="runRedo"></svg-icon>
        </div>
      </div>
      <slot name="left"></slot>
    </div>
    <div class="toolBar-center" v-if="$slots.center">
        <slot name="center"></slot>
    </div>
    <div class="toolBar-right">
      <!-- 右侧功能 -->
      <toolBarRight>
      <template #default="scoped">
        <slot name="right" v-bind="scoped"></slot>
      </template>
      </toolBarRight>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.toolBar {
  border-bottom: 1px solid var(--ml-border-color);
  display: flex;
  justify-content: space-between;
  min-height: 60px;
  overflow: hidden;

  .toolBar-left {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    flex-shrink: 0;

    .logo {
      width: 48px;
      height: 48px;
      font-size: 48px;
      margin: 0;
    }

    .logo-title {
      font-weight: bold;
      font-size: 18px;
      color: var(--ml-text-color-1);
      user-select: none;
    }

    .logo-desc {
      font-size: 14px;
      color: var(--ml-info-color-4);
      user-select: none;
    }

    .designer-history {
      display: flex;
      > div {
        margin: 0 10px;
      }
    }
    
    // 响应式适配
    @media (max-width: 1000px) {
      width: 140px;
      padding: 0 8px;
    }
    
    @media (max-width: 750px) {
      width: 100px;
      padding: 0 6px;
      
      .logo {
        width: 28px;
        height: 28px;
        font-size: 28px;
      }
      
      .logo-title {
        font-size: 14px;
      }
      
      .logo-desc {
        font-size: 10px;
      }

      .designer-history > div {
        margin: 0 4px;
      }
    }
    
    @media (max-width: 500px) {
      width: 60px;
      
      .logo-title,
      .logo-desc {
        display: none;
      }
    }
  }

  .toolBar-center {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 0 12px;
    flex: 1;
    min-width: 0;
    
    // 响应式适配
    @media (max-width: 750px) {
      padding: 0 6px;
    }
  }

  .toolBar-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 6px; // 已经是较小的padding
    flex:1;
    max-width: 100%; // 限制最大宽度，防止挤压中间内容
    
    @media (max-width: 750px) {
      padding: 0 4px;
    }
    
    @media (max-width: 500px) {
      padding: 0 2px;
    }
  }
}

.css-svg-icon {
  width: 18px;
  height: 18px;
  color: var(--ml-text-color-1);

  &:hover {
    color: var(--ml-primary-color);
    background-color: transparent;
  }
}



.disabled {
  color: var(--ml-text-color-5);
  background-color: transparent !important;
  &:hover{
    color: var(--ml-text-color-5);
  }
}
</style>