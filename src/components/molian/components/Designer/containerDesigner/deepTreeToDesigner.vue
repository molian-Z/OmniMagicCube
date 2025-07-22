<script setup lang="ts">
import { directives } from "./directives";
import { compsRefs, compsEls, variableData, globalAttrs, setSelectedComp, setZoomMode } from "../designerData";
import { isDraggable, dropKey, useDraggable, dropType, onDragenter } from "../draggable";
import { getValue } from "@molian/utils/useCore";
import { useElementBounding } from "@vueuse/core";
import { useI18n } from "vue-i18n";
import { useMenus } from './menus';
import DropHint from './components/DropHint.vue';
import { nextTick, unref } from 'vue';
import { calculateZIndex } from '../constants/zIndex';

// 性能优化：使用接口定义类型
interface ComponentData {
  id: string;
  key: string;
  name: string;
  slots?: Record<string, any>;
  [key: string]: any;
}

interface Props {
  modelValue: ComponentData[];
  parentNode?: Record<string, any>;
  treeIndex?: number;
  slotKey?: string | number;
  slotVal?: Record<string, any>;
  slotData?: Record<string, any>;
}

const { t } = useI18n();
const expandAPI = inject("mlExpandAPI");

defineOptions({
  name: "deepTree",
});

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  parentNode: () => ({}),
  treeIndex: 1,
  slotKey: "",
  slotVal: () => ({}),
  slotData: () => ({})
});

const emit = defineEmits<{
  'update:modelValue': [value: ComponentData[]]
}>();

const comps: any = inject("mlComps");
const message: any = inject("mlMessage");
const { showMenu } = <any>inject('cmdMenu');
const { menus } = useMenus();

// 性能优化：使用shallowRef减少深度响应式开销
const treeIndexNext = computed(() => props.treeIndex + 1);
const treeIndexDrop = computed(() => props.treeIndex + 2);

// 性能优化：使用markRaw避免不必要的响应式
const slots = shallowRef<Record<string, any>>({});
if (props.slotKey) {
  slots.value[props.slotKey] = markRaw(props.slotVal);
}

const compData = computed({
  get: () => props.modelValue,
  set: (val: ComponentData[]) => emit("update:modelValue", val)
})

// 性能优化：缓存getValue结果
const valueCache = new Map<string, any>();
const value = computed(() => {
  const cacheKey = JSON.stringify({
    compData: compData.value.length,
    variableData: Object.keys(variableData.value).length,
    slotData: Object.keys(props.slotData).length,
    globalAttrs: Object.keys(globalAttrs.variable).length
  });
  
  if (!valueCache.has(cacheKey)) {
    const result = getValue(
      compData.value,
      variableData.value,
      {},
      props.slotData,
      globalAttrs.variable,
      "designer"
    );
    valueCache.set(cacheKey, result);
    // 限制缓存大小
    if (valueCache.size > 50) {
      const firstKey:any = valueCache.keys().next().value;
      valueCache.delete(firstKey);
    }
  }
  
  return valueCache.get(cacheKey);
});

// 性能优化：使用Map缓存computed实例，避免重复创建
const compValueCache = new Map<number, ComputedRef<any>>();
const getCompValue = (index: number): ComputedRef<any> => {
  if (!compValueCache.has(index)) {
    compValueCache.set(index, computed(() => value.value[index]));
  }
  return compValueCache.get(index)!;
};

// 清理缓存
watch(() => compData.value.length, (newLength, oldLength) => {
  if (newLength !== oldLength) {
    compValueCache.clear();
    valueCache.clear();
  }
});

const { onDrop, onDropSlot, showToolbar } = useDraggable(comps, compData, message);

