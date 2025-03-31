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
    </div>
    <slot name="left"></slot>
    <div class="toolBar-center">
      <div class="designer-history">
        <div>
          <svg-icon :class="['css-svg-icon', !canUndo && 'disabled']" icon="undo" @click="runUndo"></svg-icon>
        </div>
        <div>
          <svg-icon :class="['css-svg-icon', !canRedo && 'disabled']" icon="undo" style="transform: rotateY(180deg);"
            @click="runRedo"></svg-icon>
        </div>
      </div>
    </div>
    <slot name="center"></slot>
    <div class="toolBar-right">
      <!-- 右侧功能 -->
      <toolBarRight>
        <slot name="right"></slot>
      </toolBarRight>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.toolBar {
  border-bottom: 1px solid var(--ml-border-color);
  display: flex;
  justify-content: space-between;

  .toolBar-left {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    width: 170px;

    .logo {
      width: 36px;
      height: 36px;
      font-size: 36px;
      margin: 0;
    }

    .logo-title {
      font-weight: bold;
      color: var(--ml-text-color-1);
      user-select: none;
    }

    .logo-desc {
      font-size: 12px;
      color: var(--ml-info-color-4);
      user-select: none;
    }
  }

  .toolBar-center {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 0 12px;
    flex: 1;

    .designer-history{
      display: flex;
      > div{
        margin: 0 10px;
      }
    }
  }

  .toolBar-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 12px;
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