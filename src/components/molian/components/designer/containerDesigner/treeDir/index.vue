<script setup>
import { inject } from 'vue'
import { modelValue, selectedComp } from '@molianComps/designer/designerData'
import deepTree from './deepTree.vue'
import floatBall from '@molianComps/float-ball/index.vue'

const t = inject('mlLangs')

const onActive = (value)=>{
  selectedComp.value = value
}
</script>

<template>
  <floatBall :title="t('container.treeDir')">
    <div class="tree-dir-container">
    <deepTree v-model="modelValue" :selectedComp="selectedComp" @activeNode="onActive"></deepTree>
  </div>
  </floatBall>
</template>

<style scoped lang="scss">
.tree-dir-container{
  width: 100%;
  height: 100%;
  background-color: var(--ml-bg-color);
  border-radius: var(--ml-radius-base);
  overflow-y: auto;
}
</style>