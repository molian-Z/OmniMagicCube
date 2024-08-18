<script setup lang="ts">
import { defineOptions, defineProps, inject, useAttrs } from "vue";
defineOptions({
  name: "MlCascader",
  inheritAttrs: false,
});
const props = defineProps({
  modelValue: {
    type: [String, Array],
    default: () => [],
  },
  options: {
    type: Array,
    default: () => [],
  },
});
const isClearable = ref(false);
const attrs = useAttrs();
const cmtdAttrs = computed(() => {
  const newAttrs: any = {};
  Object.keys(attrs).forEach((key: string) => {
    newAttrs[key] = attrs[key];
  });
  return newAttrs;
});
const t: any = inject("mlLangs");
const customComps: any = inject("customComps");
const { customInput, customPopup } = customComps;

const enter = () => {
  if (!!props.modelValue && !!attrs.clearable) {
    if (
      (typeof props.modelValue === "string" && !!props.modelValue) ||
      (Array.isArray(props.modelValue) && props.modelValue.length > 0)
    ) {
      isClearable.value = true;
    }
  }
};

const leave = () => {
  if (!!attrs.clearable) {
    isClearable.value = false;
  }
};
</script>

<template>
  <customPopup
    :class="attrs.class"
    trigger="click"
    transition="el-zoom-in-top"
    :teleported="false"
  >
    <template #reference>
      <div class="ml-cascader" @mouseenter="enter" @mouseleave="leave">
        <customInput
          class="ml-input"
          v-bind="cmtdAttrs"
          placeholder="无内容"
          :readonly="true"
          :modelValue="modelValue"
        >
          <template #suffix>
            <svg-icon :icon="isClearable ? 'ep:circle-close' : 'ep:arrow-down'" :class="[isClearable && 'is-selected']"></svg-icon>
          </template>
        </customInput>
      </div>
    </template>
    <template #content>
      <ml-cascader-panel>
      
      </ml-cascader-panel>
    </template>
  </customPopup>
</template>

<style lang="scss" scoped>
.ml-cascader * {
  cursor: pointer;
}
.is-selected{
    transition: var(--ml-transition-base);
}
.is-selected:hover{
    color: var(--ml-primary-color);
}
</style>
