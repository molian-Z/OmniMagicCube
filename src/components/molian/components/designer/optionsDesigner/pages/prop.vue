<script setup lang="ts">
import { computed, defineOptions, inject } from "vue";
import {camelCase} from 'change-case'
import { useCloned } from "@vueuse/core";
import anyData2Form from "@molianComps/AnyData2Form/index.vue";
import { selectedComp } from "../../designerData";

defineOptions({
  name: "propComp",
});
const comps: any = inject("mlComps");
const currentAttrs: any = computed(() => {
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
  currentEmits.value.forEach((item: any) => {
    delete cloned.value[item.prop];
  });
  return cloned.value;
});

const updateAttrs = (item: any, value: any) => {
  if (value.type === "variable") {
    if (value.value == undefined) {
      currentAttrs.value[item.prop] = undefined;
      selectedComp.value.on[item.emit] = undefined;
    } else {
      currentAttrs.value[item.prop] = value;
      if (!!selectedComp.value && !!value.value.join('.')) {
        selectedComp.value.on[item.emit] = {
          type: "function",
          value: {
            code: `this.vars.${value.value.join(".")} = value;`,
            codeVar: ["value"],
            functionMode: "function",
            modifiers: [],
          },
        };
      }
    }
  } else {
    currentAttrs.value[item.prop] = value;
  }
};

const getProp = (keyName: string) => {
    if(!!selectedComp.value){
        return comps.value[selectedComp.value.name].props[keyName];
    }
};

const isRemoveAttr = (keyName: any) => {
    if(!!selectedComp.value){
        return !!getProp(keyName).removeAttr
    }
}

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
        <template
          v-if="(val && val.hidden && val.hidden(currentAttrs) === false) || !val.hidden"
        >
          <anyData2Form
            :selectedComp="selectedComp"
            v-model="currentAttrs[key]"
            :propData="val"
            :keyName="key"
            v-if="!isRemoveAttr(key)"
          />
        </template>
      </template>
    </template>
  </div>
</template>
