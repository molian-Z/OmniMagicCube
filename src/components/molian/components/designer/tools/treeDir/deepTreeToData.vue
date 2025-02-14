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
  }
});

const emit = defineEmits(["update:modelValue"]);

const openedObj:any = inject('openedObj')

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
const typeStatus = ref("");
const editCompIndex = ref(-1);
const { onDragend, onDrop, onDropSlot } = useDraggable(mlComps, compData, message);
const showSlot = (slots: any) => {
    return Object.keys(slots).length > 0
};

const marginTreePx = computed(() => {
  if (typeStatus.value === "append") {
    return Number(20 + 12 * props.level) + "px";
  } else {
    return Number(12 + 12 * props.level) + "px";
  }
});

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
  hoverRef.value = compsEls[comp.key];
  setSelectedComp(comp, null);
};

const currentTitle = (comp: any) => {
  if (!!comp.subTitle) return comp.subTitle;
  if (
    comp &&
    comp.directives &&
    comp.directives.text &&
    comp.directives.text.type === "string" &&
    !!comp.directives.text.value
  ) {
    return comp.directives.text.value;
  }
  return (mlComps.value[comp.name] && mlComps.value[comp.name].title) || comp.name;
};

const isOpened = (status:boolean) => {
    if(status === undefined) return true
    return status
}

const switchOpened = (id:number) => {
    openedObj.value[id] = !isOpened(openedObj.value[id])
}

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
      v-if="dropKey === comp.key && dragIndex && dragIndex > index && typeStatus !== 'append'"
    >
      <div class="append-line-text">{{ t(`container.typeStatus.${typeStatus}`) }}</div>
    </div>
    <div
      class="tree-node-header"
      :style="{ paddingLeft: Number(12 + 12 * props.level) + 'px' }"
      :class="[selectedComp && selectedComp.key === comp.key && 'is-active']"
    >
      <svg-icon
        class="tree-node-header-expand-icon"
        :icon="showSlot(comp.slots) ? 'ooui:expand' : ''"
        :style="{ transform: !isOpened(openedObj[comp.id]) ? 'rotate(-90deg)' : 'rotate(0deg)' }"
        @click.stop="switchOpened(comp.id)"
      ></svg-icon>
      <div
        class="tree-node-header__title"
        draggable="true"
        @dragstart="startDrag($event, comp, index)"
        @dragover.prevent.stop="mouseEnter(index, comp, compData, 'pull')"
        @dragend="onDragend"
        @drop.stop="onDrop($event, index, slotData)"
      >
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
          <div class="slot-container" :class="slotKey"
          @dragover.prevent.stop="mouseEnter(index, comp, compData, 'append')"
          @drop.stop="onDropSlot($event, slotVal)">
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
      v-if="dropKey === comp.key && (dragIndex && dragIndex < index || typeStatus === 'append')"
    >
      <div class="append-line-text">{{ t(`container.typeStatus.${typeStatus}`) }}</div>
    </div>
  </div>
</template>