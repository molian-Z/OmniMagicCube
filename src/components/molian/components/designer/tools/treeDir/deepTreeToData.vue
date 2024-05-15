<script setup lang="ts">
import { defineProps, inject, computed, defineEmits } from "vue";
import svgIcon from "@molianComps/svg-icon/index.vue";
import { selectedComp, compsRef } from "@molianComps/designer/designerData";
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
} from "@molianComps/designer/draggable";

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

const compData: any = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit("update:modelValue", val);
  },
});
const t :any = inject('mlLangs');
const mlComps: any = inject("mlComps");
const message: any = inject("ml-message");
const isOpened = ref<boolean[]>([]);
const typeStatus = ref("");
const { onDragend, onDrop, onDropSlot } = useDraggable(mlComps, compData, message);
const showSlot = (slots: any) => {
  let btn = false;
  for (const key in slots) {
    btn = true;
  }
  return btn;
};

const marginTreePx = computed(() =>{
    if(typeStatus.value === 'append'){
        return Number(20 + 12 * props.level) + 'px'
    }else{
        return Number(8 + 12 * props.level) + 'px'
    }
})

watch(
  () => props.modelValue,
  (newVal) => {
    isOpened.value = Array.from({ length: newVal.length }, () => true);
  },
  {
    immediate: true,
  }
);

const startDrag = (evt: any, comp: any, index: number) => {
  onActive(comp, index);
  startDraggable(evt, comp);
};

const mouseEnter = (index: number, comp: any, compData: any, type: "pull" | "append") => {
  typeStatus.value = type;
  onDragenter(index, comp, null, compData);
};

const onActive = (comp: any, index: number) => {
  hoverNodes.value = props.modelValue;
  hoverIndex.value = index;
  //有错误暂未修复，先允许删除
  hoverComp.value = comp;
  hoverRef.value = compsRef[comp.key];
  selectedComp.value = comp;
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
      :style="{ marginLeft: Number(8 + 12 * props.level) + 'px' }"
      class="append-line"
      v-if="dropKey === comp.key && dragIndex > index && typeStatus !== 'append'"
    >
        <div class="append-line-text">{{ t(`container.typeStatus.${typeStatus}`) }}</div>
    </div>
    <div
      class="tree-node-header"
      :style="{ paddingLeft: Number(8 + 12 * props.level) + 'px' }"
      :class="[selectedComp && selectedComp.key === comp.key && 'is-active']"
    >
      <svg-icon
        class="tree-node-header-expand-icon"
        :icon="showSlot(comp.slots) ? 'ooui:expand' : ''"
        :style="{ transform: !isOpened[index] ? 'rotate(-90deg)' : 'rotate(0deg)' }"
        @click.stop="isOpened[index] = !isOpened[index]"
      ></svg-icon>
      <div
        class="tree-node-header__title"
        draggable="true"
        @dragstart="startDrag($event, comp, index)"
        @dragover.prevent.stop="mouseEnter(index, comp, compData, 'pull')"
        @dragend="onDragend"
        @drop.stop="onDrop($event, index, slotData)"
      >
        {{ mlComps[comp.name].title }}
      </div>
    </div>
    <el-collapse-transition>
      <div class="tree-node-content" v-if="isOpened[index]">
        <template v-for="(slotVal, slotKey) in comp.slots" :key="slotKey">
          <div class="slot-container" :class="slotKey">
            <template v-if="slotVal">
              <div
                class="slotTitle"
                :style="{ paddingLeft: Number(16 + 12 * (props.level + 1)) + 'px' }"
                @click.stop
                @dragover.prevent.stop="mouseEnter(index, comp, compData, 'append')"
                @drop.stop="onDropSlot($event, slotVal)"
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
      v-if="dropKey === comp.key && (dragIndex < index || typeStatus === 'append')"
    >
        <div class="append-line-text">{{ t(`container.typeStatus.${typeStatus}`) }}</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.tree-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: var(--ml-pd-small) 0;
}

.tree-node {
  .tree-node-header {
    cursor: pointer;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    transition: var(--ml-transition-base);
    border-radius: var(--ml-radius-base);

    &-expand-icon {
      transition: var(--ml-transition-base);
      font-size: 10px;
      color: var(--ml-fill-color-1);
    }

    &:hover {
      background-color: var(--ml-fill-color-4);
    }

    &.is-active {
      background-color: var(--ml-fill-color-3);
    }

    .tree-node-header__title {
      flex: 1;
      user-select: none;
      padding: var(--ml-pd-base) 0;
      padding-left: var(--ml-pd-base);
      color: var(--ml-text-color-2);
      font-weight: bold;
      font-size: 12px;
    }
  }

  .tree-node-content {
    // margin-left: var(--ml-mg-lg);

    .slot-container {
      .slotTitle {
        font-size: 14px;
        font-weight: bold;
        color: var(--ml-text-color-2);
        user-select: none;
        padding: var(--ml-pd-base) 0;
        padding-left: var(--ml-pd-lg);
      }
    }
  }
}

.append-line {
  border: 1px solid var(--ml-primary-color-6);
  transition: var(--ml-transition-base);
  position: relative;

  .append-line-text{
    position: absolute;
    width: 50%;
    top: -16px;
    color:var(--ml-primary-color-6);
  }
}
</style>
