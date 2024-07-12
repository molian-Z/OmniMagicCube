<script setup lang="ts">
import svgIcon from "@molianComps/SvgIcon/index.vue";
defineOptions({
    name: "ButtonGroup",
})
defineProps({
  list: {
    type: Array,
    default: () => [],
  } as any,
  type: {
    type: String,
    default: "primary",
  },
});

const emit = defineEmits(["itemClick"]);

const itemClick = (item: any, index: number) => {
  if (!item.disabled) {
    emit("itemClick", {
      item,
      index,
    });
  }
};
</script>

<template>
  <div class="ml-group-button">
    <div
      :class="['ml-group-button-item', item.disabled ? 'disabled' : type]"
      v-for="(item, index) in list"
      :key="index"
      @click="itemClick(item, index)"
    >
      <svg-icon :icon="item.icon" v-if="item.icon" />
      <span>{{ item.label }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ml-group-button {
  display: flex;
  align-items: center;
  justify-content: center;
  &-item {
    display: flex;
    align-items: center;
    padding: var(--ml-pd-base) var(--ml-pd-lg);
    color: var(--ml-text-reverse-color-1);
    cursor: pointer;
    user-select: none;
    transition: var(--ml-transition-base);
    &:first-child {
      border-top-left-radius: var(--ml-radius-small);
      border-bottom-left-radius: var(--ml-radius-small);
    }
    &:last-child {
      border-top-right-radius: var(--ml-radius-small);
      border-bottom-right-radius: var(--ml-radius-small);
    }
    > span {
      padding-left: var(--ml-pd-base);
    }
  }

  .primary {
    background-color: var(--ml-primary-color);
    &:hover {
      background-color: var(--ml-primary-color-3);
    }
    &:active {
      background-color: var(--ml-primary-color-4);
    }
  }
  .danger {
    background-color: var(--ml-danger-color);
    &:hover {
      background-color: var(--ml-danger-color-3);
    }
    &:active {
      background-color: var(--ml-danger-color-4);
    }
  }
  .success {
    background-color: var(--ml-success-color);
    &:hover {
      background-color: var(--ml-success-color-3);
    }
    &:active {
      background-color: var(--ml-success-color-4);
    }
  }
  .warning {
    background-color: var(--ml-warning-color);
    &:hover {
      background-color: var(--ml-warning-color-3);
    }
    &:active {
      background-color: var(--ml-warning-color-4);
    }
  }

  .disabled {
    background-color: var(--ml-fill-color-2);
    cursor: auto;
  }
}
</style>
