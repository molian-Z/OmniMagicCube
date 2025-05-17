<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { gsap } from "gsap";
import TimelineCanvas from "./TimelineCanvas.vue";
import PreviewArea from "./PreviewArea.vue";
import EffectControls from "./EffectControls.vue";
import TimelineControls from "./TimelineControls.vue";
import { EffectProperty, EffectTo, AnimationEffect } from "../../types/animation";

const props = defineProps({
  modelValue: {
    type: Array as () => AnimationEffect[],
    default: () => [],
  },
  previewElement: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits<{
  (e: "update:modelValue", value: AnimationEffect[]): void;
}>();

const { t } = useI18n();

// 时间轴相关状态
const currentTime = ref(0);
const totalDuration = ref(3); // 默认3秒时长
const isPlaying = ref(false);
const previewAnimation = ref<gsap.core.Timeline | null>(null);
const animationUpdateInterval = ref<number | null>(null);

// 预览区域引用
const previewAreaRef = ref<InstanceType<typeof PreviewArea> | null>(null);
const previewElementRef = ref<HTMLElement | null>(null);

// 当前编辑的效果索引
const currentEffectIndex = ref(0);

// 当前编辑的效果
const currentEffect = computed(() => {
  return props.modelValue[currentEffectIndex.value] || null;
});

// 获取预览元素
onMounted(() => {
  nextTick(() => {
    if (previewAreaRef.value) {
      previewElementRef.value = previewAreaRef.value.previewElement;
      updateAnimation();
    }
  });
});

// 计算总动画时长
const computeTotalDuration = () => {
  let maxDuration = 0;
  props.modelValue.forEach((effect) => {
    const effectEnd = effect.delay + effect.duration;
    if (effectEnd > maxDuration) {
      maxDuration = effectEnd;
    }
  });
  return Math.max(3, maxDuration + 0.5); // 至少3秒，并添加0.5秒缓冲
};

// 更新动画
const updateAnimation = () => {
  // 停止当前动画
  if (previewAnimation.value) {
    previewAnimation.value.kill();
  }
  
  if (!previewElementRef.value) return;
  
  // 创建时间轴
  const timeline = gsap.timeline({ 
    paused: true,
    onUpdate: () => {
      // 更新当前时间
      if (isPlaying.value) {
        currentTime.value = timeline.time();
      }
    },
    onComplete: () => {
      // 动画完成时停止
      isPlaying.value = false;
      if (animationUpdateInterval.value) {
        clearInterval(animationUpdateInterval.value);
        animationUpdateInterval.value = null;
      }
    }
  });
  
  // 添加效果
  props.modelValue.forEach(effect => {
    const config: gsap.TweenVars = {
      duration: effect.duration,
      delay: effect.delay,
      ease: effect.ease || "power2.out"
    };
    
    // 根据效果类型设置属性
    switch (effect.type) {
      case "fade":
        config.opacity = effect.to?.opacity || 1;
        break;
      case "scale":
        config.scale = effect.to?.scale || 1;
        break;
      case "rotate":
        config.rotation = effect.to?.rotation || 0;
        break;
      case "slide":
        if (effect.direction === "up") {
          config.y = `-${effect.properties?.distance || "100%"}`;
        } else if (effect.direction === "down") {
          config.y = effect.properties?.distance || "100%";
        } else if (effect.direction === "left") {
          config.x = `-${effect.properties?.distance || "100%"}`;
        } else if (effect.direction === "right") {
          config.x = effect.properties?.distance || "100%";
        }
        break;
      case "custom":
        Object.assign(config, effect.properties || {});
        break;
    }
    
    // 使用实际的DOM元素引用而不是选择器
    timeline.to(previewElementRef.value, config, effect.delay);
  });
  
  // 保存动画引用
  previewAnimation.value = timeline;
  
  // 更新预览位置
  updatePreviewPosition();
};

// 更新预览位置
const updatePreviewPosition = () => {
  if (!previewAnimation.value) return;
  
  // 设置时间轴位置
  previewAnimation.value.seek(currentTime.value);
};

// 播放预览
const playPreview = () => {
  if (!previewAnimation.value || !previewElementRef.value) return;
  
  isPlaying.value = true;
  
  // 从当前时间开始播放
  previewAnimation.value.seek(currentTime.value);
  
  // 如果已经到达结尾，则从头开始
  if (currentTime.value >= totalDuration.value) {
    currentTime.value = 0;
    previewAnimation.value.seek(0);
  }
  
  previewAnimation.value.play();
  
  // 创建更新间隔，确保UI更新
  if (animationUpdateInterval.value) {
    clearInterval(animationUpdateInterval.value);
  }
  
  animationUpdateInterval.value = window.setInterval(() => {
    if (previewAnimation.value && isPlaying.value) {
      currentTime.value = previewAnimation.value.time();
      
      // 如果到达结尾，停止播放
      if (currentTime.value >= totalDuration.value) {
        pausePreview();
      }
    }
  }, 30); // 约30fps的更新频率
};

// 暂停预览
const pausePreview = () => {
  isPlaying.value = false;
  
  if (previewAnimation.value) {
    previewAnimation.value.pause();
  }
  
  if (animationUpdateInterval.value) {
    clearInterval(animationUpdateInterval.value);
    animationUpdateInterval.value = null;
  }
};

const playToggle = () => {
  if (isPlaying.value) {
    pausePreview();
  } else {
    playPreview();
  }
};

// 添加新效果
const addEffect = () => {
  const newEffect: AnimationEffect = {
    type: "fade",
    duration: 0.5,
    delay: 0,
    ease: "power2.out",
    to: { opacity: 1 }
  };
  
  emit("update:modelValue", [...props.modelValue, newEffect]);
  currentEffectIndex.value = props.modelValue.length;
  
  // 更新总时长
  nextTick(() => {
    totalDuration.value = computeTotalDuration();
    updateAnimation();
  });
};

// 删除当前效果
const deleteEffect = () => {
  if (props.modelValue.length <= 1) return;
  
  const updatedEffects = [...props.modelValue];
  updatedEffects.splice(currentEffectIndex.value, 1);
  
  // 更新当前索引
  if (currentEffectIndex.value >= updatedEffects.length) {
    currentEffectIndex.value = updatedEffects.length - 1;
  }
  
  emit("update:modelValue", updatedEffects);
  
  // 更新总时长
  nextTick(() => {
    totalDuration.value = computeTotalDuration();
    updateAnimation();
  });
};

// 处理时间轴更新
const handleTimeUpdate = (time: number) => {
  currentTime.value = time;
  updatePreviewPosition();
};

// 处理效果更新
const handleEffectUpdate = (effects: AnimationEffect[]) => {
  emit("update:modelValue", effects);
  nextTick(() => {
    totalDuration.value = computeTotalDuration();
    updateAnimation();
  });
};

// 监听模型变化
watch(() => props.modelValue, () => {
  updateAnimation();
}, { deep: true });

// 清理定时器
onUnmounted(() => {
  if (animationUpdateInterval.value) {
    clearInterval(animationUpdateInterval.value);
    animationUpdateInterval.value = null;
  }
  
  if (previewAnimation.value) {
    previewAnimation.value.kill();
  }
});

// 初始化
nextTick(() => {
  totalDuration.value = computeTotalDuration();
});
</script>

<template>
  <div class="visual-effect-editor">
    <PreviewArea 
      ref="previewAreaRef"
      :current-effect="currentEffect"
      :is-playing="isPlaying"
      :effects="modelValue"
      :current-time="currentTime"
      :total-duration="totalDuration"
      @effect-update="handleEffectUpdate"
    />
    
    <TimelineCanvas 
      :effects="modelValue"
      :current-time="currentTime"
      :total-duration="totalDuration"
      :current-effect-index="currentEffectIndex"
      :is-playing="isPlaying"
      @time-update="handleTimeUpdate"
      @effect-select="currentEffectIndex = $event"
      @effect-update="handleEffectUpdate"
      @play-toggle="playToggle"
      @play="playPreview"
      @pause="pausePreview"
    />
    
    <div class="controls-container">
      <EffectControls 
        :effects="modelValue"
        :current-effect="currentEffect"
        :current-index="currentEffectIndex"
        @add="addEffect"
        @delete="deleteEffect"
        @update="handleEffectUpdate"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.visual-effect-editor {
  margin-bottom: 16px;
  
  .controls-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    margin-top: 8px;
  }
}
</style>