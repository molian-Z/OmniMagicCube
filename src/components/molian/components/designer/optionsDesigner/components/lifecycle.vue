<script setup lang="ts">
import { computed, defineOptions } from 'vue';
import anyData2Form from '@molianComps/any-data2form/index.vue'
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
      codeVar: defaultLifecycleMap[item].codeVar
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