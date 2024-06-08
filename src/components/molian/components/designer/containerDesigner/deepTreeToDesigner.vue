<script setup lang="ts">
import { computed, inject, defineOptions, defineProps, defineEmits, nextTick } from "vue";
import { directives } from "./directives";
import {
  compsRef,
  globalAttrs,
  selectedComp,
  compsEl,
  variableData,
} from "../designerData";
import { isDraggable, dropKey, useDraggable, dropType, onDragenter } from "../draggable";
import { data2Vars, getValue } from "@molian/utils/useCore";
import { useElementBounding } from "@vueuse/core";
defineOptions({
  name: "deepTree",
});
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  parentNode: {
    type: Object,
    default: () => {},
  },
  treeIndex: {
    type: Number,
    default: 1,
  },
  slotKey: {
    type: [String, Number],
    default: "",
  },
  slotVal: {
    type: Object,
    default: () => {},
  },
});
const emit = defineEmits(["update:modelValue"]);
const comps: any = inject("mlComps");
const message: any = inject("ml-message");
const t: any = inject("mlLangs");
const treeIndexNext = computed(() => {
  return props.treeIndex + 1;
});
const treeIndexDrop = computed(() => {
  return props.treeIndex + 2;
});
const compData: any = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit("update:modelValue", val);
  },
});

const empty = computed(() => {
  return t("container.empty");
});

const value = computed(() => {
  return getValue(compData.value, variableData.value, {}, "designer");
});
const { onDrop, onDropSlot } = useDraggable(comps, compData, message);
const setRef = async (el: any, comp: any, index: any) => {
  await nextTick();
  compsEl[comp.id] = el;
  let elDom: any = document.getElementById(comp.id);
  let elNextDom: any = el?.$el?.nextElementSibling;
  if (elDom?.classList?.contains("designer-comp")) {
    compsRef[comp.id] = elDom;
  } else if (elNextDom?.classList?.contains("designer-comp")) {
    compsRef[comp.id] = elNextDom;
  } else {
    compsRef[comp.id] = elDom || elNextDom || compsRef[comp.id];
  }
  const { width, height } = useElementBounding(compsRef[comp.id]);
  let pd = ["0", "0"];
  if (height.value < 10) {
    pd[0] = "10px";
  }
  if (width.value < 10) {
    pd[1] = "10px";
  }
  if (pd[0] !== "0" || pd[1] !== "0") {
    compsRef[comp.id].style.padding = `${pd[0]} ${pd[1]}`;
  }
  // 出现极端情况解决方案。如元素不存在以及无法对元素进行修改的情况
  // 索引不会被更新实时获取索引
  // 如果inhertAttrs未被引入将导致无法获取到元素
  const errorComp = computed(() => {
    return width.value === 0 && height.value === 0;
  });
  watch(
    () => errorComp.value,
    (newVal) => {
      if (newVal && (!elDom || (elDom && !elDom.nextElementSibling)) && !!elNextDom) {
        elNextDom.forceWatch = true;
        compsRef[comp.id] = elNextDom;
      }
    },
    {
      immediate: true,
    }
  );
};
</script>

