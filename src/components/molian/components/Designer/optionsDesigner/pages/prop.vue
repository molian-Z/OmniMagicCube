<script setup lang="ts">
import { defineOptions, computed } from "vue";
import anyData2Form from "@molianComps/AnyData2Form/index.vue";
import { selectedComp } from "../../designerData";
import { useComponentProps } from "../composables/useComponentProps";

defineOptions({
  name: "propComp",
});

const {
  currentAttrs,
  currentEmits,
  getFilteredProps,
  getProp,
  updateAttrs,
} = useComponentProps();

// 获取过滤后的属性（不显示 removeAttr 属性）
const currentProps = computed(() => getFilteredProps(false));
</script>
<template>
  <div class="basic-list">
    <template v-if="selectedComp">
      <template v-for="item in currentEmits" :key="item.prop">
        <anyData2Form
          :selectedComp="selectedComp"
          :modelValue="currentAttrs[item.prop]"
          @update:modelValue="(value) => updateAttrs(item, value)"
          :propData="getProp(item.prop)"
          :keyName="item.prop"
        />
      </template>
      <template v-for="(val, key) in currentProps" :key="key">
          <anyData2Form
            :selectedComp="selectedComp"
            v-model="currentAttrs[key]"
            :propData="val"
            :keyName="key"
          />
      </template>
    </template>
  </div>
</template>