// 事件处理函数
const handleClick = (evt: Event, comp: ComponentData, index: number) => {
  
  // 在capture阶段，检查是否存在更深层的component-wrapper
  const target = evt.target as HTMLElement
  const currentTarget = evt.currentTarget as HTMLElement
  
  // 查找target到currentTarget之间是否有其他component-wrapper
  let element = target
  while (element && element !== currentTarget) {
    if (element.classList.contains('component-wrapper') && element !== currentTarget) {
      // 存在更深层的component-wrapper，不处理此事件
      return
    }
    element = element.parentElement as HTMLElement
  }
  
  evt?.stopPropagation?.()
  setSelectedComp(comp, evt)
  showToolbar(evt, comp, index, compData.value)
}

const handleDblclick = (evt: Event, comp: ComponentData) => {
  // 在capture阶段，检查是否存在更深层的component-wrapper
  const target = evt.target as HTMLElement
  const currentTarget = evt.currentTarget as HTMLElement
  
  // 查找target到currentTarget之间是否有其他component-wrapper
  let element = target
  while (element && element !== currentTarget) {
    if (element.classList.contains('component-wrapper') && element !== currentTarget) {
      // 存在更深层的component-wrapper，不处理此事件
      return
    }
    element = element.parentElement as HTMLElement
  }
  
  evt?.stopPropagation?.()
  setZoomMode(comp)
}

const handleContextmenu = (evt: Event, comp: ComponentData, index: number) => {
  evt?.preventDefault?.()
  
  // 在capture阶段，检查是否存在更深层的component-wrapper
  const target = evt.target as HTMLElement
  const currentTarget = evt.currentTarget as HTMLElement
  
  // 查找target到currentTarget之间是否有其他component-wrapper
  let element = target
  while (element && element !== currentTarget) {
    if (element.classList.contains('component-wrapper') && element !== currentTarget) {
      // 存在更深层的component-wrapper，不处理此事件
      return
    }
    element = element.parentElement as HTMLElement
  }
  
  evt?.stopPropagation?.()
  
  setSelectedComp(comp, evt)
  showToolbar(evt, comp, index, compData.value)
  
  nextTick(() => {
    showMenu({
      zIndex: 1200,
      x: (evt as any).x || (evt as any).clientX,
      y: (evt as any).y || (evt as any).clientY,
      minWidth: 130,
      customClass: "context-menu__list",
      items: unref(menus)
    })
  })
}

const handleDragover = (evt: Event, comp: ComponentData, index: number) => {
  evt.preventDefault()
  
  // 在capture阶段，检查是否存在更深层的component-wrapper
  const target = evt.target as HTMLElement
  const currentTarget = evt.currentTarget as HTMLElement
  
  // 查找target到currentTarget之间是否有其他component-wrapper
  let element = target
  while (element && element !== currentTarget) {
    if (element.classList.contains('component-wrapper') && element !== currentTarget) {
      // 存在更深层的component-wrapper，不处理此事件
      return
    }
    element = element.parentElement as HTMLElement
  }
  
  onDragenter(index, comp, null, compData)
}

// 性能优化：使用requestAnimationFrame替代nextTick，减少DOM操作频率
const pendingRefs = new Set<string>();
const setRef = (el: HTMLElement | null, comp: ComponentData, index: number) => {
  if (!el || !comp?.id || pendingRefs.has(comp.id)) return;
  
  pendingRefs.add(comp.id);
  
  requestAnimationFrame(() => {
    try {
      updateCompRefs(el, comp);
      updateElementPadding(comp);
    } catch (error) {
      console.warn(`Failed to set ref for component ${comp.id}:`, error);
    } finally {
      pendingRefs.delete(comp.id);
    }
  });
};

// 拆分DOM操作函数提高可维护性
const updateCompRefs = (el: HTMLElement, comp: ComponentData) => {
  compsRefs[comp.id] = el;
  const elDom = document.getElementById(comp.id);
  const elNextDom = el?.nextElementSibling as HTMLElement;
  
  compsEls[comp.id] = elDom?.classList?.contains("designer-comp") 
    ? elDom 
    : elNextDom?.classList?.contains("designer-comp")
      ? elNextDom
      : elDom || elNextDom || compsEls[comp.id];
};

