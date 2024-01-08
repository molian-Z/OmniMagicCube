<script setup lang="ts">
import { ref, inject, computed, defineEmits } from 'vue'
import { deepObjToArray } from '@molian/utils/util'
import { selectedComp, globalAttrs } from '../../designerData'
import svgIcon from '@molianComps/svg-icon/index.vue'
const emit = defineEmits(['close'])
const customComps:any = inject('customComps')
const { customCascader, customInput } = customComps
const message:any = inject('ml-message')
const t:any = inject('mlLangs')
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
        children = deepObjToArray(JSON.parse(variableValue.value))
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
const changeValue = (val: any) =>{
  if(!selectedComp.value.directives.for){
    selectedComp.value.directives.for = {
      type: 'variable',
      value:[]
    }
  }
  selectedComp.value.directives.for.value = val
}
</script>
<template>
  <div style="text-align: right;">
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
    <div class="for-list__item">
      <div class="for-list__label">{{ t("options.dataKey") }}</div>
      <div class="for-list__input">
        <customInput size="small" :modelValue="directives.dataKey" @update:modelValue="updateValue('dataKey', $event)">
        </customInput>
      </div>
    </div>
    <div class="for-list__item">
      <div class="for-list__label">{{ t('options.objectKey') }}</div>
      <div class="for-list__input">
        <customInput size="small" :modelValue="directives.objectKey" @update:modelValue="updateValue('objectKey', $event)">
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
  }
}
</style>