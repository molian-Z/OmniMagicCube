<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { AnimationEffect } from "../../types/animation";
const customComps: any = inject("customComps");
const { customInputNumber, customSelect, customButton } = customComps;

const props = defineProps({
  effects: {
    type: Array as () => AnimationEffect[],
    required: true
  },
  currentEffect: {
    type: Object as () => AnimationEffect | null,
    default: null
  },
  currentIndex: {
    type: Number,
    required: true
  }
});

const emit = defineEmits<{
  (e: "add"): void;
  (e: "delete"): void;
  (e: "update", effects: AnimationEffect[]): void;
}>();

const { t } = useI18n();

// 缓动函数选项
const easeOptions = [
  { label: t("animation.ease.linear"), value: "none" },
  { label: t("animation.ease.easeIn"), value: "power2.in" },
  { label: t("animation.ease.easeOut"), value: "power2.out" },
  { label: t("animation.ease.easeInOut"), value: "power2.inOut" },
  { label: t("animation.ease.elastic"), value: "elastic.out" },
  { label: t("animation.ease.bounce"), value: "bounce.out" },
  { label: t("animation.ease.back"), value: "back.out" },
];

// 效果类型选项
const effectTypeOptions = [
  { label: t("animation.effect.fade"), value: "fade" },
  { label: t("animation.effect.slide"), value: "slide" },
  { label: t("animation.effect.scale"), value: "scale" },
  { label: t("animation.effect.rotate"), value: "rotate" },
  { label: t("animation.effect.custom"), value: "custom" },
];

// 方向选项
const directionOptions = [
  { label: t("animation.effect.direction.up"), value: "up" },
  { label: t("animation.effect.direction.down"), value: "down" },
  { label: t("animation.effect.direction.left"), value: "left" },
  { label: t("animation.effect.direction.right"), value: "right" },
  { label: t("animation.effect.direction.topLeft", "左上"), value: "topLeft" },
  { label: t("animation.effect.direction.topRight", "右上"), value: "topRight" },
  { label: t("animation.effect.direction.bottomLeft", "左下"), value: "bottomLeft" },
  { label: t("animation.effect.direction.bottomRight", "右下"), value: "bottomRight" },
];

// 更新效果类型
const updateEffectType = (type: string) => {
  if (!props.currentEffect) return;
  
  const updatedEffects = [...props.effects];
  const effect = { ...updatedEffects[props.currentIndex] };
  
  effect.type = type;
  
  // 根据类型设置默认值
  switch (type) {
    case "fade":
      effect.to = { opacity: 1 };
      break;
    case "scale":
      effect.to = { scale: 1.5 };
      break;
    case "rotate":
      effect.to = { rotation: 360 };
      break;
    case "slide":
      effect.direction = "right"; // 保持默认方向为右
      effect.properties = { 
        distance: "100px",
        // 为斜向移动添加支持
        x: "0px",
        y: "0px"
      };
      break;
    case "custom":
      effect.properties = {};
      break;
  }
  
  updatedEffects[props.currentIndex] = effect;
  emit("update", updatedEffects);
};

// 更新缓动函数
const updateEase = (ease: string) => {
  if (!props.currentEffect) return;
  
  const updatedEffects = [...props.effects];
  updatedEffects[props.currentIndex] = {
    ...updatedEffects[props.currentIndex],
    ease
  };
  
  emit("update", updatedEffects);
};

// 更新持续时间
const updateDuration = (duration: number) => {
  if (!props.currentEffect) return;
  
  const updatedEffects = [...props.effects];
  updatedEffects[props.currentIndex] = {
    ...updatedEffects[props.currentIndex],
    duration
  };
  
  emit("update", updatedEffects);
};

// 更新延迟时间
const updateDelay = (delay: number) => {
  if (!props.currentEffect) return;
  
  const updatedEffects = [...props.effects];
  updatedEffects[props.currentIndex] = {
    ...updatedEffects[props.currentIndex],
    delay
  };
  
  emit("update", updatedEffects);
};

