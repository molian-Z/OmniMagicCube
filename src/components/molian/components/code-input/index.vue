<script setup>
import { ref, inject, defineProps, defineEmits } from 'vue';
import codeEditor from '@molianComps/code-editor/index.vue'
import tagInput from '@molianComps/tag-input/index.vue'
const props = defineProps({
  modelValue: {
    type: [Object, Array],
    default: {}
  },
  keyName: {
    type: String,
    default: ''
  },
  mode: {
    type: String,
    default: 'object'
  },
  isModifiers:{
    type:Boolean,
    default:false
  }
})
const emits = defineEmits(['update:modelValue'])
const customComps = inject('customComps')
const { customButton, customDialog, customRadioGroup, customRadioButton } = customComps
const codeMode = ref('javascript')
const t = inject('mlLangs')
const visible = ref(false)
const codeObj = ref({})

const showDialog = (type) => {
  if (type === 'object' || type === 'array') {
    codeMode.value = "json"
    codeObj.value = props.modelValue || ''
  } else {
    codeMode.value = "javascript"
    if (typeof props.modelValue !== 'object') {
      const obj = {
        code: '',
        codeVar: [],
        functionMode: 'function'
      }
      if(props.isModifiers){
        obj.modifiers = []
      }
      codeObj.value = obj
    } else {
      codeObj.value = props.modelValue
    }
  }
  visible.value = true
}

const saveCode = () => {
  visible.value = false;
  emits('update:modelValue', codeObj.value)
}

// 追加变量
const appendCodeVar = (val) => {
  emits('update:modelValue', {
    ...codeObj.value,
    codeVar: val
  })
}

const updateCacheCode = (val) => {
  if (codeMode.value === 'json') {
    codeObj.value = val
  } else if (codeMode.value === 'javascript') {
    codeObj.value.code = val
  }
}


const appendModifiers = (val) => {
  if(!props.isModifiers)return false
  emits('update:modelValue', {
   ...codeObj.value,
   modifiers: val
  })
}
</script>

<template>
  <customButton :theme="typeof codeObj === 'object' && codeObj.code ? 'warning' : 'primary'" size="small"
    @click="showDialog(mode)">
    {{ codeObj.code ? t('options.modify') : t('options.edit') }}{{ t(`options.${mode}`) }}</customButton>
  <customDialog appendToBody :header="keyName" width="80%" :close-on-click-modal="false" @escKeydown="visible = false"
    @closeBtnClick="visible = false" :visible="visible" destroyOnClose>
    <template v-if="codeMode === 'javascript'">
      <div class="modeType">
        <customRadioGroup v-model="codeObj.functionMode" variant="primary-filled" size="small">
          <customRadioButton value="function">{{ t('options.function') }}</customRadioButton>
          <customRadioButton value="asyncFunction">{{ t('options.asyncFunction') }}</customRadioButton>
        </customRadioGroup>
        <tagInput v-if="isModifiers" :inputText="t('options.addNewModifier')" class="tag-modifiers" :modelValue="codeObj.modifiers" @update:modelValue="appendModifiers" />
        <tagInput :inputText="t('options.addNewVar')" class="tagInput" :modelValue="codeObj.codeVar" @update:modelValue="appendCodeVar" />
      </div>
      <div class="function-top">{{ codeObj.functionMode === 'asyncFunction' && 'async ' || '' }}<span
          style="color:#ff85cd;">function </span>({{ codeObj.codeVar && codeObj.codeVar.join(', ') || '' }}) {</div>
    </template>
    <codeEditor :mode="codeMode" :modelValue="codeMode === 'javascript' ? codeObj.code : codeObj"
      @update:modelValue="updateCacheCode"></codeEditor>
    <div class="function-bottom">}</div>
    <template #footer>
      <customButton theme="default" @click="visible = false">{{ t('options.cancel') }}</customButton>
      <customButton theme="primary" @click="saveCode">{{ t('options.confirm') }}</customButton>
    </template>
  </customDialog>
</template>

<style scoped lang="scss">
.modeType {
  margin: var(--ml-mg-base) 0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .tagInput {
    width: calc(100% - 400px);
  }

  .tag-modifiers{
    width: 270px;
  }
}

:deep(.tag-input-container) {
  justify-content: flex-end;
}
</style>