// 性能优化：防抖padding更新
const paddingUpdateTimers = new Map<string, number>();
const updateElementPadding = (comp: ComponentData) => {
  const element = compsEls[comp.id];
  if (!element?.style) return;

  // 清除之前的定时器
  if (paddingUpdateTimers.has(comp.id)) {
    clearTimeout(paddingUpdateTimers.get(comp.id));
  }

  // 防抖更新
  const timer = window.setTimeout(() => {
    try {
      const { width, height } = useElementBounding(element);
      const needsPadding = height.value < 10 || width.value < 10;
      
      if (needsPadding) {
        const paddingV = height.value < 10 ? '10px' : '0';
        const paddingH = width.value < 10 ? '10px' : '0';
        element.style.padding = `${paddingV} ${paddingH}`;
      }
    } catch (error) {
      console.warn(`Failed to update padding for component ${comp.id}:`, error);
    } finally {
      paddingUpdateTimers.delete(comp.id);
    }
  }, 100);
  
  paddingUpdateTimers.set(comp.id, timer);
};

// 性能优化：缓存slot检查结果
const slotDataCache = new WeakMap<Record<string, any>, boolean>();
const isSlotData = (slotProps: Record<string, any>): boolean => {
  if (!slotProps) return false;
  
  if (!slotDataCache.has(slotProps)) {
    slotDataCache.set(slotProps, Object.keys(slotProps).length > 0);
  }
  
  return slotDataCache.get(slotProps)!;
};

// 优化空白拖拽区域样式，移除zIndex避免与CSS冲突
const emptyContentStyle = computed(() => {
  return {
    padding: '12px 16px',
    textAlign: 'center' as const,
    backgroundColor: 'var(--ml-primary-color-1)',
    border: '2px dashed var(--ml-primary-color)',
    borderRadius: '6px',
    minWidth: '200px',
    maxWidth: '400px',
    fontSize: '14px',
    color: 'var(--ml-primary-color)',
    cursor: 'copy',
    transition: 'all 0.2s ease',
    position: 'relative' as const,
    margin: '4px 0',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const
  };
});

// 性能优化：缓存文本拼接结果
const textCache = new Map<string, string>();
const getDropText = (compName: string, slotKey: string): string => {
  const cacheKey = `${compName}-${slotKey}`;
  
  if (!textCache.has(cacheKey)) {
    try {
      const text = [
        t("container.dropComp"),
        t(comps[compName]?.title || compName),
        t("container.component"),
        t(`slot.${slotKey}`),
        t("container.slot")
      ].join('');
      textCache.set(cacheKey, text);
    } catch (error) {
      console.warn(`Failed to generate drop text for ${compName}-${slotKey}:`, error);
      textCache.set(cacheKey, `Drop to ${slotKey} slot`);
    }
  }
  
  return textCache.get(cacheKey)!;
};

// 组件卸载时清理资源
onUnmounted(() => {
  compValueCache.clear();
  valueCache.clear();
  textCache.clear();
  paddingUpdateTimers.forEach(timer => clearTimeout(timer));
  paddingUpdateTimers.clear();
  pendingRefs.clear();
});
</script>

