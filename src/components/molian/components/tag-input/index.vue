<script setup>
import { ref, nextTick, inject, defineProps, defineEmits, computed } from 'vue';
import { useVModel } from '@vueuse/core'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
})
const emit = defineEmits(['update:modelValue'])
const t = inject('mlLangs')
const customComps = inject('customComps')
const { customInput, customTag, customButton } = customComps

const inputValue = ref('')
const dynamicTags = useVModel(props, 'modelValue', emit)
const inputVisible = ref(false)
const inputRef = ref()

const handleClose = (tag) => {
  dynamicTags.value.splice(dynamicTags.value.indexOf(tag), 1)
}


const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    inputRef.value.$refs.ref.focus()
  })
}
const handleInputConfirm = () => {
  if (inputValue.value) {
    dynamicTags.value.push(inputValue.value)
    emit('update:modelValue', dynamicTags.value)
  }
  inputVisible.value = false
  inputValue.value = ''
}

</script>

<template>
  <div class="tag-input-container">
    <customTag v-for="tag in modelValue" :key="tag" closable :disable-transitions="false"
      @close="handleClose(tag)">
      {{ tag }}
    </customTag>
    <customInput style="width:70px;" v-if="inputVisible" ref="inputRef" v-model="inputValue" size="small" @enter="handleInputConfirm" @blur="handleInputConfirm" />
    <customButton v-else size="small" @click="showInput">
      {{t('options.addNewVar')}}
    </customButton>
  </div>
</template>
<style scoped>
.tag-input-container{
  display: flex;
  > *{
    margin: 0 var(--ml-mg-small);
  }
}
</style>