<script setup lang="ts">
import { defineProps, computed } from "vue";
import slotTemplate from "./SlotTemplate.vue";
import renderFor from "./RenderFor.vue";
import { isIf, isFor, isShow, data2Vars, getValue } from "@molian/utils/useCore";
const props = defineProps(<
  {
    modelValue: any;
    expandAPI?: any;
    slotData: {
      [key: string]: any;
    };
    interInc: any
  }
>{
  modelValue: {
    type: Array,
    default: () => [],
  },
  expandAPI: {
    type: Object,
    default: () => {},
  },
  slotData: {
    type: Object,
    default: () => {},
  },
  interInc:{
    type: Object,
    default: () => {}
  }
});
const { variable, originVariable } = props.interInc
const renderData = computed(() => {
  return getValue(
    props.modelValue,
    variable.value,
    props.expandAPI,
    props.slotData,
    originVariable.value
  );
});
const newForEach = ({ comp, $slot }: any) => {
  if (!!comp.directives.for) {
    const forData = data2Vars(comp.directives.for, variable.value);
    if (typeof forData === "function") {
      return forData($slot);
    } else {
      return forData;
    }
  }
};
</script>
<template>
  <template v-for="comp in renderData" :key="comp.key">
    <renderFor
      v-if="isFor({ comp, $slot: slotData })"
      :modelValue="newForEach({ comp, $slot: slotData })"
      :comp="comp"
      :slotData="slotData"
      :expandAPI="expandAPI"
      :interInc="interInc"
    >
      <template #default="scoped">
        <slotTemplate
          :comp="comp"
          :expandAPI="expandAPI"
          :slotData="scoped.slotData"
          v-show="isShow({ comp, $slot: scoped.slotData })"
          v-on="scoped.cacheOn"
          :interInc="interInc"
        />
      </template>
    </renderFor>
    <slotTemplate
      :comp="comp"
      :expandAPI="expandAPI"
      :slotData="slotData"
      v-else-if="isIf({ comp, $slot: slotData })"
      v-show="isShow({ comp, $slot: slotData })"
      v-on="comp.cacheOn"
      :interInc="interInc"
    />
  </template>
</template>
