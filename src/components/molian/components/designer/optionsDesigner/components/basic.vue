<script setup lang="ts">
import { computed, defineOptions, inject } from 'vue';
import anyData2Form from '@molianComps/any-data2form/index.vue'
import { selectedComp } from '../../designerData'

defineOptions({
  name: 'basicComp'
})
const comps:any = inject('mlComps')


const currentAttrs = computed(() => {
  if (!selectedComp.value) return {}
  return selectedComp.value && selectedComp.value.attrs
})

const currentProps = computed(() => {
  if (!selectedComp.value) return {}
  return comps.value[selectedComp.value.name].props
})

</script>
<template>
  <div class="basic-list">
    <template v-if="selectedComp">
      <template v-for="(val, key) in currentProps" :key="key">
        <anyData2Form :selectedComp="selectedComp" v-model="currentAttrs[key]" :propData="val" :keyName="key"></anyData2Form>
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