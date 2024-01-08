<script setup lang="ts">
import { ref, defineProps, defineExpose } from 'vue'

defineProps({
  title: {
    type: String,
    default: ''
  }
})
const expand = ref(false)
const switchExpand = (bool: boolean)=>{
  expand.value = bool
}
defineExpose({
  expand,
  switchExpand
})
</script>
<template>
  <div :class="['float-ball-body', expand && 'expand']">
    <div class="toggle" @click="expand = !expand">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <div class="float-ball__header" v-if="$slots.header || !!title">
      <slot name="header">
        <div class="float-ball__title">{{title}}</div>
      </slot>
    </div>
    <div :class="['float-ball__container', $slots.header || !!title && 'hasHeader']" v-if="expand">
      <slot />
    </div>
  </div>
</template>


<style scoped lang="scss">
@use '../../assets/styles/global.scss';

.float-ball-body {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 9999999999;
  width: 48px;
  height: 48px;
  border-radius: 50px;
  border: 1px solid var(--ml-fill-color-3, #E5E6EB);
  background-color: rgba(global.$bgColor, 0.15);
  box-shadow: var(--ml-shadow-lg);
  backdrop-filter: var(--ml-bg-blur-base);
  transition: var(--ml-transition-base);

  .toggle {
    position: absolute;
    right: 6px;
    bottom: 6px;
    width: 32px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    overflow: hidden;

    span {
      position: absolute;
      height: 2px;
      width: 20px;
      background-color: var(--ml-fill-color-1, #E5E6EB);
      border-radius: 4px;
      cursor: pointer;
      transition: 0.5s;
    }

    span:nth-child(1) {
      transform: translateY(-8px);
      width: 15px;
      left: 6px;
    }

    span:nth-child(2) {
      transform: translateY(8px);
      width: 10px;
      left: 6px;
    }
  }

  .float-ball__header {
    display: none;
  }

  .float-ball__container {
    display: none;
    transition: var(--ml-transition-base);
  }

  &.expand {
    width: 260px;
    height: 80vh;
    border-radius: var(--ml-radius-lg);

    .toggle {
      span:nth-child(1) {
        width: 20px;
        transform: translateY(0px) rotate(45deg);
        transition-delay: 0.125s;
      }

      span:nth-child(2) {
        width: 20px;
        transform: translateY(0px) rotate(315deg);
        transition-delay: 0.125s;
      }

      span:nth-child(3) {
        transform: translateX(60px);
      }
    }

    .float-ball__header {
      display: flex;
      height: 40px;
      padding: var(--ml-pd-base);
      padding-bottom: 0;
      align-items: center;

      .float-ball__title{
        font-size: 14px;
        font-weight: bold;
      }
    }

    .float-ball__container {
      display: flex;
      height: calc(100% - 32px);
      padding: var(--ml-pd-base);

      &.hasHeader{
        height: calc(100% - 64px - var(--ml-pd-base));
      }
    }
  }
}
</style>