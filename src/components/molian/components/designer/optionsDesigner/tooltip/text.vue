<script setup lang="ts">
import { inject, computed, defineEmits, defineProps, watch } from 'vue'
import { deepObjToArray } from '@molian/utils/util'
import { selectedComp, globalAttrs } from '../../designerData'
import svgIcon from '@molianComps/SvgIcon/index.vue'
defineProps({
  title: {
    type: String,
    default: ''
  }
})
const emit = defineEmits(['close'])
const customComps: any = inject('customComps')
const { customCascaderPanel, customRadioGroup, customRadioButton, customInput } = customComps
const message: any = inject("mlMessage")
const t: any = inject('mlLangs')
const variableList = computed(() => {
  return Object.keys(globalAttrs.variable).map(key => {
    const variableValue = globalAttrs.variable[key]
    if (variableValue.type === 'object') {
      const currentObjValue: {
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
    return selectedComp.value && selectedComp.value.directives && selectedComp.value.directives.text && selectedComp.value.directives.text.value || null
  },
  set(val) {
    if(!selectedComp.value) return 
    if (!selectedComp.value.directives) {
      selectedComp.value.directives = {}
    }
    if (val === null) {
      selectedComp.value.directives.text = null
    } else {
      selectedComp.value.directives.text = val
    }
  }
})
const switchTab = ref('string')

const clearData = () => {
  directives.value = null
  emit('close')
}

const changeValue = function (val: any, option: any, pathValues: any) {
  if (typeof val === 'string' && Array.isArray(pathValues)) {
    directives.value = {
      type: 'variable',
      value: pathValues.map(item => item.value)
    }
  } else {
    directives.value = {
      type: 'variable',
      value: val
    }
  }
}

const changeInput = function (val: string) {
  directives.value = {
    type: 'string',
    value: val
  }
}

const changeTab = function (val: string) {
  directives.value = null
}

watch(() => directives.value, (newVal) => {
  if(newVal === null){
    switchTab.value = switchTab.value === 'string' ? 'string' : 'variable';
  }else if (typeof newVal === 'string' && switchTab.value !== 'string') {
    switchTab.value = 'string'
  } else if (typeof newVal === 'object' && switchTab.value !== 'variable') {
    switchTab.value = 'variable'
  }
},{
  immediate:true
})

</script>
<template>
  <div class="flex-container">
    <span class="sub-title">{{ t('options.' + title) }}</span>
    <svgIcon class="svg-icon " icon="clear" @click="clearData"></svgIcon>
  </div>
  <div class="switch-tab">
    <customRadioGroup v-model="switchTab" variant="primary-filled" size="small" @change="changeTab" :disabled="!selectedComp">
      <customRadioButton value="string">{{ t('options.string') }}</customRadioButton>
      <customRadioButton value="variable">{{ t('options.variable') }}</customRadioButton>
    </customRadioGroup>
  </div>
  <customInput size="small" :modelValue="directives" @update:modelValue="changeInput" :textarea="true" :disabled="!selectedComp" v-if="switchTab === 'string'" />
  <customCascaderPanel size="small" :options="variableList" :checkStrictly="true" :clearable="true" valueType="full"
    :modelValue="directives" @update:modelValue="changeValue" v-else-if="switchTab === 'variable'" />
</template>

<style scoped lang="scss">
.flex-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 120px;
}

.switch-tab {
  text-align: center;
  margin-bottom: var(--ml-mg-small);
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