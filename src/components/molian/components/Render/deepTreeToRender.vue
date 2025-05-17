<script setup lang="ts">
import { memoize } from "es-toolkit";
import { defineProps, inject, onUnmounted } from "vue";
import { watchThrottled } from "@vueuse/core";
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
const renderData:any = shallowRef([]);

// 注入组件池实例
const componentPool: any = inject("componentPool");
if (!componentPool) {
  throw new Error("componentPool not provided");
}

// 活动组件管理
const activeComponents = new Map();
// 组件复用函数
const reuseComponent = (comp: any) => {
  if (!comp || !comp.type) return comp;
  const type = comp.type;
  const key = comp.key;
  if (activeComponents.has(key)) {
    const existingComponent = activeComponents.get(key);
    existingComponent.props = comp.props || {};
    existingComponent.events = comp.events || {};
    existingComponent.directives = comp.directives;
    return existingComponent;
  }
  let component = componentPool.acquire(type);
  if (!component) {
    component = {
      type,
      key,
      instance: null,
      props: comp.props || {},
      events: comp.events || {},
      directives: comp.directives,
    };
  } else {
    component.key = key;
    component.props = comp.props || {};
    component.events = comp.events || {};
    component.directives = comp.directives;
  }
  activeComponents.set(key, component);
  return component;
};

// 修改数据监听，添加组件复用
watchThrottled(
  () => props.modelValue,
  (newVal, oldVal) => {
    if (JSON.stringify(newVal) === JSON.stringify(oldVal)) return;
    const processedData = getValue(
      newVal,
      variable.value,
      props.expandAPI,
      props.slotData,
      originVariable.value
    );
    
    renderData.value = Array.isArray(processedData) 
      ? processedData.map(item => reuseComponent(item))
      : [];
  },
  { immediate: true, throttle: 50 }
);
const newForEach = memoize(({ comp, $slot }: any) => {
  if (!!comp.directives.for) {
    const forData = data2Vars(comp.directives.for, variable.value, {
        slotData: $slot,
        expandAPI: {
            __type: 'render'
        }
    });
    if (typeof forData === "function") {
      return forData($slot);
    }
    return forData;
  }
});

// 组件卸载时清理
onUnmounted(() => {
  for (const [_, component] of activeComponents) {
    componentPool.release(component.type, component);
  }
  activeComponents.clear();
});
</script>
<template>
  <template v-for="comp in renderData" :key="comp.key">
    <renderFor
      v-if="isFor({ comp, $slot: slotData })"
      :modelValue="newForEach({ comp, $slot: slotData })"
      :comp="comp"
      :slotData="slotData as Record<string, any>"
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
      v-else-if="isIf({ comp, $slot: slotData })"
      v-memo="[comp.directives?.if, comp.key, comp.props]"
      :comp="comp"
      :expandAPI="expandAPI"
      :slotData="slotData"
      v-show="isShow({ comp, $slot: slotData })"
      v-on="comp.cacheOn"
      :interInc="interInc"
    />
  </template>
</template>