// 更新方向
const updateDirection = (direction: string) => {
  if (!props.currentEffect) return;
  
  const updatedEffects = [...props.effects];
  updatedEffects[props.currentIndex] = {
    ...updatedEffects[props.currentIndex],
    direction
  };
  
  emit("update", updatedEffects);
};

// 是否显示方向选择器
const showDirectionSelector = computed(() => {
  return props.currentEffect?.type === 'slide';
});

// 是否显示自定义属性编辑器
const showCustomProperties = computed(() => {
  return props.currentEffect?.type === 'custom';
});
</script>

<template>
  <div class="effect-controls">
    <div v-if="currentEffect" class="control-container">
      <!-- 效果类型 -->
      <div class="control-row">
        <div class="control-label">{{ t('animation.effect.type') }}</div>
        <customSelect 
          v-model="currentEffect.type" 
          @change="updateEffectType"
          class="control-input control-input-small"
          :options="effectTypeOptions"
        />
      </div>
      
      <!-- 缓动函数 -->
      <div class="control-row">
        <div class="control-label">{{ t('animation.effect.ease') }}</div>
        <customSelect 
          v-model="currentEffect.ease" 
          @change="updateEase"
          class="control-input"
          :options="easeOptions"
        />
      </div>
      
      <!-- 持续时间 -->
      <div class="control-row">
        <div class="control-label">{{ t('animation.duration') }}</div>
        <customInputNumber 
          v-model="currentEffect.duration" 
          :min="0.1" 
          :max="10" 
          :step="0.01"
          :precision="2"
          @change="updateDuration"
          class="control-input-number"
          
          controls-position="right"
        />
      </div>
      
      <!-- 延迟时间 -->
      <div class="control-row">
        <div class="control-label">{{ t('animation.delay') }}</div>
        <customInputNumber 
          v-model="currentEffect.delay" 
          :min="0" 
          :max="10" 
          :step="0.01"
          :precision="2"
          @change="updateDelay"
          class="control-input-number"
          
          controls-position="right"
        />
      </div>
      
      <!-- 方向选择器 -->
      <div v-if="showDirectionSelector" class="control-row">
        <div class="control-label">{{ t('animation.effect.direction.title') }}</div>
        <customSelect 
          v-model="currentEffect.direction" 
          @change="updateDirection"
          class="control-input-small"
          disabled
          :options="directionOptions"
        />
      </div>
      
      <!-- 自定义属性提示 -->
      <div v-if="showCustomProperties" class="control-row custom-row">
        <div class="control-label">{{ t('animation.custom') }}</div>
        <div class="custom-properties-hint">
          {{ t('animation.customHint', '请通过拖拽预览元素来设置自定义属性') }}
        </div>
      </div>
    </div>
    
    <div class="effect-actions">
      <customButton  @click="$emit('add')" theme="primary" :disabled="effects.length >= 5">
        {{ t('animation.effect.add') }}
      </customButton>
      
      <customButton 
         
        @click="$emit('delete')" 
        type="danger" 
        :disabled="effects.length <= 1"
      >
        {{ t('animation.effect.delete') }}
      </customButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
.effect-controls {
    width: 100%;
  
  .control-container {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 16px;
  }
  
  .control-row {
    display: flex;
    align-items: center;
    min-width: 180px;
    
    &.custom-row {
      width: 100%;
    }
  }
  
  .control-label {
    font-size: 14px;
    color: var(--ml-text-color-regular);
    margin-right: 8px;
    flex-shrink: 0;
  }
  
  .control-input {
    width: 160px;
  }
  
  .control-input-number {
    width: 90px;
  }
  
  .custom-properties-hint {
    font-size: 12px;
    color: var(--ml-text-color-secondary);
    padding: 4px 8px;
    background-color: var(--ml-fill-color-light);
    border-radius: var(--ml-radius-small);
    flex: 1;
  }
  
  .effect-actions {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 16px;
  }
}
</style>