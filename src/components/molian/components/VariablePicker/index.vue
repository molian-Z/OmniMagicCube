<script setup lang="ts">
import { defineOptions, defineProps, defineEmits, inject, useAttrs } from "vue";
import Popper from "@molianComps/Popper/index.vue";
import { useI18n } from "vue-i18n";
defineOptions({
  name: "VariablePicker",
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
  clearable: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["update:modelValue"]);
const isClearable = ref(false);
const attrs = useAttrs();
const cmtdAttrs = computed(() => ({ ...attrs }));
const { t } = useI18n();
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
  if (!!props.modelValue && !!props.clearable) {
    if (
      (typeof props.modelValue === "string" && !!props.modelValue) ||
      (Array.isArray(props.modelValue) && props.modelValue.length > 0)
    ) {
      isClearable.value = true;
    }
  }
};

const leave = () => {
  if (!!props.clearable) {
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

const clearValue = () => {
  if (props.clearable) {
    emit("update:modelValue", []);
  }
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
            icon="circle-close"
            :class="[
              'arrow-selected',
              isClearable && 'is-selected',
              !!openedShow && 'is-opened',
            ]"
            @click.stop="clearValue"
            v-if="isClearable"
          ></svg-icon>
          <svg-icon
            icon="arrow-down"
            :class="[
              'arrow-selected',
              !!openedShow && 'is-opened',
            ]"
            v-else
          ></svg-icon>
        </template>
      </customInput>
    </div>
    <template #content>
      <div class="shadow">
        <div class="ml-cascader-panel__header">全局变量</div>
        <MlCascaderPanel
          :modelValue="modelValue"
          :options="options"
          @update:modelValue="setValue"
          @selected="selected"
        />
      </div>
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

.ml-cascader-panel__header {
  padding: var(--ml-pd-lg) var(--ml-pd-lg) var(--ml-pd-base) var(--ml-pd-lg);
  font-weight: bold;
  border-bottom: 1px solid var(--ml-border-color);
  background-color: var(--ml-bg-color);
}
.shadow {
  box-shadow: var(--ml-shadow-small-inset);
  border-radius: var(--ml-radius-base);
  overflow: hidden;
}
</style>
