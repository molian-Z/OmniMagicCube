<script setup>
import { computed, defineOptions } from 'vue';
import anyData2Form from '@/components/molian/components/any-data2form'
import { globalAttrs } from '../../designerData'
import { defaultLifecycleMap } from '@molian/utils/defaultData'

defineOptions({
  name: 'basicComp'
})

const { lifecycle } = globalAttrs

const currentEmits = computed(() => {
  const lifecycleOn = Array.from(new Set(Object.keys(defaultLifecycleMap).concat(lifecycle.value ? Object.keys(lifecycle.value) : [])))
  return lifecycleOn.map(item => {
    return {
      key: item,
      type: 'function',
      codeVar: defaultLifecycleMap[item]
    }
  })
})
</script>
<template>
  <div class="basic-list">
    <template v-for="(item) in currentEmits" :key="item.key">
      <anyData2Form v-model="lifecycle[item.key]" :propData="item" :keyName="item.key" :isModifiers="false" />
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