<script setup lang="ts">
import { defineOptions, computed } from "vue";
import anyData2Form from "@molianComps/AnyData2Form/index.vue";
import { selectedComp } from "../../designerData";
import { useParentProps } from "../composables/useComponentProps";

defineOptions({
  name: "propComp",
});

const { parentComp, getFilteredParentProps } = useParentProps();

// 获取过滤后的父组件属性（不显示 removeAttr 属性）
const parentProps = computed(() => getFilteredParentProps(false));
// 创建可写的computed来处理parentAttrs的读写
const currentParentAttrs = computed({
  get() {
    return selectedComp.value?.parentAttrs || {};
  },
  set(newValue) {
    if (selectedComp.value) {
      // 确保parentAttrs存在
      if (!selectedComp.value.parentAttrs) {
        selectedComp.value.parentAttrs = {};
      }
      // 更新整个parentAttrs对象
      selectedComp.value.parentAttrs = newValue;
    }
  },
});

// 创建单个属性的getter/setter
const getParentAttr = (key: string) => {
  return currentParentAttrs.value[key]
};

const setParentAttr = (key: string, value: any) => {
  if (selectedComp.value) {
    // 确保parentAttrs存在
    if (!selectedComp.value.parentAttrs) {
      selectedComp.value.parentAttrs[key] = {
        type: currentParentAttrs.value[key].type.toString(),
      };
    }
    if (value.type && typeof value.type === "function") {
      value.type = value.type.name.toLowerCase();
    }
    // 更新特定属性
    selectedComp.value.parentAttrs[key] = value;
  }
};
</script>
<template>
  <div class="basic-list">
    <!-- 父组件属性 -->
    <template v-if="parentComp">
      <template v-for="(val, key) in parentProps" :key="key">
        <anyData2Form
          :selectedComp="selectedComp"
          :modelValue="getParentAttr(key)"
          @update:modelValue="(value) => setParentAttr(key, value)"
          :propData="val"
          :keyName="key"
        />
      </template>
    </template>

    <!-- 无父组件提示 -->
    <div v-if="!parentComp && selectedComp" class="no-parent">
      <p>当前组件没有父组件</p>
    </div>
  </div>
</template>

<style scoped>
.no-parent {
  padding: 20px;
  text-align: center;
  color: #999;
  font-style: italic;
}

.no-parent p {
  margin: 0;
}
</style>
