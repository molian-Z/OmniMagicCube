<script setup lang="ts">
import { defineOptions, defineProps } from "vue";
defineOptions({
  name: "TagGroup",
});
defineProps({
  data: {
    type: Array,
    default: () => [],
  } as any,
});

const targetRef = ref<any[]>([]);
const targetIsVisible = ref<any[]>([]);
const targetRefWidth = ref<any[]>([]);
</script>

<template>
  <div class="tag-group">
    <div
      ref="targetRef"
      class="tag-group-item"
      v-for="(tag, index) in data"
      :key="tag"
      :style="{ display: targetIsVisible[index] === false ? 'none' : 'block', width: !!targetRefWidth[index] && targetRefWidth[index]+'px' }"
    >
      {{ tag }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tag-group {
  display: flex;
  align-items: center;
  text-wrap: nowrap;
  &-item {
    padding: var(--ml-pd-small) var(--ml-pd-base);
    background-color: var(--ml-primary-color-1);
    color: var(--ml-primary-color);
    border-radius: var(--ml-radius-small);
    font-size: 12px;
    font-weight: 400;
    margin-right: var(--ml-mg-small);
    &:last-child {
      margin-right: 0;
    }
  }
}
</style>
