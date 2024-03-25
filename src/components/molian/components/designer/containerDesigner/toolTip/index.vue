<script setup lang="ts">
import { computed, inject } from 'vue'
import { hoverComp, hoverBounding, startDraggable, useDraggable } from '../../draggable'
import svgIcon from '@molianComps/svg-icon/index.vue'

const t: any = inject('mlLangs')
const { onDragend } = useDraggable(null, null, null)
const { top, left, width, height } = hoverBounding
const comps: any = inject('mlComps')
const currentBounding = computed(() => {
  let isWidth = 160
  if (hoverComp.value) {
    let obj: any = {
      //left: left.value + width.value / 2 <= (isWidth / 2) ? '5px' : Number(left.value - (isWidth / 2)) + width.value / 2 + 'px',
      left: left.value + 'px',
      // width: isWidth + 'px'
    }
    if (top.value < 60) {
      obj.top = top.value + height.value + 5 + 'px'
    } else {
      // obj.top = top.value - 60 + 'px'
      obj.top = top.value - 65 + 'px'
    }
    return obj
  }
})
</script>

<template>
  <div class="drag-shadow" :style="currentBounding" v-if="hoverComp">
    <div class="drag-tips">
      <svg-icon class="drag-icon" :icon="hoverComp.icon || 'comps-default'" />
      <div class="drag-title">
        <div class="drag-title-text">{{ t('component.' + comps[hoverComp.name].title) }}</div>
        <div class="drag-title__desc">{{ hoverComp.name }}</div>
      </div>
    </div>

    <div class="drag-handler" draggable="true" @dragstart="startDraggable" @dragend="onDragend">
      <svgIcon icon="drag-move"></svgIcon>
      <!-- <span>{{ t('container.moveComp') }}</span> -->
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../../../../assets/styles/global.scss';

.drag-shadow {
  position: absolute;
  background-color: rgba(global.$bgColor, 0.15);
  box-shadow: var(--ml-shadow-lg);
  backdrop-filter: saturate(150%) var(--ml-bg-blur-base);
  border-radius: var(--ml-radius-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
  user-select: none;
  padding: 12px var(--ml-pd-base);
  transition: var(--ml-transition-base);

  .drag-tips {
    display: flex;
    align-items: center;

    .drag-icon{
      width: 22px;
      height: 22px;
      color:var(--ml-text-color-1);
    }

    .drag-title {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-start;
      padding-left: var(--ml-pd-small);

      .drag-title-text {
        font-weight: bold;
        padding-bottom: var(--ml-pd-small);
        color:var(--ml-text-color-1);
      }

      .drag-title__desc {
        font-size: 12px;
        color: var(--ml-fill-color-1);
      }
    }
  }

  .drag-handler {
    color: var(--ml-primary-color);
    font-size: 22px;
    cursor: all-scroll;
    transition: var(--ml-transition-base);
    padding-right: var(--ml-pd-base);

    &:hover {
      color: var(--ml-primary-color-light-hover);
    }
  }
}
</style>