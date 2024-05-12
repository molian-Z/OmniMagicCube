<script setup lang="ts">
import { computed, defineOptions, inject } from "vue";
import { useCloned } from "@vueuse/core";
import anyData2Form from "@molianComps/any-data2form/index.vue";
import { selectedComp } from "../../designerData";

defineOptions({
  name: "basicComp",
});
const comps: any = inject("mlComps");

const currentAttrs = computed(() => {
  if (!selectedComp.value) return {};
  return selectedComp.value.attrs;
});

const currentProps = computed(() => {
  if (!selectedComp.value) return {};
  return comps.value[selectedComp.value.name].props;
});
</script>
<template>
  <div class="basic-list">
    <template v-if="selectedComp">
      <template v-for="(val, key) in currentProps" :key="key">
        <template v-if="val.hidden && val.hidden(currentAttrs) === false || !val.hidden">
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
