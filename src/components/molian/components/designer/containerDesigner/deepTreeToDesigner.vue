<script setup lang="ts">
import { computed, inject, defineOptions, defineProps, defineEmits, nextTick } from "vue";
import { directives } from "./directives";
import { compsRefs, compsEls, variableData, globalAttrs } from "../designerData";
import { isDraggable, dropKey, useDraggable, dropType, onDragenter } from "../draggable";
import { getValue } from "@molian/utils/useCore";
import { useElementBounding } from "@vueuse/core";
import { useI18n } from "vue-i18n";
import DropHint from './components/DropHint.vue';
const { t } = useI18n();
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
  slotData: {
    type: Object,
    default: () => {}
  }
});
const emit = defineEmits(["update:modelValue"]);
const comps: any = inject("mlComps");
const message: any = inject("mlMessage");
const treeIndexNext = computed(() => {
  return props.treeIndex + 1;
});
const treeIndexDrop = computed(() => {
  return props.treeIndex + 2;
});
const slots: any = ref({});
if (!!props.slotKey) {
  slots.value[props.slotKey] = props.slotVal;
}
const compData:any = computed({
    get: () => props.modelValue,
    set: (val) => emit("update:modelValue", val)
});

const value = computed(() => 
    getValue(
        compData.value,
        variableData.value,
        {},
        props.slotData,
        globalAttrs.variable,
        "designer"
    )
);
const { onDrop, onDropSlot } = useDraggable(comps, compData, message);
const setRef = async (el: HTMLElement, comp: any, index: number) => {
    await nextTick();
    const updateCompRefs = () => {
        compsRefs[comp.id] = el;
        const elDom = document.getElementById(comp.id);
        const elNextDom = el?.nextElementSibling;
        compsEls[comp.id] = elDom?.classList?.contains("designer-comp") 
            ? elDom 
            : elNextDom?.classList?.contains("designer-comp")
                ? elNextDom
                : elDom || elNextDom || compsEls[comp.id];
    };
    const updateElementPadding = () => {
        const element = compsEls[comp.id];
        if (!element?.style) return;

        const { width, height } = useElementBounding(element);
        const padding = [
            height.value < 10 ? '10px' : '0',
            width.value < 10 ? '10px' : '0'
        ];
        if (padding[0] !== '0' || padding[1] !== '0') {
            try {
                element.style.padding = `${padding[0]} ${padding[1]}`;
            } catch (error) {
                console.warn('Failed to update element padding:', error);
            }
        }
    };
    updateCompRefs();
    updateElementPadding();
};

const isSlotData = (slotProps: Record<string, any>): boolean => Boolean(slotProps && Object.keys(slotProps).length);
</script>

<template>
  <template v-for="(comp, index) in compData" :key="comp.key">
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
    <directives
      :ref="(el: any) => setRef(el, comp, index)"
      :comp="value[index]"
      :index="index"
      :modelValue="compData"
      :parentNode="parentNode"
      :slots="slots"
      :inheritProps="slotData"
    >
      <template
        v-for="(slotVal, slotKey) in comp.slots"
        :key="slotKey"
        #[slotKey]="slotProps"
      >
        <template v-if="slotVal && slotVal.children">
          <template v-if="isSlotData(slotProps)">
            <deepTreeToDesigner
              v-model="slotVal.children"
              :parentNode="comp"
              :slotData="slotProps"
              :slotKey="slotKey"
              :slotVal="slotVal"
              :treeIndex="treeIndexNext"
            />
          </template>
          <deepTreeToDesigner
            v-else
            v-model="slotVal.children"
            :parentNode="comp"
            :slotData="slotProps"
            :slotKey="slotKey"
            :slotVal="slotVal"
            :treeIndex="treeIndexNext"
          />
          <div 
            class="designer-comp__empty" 
            v-if="isDraggable && dropKey === comp.key"
          >
            <div
              :class="[
                'designer-comp__empty-content',
                dropKey === comp.key && !dropType && 'dropping-comp',
              ]"
              :style="{
                padding: '8px',
                textAlign: 'center',
                backgroundColor: 'var(--ml-primary-color-1)',
                borderRadius: '4px',
                width: '300px',
              }"
              @dragover.self.prevent.stop="onDragenter(index, comp, null, compData)"
              @drop.self.stop="onDropSlot($event, slotVal, comp)"
            >
              {{
                t("container.dropComp") +
                t(comps[comp.name].title) +
                t("container.component") +
                t("slot." + slotKey) +
                t("container.slot")
              }}
            </div>
          </div>
        </template>
      </template>
    </directives>
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
  </template>
</template>

<style lang="scss">
.designer-comp {
  position: relative;
  z-index: v-bind(treeIndexNext);
  
  &::after {
    z-index: v-bind(treeIndexNext);
  }
}

.designer-comp__empty {
    position: relative;
    bottom:0;
    right:0;
    z-index: 9998;
    &:hover{
        z-index: 9999;
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
}
.designer-comp__empty-content {
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    background-color: var(--ml-primary-color-2) !important;
    transform: scale(1.02);
  }
}

.dropping-comp {
  background-color: var(--ml-primary-color-2) !important;
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
