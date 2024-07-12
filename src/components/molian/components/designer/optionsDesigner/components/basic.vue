<script setup lang="ts">
import { computed, defineOptions, inject } from "vue";
import { useCloned } from "@vueuse/core";
import anyData2Form from "@molianComps/AnyData2Form/index.vue";
import { selectedComp } from "../../designerData";

defineOptions({
  name: "basicComp",
});
const comps: any = inject("mlComps");

const currentAttrs = computed(() => {
  if (!selectedComp.value) return {};
  return selectedComp.value.attrs;
});

const currentEmits = computed(() => {
  if (!selectedComp.value) return {};
  return (
    selectedComp.value &&
    comps.value[selectedComp.value.name].emits
      .filter((item: any) => {
        return item.indexOf("update:") === 0;
      })
      .map((item: any) => {
        return {
          prop: item.replace("update:", ""),
          emit: item,
        };
      })
  );
});

const currentProps = computed(() => {
  if (!selectedComp.value) return {};
  const { cloned } = useCloned(comps.value[selectedComp.value.name].props);
  currentEmits.value.forEach((item) => {
    delete cloned.value[item.prop];
  });
  return cloned.value;
});

const updateAttrs = (item: any, value: any) => {
  if (value.value == undefined) {
    currentAttrs.value[item.prop] = undefined;
    selectedComp.value.on["update:modelValue"] = undefined;
  } else {
    currentAttrs.value[item.prop] = value;
    selectedComp.value.on["update:modelValue"] = {
      type: "function",
      value: {
        code: `this.vars.${value.value.join('.')} = value;`,
        codeVar: ["value"],
        functionMode: "function",
        modifiers: [],
      }
    }
  }
};
</script>
<template>
  <div class="basic-list">
    <template v-if="selectedComp">
      <template v-for="(item, index) in currentEmits" :key="index">
        <anyData2Form
          :selectedComp="selectedComp"
          :modelValue="currentAttrs[item.prop]"
          @update:modelValue="(value) => updateAttrs(item, value)"
          :propData="{ type: [] }"
          :keyName="item.prop"
        />
      </template>
      <template v-for="(val, key) in currentProps" :key="key">
        <template
          v-if="(val && val.hidden && val.hidden(currentAttrs) === false) || !val.hidden"
        >
          <anyData2Form
            :selectedComp="selectedComp"
            v-model="currentAttrs[key]"
            :propData="val"
            :keyName="key"
          />
        </template>
      </template>
    </template>
  </div>
</template>
