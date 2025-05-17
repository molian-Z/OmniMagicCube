<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from "vue";
import { useI18n } from "vue-i18n";
import { gsap } from "gsap";
const customComps: any = inject("customComps");
const { customTooltip } = customComps;

import { AnimationEffect } from "../../types/animation";

const props = defineProps({
  currentEffect: {
    type: Object as () => AnimationEffect | null,
    default: null,
  },
  isPlaying: {
    type: Boolean,
    default: false,
  },
  // 添加所有效果的数组
  effects: {
    type: Array as () => AnimationEffect[],
    default: () => [],
  },
  // 当前时间
  currentTime: {
    type: Number,
    default: 0,
  },
  // 总时长
  totalDuration: {
    type: Number,
    default: 3,
  },
});

const emit = defineEmits<{
  (e: "effectUpdate", effects: AnimationEffect[]): void;
}>();

const { t } = useI18n();

// 预览元素引用
const previewContainer = ref<HTMLElement | null>(null);
const previewElement = ref<HTMLElement | null>(null);

// 动画时间轴
const timeline = ref<gsap.core.Timeline | null>(null);

// 初始化拖拽事件
onMounted(() => {
  if (previewElement.value) {
    initDragEvents();
    createTimeline();
  }
});

// 清理资源
onBeforeUnmount(() => {
  if (timeline.value) {
    timeline.value.kill();
  }
});

// 创建动画时间轴
// 添加一个标志变量
const skipReset = ref(false);

const createTimeline = () => {
  if (!previewElement.value || !props.effects || props.effects.length === 0) return;

  // 清理旧时间轴
  if (timeline.value) {
    timeline.value.kill();
  }

  // 创建新时间轴
  const tl = gsap.timeline({ paused: true });
  
  // 无论是否跳过重置，都需要设置时间轴的初始状态
  // 只有在不跳过重置时才重置元素位置
  if (!skipReset.value) {
    gsap.set(previewElement.value, {
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      opacity: 1,
    });
  } else {
    // 即使跳过重置，也需要为时间轴设置初始状态
    // 但不改变当前元素的实际位置
    tl.set(previewElement.value, {
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      opacity: 1,
    }, 0);
    
    // 重置标志
    skipReset.value = false;
  }

  // 添加所有效果
  props.effects.forEach((effect) => {
    if (!effect) return;

    const config: gsap.TweenVars = {
      duration: effect.duration || 0.5,
      delay: effect.delay || 0,
      ease: effect.ease || "power2.out",
    };

    // 根据效果类型设置属性
    switch (effect.type) {
      case "fade":
        config.opacity = effect.to?.opacity !== undefined ? effect.to.opacity : 1;
        break;
      case "scale":
        config.scale = effect.to?.scale !== undefined ? effect.to.scale : 1;
        break;
      case "rotate":
        config.rotation = effect.to?.rotation !== undefined ? effect.to.rotation : 0;
        break;
      case "slide":
        // 优先使用保存的 x 和 y 值进行斜向移动
        if (effect.properties?.x && effect.properties?.y) {
          // 使用实际的 x 和 y 值
          config.x = effect.properties.x;
          config.y = effect.properties.y;
        } else {
          // 兼容旧数据，使用方向和距离
          const distance = effect.properties?.distance || "100%";

          // 处理斜向方向
          if (effect.direction === "topLeft") {
            config.x = `-${distance}`;
            config.y = `-${distance}`;
          } else if (effect.direction === "topRight") {
            config.x = distance;
            config.y = `-${distance}`;
          } else if (effect.direction === "bottomLeft") {
            config.x = `-${distance}`;
            config.y = distance;
          } else if (effect.direction === "bottomRight") {
            config.x = distance;
            config.y = distance;
          } else if (effect.direction === "up") {
            config.y = `-${distance}`;
          } else if (effect.direction === "down") {
            config.y = distance;
          } else if (effect.direction === "left") {
            config.x = `-${distance}`;
          } else if (effect.direction === "right") {
            config.x = distance;
          }
        }
        break;
      case "custom":
        if (effect.properties) {
          Object.assign(config, effect.properties);
        }
        break;
    }

    tl.to(previewElement.value, config, effect.delay);
  });
  timeline.value = tl;
};

