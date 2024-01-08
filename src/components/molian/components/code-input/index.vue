<script setup lang="ts">
import { ref, computed, inject, defineProps, defineEmits } from 'vue';
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
  isModifiers: {
    type: Boolean,
    default: false
  },
  isVariable: {
    type: Boolean,
    default: true
  }
})
const emits = defineEmits(['update:modelValue'])
const customComps:any = inject('customComps')
const { customButton, customDialog, customRadioGroup, customRadioButton } = customComps
const codeMode = ref('javascript')
const t:any = inject('mlLangs')
const visible = ref(false)
const codeObj = ref<any>({})

const newValue:any = computed(()=>{
  return props.modelValue || {}
})

const showDialog = (type: string) => {
  if (type === 'object' || type === 'array') {
    codeMode.value = "json"
    codeObj.value = props.modelValue || type === 'object' ? {} : []
  } else {
    codeMode.value = "javascript"
    if (typeof props.modelValue !== 'object' || !props.modelValue) {
      const obj:{
        code: string,
        codeVar: string[],
        functionMode: string,
        modifiers?: string[]
      } = {
        code: '',
        codeVar: [],
        functionMode: 'function'
      }
      if (props.isModifiers) {
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
const appendCodeVar = (val: string[]) => {
  emits('update:modelValue', {
    ...codeObj.value,
    codeVar: val
  })
}

const updateCacheCode = (val: string) => {
  if (codeMode.value === 'json') {
    codeObj.value = val
  } else if (codeMode.value === 'javascript') {
    codeObj.value.code = val
  }
}


const appendModifiers = (val: string[]) => {
  if (!props.isModifiers) return false
  emits('update:modelValue', {
    ...codeObj.value,
    modifiers: val
  })
}
</script>

<template>
  <customButton :theme="newValue.code ? 'warning' : 'primary'" size="small"
    @click="showDialog(mode)">
    {{ newValue.code ? t('options.modify') : t('options.edit') }}{{ t(`options.${mode}`) }}

    <customDialog appendToBody :header="keyName" width="80%" :close-on-click-modal="false" @escKeydown="visible = false"
      @closeBtnClick="visible = false" :visible="visible" destroyOnClose>
      <template v-if="codeMode === 'javascript'">
        <div class="modeType">
          <customRadioGroup v-model="codeObj.functionMode" variant="primary-filled" size="small">
            <customRadioButton value="function">{{ t('options.function') }}</customRadioButton>
            <customRadioButton value="asyncFunction">{{ t('options.asyncFunction') }}</customRadioButton>
          </customRadioGroup>
          <tagInput v-if="isModifiers" :inputText="t('options.addNewModifier')" class="tag-modifiers"
            :modelValue="codeObj.modifiers" @update:modelValue="appendModifiers" />
          <tagInput v-if="isVariable" :inputText="t('options.addNewVar')" class="tagInput" :modelValue="codeObj.codeVar"
            @update:modelValue="appendCodeVar" />
        </div>
        <div class="function-top">{{ codeObj.functionMode === 'asyncFunction' && 'async ' || '' }}<span
            style="color:#ff85cd;">function </span>({{ codeObj.codeVar && codeObj.codeVar.join(', ') || '' }}) {</div>
      </template>
      <codeEditor :mode="codeMode" :modelValue="codeMode === 'javascript' ? codeObj.code : codeObj"
        @update:modelValue="updateCacheCode"></codeEditor>
      <div class="function-bottom" v-if="codeMode === 'javascript'">}</div>
      <template #footer>
        <customButton theme="default" @click="visible = false">{{ t('options.cancel') }}</customButton>
        <customButton theme="primary" @click="saveCode">{{ t('options.confirm') }}</customButton>
      </template>
    </customDialog>
  </customButton>
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

  .tag-modifiers {
    width: 270px;
  }
}

:deep(.tag-input-container) {
  justify-content: flex-end;
}
</style>