<script setup lang="ts">
import { memoize } from "es-toolkit";
import { defineProps, inject, onUnmounted } from "vue";
import { watchThrottled } from "@vueuse/core";
import slotTemplate from "./slottemplate.vue";
import renderFor from "./renderfor.vue";
import { isIf, isFor, isShow, data2Vars, getValue } from "@molian/utils/useCore";
import { createReactiveTimeSlicing } from "./timeslicing";
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

// 使用时间切片的响应式数据管理
const {
  data: renderData,
  isProcessing,
  progress,
  updateWithTimeSlicing
} = createReactiveTimeSlicing([]);

// 性能监控
const performanceMetrics = ref({
  lastRenderTime: 0,
  componentCount: 0,
  useTimeSlicing: false
});

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

// 修改数据监听，添加时间切片和组件复用
watchThrottled(
  () => props.modelValue,
  async (newVal, oldVal) => {
    if (JSON.stringify(newVal) === JSON.stringify(oldVal)) return;
    
    const startTime = performance.now();
    const processedData: any = getValue(
      newVal,
      variable.value,
      props.expandAPI,
      props.slotData,
      originVariable.value
    ) as any;
    
    if (!Array.isArray(processedData)) {
      await updateWithTimeSlicing([]);
      return;
    }
    
    const componentCount = processedData.length;
    performanceMetrics.value.componentCount = componentCount;
    
    // 根据组件数量决定是否使用时间切片
    const shouldUseTimeSlicing = componentCount > 50; // 超过50个组件时使用时间切片
    performanceMetrics.value.useTimeSlicing = shouldUseTimeSlicing;
    
    if (shouldUseTimeSlicing) {
      // 使用时间切片处理大量组件
      await updateWithTimeSlicing(
        processedData,
        (item) => reuseComponent(item),
        {
          batchSize: 10, // 每批处理10个组件
          timeSlice: 5,  // 5ms时间片
          onProgress: (progress) => {
            // 可以在这里添加进度显示逻辑
            console.log(`渲染进度: ${Math.round(progress * 100)}%`);
          }
        }
      );
    } else {
      // 少量组件直接处理
      const reusedComponents: any= processedData.map(item => reuseComponent(item));
      await updateWithTimeSlicing(reusedComponents);
    }
    
    const endTime = performance.now();
    performanceMetrics.value.lastRenderTime = endTime - startTime;
    
    // 性能日志
    if (componentCount > 20) {
      console.log(`渲染性能: ${componentCount}个组件, 耗时${Math.round(performanceMetrics.value.lastRenderTime)}ms, 使用时间切片: ${shouldUseTimeSlicing}`);
    }
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

// 暴露性能指标和状态给父组件
defineExpose({
  performanceMetrics: readonly(performanceMetrics),
  isProcessing: readonly(isProcessing),
  progress: readonly(progress)
});
</script>
<template>
  <!-- 时间切片处理中的加载提示 -->
  <div v-if="isProcessing && performanceMetrics.useTimeSlicing" class="time-slicing-loading">
    <div class="loading-text">正在渲染组件...</div>
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: `${progress * 100}%` }"></div>
    </div>
    <div class="loading-info">
      {{ performanceMetrics.componentCount }} 个组件 | 进度: {{ Math.round(progress * 100) }}%
    </div>
  </div>
  
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

<style scoped>
.time-slicing-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 10px 0;
}

.loading-text {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.progress-bar {
  width: 200px;
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #45a049);
  transition: width 0.3s ease;
}

.loading-info {
  font-size: 12px;
  color: #999;
}
</style>
