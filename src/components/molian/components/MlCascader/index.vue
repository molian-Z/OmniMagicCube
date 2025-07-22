<script setup lang="ts">
import { defineOptions, defineProps, defineEmits, inject, useAttrs } from "vue";
import Popper from "@molianComps/Popper/index.vue";
import {useI18n} from 'vue-i18n'
defineOptions({
  name: "MlCascader",
  inheritAttrs: false,
});
interface CascaderOption {
  label: string;
  value: string | number;
  children?: CascaderOption[];
  disabled?: boolean;
}

const props = defineProps({
  modelValue: {
    type: Array as PropType<(string | number)[]>,
    default: () => [],
  },
  options: {
    type: Array as PropType<CascaderOption[]>,
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
const cmtdAttrs = computed(() => ({ ...attrs }));
const customComps: any = inject("customComps");
const { customInput } = customComps;

const show = shallowRef(false);
const openedShow = shallowRef(false);
const popper = useTemplateRef<any>('popper');
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
    nextTick(() => {
      if (popper.value?.popperInstance) {
        popper.value.popperInstance.update();
      }
      setTimeout(() => {
        if (popper.value?.popperInstance) {
            popper.value.popperInstance.update();
        }
      }, 150);
    });
};

const displayValue = computed(() => 
  Array.isArray(props.modelValue) && props.modelValue.length 
    ? props.modelValue.join("/") 
    : ""
);
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
        :modelValue="displayValue"
      >
        <template #suffix>
          <svg-icon
            :icon="isClearable ? 'circle-close' : 'arrow-down'"
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
