<script setup lang="ts">
import { defineOptions, defineProps, defineEmits, inject, useAttrs } from "vue";
import Popper from "@molianComps/Popper/index.vue";
import {useI18n} from 'vue-i18n'
defineOptions({
  name: "MlCascader",
  inheritAttrs: false,
});
const props = defineProps({
  modelValue: {
    type: Array as any,
    default: () => [],
  },
  options: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: "",
  },
});
const {t} = useI18n()
const emit = defineEmits(["update:modelValue"]);
const isClearable = ref(false);
const attrs = useAttrs();
const cmtdAttrs = computed(() => {
  const newAttrs: any = {};
  Object.keys(attrs).forEach((key: string) => {
    newAttrs[key] = attrs[key];
  });
  return newAttrs;
});
const customComps: any = inject("customComps");
const { customInput } = customComps;

const show = ref(false);
const openedShow = ref(false);
const popper = ref(null);
watch(
  () => show.value,
  (newVal) => {
    openedShow.value = newVal;
  }
);
const setValue = (value: any) => {
  emit("update:modelValue", value);
};

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

const selected = () => {
  if (!!popper.value) {
    popper.value.popperInstance.update();
  }
};
</script>

<template>
  <popper
    ref="popper"
    v-model:visible="show"
    @beforeLeave="openedShow = false"
    :class="attrs.class"
  >
    <div class="ml-cascader" @mouseenter="enter" @mouseleave="leave">
      <customInput
        class="ml-input"
        v-bind="cmtdAttrs"
        :placeholder="props.placeholder || t('options.placeholder')"
        :readonly="true"
        :modelValue="modelValue.join('/')"
      >
        <template #suffix>
          <svg-icon
            :icon="isClearable ? 'ep:circle-close' : 'ep:arrow-down'"
            :class="[
              'arrow-selected',
              isClearable && 'is-selected',
              !!openedShow && 'is-opened',
            ]"
          ></svg-icon>
        </template>
      </customInput>
    </div>
    <template #content>
        <MlCascaderPanel
          :modelValue="modelValue"
          :options="options"
          @update:modelValue="setValue"
          @selected="selected"
        />
    </template>
  </popper>
</template>

<style lang="scss" scoped>
.ml-cascader * {
  cursor: pointer;
}

.arrow-selected {
  transition: var(--ml-transition-base);
}

.is-selected {
  transition: var(--ml-transition-base);
}
.is-selected:hover {
  color: var(--ml-primary-color);
}

.is-opened {
  transform: rotate(180deg);
}
</style>
