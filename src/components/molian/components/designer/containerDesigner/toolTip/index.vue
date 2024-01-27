<script setup lang="ts">
import { computed, inject } from 'vue'
import { hoverComp, hoverBounding, startDraggable, useDraggable, hoverNodes, hoverIndex, resetDraggable } from '../../draggable'
import { useCloned } from '@vueuse/core'
import { selectedComp } from '../../designerData'
import svgIcon from '@molianComps/svg-icon/index.vue'
import { slotsMap } from '@molian/utils/compsConfig'

const customComps: any = inject('customComps')
const t: any = inject('mlLangs')
const { onDragend } = useDraggable(null, null, null)
const { top, left, width, height } = hoverBounding
const { customDropdown } = customComps
const deleteComp = function () {
  if (hoverNodes.value) {
    hoverNodes.value.splice(hoverIndex.value, 1)
  }
  resetDraggable()
}
const currentBounding = computed(() => {
  let isWidth = 360
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

const slotsData = computed(() => {
  if (selectedComp.value) {
    return slotsMap.value[selectedComp.value.name] && Object.keys(slotsMap.value[selectedComp.value.name]).map(key => {
      return {
        value: key,
        label: key,
        disabled: !!selectedComp.value.slots[key],
        onclick: () => appendSlot(key, hoverComp.value)
      }
    })
  }
  return []
})

const appendSlot = function (key: string, val: any) {
  if (selectedComp.value.slots && selectedComp.value.slots[key]) {
    delete selectedComp.value.slots[key]
    return false
  }
  const { cloned } = useCloned(val)
  if (cloned.value === true || cloned.value === 'auto') {
    cloned.value = {
      children: []
    }
  } else {
    cloned.value.children = []
  }
  if (selectedComp.value.slots) {
    selectedComp.value.slots[key] = cloned.value
  } else {
    selectedComp.value.slots = {
      [key]: cloned.value
    }
  }
}
</script>

<template>
  <div class="drag-shadow" :style="currentBounding" v-if="hoverComp">
    <div class="drag-handler" draggable="true" @dragstart="startDraggable" @dragend="onDragend">
      <svgIcon icon="move"></svgIcon>
      <span>{{ t('container.moveComp') }}</span>
    </div>
    <customDropdown :optionItems="slotsData" trigger="click">
      <div class="drag-appendSlot">
        <svg-icon class="svg-icon-transh" icon="appendSlot"></svg-icon>
        <span>{{ t('container.appendSlot') }}</span>
      </div>
    </customDropdown>
    <div class="drag-delete" @click.stop="deleteComp">
      <svg-icon class="svg-icon-transh" icon="trash"></svg-icon>
      <span>{{ t('container.deleteComp') }}</span>
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

  .drag-appendSlot {
    color: var(--ml-primary-color);
    font-size: 16px;
    transition: var(--ml-transition-base);
    cursor: pointer;
    padding-right: var(--ml-pd-base);

    &:hover {
      color: var(--ml-primary-color-light-hover);
    }
  }

  .drag-slot {
    color: var(--ml-primary-color);
    font-size: 16px;
    cursor: pointer;
    transition: var(--ml-transition-base);
    padding-right: var(--ml-pd-base);

    &:hover {
      color: var(--ml-primary-color-light-hover);
    }
  }

  .drag-delete {
    color: var(--ml-danger-color);
    font-size: 16px;
    cursor: pointer;
    transition: var(--ml-transition-base);

    &:hover {
      color: var(--ml-danger-color-light-hover);
    }
  }
}
</style>
  