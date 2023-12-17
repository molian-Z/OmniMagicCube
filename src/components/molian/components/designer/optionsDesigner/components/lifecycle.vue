<script setup>
import { computed, defineOptions, inject } from 'vue';
import anyData2Form from '@/components/molian/components/any-data2form'
import { selectedComp } from '../../designerData'
import { defaultPageEventMap } from '@molian/utils/defaultData'

defineOptions({
  name: 'basicComp'
})
const comps = inject('mlComps')
const t = inject('mlLangs')
// const lifecycle = inject('mlLifecycle')
const currentOn = computed(() => {
  if (!selectedComp.value) return {}
  return selectedComp.value && selectedComp.value.on
})

const currentEmits = computed(() => {
  if (!selectedComp.value) return {}
  const newNativeOn = Array.from(new Set(Object.keys(defaultPageEventMap).concat(currentOn.value? Object.keys(currentOn.value) : [])))
  return selectedComp.value && newNativeOn.map(item => {
    return {
      key: item,
      type: 'function',
      codeVar:defaultPageEventMap[item]
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
  height: 542px;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: var(--ml-bg-color);
  border-radius: var(--ml-radius-base);
  flex-direction: column;
}
</style>