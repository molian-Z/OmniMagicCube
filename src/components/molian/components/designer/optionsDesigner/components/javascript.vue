<script setup>
import { computed, defineOptions, inject } from 'vue';
import anyData2Form from '@molianComps/any-data2form/index.vue'
import { selectedComp } from '../../designerData'

defineOptions({
  name: 'basicComp'
})
const comps = inject('mlComps')
const t = inject('mlLangs')


const currentOn = computed(() => {
  if (!selectedComp.value) return {}
  return selectedComp.value && selectedComp.value.on
})

const currentEmits = computed(() => {
  if (!selectedComp.value) return {}
  return selectedComp.value && comps.value[selectedComp.value.name].emits.map(item => {
    return {
      key: item,
      type: 'function'
    }
  })
})

</script>
<template>
  <div class="basic-list">
    <template v-if="selectedComp">
      <template v-for="(item) in currentEmits" :key="item.key">
        <anyData2Form :selectedComp="selectedComp" v-model="currentOn[item.key]" :propData="item" :keyName="item.key">
        </anyData2Form>
      </template>
    </template>
  </div>
</template>

<style scoped lang="scss">
.basic-list {
  display: flex;
  width: 100%;
  height: 510px;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: var(--ml-bg-color);
  border-radius: var(--ml-radius-base);
  flex-direction: column;
}
</style>