<template>
  <div 
    v-for="(comp, index) in compData" 
    :key="comp.key"
    v-memo="[comp.key, comp.name, isDraggable, dropKey || '', dropType || '', treeIndexNext || '']"
    class="component-wrapper"
    @click.capture="handleClick($event, comp, index)"
    @dblclick.capture="handleDblclick($event, comp)"
    @contextmenu.capture="handleContextmenu($event, comp, index)"
    @dragover.capture="handleDragover($event, comp, index)"
  >
    <!-- 前置拖拽提示 --> 
    <drop-hint
      v-if="isDraggable"
      type="prefix"
      :comp="comp"
      :index="index"
      :drop-key="dropKey || ''"
      :drop-type="dropType"
      :tree-index="treeIndexDrop"
      :comps="comps"
      @drop="onDrop"
      @dragenter="onDragenter"
    />
    
    <!-- 主要组件内容 -->
    <directives
      :ref="(el: any) => setRef(el, comp, index)"
      :comp="getCompValue(index)"
      :index="index"
      :modelValue="compData"
      :parentNode="parentNode"
      :slots="slots"
      :inheritProps="slotData"
      :expandAPI="expandAPI"
    >
      <!-- 插槽内容渲染 -->
      <template
        v-for="(slotVal, slotKey) in comp.slots"
        :key="slotKey"
        v-slot:[slotKey]="slotProps"
      >
        <template v-if="slotVal?.children">
          <deepTreeToDesigner
            v-model="slotVal.children"
            :parentNode="comp"
            :slotData="isSlotData(slotProps) ? slotProps : {}"
            :slotKey="slotKey"
            :slotVal="slotVal"
            :treeIndex="treeIndexNext"
          />
          
          <transition name="fade" appear>
            <div 
              v-if="isDraggable && dropKey === comp.key && (!slotVal.children || slotVal.children.length === 0)"
              class="designer-comp__empty"
            >
              <div
                :class="[
                  'designer-comp__empty-content',
                  { 'dropping-comp': dropKey === comp.key && !dropType }
                ]"
                :style="emptyContentStyle"
                @dragover.self.prevent.stop="onDragenter(index, comp, null, compData)"
                @drop.self.stop="onDropSlot($event, slotVal, comp)"
              >
                {{ getDropText(comp.name, String(slotKey)) }}
              </div>
            </div>
          </transition>
        </template>
      </template>
    </directives>
    
    <!-- 后置拖拽提示 -->
    <drop-hint
      v-if="isDraggable"
      type="suffix"
      :comp="comp"
      :index="index"
      :drop-key="dropKey || ''"
      :drop-type="dropType"
      :tree-index="treeIndexDrop"
      :comps="comps"
      @drop="onDrop"
      @dragenter="onDragenter"
    />
  </div>
</template>

<style lang="scss">
.component-wrapper {
  display: contents; // 让wrapper表现得像template一样，不影响布局
}

.designer-comp {
  position: relative;
  z-index: v-bind('calculateZIndex(treeIndex)');
  will-change: transform; // 启用硬件加速
  
  &::after {
    z-index: v-bind('calculateZIndex(treeIndex) + 1');
  }
}

.designer-comp__empty {
  position: relative;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: v-bind('calculateZIndex(treeIndex) + 5'); // 确保在深层嵌套中可见
  will-change: z-index, transform;
  pointer-events: auto; // 确保可以接收拖拽事件
  margin: 8px 0;
  
  &:hover {
    z-index: v-bind('calculateZIndex(treeIndex) + 6');
  }
}

.drop__empty {
  position: relative;
}

.prefix-drop-slot,
.suffix-drop-slot {
  border-radius: 4px;
  border: 2px dashed var(--ml-primary-color);
  font-size: 12px;
  color: var(--ml-primary-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  will-change: transform;
}

.designer-comp__empty-content {
  transition: all 0.2s ease; // 统一过渡时间
  cursor: copy;
  will-change: transform, background-color;
  
  &:hover {
    background-color: var(--ml-primary-color-2) !important;
    transform: scale(1.02) translateZ(0); // 添加translateZ启用硬件加速
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.dropping-comp {
  background-color: var(--ml-primary-color-2) !important;
  transform: scale(1.05) translateZ(0);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: var(--ml-primary-color) !important;
}

// 性能优化：添加fade过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 兼容性：为旧版浏览器添加前缀
@supports not (will-change: transform) {
  .designer-comp,
  .designer-comp__empty,
  .prefix-drop-slot,
  .suffix-drop-slot,
  .designer-comp__empty-content {
    -webkit-transform: translateZ(0);
    -moz-transform: translateZ(0);
    -ms-transform: translateZ(0);
    transform: translateZ(0);
  }
}
</style>
