<script setup lang="ts">
import { useI18n } from "vue-i18n";
const customComps: any = inject("customComps");
const { customInputNumber, customSelect, customSwitch, customDivider } = customComps;
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
    <div class="form-section">
      <div class="form-row">
        <!-- 重复次数 -->
        <div class="form-item">
          <div class="form-label">{{ t('animation.timeline.repeat') }}</div>
          <customInputNumber
            v-model="modelValue.repeat"
            :min="-1"
            :step="1"
            @change="(val: any) => updateTimeline('repeat', val)"
          />
          <div class="form-hint">
            {{ t("animation.timeline.repeatHint") }}
          </div>
        </div>

        <!-- 往返动画 -->
        <div class="form-item">
          <div class="form-label">{{ t('animation.timeline.yoyo') }}</div>
          <customSwitch
            v-model="modelValue.yoyo"
            @change="(val: any) => updateTimeline('yoyo', val)"
          />
          <div class="form-hint">
            {{ t("animation.timeline.yoyoHint") }}
          </div>
        </div>
      </div>

      <div class="form-row">
        <!-- 延迟时间 -->
        <div class="form-item">
          <div class="form-label">{{ t('animation.timeline.delay') }}</div>
          <customInputNumber
            v-model="modelValue.delay"
            :min="0"
            :step="0.1"
            :precision="1"
            @change="(val: any) => updateTimeline('delay', val)"
          />
        </div>

        <!-- 播放速度 -->
        <div class="form-item">
          <div class="form-label">{{ t('animation.timeline.timeScale') }}</div>
          <customInputNumber
            v-model="modelValue.timeScale"
            :min="0.1"
            :step="0.1"
            :precision="1"
            @change="(val: any) => updateTimeline('timeScale', val)"
          />
          <div class="form-hint">
            {{ t("animation.timeline.timeScaleHint") }}
          </div>
        </div>
      </div>
    </div>

    <!-- 默认设置 -->
    <customDivider>{{ t("animation.timeline.defaults") }}</customDivider>

    <div class="form-section">
      <div class="form-row">
        <!-- 默认持续时间 -->
        <div class="form-item">
          <div class="form-label">{{ t('animation.timeline.defaultDuration') }}</div>
          <customInputNumber
            v-model="modelValue.defaults.duration"
            :min="0"
            :step="0.1"
            :precision="1"
            @change="(val: any) => updateDefaults('duration', val)"
          />
        </div>

        <!-- 默认缓动函数 -->
        <div class="form-item">
          <div class="form-label">{{ t('animation.timeline.defaultEase') }}</div>
          <customSelect
            v-model="modelValue.defaults.ease"
            :options="easeOptions"
            @change="(val: any) => updateDefaults('ease', val)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.timeline-editor {
  margin-bottom: 16px;

  .form-section {
    margin-bottom: 16px;
  }

  .form-hint {
    font-size: 14px;
    color: var(--ml-text-color-6);
    margin-left: 8px;
  }
}
</style>