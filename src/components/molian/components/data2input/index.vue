<script setup lang="ts">
import { ref, computed, inject, defineProps } from 'vue';
import { useVModel } from '@vueuse/core'
import codeInput from '@molianComps/MlCodeInput/index.vue'
defineOptions({
    name: "Data2Input"
})
const customComps:any = inject('customComps')
const { customInputNumber, customInput, customSwitch, customSelect } = customComps
const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean, Object, Array],
    default: ''
  },
  propData: {
    type: Object,
    default: () => ({})
  },
})
const emit = defineEmits(['update:modelValue'])
const value:any = useVModel(props, 'modelValue', emit)
const currentTypeIndex = ref(0)
const type = computed(() => {
  if (Array.isArray(props.propData.type)) {
    return props.propData.type[currentTypeIndex.value]
  } else {
    return props.propData.type
  }
})
// 指令支持
</script>

<template>
  <div class="data2input-item">
      <customSwitch v-model="value" v-bind="propData.customOptinos" v-if="type === 'boolean'" />
      <customSelect :options="propData.optionItems" v-model="value" v-bind="propData.customOptinos" v-else-if="propData.optionItems" />
      <customInputNumber v-model="value" v-bind="propData.customOptinos" v-else-if="type === 'number'" />
      <codeInput :isVariable="propData.type !== 'computed'" :isModifiers="false" :mode="type" :keyName="propData.label || propData.prop" v-model="value"
        v-else-if="['promise', 'function', 'object', 'array', 'computed'].indexOf(type) > -1" />
      <customInput v-model="value" v-bind="propData.customOptinos" v-else></customInput>
  </div>
</template>

<style scoped lang="scss">
.data2input-item {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--ml-bg-color);
  padding: var(--ml-pd-base);
  border-radius: var(--ml-radius-base);
  width: 100%;
  &> :not(button){
    width: 100%;
  }
}
</style>