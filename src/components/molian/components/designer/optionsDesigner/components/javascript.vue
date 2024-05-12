<script setup lang="ts">
import { computed, defineOptions, inject } from 'vue';
import anyData2Form from '@molianComps/any-data2form/index.vue'
import { selectedComp } from '../../designerData'

defineOptions({
  name: 'basicComp'
})
const comps:any = inject('mlComps')


const currentOn = computed(() => {
  if (!selectedComp.value) return {}
  return selectedComp.value && selectedComp.value.on
})

const currentEmits = computed(() => {
  if (!selectedComp.value) return {}
  return selectedComp.value && comps.value[selectedComp.value.name].emits.map((item: any) => {
    return {
      key: item,
      type: 'function'
    }
  })
})

defineExpose(currentOn)

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