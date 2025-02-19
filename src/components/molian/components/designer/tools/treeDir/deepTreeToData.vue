<script setup lang="ts">
import { defineProps, inject, computed, defineEmits } from "vue";
import svgIcon from "@molianComps/SvgIcon/index.vue";
import {
  selectedComp,
  compsEls,
  setSelectedComp,
} from "@molianComps/Designer/designerData";
import {
  hoverComp,
  hoverRef,
  hoverNodes,
  hoverIndex,
  onDragenter,
  useDraggable,
  startDraggable,
  dropKey,
  dragIndex,
  dragComp,
} from "@molianComps/Designer/draggable";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  } as any,
  level: {
    type: Number,
    default: 0,
  },
  slotData: {
    type: Object,
    default: () => {},
  },
});

const emit = defineEmits(["update:modelValue"]);

const openedObj: any = inject("openedObj");

const compData: any = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit("update:modelValue", val);
  },
});
const mlComps: any = inject("mlComps");
const message: any = inject("mlMessage");
const customComps: any = inject("customComps");
const { customInput } = customComps;
const typeStatus = ref<"pull" | "append" | "">("");
const editCompIndex = ref(-1);
const { onDragend, onDrop, onDropSlot } = useDraggable(mlComps, compData, message);
const showSlot = (slots: any) => {
  return Object.keys(slots).length > 0;
};

const marginTreePx = computed(() => {
  if (typeStatus.value === "append") {
    return Number(20 + 12 * props.level) + "px";
  } else {
    return Number(12 + 12 * props.level) + "px";
  }
});

/**
 * 启动拖拽操作
 *
 * 此函数用于在拖拽开始时调用，它执行两个主要任务：
 * 1. 使用 `onActive` 函数激活指定的组件和索引，以提供用户反馈。
 * 2. 调用 `startDraggable` 函数初始化拖拽操作。
 *
 * @param {any} evt - 触发的事件对象，通常由拖拽操作产生。
 * @param {any} comp - 要拖拽的组件对象，用于标识拖拽的目标。
 * @param {number} index - 组件在列表或集合中的索引，用于精确定位拖拽对象。
 */
const startDrag = (evt: any, comp: any, index: number) => {
  onActive(comp, index);
  startDraggable(evt, comp);
};

/**
 * 鼠标进入事件的处理函数
 * 该函数用于处理鼠标进入时的逻辑，包括更新类型状态和调用拖拽进入事件处理函数
 *
 * @param {number} index - 组件的索引，用于标识特定的组件
 * @param {any} comp - 组件对象，表示正在操作的组件
 * @param {any} compData - 组件数据，包含组件的相关数据
 * @param {"pull" | "append" | ""} type - 拖拽类型，表示拖拽操作的类型："pull"、"append" 或空字符串
 */
const mouseEnter = (
  index: number,
  comp: any,
  compData: any,
  type: "pull" | "append" | ""
) => {
  if (type === "append" && comp.id === dragComp.value.id) {
    return false;
  }
  // 更新类型状态值
  if (typeStatus.value !== type) {
    typeStatus.value = type;
  }
  // 调用拖拽进入事件处理函数，第三个参数为null表示当前场景不需要该参数
  onDragenter(index, comp, null, compData);
};

/**
 * 当组件被激活时触发的函数
 * @param {any} comp - 被激活的组件对象
 * @param {number} index - 被激活组件的索引
 */
const onActive = (comp: any, index: number) => {
  // 将鼠标悬停时的组件状态设置为与模型中相同的值
  hoverNodes.value = props.modelValue;
  // 记录当前悬停的组件索引
  hoverIndex.value = index;
  // 由于存在未修复的错误，暂时允许删除操作
  hoverComp.value = comp;
  // 获取并记录对应组件的引用
  hoverRef.value = compsEls[comp.key];
  // 设置选中的组件，第二个参数为null表示没有父组件
  setSelectedComp(comp, null);
};

/**
 * 获取当前组件的标题
 *
 * 该函数旨在根据组件的不同属性条件，返回最合适的标题
 * 首先检查组件是否有子标题（subTitle），如果有则直接返回子标题
 * 如果没有子标题，则尝试从组件的指令中提取标题信息
 * 如果指令中也没有标题信息，则从组件库中获取与该组件名称关联的标题
 * 如果组件库中也找不到相关标题，则直接返回组件的名称作为标题
 *
 * @param {any} comp - 当前组件对象，应包含标题或子标题的相关信息
 * @returns {string} - 当前组件的标题
 */
