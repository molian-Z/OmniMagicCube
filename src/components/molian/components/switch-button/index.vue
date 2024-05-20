<script lang="ts" setup>
import { defineProps, defineEmits, ref, computed } from 'vue'
import { useElementBounding } from '@vueuse/core'
const props = defineProps({
  optionItems: {
    type: Array,
    default: () => []
  } as any,
  modelValue: {
    type: String,
    default: ""
  }
})
const emit = defineEmits(['tabClick', 'update:modelValue'])
const bodyRef = ref()
const switchRefs = ref()
const bodyBounding = useElementBounding(bodyRef)
const clickTab = function (item: any) {
  emit('update:modelValue', item.name)
  emit('tabClick', item)
}

const currentIndex = computed(() => {
  return props.optionItems.findIndex((item: any) => {
    return item.name === props.modelValue
  })
})

const getRectStyle = computed(() => {
  if (currentIndex.value > -1) {
    let currentDom = switchRefs.value && switchRefs.value[currentIndex.value]
    if (!!currentDom) {
      const { top, bottom, right, left } = useElementBounding(currentDom)
      return {
        top: (top.value - bodyBounding.top.value) + 'px',
        left: (left.value - bodyBounding.left.value) + 'px',
        bottom: (bodyBounding.bottom.value - bottom.value) + 'px',
        right: (bodyBounding.right.value - right.value) + 'px'
      }
    }
  }
  return {}
})

</script>

<template>
  <div class="switch-button">
    <div class="switch-button-body" ref="bodyRef">
      <div class="switch-button__active" :style="getRectStyle"></div>
      <div ref="switchRefs" :class="['switch-button__item', index === currentIndex && 'active']"
        :style="{ width: `${100 / optionItems.length}%` }" v-for="(item, index) in optionItems" @click="clickTab(item)">
        <div class="switch-button__item-title">{{ item.title || item.text }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.switch-button {
  padding: var(--ml-pd-base);
  cursor: pointer;
  user-select: none;

  .switch-button-body {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    background-color: #eee;
    border: 1px solid var(--ml-border-color);
    border-radius: var(--ml-radius-base);
    padding: var(--ml-pd-small);
    position: relative;

    .switch-button__item {
      padding: var(--ml-pd-small);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--ml-radius-base);
      position: relative;

      .switch-button__item-title {
        font-size: 14px;
        color: var(--ml-text-color-1);
        padding: var(--ml-pd-small);
        text-wrap: nowrap;
      }

      &.active {
        font-weight: bold;

        .switch-button__item-title {
          color: var(--ml-primary-color);
        }
      }
    }

    .switch-button__active {
      position: absolute;
      background-color: var(--ml-bg-color);
      border-radius: var(--ml-radius-base);
      box-shadow: var(--ml-shadow-small) var(--ml-shadow-small-inset);
      transition: var(--ml-transition-base);
    }
  }
}
</style>