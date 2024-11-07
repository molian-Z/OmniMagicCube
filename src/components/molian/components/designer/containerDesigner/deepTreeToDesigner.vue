<script setup lang="ts">
import { computed, inject, defineOptions, defineProps, defineEmits, nextTick } from "vue";
import { directives } from "./directives";
import { compsRef, compsEl, variableData, globalAttrs } from "../designerData";
import { isDraggable, dropKey, useDraggable, dropType, onDragenter } from "../draggable";
import { getValue } from "@molian/utils/useCore";
import { useElementBounding, watchDebounced } from "@vueuse/core";
import { useI18n } from "vue-i18n";
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
const compData: any = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit("update:modelValue", val);
  },
});
const slots: any = ref({});
if (!!props.slotKey) {
  slots.value[props.slotKey] = props.slotVal;
}
const value = computed(() => {
  return getValue(
    compData.value,
    variableData.value,
    {},
    props.slotData,
    globalAttrs.variable,
    "designer"
  );
});
const { onDrop, onDropSlot } = useDraggable(comps, compData, message);
const setRef = (el: any, comp: any, index: number) => {
  // await nextTick();
  nextTick(() => {
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
    // 如果获取不到节点暂时暂停。后续直接通过dom操作节点，不在采用uniapp等框架的兼容方案.
    function setRef() {
    //   if (!compsRef[comp.id]) {
    //     setTimeout(() => {
    //       setRef();
    //     }, 300);
    //   }
      const { width, height } = useElementBounding(compsRef[comp.id]);
      let pd = ["0", "0"];
      if (height.value < 10) {
        pd[0] = "10px";
      }
      if (width.value < 10) {
        pd[1] = "10px";
      }
      if (
        pd[0] !== "0" ||
        (pd[1] !== "0" && !!compsRef[comp.id] && !!compsRef[comp.id].style)
      ) {
        try {
          compsRef[comp.id].style.padding = `${pd[0]} ${pd[1]}`;
        } catch (error) {
          // 未缓存
        }
      }
      // 出现极端情况解决方案。如元素不存在以及无法对元素进行修改的情况
      // 索引不会被更新实时获取索引
      // 如果inhertAttrs未被引入将导致无法获取到元素
      const errorComp = computed(() => {
        return width.value === 0 && height.value === 0;
      });
      watchDebounced(
        () => errorComp.value,
        (newVal) => {
          if (newVal && (!elDom || (elDom && !elDom.nextElementSibling)) && !!elNextDom) {
            elNextDom.forceWatch = true;
            compsRef[comp.id] = elNextDom;
          }
        },
        {
          debounce: 300,
          maxWait: 1000,
        }
      );
    }
    setRef();
  });
};

const isSlotData = (slotProps: any) => {
  return slotProps && Object.keys(slotProps).length > 0
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
            t(comps[comp.name].title) +
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
          <div class="designer-comp__empty" v-if="isDraggable && dropKey === comp.key">
            <div
              :class="[
                'designer-comp__empty-content',
                dropKey === comp.key && !dropType && 'dropping-comp',
              ]"
              @dragover.self.prevent.stop="onDragenter(index, comp, null, compData)"
              @drop.self.stop="onDropSlot($event, slotVal)"
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
            t(comps[comp.name].title) +
            t("container.component") +
            t("container.after")
          }}
        </div>
      </div>
    </transition>
  </template>
</template>

<style lang="scss">
.designer-comp::after {
  z-index: v-bind(treeIndex);
}

.prefix-drop-slot,
.suffix-drop-slot {
  z-index: v-bind(treeIndexDrop);
}

.designer-comp {
  --el-index-normal: v-bind(treeIndex);
}

.designer-comp__empty {
  z-index: v-bind(treeIndexNext);
}
</style>
