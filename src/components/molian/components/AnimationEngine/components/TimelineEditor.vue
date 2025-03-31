<script setup lang="ts">
import { useI18n } from "vue-i18n";
import {
  ElFormItem,
  ElSelect,
  ElOption,
  ElInputNumber,
  ElInput,
  ElSwitch,
  ElDivider,
} from "element-plus";

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      defaults: {
        duration: 0.5,
        ease: "power2.out",
      },
      repeat: 0,
      yoyo: false,
      delay: 0,
      timeScale: 1,
      autoPlay: true,
      paused: false,
    }),
  },
});

const emit = defineEmits(["update:modelValue"]);

const { t } = useI18n();

// 缓动函数选项
const easeOptions = [
  { label: t("animation.ease.linear"), value: "none" },
  { label: t("animation.ease.easeIn"), value: "power2.in" },
  { label: t("animation.ease.easeOut"), value: "power2.out" },
  { label: t("animation.ease.easeInOut"), value: "power2.inOut" },
  { label: t("animation.ease.elastic"), value: "elastic.out" },
  { label: t("animation.ease.bounce"), value: "bounce.out" },
  { label: t("animation.ease.back"), value: "back.out" }
];

// 确保默认值存在
const ensureDefaults = () => {
  if (!props.modelValue.defaults) {
    updateTimeline("defaults", {
      duration: 0.5,
      ease: "power2.out",
    });
  }
};

// 更新时间轴配置
const updateTimeline = (key: string, value: any) => {
  const updatedTimeline = { ...props.modelValue };
  updatedTimeline[key] = value;
  emit("update:modelValue", updatedTimeline);
};

// 更新默认设置
const updateDefaults = (key:string, value:any) => {
  const updatedDefaults = { ...(props.modelValue.defaults || {}) };
  updatedDefaults[key] = value;
  updateTimeline("defaults", updatedDefaults);
};

// 初始化时确保必要的对象存在
ensureDefaults();
</script>

<template>
  <div class="timeline-editor">
    <!-- 基本设置 -->
    <ElFormItem :label="t('animation.timeline.repeat')">
      <ElInputNumber
        v-model="modelValue.repeat"
        :min="-1"
        :step="1"
        class="full-width"
        @change="(val) => updateTimeline('repeat', val)"
      />
      <div class="form-hint">
        {{ t("animation.timeline.repeatHint") }}
      </div>
    </ElFormItem>

    <ElFormItem :label="t('animation.timeline.yoyo')">
      <ElSwitch
        v-model="modelValue.yoyo"
        @change="(val) => updateTimeline('yoyo', val)"
      />
      <div class="form-hint">
        {{ t("animation.timeline.yoyoHint") }}
      </div>
    </ElFormItem>

    <ElFormItem :label="t('animation.timeline.delay')">
      <ElInputNumber
        v-model="modelValue.delay"
        :min="0"
        :step="0.1"
        :precision="1"
        class="full-width"
        @change="(val) => updateTimeline('delay', val)"
      />
    </ElFormItem>

    <ElFormItem :label="t('animation.timeline.timeScale')">
      <ElInputNumber
        v-model="modelValue.timeScale"
        :min="0.1"
        :step="0.1"
        :precision="1"
        class="full-width"
        @change="(val) => updateTimeline('timeScale', val)"
      />
      <div class="form-hint">
        {{ t("animation.timeline.timeScaleHint") }}
      </div>
    </ElFormItem>

    <!-- 默认设置 -->
    <ElDivider>{{ t("animation.timeline.defaults") }}</ElDivider>

    <ElFormItem :label="t('animation.timeline.defaultDuration')">
      <ElInputNumber
        v-model="modelValue.defaults.duration"
        :min="0"
        :step="0.1"
        :precision="1"
        class="full-width"
        @change="(val) => updateDefaults('duration', val)"
      />
    </ElFormItem>

    <ElFormItem :label="t('animation.timeline.defaultEase')">
      <ElSelect
        v-model="modelValue.defaults.ease"
        class="full-width"
        @change="(val) => updateDefaults('ease', val)"
      >
        <ElOption
          v-for="option in easeOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </ElSelect>
    </ElFormItem>
  </div>
</template>

<style scoped lang="scss">
.timeline-editor {
  margin-bottom: 16px;

  .full-width {
    width: 100%;
  }

  .form-hint {
    font-size: 12px;
    color: var(--ml-text-color-secondary);
    margin-top: 4px;
  }
}
</style>