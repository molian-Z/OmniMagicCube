<script setup lang="ts">
import svgIcon from "@molianComps/SvgIcon/index.vue";
import { useI18n } from "vue-i18n";
defineOptions({
  name: "MlCascaderPanel",
});

const props = defineProps({
  modelValue: {
    type: [String, Boolean, Number],
    default: "",
  },
  options: {
    type: Array as any,
    default: () => [],
  },
  level: {
    type: Number,
    default: 1,
  },
  allowCustomInput: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["update:modelValue", "customInput", "update:currented"]);
const {t} = useI18n();
const showCustomInput = ref(false);
const customInputValue = ref("");
const modelValue = defineModel<any>("modelValue");
const customComps: any = inject("customComps");
const { customInput, customButton } = customComps;
const selectCheckedItem = (item: any) => {
  emit("update:modelValue", item.value);
};

const selectItem = (item: any) => {
  emit("update:currented", item.value);
};

const zIndex = computed(() => {
  return 1000 - props.level;
});
const handleCustomInputConfirm = () => {
  if (customInputValue.value.trim()) {
    emit("customInput", customInputValue.value, props.level);
    showCustomInput.value = false;
    customInputValue.value = "";
  }
};

const handleCustomInputCancel = () => {
  showCustomInput.value = false;
  customInputValue.value = "";
};
</script>

<template>
  <div class="ml-cascader-panel-items">
    <!-- 原有选项列表 -->
    <div v-if="!showCustomInput" class="ml-cascader-panel-items__list">
      <div
        :class="[
          'ml-cascader-panel-items__item',
          item.value === modelValue && 'active',
          item.disabled && 'disabled',
        ]"
        v-for="item in options"
        :key="item.value"
        @click="selectItem(item)"
      >
        <div class="ml-cascader-panel-items__item-content">
          <div
            class="ml-cascader-panel-items__item-content-radio"
            @click.stop="selectCheckedItem(item)"
          >
            <transition name="zoom">
              <div
                v-if="item.value === modelValue"
                class="ml-cascader-panel-items__item-content-radio-checked"
              ></div>
            </transition>
          </div>
          <div class="ml-cascader-panel-items__item-content__label">
            <div>{{ item.label || item.value }}</div>
            <svg-icon icon="arrow" v-if="!!item.children && item.children.length > 0" />
          </div>
        </div>
      </div>
      <!-- 自定义输入触发按钮 -->
      <div
        v-if="allowCustomInput"
        class="ml-cascader-panel-items__item trigger"
        @click="showCustomInput = true"
      >
        <span>{{t('attrs.MlCascaderPanelItems.customInput')}}</span>
      </div>
    </div>

    <!-- 自定义输入表单 -->
    <div v-else class="ml-cascader-panel-items__custom-input">
      <customInput
        v-model="customInputValue"
        :placeholder="t('attrs.MlCascaderPanelItems.placeholder')"
        @keyup.enter="handleCustomInputConfirm"
        size="small"
      />
      <div class="ml-cascader-panel-items__custom-actions">
        <customButton theme="primary" size="small" @click="handleCustomInputConfirm">{{ t('actions.confirmText') }}</customButton>
        <customButton theme="danger" size="small" @click="handleCustomInputCancel">{{ t('actions.cancelText') }}</customButton>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ml-cascader-panel-items {
  background-color: var(--ml-bg-color);
  padding: var(--ml-pd-base);
  flex: 1;
  border-right: 1px solid var(--ml-border-color);
  position: relative;
  z-index: v-bind(zIndex);
  min-width: 130px;
  max-height: 320px;
  overflow: auto;
  &__custom-actions {
    display: flex;
    margin-top: 8px;
  }
  &:last-child {
    border-right: none;
  }
  &__item {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: var(--ml-mg-small) 0;
    padding: var(--ml-pd-small) var(--ml-pd-base);
    cursor: pointer;
    user-select: none;
    font-size: 14px;
    color: var(--ml-text-color-3);
    transition: var(--ml-transition-base);
    &::before {
      content: "";
      border-radius: var(--ml-radius-small);
      transition: var(--ml-transition-base);
      position: absolute;
      top: 0%;
      left: 30%;
      bottom: 100%;
      right: 70%;
      z-index: -1;
    }
    &:hover {
      color: var(--ml-primary-color);
      &::before {
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        background-color: var(--ml-bg-page-color);
      }
    }
    &:focus {
      background-color: var(--ml-primary-color-focus);
    }

    &.active {
      color: var(--ml-primary-color);
      font-weight: bold;
    }

    &-content {
      display: flex;
      align-items: center;
      flex: 1;
      &-radio {
        width: 16px;
        height: 16px;
        background-color: #eaeaeb;
        border-radius: 100%;
        margin-right: var(--ml-mg-base);
        position: relative;

        &-checked {
          position: absolute;
          width: 8px;
          height: 8px;
          background-color: var(--ml-primary-color);
          border-radius: 100%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      }

      &__label {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex: 1;
      }
    }
  }

  & .other {
    font-size: 14px;
    align-items: center;
    justify-content: center;
  }

  .trigger{
    justify-content: center;
  }
}

/* 1. 声明过渡效果 */
.zoom-move,
.zoom-enter-active,
.zoom-leave-active {
  transition: all 0.2s;
}

/* 2. 声明进入和离开的状态 */
.zoom-enter-from,
.zoom-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.1);
}

/* 3. 确保离开的项目被移除出了布局流
      以便正确地计算移动时的动画效果。 */
.zoom-leave-active {
  position: absolute;
}
</style>
