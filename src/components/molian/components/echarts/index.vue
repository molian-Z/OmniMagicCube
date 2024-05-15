<script setup lang="ts">
import { ref, onMounted, watch, defineExpose, defineOptions, defineProps } from "vue";
import * as echarts from "echarts";
import { refDebounced, useResizeObserver } from "@vueuse/core";
const modules = import.meta.glob("./model/*.ts", { eager: true });
const typeMap = ref<any>({});
defineOptions({
  name: "MlEcharts",
});
const props = defineProps({
  type: {
    type: String,
    default: "bar",
    optionItems: ["bar", "line", "pie", "gauge"],
  },
  modelValue: {
    type: [Object, Array],
    default: () => {
      return [];
    },
  },
  width: {
    type: String,
    default: "100%",
  },
  height: {
    type: String,
    default: "150px",
  },
  xAxisType: {
    type: String,
    default: "category",
    optionItems: ["category", "value", "time", "log"],
    hidden: function (attrs: any) {
      return ["bar", "line"].indexOf(attrs.type.value) === -1;
    },
  },
  yAxisType: {
    type: String,
    default: "value",
    optionItems: ["category", "value", "time", "log"],
    hidden: function (attrs: any) {
      return ["bar", "line"].indexOf(attrs.type.value) === -1;
    },
  },
  axisData: {
    type: Array,
    default: () => [],
    hidden: function (attrs: any) {
      return ["bar", "line"].indexOf(attrs.type.value) === -1;
    },
  },
  showTooltip: {
    type: Boolean,
    default: true,
  },
  showXAxis: {
    type: Boolean,
    default: true,
    hidden: function (attrs: any) {
      return ["bar", "line"].indexOf(attrs.type.value) === -1;
    },
  },
  showYAxis: {
    type: Boolean,
    default: true,
    hidden: function (attrs: any) {
      return ["bar", "line"].indexOf(attrs.type.value) === -1;
    },
  },
  showLegend: {
    type: Boolean,
    default: true,
  },
  showBackground: {
    type: Boolean,
    default: true,
    hidden: function (attrs: any) {
      return ["bar", "line"].indexOf(attrs.type.value) === -1;
    },
  },
  barWidth: {
    type: Number,
    default: 6,
    hidden: function (attrs: any) {
      return ["bar"].indexOf(attrs.type.value) === -1;
    },
  },
  borderRadius: {
    type: Number,
    default: 0,
    hidden: function (attrs: any) {
      return ["bar"].indexOf(attrs.type.value) === -1;
    },
  },
  pieLabelType:{
    type: String,
    default:'none',
    optionItems: ["none", "inside", "outside", "center"],
    hidden: function (attrs: any) {
      return ["pie"].indexOf(attrs.type.value) === -1;
    },
  },
  isCircle: {
    type: Boolean,
    default: false,
    hidden: function (attrs: any) {
      return ["pie"].indexOf(attrs.type.value) === -1;
    },
  },
  isStack: {
    type: Boolean,
    default: false,
    hidden: function (attrs: any) {
      return ["bar", "line"].indexOf(attrs.type.value) === -1;
    },
  },
  selectedColor: {
    type: String,
    default: "colors1",
    optionItems: ["colors1", "colors2", "colors3", "colors4", "colors5"],
  },
  options: {
    type: Object,
    default: () => {
      return {};
    },
  },
});

const echartDom = ref();
let echartData: any = {};
const containerRef = ref({
    width:0,
    height:0
});

const debouncedContainer = refDebounced(containerRef, 100);

// 通过防抖函数监听容器大小变化，防止多次变化引起的错误
watch(debouncedContainer, (newVal)=>{
    echartData.resize({
      width:newVal.width,
      height:newVal.height,
      animation: {
        duration: 300,
      },
    });
})

onMounted(() => {
  for (const file in modules) {
    const modulesName = file.replace("./model/", "").replace(".ts", "");
    const res: any = modules[file];
    if (!!res.default) {
      typeMap.value[modulesName] = res.default;
    }
  }
  // 监听容器大小变化
  useResizeObserver(echartDom, (entries) => {
    const entry = entries[0];
    const { width, height } = entry.contentRect;
    containerRef.value = {
        width,height
    }
  });
  // 初始化echart图表
  echartData = echarts.init(echartDom.value);
  // 监听数据变化并更新图表
  watch(
    () => props,
    (newVal) => {
      setData(newVal);
    },
    {
      immediate: true,
      deep: true,
    }
  );
});

// 写入echart数据
const setData = (data: any) => {
  nextTick(() => {
    echartData.setOption(typeMap.value[props.type](data));
  });
};
// 导出echart相关信息
defineExpose({
  echartDom,
  echartData,
});
</script>

<template>
  <div ref="echartDom" :style="{ width: `${props.width}`, height: `${props.height}` }" />
</template>
