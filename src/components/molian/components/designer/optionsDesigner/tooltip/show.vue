<script setup lang="ts">
import { inject, computed, defineEmits, defineProps } from 'vue'
import { deepObjToArray } from '@molian/utils/util'
import { selectedComp, globalAttrs } from '../../designerData'
import svgIcon from '@molianComps/SvgIcon/index.vue'
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
const { customCascaderPanel } = customComps
const message:any = inject("mlMessage")
const variableList = computed(() => {
  return Object.keys(globalAttrs.variable).map(key => {
    const variableValue = globalAttrs.variable[key]
    if (variableValue.type === 'object') {
      const currentObjValue:{
        label: string,
        value: string,
        children?: any[]
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
const directives = computed({
  get() {
    return selectedComp.value && selectedComp.value.directives && selectedComp.value.directives.show && selectedComp.value.directives.show.value || []
  },
  set(val) {
    if (!selectedComp.value.directives) {
      selectedComp.value.directives = {}
    }
    if (val === null) {
      selectedComp.value.directives.show = null
    } else {
      selectedComp.value.directives.show = {
        type: 'variable',
        value: val
      }
    }
  }
})

const clearData = ()=>{
  directives.value = null
  emit('close')
}

const changeValue = function(val: any, option: any, pathValues: any){
  if(typeof val === 'string' && Array.isArray(pathValues)){
    directives.value = pathValues.map(item => item.value)
  }else{
    directives.value = val
  }
}

</script>
<template>
  <div class="flex-container">
    <span class="sub-title">{{ t('options.'+title) }}</span>
    <svgIcon class="svg-icon " icon="clear" @click="clearData"></svgIcon>
  </div>
  <customCascaderPanel size="small" :options="variableList" :checkStrictly="true" :clearable="true" valueType="full"
    :modelValue="directives"  @update:modelValue="changeValue" />
</template>

<style scoped lang="scss">
.flex-container{
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 120px;
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
</style>