<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import { AnimationManager } from "./services/animation-manager";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const props = defineProps({
  componentId: {
    type: [String, Object],
    required: true,
  },
  animationConfig: {
    type: Object as PropType<AnimationConfig>,
    required: true,
  },
  animationType: {
    type: String,
    required: true,
  },
  playing: {
    type: Boolean,
    default: false,
  },
  // 添加内联模式属性
  inlineMode: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["animation-end", 'close']);

const previewElement = ref<any>(null);
const previewContainer = ref<any>(null);
let animationManager: AnimationManager | null = null;

// 监听playing变化，当为true时执行动画
watch(() => props.playing, (newVal) => {
  if (newVal) {
    // 开始播放动画的逻辑
    playAnimation();
  } else {
    // 停止动画的逻辑
    stopAnimation();
  }
});

// 初始化动画管理器
onMounted(() => {
  // 在元素可用时初始化
  if (previewElement.value) {
    initAnimationManager();
  }
});

// 清理动画实例
onBeforeUnmount(() => {
  stopAnimation();
  if (animationManager) {
    animationManager.destroy();
    animationManager = null;
  }
});

// 初始化动画管理器
const initAnimationManager = () => {
  if (!previewElement.value) return;
  
  // 创建动画配置对象 - 修改为正确的结构
  let animations = {};
  
  if (props.animationType === 'enter' || props.animationType === 'leave') {
    animations = {
      [props.animationType]: [props.animationConfig]  // 注意这里使用数组
    };
  } else if (props.animationType === 'stateChange' || props.animationType === 'interaction') {
    animations = {
      [props.animationType]: {
        [props.animationConfig.stateName || props.animationConfig.name]: props.animationConfig
      }
    };
  }
  
  // 创建动画管理器
  animationManager = new AnimationManager(
    previewElement.value,
    animations,
    { componentId: props.componentId }
  );
};

// 播放动画
const playAnimation = () => {
  if (!previewElement.value) {
    console.warn('预览元素不可用');
    return;
  }

  // 确保动画管理器已初始化
  if (!animationManager) {
    initAnimationManager();
  } else {
    // 更新动画配置 - 修改为正确的结构
    let animations = {};
    
    if (props.animationType === 'enter' || props.animationType === 'leave') {
      
      animations = {
        [props.animationType]: [props.animationConfig]  // 注意这里使用数组
      };
    } else if (props.animationType === 'stateChange' || props.animationType === 'interaction') {
      animations = {
        [props.animationType]: {
          [props.animationConfig.stateName || props.animationConfig.name]: props.animationConfig
        }
      };
    }
    
    // 重新创建动画管理器
    animationManager.destroy();
    animationManager = new AnimationManager(
      previewElement.value,
      animations,
      { componentId: props.componentId }
    );
  }
  
  // 根据动画类型触发相应的动画
  let animation;
  if (props.animationType === 'enter') {
    animation = animationManager?.setupEnterAnimation();
  } else if (props.animationType === 'leave') {
    animation = animationManager?.setupLeaveAnimation();
  } else {
    // 对于状态变化和交互动画，使用triggerAnimation方法
    const animName = props.animationConfig.stateName || props.animationConfig.name || 'default';
    animation = animationManager?.triggerAnimation(props.animationType, animName);
  }
  
  // 使用GSAP的onComplete回调
  if (animation && animation.eventCallback) {
    animation.eventCallback("onComplete", animationComplete);
  } else {
    // 如果无法获取动画实例或不支持回调，使用计时器作为备选方案
    let totalDuration = 0;
    if (props.animationConfig.effects && props.animationConfig.effects.length > 0) {
      props.animationConfig.effects.forEach((effect: { duration?: number; delay?: number }) => {
        const effectDuration = (effect.duration || 0.3) + (effect.delay || 0);
        totalDuration = Math.max(totalDuration, effectDuration);
      });
    } else {
      totalDuration = 1;
    }
    
    setTimeout(() => {
      animationComplete();
    }, totalDuration * 1000 + 500);
  }
};

// 停止动画
const stopAnimation = () => {
  if (animationManager) {
    // 清理当前动画，但不销毁管理器
    if (props.animationType === 'enter' || props.animationType === 'leave') {
      // 这里可以添加特定的清理逻辑
    }
  }
};

// 关闭预览
const closePreview = () => {
  stopAnimation();
  emit("close");
};

// 动画结束时触发事件
const animationComplete = () => {
  // 重置元素样式到初始状态
  if (previewElement.value && animationManager) {
    animationManager.resetStyles(previewElement.value);
  }
  emit('animation-end');
};
</script>

<template>
  <!-- 如果是内联模式，直接显示预览元素 -->
  <div v-if="inlineMode" class="preview-element">
    <!-- 预览元素内容 -->
    <div class="preview-box" ref="previewElement">
      {{ t("animation.previewElement") }}
    </div>
  </div>
  <!-- 如果不是内联模式，使用弹出层 -->
  <div v-else class="animation-preview-popup" v-show="playing">
    <div class="preview-popup-header">
      <span>{{ t("animation.preview") }}</span>
      <button class="close-button" @click="closePreview">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path
            fill="currentColor"
            d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
          />
        </svg>
      </button>
    </div>
    <div class="preview-popup-content" ref="previewContainer">
      <div class="preview-element" ref="previewElement"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
// 添加内联模式的样式
.preview-element {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .preview-box {
    width: 100px;
    height: 100px;
    background-color: var(--ml-primary-color-light);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ml-primary-color);
    font-weight: bold;
    border-radius: var(--ml-radius-base);
  }
}

// 悬浮预览弹窗
.preview-popup {
  position: fixed;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 240px;
  background-color: var(--ml-bg-color);
  border-radius: 0 var(--ml-radius-base) var(--ml-radius-base) 0;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;

  .preview-popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--ml-pd-base);
    border-bottom: 1px solid var(--ml-border-color-light);

    span {
      font-size: 14px;
      font-weight: 500;
    }

    .close-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border: none;
      background: transparent;
      color: var(--ml-text-color-secondary);
      cursor: pointer;
      border-radius: 50%;
      transition: all 0.2s;

      &:hover {
        background-color: var(--ml-fill-color-3);
        color: var(--ml-text-color-primary);
      }
    }
  }

  .preview-popup-content {
    height: 200px;
    padding: var(--ml-pd-lg);
    display: flex;
    align-items: center;
    justify-content: center;

    .preview-element {
      width: 80px;
      height: 80px;
      background-color: var(--ml-primary-color);
      border-radius: var(--ml-radius-small);
    }
  }
}

// 过渡动画
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-100%) translateY(-50%);
  opacity: 0;
}
</style>
