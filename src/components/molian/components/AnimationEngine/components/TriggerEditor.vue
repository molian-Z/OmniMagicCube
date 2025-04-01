<script setup lang="ts">
import { useI18n } from "vue-i18n";
const customComps: any = inject("customComps");
const { customInput, customInputNumber, customSelect } = customComps;

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      type: "onMount",
      delay: 0,
      condition: {
        value: "",
        operator: "===",
      },
    }),
  },
  animationType: {
    type: String,
    default: "enter",
  },
});

const emit = defineEmits(["update:modelValue"]);

const { t } = useI18n();

// 触发器类型选项
const triggerTypeOptions = computed(() => {
  const baseOptions = [
    { label: t("animation.trigger.onMount"), value: "onMount" },
    { label: t("animation.trigger.onUnmount"), value: "onUnmount" },
    { label: t("animation.trigger.onClick"), value: "onClick" },
    { label: t("animation.trigger.onHover"), value: "onHover" },
    { label: t("animation.trigger.onScroll"), value: "onScroll" },
    { label: t("animation.trigger.onStateChange"), value: "onStateChange" },
  ];

  // 根据动画类型过滤选项
  if (props.animationType === "enter") {
    return baseOptions.filter((opt) =>
      ["onMount", "onScroll", "onClick", "onHover", "onStateChange"].includes(opt.value)
    );
  } else if (props.animationType === "leave") {
    return baseOptions.filter((opt) =>
      ["onUnmount", "onClick", "onHover", "onStateChange"].includes(opt.value)
    );
  }

  return baseOptions;
});

// 操作符选项
const operatorOptions = [
  { label: "===", value: "===" },
  { label: "!==", value: "!==" },
  { label: ">", value: ">" },
  { label: ">=", value: ">=" },
  { label: "<", value: "<" },
  { label: "<=", value: "<=" },
];

// 是否显示条件设置
const showCondition = computed(() => {
  return props.modelValue.type === "onStateChange";
});

// 更新触发器配置
const updateTrigger = (key: string, value: any) => {
  const updatedTrigger = { ...props.modelValue };
  updatedTrigger[key] = value;
  emit("update:modelValue", updatedTrigger);
};

// 更新条件配置
const updateCondition = (key: string, value: any) => {
  const updatedTrigger = { ...props.modelValue };
  if (!updatedTrigger.condition) {
    updatedTrigger.condition = { value: "", operator: "===" };
  }
  updatedTrigger.condition[key] = value;
  emit("update:modelValue", updatedTrigger);
};
</script>

<template>
  <div class="trigger-editor">
    <div class="form-row">
      <!-- 触发类型 -->
      <div class="form-item">
        <div class="form-label">{{ t("animation.trigger.type") }}</div>
        <customSelect
          v-model="modelValue.type"
          class="full-width"
          @change="(val) => updateTrigger('type', val)"
          :options="triggerTypeOptions"
        />
      </div>

      <!-- 延迟时间 -->
      <div class="form-item">
        <div class="form-label">{{ t("animation.trigger.delay") }}</div>
        <customInputNumber
          v-model="modelValue.delay"
          :min="0"
          :step="0.1"
          :precision="1"
          class="full-width"
          @change="(val) => updateTrigger('delay', val)"
        />
      </div>
    </div>

    <!-- 条件设置 (仅在状态变化触发时显示) -->
    <template v-if="showCondition">
      <div class="form-row">
        <div class="form-item">
          <div class="form-label">{{ t("animation.trigger.conditionValue") }}</div>
          <customInput
            v-model="modelValue.condition.value"
            @input="(val) => updateCondition('value', val)"
          />
        </div>

        <div class="form-item">
          <div class="form-label">{{ t("animation.trigger.conditionOperator") }}</div>
          <customSelect
            v-model="modelValue.condition.operator"
            class="full-width"
            @change="(val) => updateCondition('operator', val)"
            :options="operatorOptions"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.trigger-editor {
  margin-bottom: 16px;

  .full-width {
    width: 100%;
  }
}
</style>
