<script setup lang="ts">
import { computed } from 'vue';
import { useElementBounding } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import { compsEls } from "../../designerData";
import { calculateDropHintZIndex } from '../../constants/zIndex';
const { t } = useI18n();

// 添加 treeIndex 属性
interface Props {
  type: 'prefix' | 'suffix';
  comp: any;
  index: number;
  dropKey: string;
  dropType: string | null;
  comps: any;
  treeIndex: number; // 新增属性
  layout?: 'horizontal' | 'vertical'; // 新增布局属性
}
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'drop', event: DragEvent, index: number, slotVal: any, comp: any): void;
  (e: 'dragenter', index: number, comp: any, type: string | null, data: any[]): void;
}>();
const classes = computed(() => [
  `${props.type}-drop-slot`,
  props.dropKey === props.comp.key && props.dropType === (props.type === 'prefix' ? 'prev' : 'next') && 'dropping-comp'
]);
// 使用全局配置计算 zIndex
const zIndex = computed(() => {
  return calculateDropHintZIndex(props.treeIndex);
});
const dropIndex = computed(() => props.type === 'prefix' ? props.index : props.index + 1);

// 获取当前组件和父级元素的位置信息
const currentEl = computed(() => compsEls[props.comp.id]);
const parentEl = computed(() => currentEl.value?.parentElement);
// 使用 useElementBounding 获取元素位置信息
const { width, x: currentX, y: currentY } = useElementBounding(currentEl);
const { x: parentX, y: parentY } = useElementBounding(parentEl);

const hintText = computed(() => 
  t('container.drop') +
  t(props.comps[props.comp.name].title) +
  t('container.component') +
  t(props.type === 'prefix' ? 'container.before' : 'container.after')
);

// 计算相对位置
const relativePosition = computed(() => ({
  x: currentX.value - parentX.value,
  y: currentY.value - parentY.value
}));
// 优化 dropStyle 计算，改善定位精度
const dropStyle: any = computed(() => {
  const isHorizontal = props.layout === 'horizontal';
  const offset = 4; // 增加偏移量，避免重叠
  
  return {
    zIndex: zIndex.value,
    position: 'absolute',
    pointerEvents: 'auto',
    ...(isHorizontal ? {
      top: `${relativePosition.value.y}px`,
      [props.type === 'prefix' ? 'left' : 'right']: `${props.type === 'prefix' ? -offset : offset}px`,
      transform: 'none',
      height: '100%',
      minHeight: '32px'
    } : {
      left: `${relativePosition.value.x}px`,
      [props.type === 'prefix' ? 'top' : 'bottom']: `${props.type === 'prefix' ? -offset : offset}px`,
      transform: 'none',
      width: '100%',
      minWidth: '32px'
    }),
    overflow: 'visible'
  };
});

// 优化 hintStyle 计算，改善视觉效果和交互
const hintStyle: any = computed(() => {
  const isHorizontal = props.layout === 'horizontal';
  const elementWidth = width.value || 0;
  
  return {
    zIndex: zIndex.value,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--ml-primary-color-1)',
    border: '2px dashed var(--ml-primary-color)',
    borderRadius: '4px',
    fontSize: '12px',
    color: 'var(--ml-primary-color)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    cursor: 'copy',
    transition: 'all 0.2s ease',
    ...(isHorizontal ? {
      height: '100%',
      width: '32px',
      minHeight: '32px',
      writingMode: 'vertical-rl',
      textOrientation: 'mixed'
    } : {
      width: elementWidth > 50 ? `${elementWidth}px` : '120px',
      height: '32px',
      minWidth: '120px',
      writingMode: 'horizontal-tb'
    })
  };
});
</script>

<template>
  <transition name="fade">
    <div class="drop__empty" :style="dropStyle" v-if="dropKey === comp.key">
      <div
        :class="classes"
        :style="hintStyle"
        @drop.self.stop="$emit('drop', $event, dropIndex, null, comp)"
        @dragover.self.prevent="$emit('dragenter', index, comp, type === 'prefix' ? 'prev' : 'next', ($parent as any)?.compData)"
      >
        {{ hintText }}
      </div>
    </div>
  </transition>
</template>

<style lang="scss" scoped>
.drop__empty {
  pointer-events: auto;
}

.prefix-drop-slot,
.suffix-drop-slot {
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--ml-primary-color-2) !important;
    transform: scale(1.02);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  &.dropping-comp {
    background-color: var(--ml-primary-color-2) !important;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
