<script setup lang="ts">
import { defineProps, inject } from "vue";
import deepTreeToRender from "./deepTreeToRender.vue";
import { setRenderRef } from "./renderData";
import { toKebabCase } from "@molian/utils/util";
const comps: any = inject("mlComps");
const props = defineProps(<
  {
    comp: any;
    variable: any;
  }
>{
  comp: {
    type: Object,
    default: () => {},
  },
  variable: {
    type: Object,
    default: () => {},
  },
});

// props
const parseProps = (attrs: any) => {
  const propsData: {
    [key: string]: any;
  } = {};
  for (const key in attrs) {
    if (Object.hasOwnProperty.call(attrs, key)) {
      const element = attrs[key];
      const compProp = comps.value[props.comp.name].props[key];
      if ((compProp.hidden && compProp.hidden(attrs) === false) || !compProp.hidden) {
        if (element.type === "variable") {
          let newVal = null;
          if (element.value) {
            element.value.forEach((item: string) => {
              newVal = props.variable[item];
            });
          }
          propsData[key] = newVal;
        } else if (element.value !== undefined && element.value !== null) {
          propsData[key] = element.value;
        }
      }
    }
  }
  return propsData;
};
const useComp = computed(() => {
  return !!comps[props.comp.name] ? comps[props.comp.name].comp : props.comp.name;
});
</script>
<template>
  <component
    :id="comp.id"
    :is="useComp"
    :ref="(el: any) => setRenderRef(el, comp)"
    v-bind="parseProps(comp.attrs)"
    :class="toKebabCase(comp.name) + '__' + comp.key"
  >
    <template
      v-for="(slotVal, slotKey) in comp.slots"
      :key="slotKey"
      #[slotKey]="slotProps"
    >
      <template v-if="slotVal && slotVal.children">
        <template v-if="JSON.stringify(slotProps) !== '{}'">
          <deepTreeToRender v-model="slotVal.children" :slotProps="slotProps" />
        </template>
        <deepTreeToRender v-else v-model="slotVal.children" />
      </template>
    </template>
  </component>
</template>
