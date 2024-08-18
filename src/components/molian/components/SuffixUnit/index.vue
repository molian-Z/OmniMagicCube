<script setup lang="ts">
import { defineOptions, defineProps, defineEmits, ref } from 'vue';
import { selectedComp } from "@molianComps/Designer/designerData";
import popper from "@molianComps/Popper/index.vue";
defineOptions({
    name: "SuffixUnit",
})
defineProps({
  modelValue: {
    type: String,
    default: "px",
  },
  unitList: {
    type: Array,
    default: () => ["px", "%", "vw", "vh", "rem", "rpx", 'calc'],
  },
} as any);
const emit = defineEmits(['update:modelValue'])
const show = ref<boolean>(false);
const change = (value:string) => {
    emit('update:modelValue', value)
    show.value = false
}
</script>
<template>
  <popper v-model:visible="show" :disabled="!selectedComp">
    <span class="suffix-unit">{{ modelValue }}</span>
    <template #content>
      <div class="suffix-unit-list">
        <div
          :class="['suffix-unit-list__item', modelValue === unitItem && 'active']"
          v-for="unitItem in unitList"
          :key="unitItem"
          @click="change(unitItem)"
        >
          {{ unitItem }}
        </div>
      </div>
    </template>
  </popper>
</template>
<style lang="scss" scoped>
.suffix-unit {
  &-list {
    &__item {
      padding: var(--ml-pd-small) var(--ml-pd-lg);
      transition: var(--ml-transition-base);
      cursor: pointer;
      user-select: none;
      text-align: center;
      font-size: 12px;
      margin: var(--ml-mg-small) 0;
      &:hover {
        background-color: var(--ml-fill-color-4);
        color: var(--ml-primary-color-4);
      }
    }
    .active {
      color: var(--ml-primary-color);
      font-weight: bold;
    }
  }
}
</style>
