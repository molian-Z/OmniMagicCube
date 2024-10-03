<script setup lang="ts">
import { inject, computed, defineEmits, defineProps } from 'vue'
import { deepObjToArray } from '@molian/utils/util'
import { selectedComp, globalAttrs, variableData } from '../../designerData'
import svgIcon from '@molianComps/SvgIcon/index.vue'
import { data2Vars } from '@molian/utils/useCore'
import {useI18n} from 'vue-i18n'
const {t} = useI18n()
defineProps({
  title:{
    type: String,
    default: ''
  }
})
const emit = defineEmits(['close'])
const customComps:any = inject('customComps')
const { customCascader, customInput } = customComps
const message:any = inject("mlMessage")
const variableList = computed(() => {
  return Object.keys(globalAttrs.variable).filter(key => {
    const variableValue = globalAttrs.variable[key]
    if (["string", "array", "object", "number", 'computed', 'function'].indexOf(variableValue.type) > -1) {
      return true
    }
  }).map(key => {
    const variableValue = globalAttrs.variable[key]

    if (variableValue.type === 'object') {
      const currentObjValue:{
        label: string;
        value: string;
        children?: any[];
      } = {
        label: globalAttrs.variable[key].label || key,
        value: key
      }
      let children = []
      try {
        children = deepObjToArray(variableValue.value)
      } catch (error) {
        message.error(currentObjValue.label + t('options.isNotJSONFormatData'))
      }
      if (children.length > 0) {
        currentObjValue.children = children
      }
      return currentObjValue
    } else {
      return {
        label: globalAttrs.variable[key].label || key,
        value: key
      }
    }
  })
})
const directives = computed(() => {
  return selectedComp.value && selectedComp.value.directives && selectedComp.value.directives.for || {value:[]}
})

const variableValue = computed(()=>{
  return directives.value && Array.isArray(directives.value.value) && directives.value.value || []
})

const clearData = () => {
  selectedComp.value.directives.for = null
  emit('close')
}

const updateValue = (key: string | number, val: any) => {
  if(!selectedComp.value.directives.for){
    selectedComp.value.directives.for = {
      type: 'variable',
      value:[]
    }
  }
  selectedComp.value.directives.for[key] = val
}
const changeValue = function(val: any, option: any, pathValues: any){
  if(!selectedComp.value.directives.for){
    selectedComp.value.directives.for = {
      type: 'variable',
      value:[]
    }
  }
  if(typeof val === 'string' && Array.isArray(pathValues)){
    selectedComp.value.directives.for.value = pathValues.map(item => item.value)
  }else{
    selectedComp.value.directives.for.value = val
  }
}

const value = computed(()=>{
  return data2Vars(directives.value, variableData.value)
})
</script>
<template>
  <div class="flex-container">
    <span class="sub-title">{{ t('options.'+title) }}</span>
    <svgIcon class="svg-icon " icon="clear" @click="clearData"></svgIcon>
  </div>
  <div class="for-list">
    <div class="for-list__item">
      <div class="for-list__label">{{ t('options.variable') }}</div>
      <div class="for-list__input">
        <customCascader size="small" :options="variableList" :checkStrictly="true" :clearable="true" valueType="full"
          :modelValue="variableValue" @update:modelValue="changeValue" />
      </div>
    </div>
    <div class="for-list__item">
      <div class="for-list__label">{{ t("options.idKey") }}</div>
      <div class="for-list__input">
        <customInput size="small" :modelValue="directives.idKey" @update:modelValue="updateValue('idKey', $event)">
        </customInput>
      </div>
    </div>
    <div class="for-list__item" v-if="(typeof value === 'object' && !Array.isArray(value))">
      <div class="for-list__label">{{ t('options.objectKey') }}</div>
      <div class="for-list__input">
        <customInput size="small" :modelValue="directives.objectKey" @update:modelValue="updateValue('objectKey', $event)">
        </customInput>
      </div>
    </div>
    <div class="for-list__item">
      <div class="for-list__label">{{ t("options.dataKey") }}</div>
      <div class="for-list__input">
        <customInput size="small" :modelValue="directives.dataKey" @update:modelValue="updateValue('dataKey', $event)">
        </customInput>
      </div>
    </div>
    <div class="for-list__item">
      <div class="for-list__label">{{ t('options.indexKey') }}</div>
      <div class="for-list__input">
        <customInput size="small" :modelValue="directives.indexKey" @update:modelValue="updateValue('indexKey', $event)">
        </customInput>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.flex-container{
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.svg-icon {
  cursor: pointer;
  transition: var(--ml-transition-base);
  padding: var(--ml-pd-small);
  margin-top: var(--ml-mg-small);
  width: 26px;
  height: 26px;
  border-radius: var(--ml-radius-base);

  &:hover {
    background-color: var(--ml-fill-color-5);
  }
}

.for-list__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--ml-pd-base);

  .for-list__label {
    width: 40px;
    font-size: 14px;
    font-weight: bold;
    padding-right: var(--ml-pd-base);
    overflow: hidden;
  }

  .for-list__input {
    width: 160px;
    position: relative;
    &> *{
      width: 100%;
    }
  }
}
</style>