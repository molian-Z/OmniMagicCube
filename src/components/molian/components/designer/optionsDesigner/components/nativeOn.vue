<script setup>
import { computed, defineOptions, inject,ref } from 'vue';
import anyData2Form from '@/components/molian/components/any-data2form'
import { selectedComp } from '../../designerData'
import { defaultNativeEventMap } from '@molian/utils/defaultData'
defineOptions({
  name: 'basicComp'
})
const customComps = inject('customComps')
const t = inject('mlLangs')
const { customButton, customInput } = customComps
const appendOnInput = ref('')
const currentOn = computed(() => {
  if (!selectedComp.value) return {}
  return selectedComp.value && selectedComp.value.nativeOn
})

const currentNativeOn = computed(() => {
  if (!selectedComp.value) return {}
  const newNativeOn = Array.from(new Set(Object.keys(defaultNativeEventMap).concat(currentOn.value? Object.keys(currentOn.value) : [])))
  return selectedComp.value && newNativeOn.map(item => {
    return {
      key: item,
      type: 'function',
      codeVar: defaultNativeEventMap[item]
    }
  })
})

const appendOn = function () {
  if (!appendOnInput.value || currentOn.value[appendOnInput.value]) {
    return false
  }
  currentOn.value[appendOnInput.value] = {code:"",codeVar:[]}
  appendOnInput.value = ''
}

</script>
<template>
  <div class="basic-list">
    <template v-if="selectedComp">
      <template v-for="(item) in currentNativeOn" :key="item.key">
        <anyData2Form :selectedComp="selectedComp" v-model="currentOn[item.key]" :propData="item" :keyName="item.key">
        </anyData2Form>
      </template>
      <div class="appendOn">
      <customInput size="small" v-model="appendOnInput">
        <template #suffix>
          <customButton @click="appendOn">{{t('options.appendOn')}}</customButton>
        </template>
      </customInput>
      
      </div>
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

.appendOn{
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--ml-bg-color);
  padding: var(--ml-pd-base);
  border-radius: var(--ml-radius-base);
}
</style>