const currentTitle = (comp: any) => {
  // 检查组件是否有子标题，如果有则直接返回
  if (!!comp.subTitle) return comp.subTitle;

  // 检查组件指令中是否有特定的文本类型，并且该文本有值，如果有则返回该值作为标题
  if (
    comp &&
    comp.directives &&
    comp.directives.text &&
    comp.directives.text.type === "string" &&
    !!comp.directives.text.value
  ) {
    return comp.directives.text.value;
  }

  // 如果上述条件都不满足，尝试从组件库中获取与该组件名称关联的标题，如果获取失败，则返回组件名称
  return (mlComps.value[comp.name] && mlComps.value[comp.name].title) || comp.name;
};

const isOpened = (status: boolean) => {
  if (status === undefined) return true;
  return status;
};

const switchOpened = (id: number) => {
  openedObj.value[id] = !isOpened(openedObj.value[id]);
};
</script>

<template>
  <div
    class="tree-node"
    v-for="(comp, index) in modelValue"
    :key="comp.key"
    @click.stop="onActive(comp, index)"
  >
    <div
      :style="{ marginLeft: Number(12 + 12 * props.level) + 'px' }"
      class="append-line"
      v-if=" dropKey === comp.key && typeStatus === 'pull'"
    >
      <div class="append-line-text">{{ t(`container.typeStatus.${typeStatus}`, {title: comp.subTitle || currentTitle(comp)}) }}</div>
    </div>
    <div
      class="tree-node-header"
      draggable="true"
      @dragstart="startDrag($event, comp, index)"
      @dragover.prevent.stop="mouseEnter(index, comp, compData, 'pull')"
      @dragend="onDragend"
      @drop.stop="onDrop($event, index, slotData, comp)"
      :style="{ paddingLeft: Number(12 + 12 * props.level) + 'px' }"
      :class="[selectedComp && selectedComp.key === comp.key && 'is-active']"
    >
      <svg-icon
        class="tree-node-header-expand-icon"
        :icon="showSlot(comp.slots) ? 'ooui:expand' : ''"
        :style="{
          transform: !isOpened(openedObj[comp.id]) ? 'rotate(-90deg)' : 'rotate(0deg)',
        }"
        @click.stop="switchOpened(comp.id)"
      ></svg-icon>
      <div class="tree-node-header__title">
        <div v-if="editCompIndex !== index">{{ currentTitle(comp) }}</div>
        <customInput
          style="width: 100px"
          size="small"
          v-model="comp.subTitle"
          @blur="editCompIndex = -1"
          v-else
        ></customInput>
        <svg-icon
          class="tree-node-header__title-icon"
          icon="ep:edit"
          @click="editCompIndex = index"
          v-if="editCompIndex !== index"
        ></svg-icon>
        <svg-icon
          class="tree-node-header__title-icon"
          icon="ep:select"
          v-else
          @click="editCompIndex = -1"
        ></svg-icon>
      </div>
    </div>
    <el-collapse-transition>
      <div class="tree-node-content" v-if="isOpened(openedObj[comp.id])">
        <template v-for="(slotVal, slotKey) in comp.slots" :key="slotKey">
          <div
            class="slot-container"
            :class="slotKey"
            @dragover.prevent.stop="mouseEnter(index, comp, compData, 'append')"
            @drop.stop="onDropSlot($event, slotVal, comp)"
          >
            <template v-if="slotVal">
              <div
                class="slotTitle"
                :style="{ paddingLeft: Number(12 + 12 * (props.level + 1)) + 'px' }"
                @click.stop
              >
                {{ slotKey }}
              </div>
              <deepTreeToData
                v-model="slotVal.children"
                :level="Number(level) + 1"
                :selectedComp="selectedComp"
                :slotData="slotVal"
              />
            </template>
          </div>
        </template>
      </div>
    </el-collapse-transition>
    <div
      :style="{ marginLeft: marginTreePx }"
      class="append-line"
      v-if="
        dropKey === comp.key &&
        ((dragIndex && dragIndex < index) || typeStatus === 'append')
      "
    >
      <div class="append-line-text">{{ t(`container.typeStatus.${typeStatus}`, {title: comp.subTitle || currentTitle(comp)}) }}</div>
    </div>
  </div>
</template>
