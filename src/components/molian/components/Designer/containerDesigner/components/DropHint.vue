<script setup lang="ts">
import { computed } from 'vue';
import { useElementBounding } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import { compsEls } from "../../designerData";
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
// 计算实际的 z-index 值
// 修改 z-index 计算逻辑，使用更大的基数和间隔
const baseZIndex = 100;
const zIndex = computed(() => baseZIndex + props.treeIndex * 2);
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
// 修改 dropStyle 计算
const dropStyle = computed(() => {
  const isHorizontal = props.layout === 'horizontal';
  const offset = props.type === 'prefix' ? -2 : 2;
  
  return {
    zIndex: zIndex.value,
    position: 'absolute',
    ...(isHorizontal ? {
      top: `${relativePosition.value.y}px`,
      [props.type === 'prefix' ? 'left' : 'right']: `${offset}px`,
      transform: 'none'
    } : {
      left: `${relativePosition.value.x}px`,
      [props.type === 'prefix' ? 'top' : 'bottom']: `${offset}px`,
      transform: 'none'
    }),
    overflow: 'visible'
  };
});

// 修改 hintStyle 计算
const hintStyle = computed(() => ({
  zIndex: zIndex.value,
  ...(props.layout === 'horizontal' ? {
    height: '100%',
    width: '32px',
    left: '50%',
    transform: 'translateX(-50%)'
  } : {
    width: `${width.value.toFixed(2) === '380.99' ? 120 : width.value}px`,
    height: '32px',
    top: width.value > 50 ? '50%' : props.type === 'prefix' ? 'calc(50% - 8px)' : 'calc(50% + 8px)',
    transform: 'translateY(-50%)'
  }),
  writingMode: props.layout === 'horizontal' ? 'vertical-rl' : 'horizontal-tb',
}));
</script>

<template>
  <transition name="fade">
    <div class="drop__empty" :style="dropStyle" v-if="dropKey === comp.key">
      <div
        :class="[classes, props.layout === 'horizontal' ? 'horizontal' : 'vertical']"
        :style="hintStyle"
        @drop.self.stop="$emit('drop', $event, dropIndex, null, comp)"
        @dragover.self.prevent="$emit('dragenter', index, comp, type === 'prefix' ? 'prev' : 'next', ($parent as any)?.compData)"
      >
        {{ hintText }}
      </div>
    </div>
  </transition>
</template>
