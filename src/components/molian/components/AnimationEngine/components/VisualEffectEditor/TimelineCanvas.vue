<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount, computed } from "vue";
import { AnimationEffect } from "../../types/animation";
import { useI18n } from "vue-i18n";
import { useTimelineDrawing } from "../../composables/useTimelineDrawing";
import { useTimelineEvents } from "../../composables/useTimelineEvents";
import { useTimelineKeyboard } from "../../composables/useTimelineKeyboard";
import TimelineControls from "./TimelineControls.vue";

const props = defineProps({
  effects: {
    type: Array as () => AnimationEffect[],
    required: true
  },
  currentTime: {
    type: Number,
    required: true
  },
  totalDuration: {
    type: Number,
    required: true
  },
  currentEffectIndex: {
    type: Number,
    required: true
  },
  isPlaying: { // 添加isPlaying属性
    type: Boolean,
    default: false
  }
});

const emit = defineEmits<{
  (e: "time-update", time: number): void;
  (e: "effect-select", index: number): void;
  (e: "effect-update", effects: AnimationEffect[]): void;
  (e: "play-toggle"): void;
  (e: "play"): void; // 添加play事件
  (e: "pause"): void; // 添加pause事件
}>();

const { t } = useI18n();

// 时间轴相关状态
const timelineCanvas = ref<HTMLCanvasElement | null>(null);
const timelineCtx = ref<CanvasRenderingContext2D | null>(null);
const timelineWidth = ref(1052);
const timelineHeight = ref(220);
const timeScale = ref(100); // 每秒像素数
const isDragging = ref(false);
const selectedKeyframe = ref<{
  effect: AnimationEffect;
  index: number;
  type: "start" | "end";
} | null>(null);

// 添加键盘快捷键相关状态
const isKeyboardFocused = ref(false);

// 使用计算属性来包装props，这样composables可以正确访问值
const effectsComputed = computed(() => props.effects);
const currentTimeComputed = computed(() => props.currentTime);
const totalDurationComputed = computed(() => props.totalDuration);
const currentEffectIndexComputed = computed(() => props.currentEffectIndex);

// 使用 composables
const { drawTimeline } = useTimelineDrawing(
  timelineCtx,
  timelineWidth,
  timelineHeight,
  timeScale,
  effectsComputed,
  currentTimeComputed,
  totalDurationComputed,
  currentEffectIndexComputed,
  t
);

const { 
  handleMouseDown, 
  handleMouseMove, 
  handleMouseUp, 
  zoomIn, 
  zoomOut, 
  resetZoom, 
  handleWheel 
} = useTimelineEvents(
  timelineCanvas,
  timeScale,
  isDragging,
  selectedKeyframe,
  effectsComputed,
  totalDurationComputed,
  drawTimeline,
  emit
);

const { 
  handleKeyDown, 
  handleFocus, 
  handleBlur 
} = useTimelineKeyboard(
  isKeyboardFocused,
  currentTimeComputed,
  totalDurationComputed,
  currentEffectIndexComputed,
  effectsComputed,
  emit
);

// 初始化画布
onMounted(() => {
  if (timelineCanvas.value) {
    timelineCtx.value = timelineCanvas.value.getContext("2d");
    drawTimeline();
    
    // 添加全局键盘事件监听
    window.addEventListener('keydown', handleKeyDown);
  }
});

// 在组件卸载时移除事件监听
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

// 监听属性变化
watch([() => props.currentTime, () => props.totalDuration, () => props.effects, () => props.currentEffectIndex], () => {
  drawTimeline();
}, { deep: true });
</script>

<template>
  <div class="timeline-container" 
       tabindex="0" 
       @focus="handleFocus" 
       @blur="handleBlur">
    <!-- 添加缩放控制 -->
    <div class="timeline-zoom-controls">
      <ElButton class="zoom-button" @click="zoomIn" title="放大">+</ElButton>
      <ElButton class="zoom-button" @click="zoomOut" title="缩小">-</ElButton>
      <ElButton class="zoom-button" style="width: 48px;" @click="resetZoom" title="重置缩放">100%</ElButton>
    </div>
    
    <canvas
      ref="timelineCanvas"
      :width="timelineWidth"
      :height="timelineHeight"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @wheel="handleWheel"
      class="timeline-canvas"
    ></canvas>
    
    <!-- 底部固定操作栏 -->
    <div class="timeline-bottom-toolbar">
      <div class="timeline-controls-wrapper">
        <TimelineControls
          :current-time="currentTime"
          :total-duration="totalDuration"
          :is-playing="isPlaying"
          @play="emit('play')"
          @pause="emit('pause')"
          @seek="emit('time-update', $event)"
        />
      </div>
      
      <div class="keyboard-shortcuts-hint">
        <span>{{ t('animation.effect.shortcuts.hint', '快捷键：') }}</span>
        <span>{{ t('animation.effect.shortcuts.playPause', '空格(播放/暂停)') }}</span>
        <span>{{ t('animation.effect.shortcuts.frameNavigation', '←→(前后帧)') }}</span>
        <span>{{ t('animation.effect.shortcuts.jumpToEnds', 'Home/End(开始/结束)') }}</span>
        <span>{{ t('animation.effect.shortcuts.deleteEffect', 'Delete(删除效果)') }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.timeline-container {
  border: 1px solid var(--ml-border-color);
  border-radius: var(--ml-radius-base);
  overflow: hidden;
  margin-bottom: 8px;
  position: relative;
  outline: none; // 移除焦点时的默认轮廓
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  
  &:focus {
    border-color: var(--ml-primary-color);
    box-shadow: 0 0 0 2px rgba(var(--ml-primary-color), 0.2);
  }
  
  .timeline-canvas {
    display: block;
    cursor: pointer;
    background-color: var(--ml-bg-color);
  }
  
  .timeline-zoom-controls {
    position: absolute;
    top: 5px;
    right: 10px;
    z-index: 10;
    display: flex;
    gap: 4px;
    
    .zoom-button {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      border: 1px solid var(--ml-border-color);
      background-color: white;
      margin-left: 0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      
      &:hover {
        background-color: var(--ml-fill-color);
      }
    }
  }
  
  /* 底部固定操作栏样式 */
  .timeline-bottom-toolbar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 36px;
    background-color: var(--ml-bg-color);
    box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;
    z-index: 10;
    
    .timeline-controls-wrapper {
      display: flex;
      align-items: center;
    }
    
    .keyboard-shortcuts-hint {
      display: flex;
      gap: 8px;
      font-size: 12px;
      color: var(--ml-text-color-7);
      
      span {
        white-space: nowrap;
      }
    }
  }
}
</style>