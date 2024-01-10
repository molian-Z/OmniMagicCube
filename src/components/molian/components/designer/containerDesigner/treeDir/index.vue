<script setup lang="ts">
import { inject } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { modelValue, selectedComp, treeDirRef } from '@molianComps/designer/designerData'
import deepTree from './deepTreeToData.vue'
import floatBall from '@molianComps/float-ball/index.vue'

const t: any = inject('mlLangs')

onClickOutside(treeDirRef, () => {
  if (treeDirRef.value.expand) {
    treeDirRef.value.switchExpand(false)
  }
})
</script>

<template>
  <floatBall :title="t('container.treeDir')" ref="treeDirRef">
    <div class="tree-dir-container">
      <deepTree v-model="modelValue" @activeNode="onActive"></deepTree>
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