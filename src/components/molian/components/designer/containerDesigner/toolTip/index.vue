<script setup lang="ts">
import { computed, inject } from 'vue'
import { hoverComp, hoverBounding, startDraggable, useDraggable } from '../../draggable'
import svgIcon from '@molianComps/svg-icon/index.vue'

const t: any = inject('mlLangs')
const { onDragend } = useDraggable(null, null, null)
const { top, left, width, height } = hoverBounding
const currentBounding = computed(() => {
  let isWidth = 180
  if (hoverComp.value) {
    let obj: any = {
      left: left.value + width.value / 2 <= (isWidth / 2) ? '5px' : Number(left.value - (isWidth / 2)) + width.value / 2 + 'px',
      width: isWidth + 'px'
    }
    if (top.value < 60) {
      obj.top = top.value + height.value + 'px'
    } else {
      obj.top = top.value - 60 + 'px'
    }
    return obj
  }
})
</script>

<template>
  <div class="drag-shadow" :style="currentBounding" v-if="hoverComp">
    <div class="drag-handler" draggable="true" @dragstart="startDraggable" @dragend="onDragend">
      <svgIcon icon="move"></svgIcon>
      <span>{{ t('container.moveComp') }}</span>
    </div>
    <div>AI</div>
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
  justify-content: space-around;
  align-items: center;
  z-index: 100;
  user-select: none;
  padding: var(--ml-pd-lg);
  transition: var(--ml-transition-base);

  .drag-handler {
    color: var(--ml-primary-color);
    font-size: 16px;
    cursor: all-scroll;
    transition: var(--ml-transition-base);
    padding-right: var(--ml-pd-base);

    &:hover {
      color: var(--ml-primary-color-light-hover);
    }
  }
}
</style>