// 监听播放状态变化
watch(
  () => props.isPlaying,
  (isPlaying) => {
    if (!timeline.value) return;

    if (isPlaying) {
      // 从当前时间开始播放
      timeline.value.seek(props.currentTime);
      timeline.value.play();
    } else {
      timeline.value.pause();
    }
  }
);

// 监听当前时间变化
watch(
  () => props.currentTime,
  (newTime) => {
    if (!timeline.value) return;

    // 更新时间轴位置
    timeline.value.seek(newTime);
  }
);

// 监听效果变化，重新创建时间轴
watch(
  () => props.effects,
  () => {
    createTimeline();
  },
  { deep: true }
);

// 初始化拖拽事件
const initDragEvents = () => {
  if (!previewElement.value) return;

  const element = previewElement.value;
  let startX = 0;
  let startY = 0;
  let startScale = 1;
  let startRotation = 0;
  let startOpacity = 1;
  let elementStartX = 0;
  let elementStartY = 0;

  // 拖拽处理
  const onDragStart = (e: MouseEvent) => {
    if (!props.currentEffect) return;

    e.preventDefault();

    // 记录起始位置
    startX = e.clientX;
    startY = e.clientY;

    // 获取当前变换
    const style = getComputedStyle(element);
    const transform = new DOMMatrix(style.transform);
    startScale = transform.a;
    startRotation = Math.atan2(transform.b, transform.a) * (180 / Math.PI);
    startOpacity = parseFloat(style.opacity);

    // 记录元素初始位置
    elementStartX = transform.e;
    elementStartY = transform.f;

    document.addEventListener("mousemove", onDragMove);
    document.addEventListener("mouseup", onDragEnd);
  };

  const onDragMove = (e: MouseEvent) => {
    if (!props.currentEffect) return;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    // 根据效果类型应用不同的变换
    switch (props.currentEffect.type) {
      case "slide":
        // 直接使用鼠标移动的差值来设置元素位置
        gsap.set(element, {
          x: elementStartX + deltaX,
          y: elementStartY + deltaY, // 确保垂直方向的移动也被应用
        });
        break;
      case "scale":
        const newScale = startScale + deltaX * 0.01;
        gsap.set(element, { scale: Math.max(0.1, newScale) });
        break;
      case "rotate":
        const newRotation = startRotation + deltaX * 0.5;
        gsap.set(element, { rotation: newRotation });
        break;
      case "fade":
        const newOpacity = startOpacity + deltaX * 0.01;
        gsap.set(element, { opacity: Math.max(0, Math.min(1, newOpacity)) });
        break;
    }
  };

  const onDragEnd = () => {
    if (!props.currentEffect) return;

    document.removeEventListener("mousemove", onDragMove);
    document.removeEventListener("mouseup", onDragEnd);

    // 更新效果配置
    const effect = { ...props.currentEffect };

    if (!effect.to) effect.to = {};

    // 根据效果类型保存最终状态
    switch (effect.type) {
      case "slide":
        const transform = getComputedStyle(element).transform;
        const matrix = new DOMMatrix(transform);
        effect.to.x = matrix.e;
        effect.to.y = matrix.f;

        // 保存实际的 x 和 y 值
        if (!effect.properties) effect.properties = {};
        effect.properties.x = `${effect.to.x}px`;
        effect.properties.y = `${effect.to.y}px`;

        // 根据 x 和 y 的值判断实际方向，包括斜向
        const absX = Math.abs(effect.to.x);
        const absY = Math.abs(effect.to.y);

        // 判断是否为斜向移动
        const isSignificantMove = absX > 10 || absY > 10; // 移动距离超过10px才算有效移动
        const isDiagonal = isSignificantMove && absX > 10 && absY > 10; // 水平和垂直方向都有明显移动

        if (isDiagonal) {
          // 斜向移动
          if (effect.to.x > 0 && effect.to.y < 0) {
            effect.direction = "topRight"; // 右上
          } else if (effect.to.x < 0 && effect.to.y < 0) {
            effect.direction = "topLeft"; // 左上
          } else if (effect.to.x > 0 && effect.to.y > 0) {
            effect.direction = "bottomRight"; // 右下
          } else {
            effect.direction = "bottomLeft"; // 左下
          }
        } else {
          // 单一方向移动
          if (absX > absY) {
            effect.direction = effect.to.x > 0 ? "right" : "left";
          } else {
            effect.direction = effect.to.y > 0 ? "down" : "up";
          }
        }

        // 设置距离
        effect.properties.distance = `${Math.sqrt(absX * absX + absY * absY)}px`; // 使用直线距离
        break;
      case "scale":
        const matches = getComputedStyle(element).transform.match(/matrix\(([^,]*)/);
        effect.to.scale = matches ? parseFloat(matches[1]) : 1;
        break;
      case "rotate":
        const style = getComputedStyle(element);
        const rotateMatrix = new DOMMatrix(style.transform);
        effect.to.rotation = Math.atan2(rotateMatrix.b, rotateMatrix.a) * (180 / Math.PI);
        break;
      case "fade":
        effect.to.opacity = parseFloat(getComputedStyle(element).opacity);
        break;
    }

    // 获取父组件中的所有效果
    const allEffects = [...(props.effects || [])];

    // 找到当前效果的索引并更新
    const currentIndex = allEffects.findIndex(
      (e) =>
        e === props.currentEffect ||
        (e.type === props.currentEffect?.type &&
          e.duration === props.currentEffect?.duration &&
          e.delay === props.currentEffect?.delay)
    );

    if (currentIndex !== -1) {
      allEffects[currentIndex] = effect;
      skipReset.value = true;
      emit("effectUpdate", allEffects);
    } else {
      // 如果找不到当前效果，则添加到数组末尾
      allEffects.push(effect);
      skipReset.value = true;
      emit("effectUpdate", allEffects);
    }
  };

  // 添加拖拽事件监听
  element.addEventListener("mousedown", onDragStart);
};

// 暴露预览元素给父组件
defineExpose({
  previewElement,
  timeline,
});
</script>

<template>
  <div class="preview-container" ref="previewContainer">
    <div class="preview-element" ref="previewElement">
      {{ t("animation.previewElement") }}
    </div>

    <div class="edit-hint" v-if="currentEffect">
      <customTooltip :content="t('animation.dragHint')">
        <svg-icon icon="info-filled" />
      </customTooltip>
      {{ t(`animation.effect.${currentEffect.type}`) }}
    </div>
  </div>
</template>

<style scoped lang="scss">
.preview-container {
  position: relative;
  height: 300px;
  background-color: var(--ml-bg-color);
  border: 1px solid var(--ml-border-color);
  border-radius: var(--ml-radius-base);
  overflow: hidden;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;

  .preview-element {
    width: 100px;
    height: 100px;
    background-color: var(--ml-primary-color-light);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ml-primary-color);
    font-weight: bold;
    border-radius: var(--ml-radius-base);
    cursor: move;
    user-select: none;
    position: relative;

    &:hover::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border: 2px dashed var(--ml-primary-color);
      border-radius: var(--ml-radius-base);
      pointer-events: none;
    }
  }

  .edit-hint {
    position: absolute;
    top: 8px;
    left: 8px;
    background-color: rgba(255, 255, 255, 0.8);
    padding: 4px 8px;
    border-radius: var(--ml-radius-small);
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .control-points {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
  }
}
</style>
