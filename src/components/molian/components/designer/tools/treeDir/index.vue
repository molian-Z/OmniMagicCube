<script setup lang="ts">
import { inject } from "vue";
import { onClickOutside } from "@vueuse/core";
import { modelValue, treeDirRef } from "@molianComps/Designer/designerData";
import { setting } from "@molian/utils/defaultData";
import deepTree from "./deepTreeToData.vue";
import floatBall from "@molianComps/FloatBall/index.vue";

const t: any = inject("mlLangs");

onClickOutside(treeDirRef, (evt: any) => {
  const { classList } = evt.target;
  if (!classList.contains("container-main") && !classList.contains("container-draggable-body")) return 
    if (treeDirRef.value.expand) {
      treeDirRef.value.switchExpand(false);
    }
});
</script>

<template>
  <floatBall
    :title="t('container.treeDir')"
    :offsetX="!setting.immerseRightMode ? '330px' : '0px'"
    ref="treeDirRef"
  >
    <div class="tree-dir-container">
      <deepTree v-model="modelValue"></deepTree>
    </div>
  </floatBall>
</template>

<style scoped lang="scss">
.tree-dir-container {
  width: 100%;
  height: 100%;
  background-color: var(--ml-bg-color);
  border-radius: var(--ml-radius-base);
  overflow-y: auto;
}
</style>