<template>
  <template v-for="(comp, index) in compData" :key="comp.key">
    <transition name="fade">
      <div class="drop__empty" v-if="isDraggable && dropKey === comp.key">
        <div
          :class="[
            'prefix-drop-slot',
            dropKey === comp.key && dropType === 'prev' && 'dropping-comp',
          ]"
          @drop.self.stop="onDrop($event, index, slotVal)"
          @dragover.self.prevent="onDragenter(index, comp, 'prev', compData)"
        >
          {{
            t("container.drop") +
            t("component." + comps[comp.name].title) +
            t("container.component") +
            t("container.before")
          }}
        </div>
      </div>
    </transition>
    <directives
      :ref="(el: any) => setRef(el, comp, index)"
      :comp="value[index]"
      :index="index"
      :modelValue="compData"
      :parentNode="parentNode"
    >
      <template
        v-for="(slotVal, slotKey) in comp.slots"
        :key="slotKey"
        #[slotKey]="slotProps"
      >
        <template v-if="slotVal && slotVal.children">
          <template v-if="JSON.stringify(slotProps) !== '{}'">
            <deepTreeToDesigner
              v-model="slotVal.children"
              :parentNode="comp"
              :slotProp="slotProps"
              :slotKey="slotKey"
              :slotVal="slotVal"
            />
          </template>
          <deepTreeToDesigner
            v-else
            v-model="slotVal.children"
            :parentNode="comp"
            :slotKey="slotKey"
            :slotVal="slotVal"
            :treeIndex="treeIndex + 1"
          />
          <div
            class="designer-comp__empty"
            v-if="isDraggable && dropKey === comp.key"
          >
            <div
              :class="['designer-comp__empty-content', dropKey === comp.key && !dropType && 'dropping-comp']"
              @dragover.self.prevent.stop="onDragenter(index, comp, null, compData)"
              @drop.self.stop="onDropSlot($event, slotVal)"
            >
              {{
                t("container.dropComp") +
                t("component." + comps[comp.name].title) +
                t("container.component") +
                t("slot." + slotKey) +
                t("container.slot")
              }}
            </div>
          </div>
        </template>
      </template>
    </directives>
    <transition name="fade">
      <div class="drop__empty" v-if="isDraggable && dropKey === comp.key">
        <div
          :class="[
            'suffix-drop-slot',
            dropKey === comp.key && dropType === 'next' && 'dropping-comp',
          ]"
          @dragover.self.prevent="onDragenter(index, comp, 'next', compData)"
          @drop.self.stop="onDrop($event, index + 1, slotVal)"
        >
          {{
            t("container.drop") +
            t("component." + comps[comp.name].title) +
            t("container.component") +
            t("container.after")
          }}
        </div>
      </div>
    </transition>
  </template>
</template>

<style lang="scss">
@use '../../../assets/styles/global.scss';

.designer-comp {
  // min-height: 28px !important;
  margin: var(--ml-mg-base) 0;
  position: relative;
  transition: var(--ml-transition-base);
  // min-width: 20px;
  padding: var(--ml-pd-small);

  &.comp-inline {
    display: inline-flex;

    &::after {
      z-index: 1000;
    }
  }

  &.hiddenComps {
    opacity: 0.7;
  }

  &::after {
    border: 2px solid var(--ml-info-color-1);
    border-radius: var(--ml-radius-base);
    content: "";
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    transition: var(--ml-transition-base);
    z-index: v-bind(treeIndex);
  }

  &.is-margin {
    margin: 8px;
  }

  &.selectedComp {
    &::after {
      border: 2px solid var(--ml-primary-color);
      display: block;
    }
  }
}

.designer-comp-is-empty::after {
  content: "空内容" !important;
  font-size: 12px;
  color: var(--ml-info-color-1);
  display: flex !important;
  justify-content: center;
  align-items: center;
}

.drop__empty {
  position: relative;
}

.prefix-drop-slot,
.suffix-drop-slot {
  position: absolute !important;
  padding: var(--ml-pd-small);
  border: 2px dashed var(--ml-warning-color-1);
  padding: 0 var(--ml-pd-small);
  width: 100%;
  min-width: 200px;
  text-align: center;
  font-weight: bold;
  color: var(--ml-warning-color-6);
  user-select: none;
  line-height: 24px;
  transition: var(--ml-transition-base);
  z-index: v-bind(treeIndexDrop);
}

.prefix-drop-slot {
  top: -20px;
  left: 0;
}
.suffix-drop-slot {
  bottom: -20px;
  right: 0;
}

.designer-comp__empty {
  flex: 1;
  position: relative;
  z-index: v-bind(treeIndexNext);
  &-content {
    position: absolute;
    border: 2px dashed var(--ml-info-color-1);
    padding: 0 var(--ml-pd-small);
    text-align: center;
    font-weight: bold;
    color: var(--ml-info-color-1);
    user-select: none;
    line-height: 24px;
    transition: var(--ml-transition-base);
  }
}

.dropping-comp {
  border-color: var(--ml-primary-color) !important;
  color: var(--ml-primary-color) !important;
}
</style>
