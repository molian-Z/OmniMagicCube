<script setup>
import { defineProps, defineEmits, inject } from 'vue'
import svgIcon from '@molianComps/svg-icon/index.vue'

const props = defineProps({
  modelValue: Array,
  selectedComp: Object
})
const mlComps = inject('mlComps')

const emit = defineEmits(['activeNode'])

const sendActive = function (comp) {
  emit('activeNode', comp)
}
</script>

<template>
  <div class="tree-node" v-for="comp in modelValue" :key="comp.key">
    <div class="tree-node-header" :class="[selectedComp && selectedComp.key === comp.key && 'is-active']">
      <svg-icon icon="node-fold" style="transform:rotate(90deg)"></svg-icon>
      <div class="tree-node-header__title" @click="sendActive(comp)">{{ mlComps[comp.name].title }}</div>
    </div>
    <div class="tree-node-content">
      <template v-for="(slotVal, slotKey) in comp.slots" :key="slotKey">
        <div class="slot-container" :class="slotKey">
          <template v-if="slotVal && slotVal.children && slotVal.children.length > 0">
            <span class="slotTitle">{{ slotKey }}</span>
            <deepTree v-model="slotVal.children" :selectedComp="selectedComp" @activeNode="sendActive"></deepTree>
          </template>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.tree-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}


.tree-node {
  .tree-node-header {
    cursor: pointer;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    transition: var(--ml-transition-base);
    padding: var(--ml-pd-base);
    border-radius: var(--ml-radius-base);

    &:hover {
      background-color: var(--ml-fill-color-4);
    }

    &.is-active{
      background-color: var(--ml-fill-color-3);
    }

    .tree-node-header__title{
      flex: 1;
    }
  }

  .tree-node-content {
    margin-left: var(--ml-mg-lg);

    .slot-container{
      .slotTitle{
        font-size: 14px;
        font-weight: bold;
        color: var(--ml-color-text-2);
        margin-left: var(--ml-mg-lg);
      }
    }
  }
}
</style>