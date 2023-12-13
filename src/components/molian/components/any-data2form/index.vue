<script setup>
import { ref, computed, defineOptions, inject, defineProps, watch } from 'vue';
import { useVModel } from '@vueuse/core'
import svgIcon from '@molianComps/svg-icon/index.vue'
import codeEditor from '@molianComps/code-editor/index.vue'
const t = inject('mlLangs')
const customComps = inject('customComps')
const { customInputNumber, customInput, customSwitch, customSelect, customButton, customDialog } = customComps
const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean, Object, Array],
    default: ''
  },
  keyName: {
    type: String,
    default: ''
  },
  attrs: {
    type: Object,
    default: () => ({})
  },
  propData: {
    type: Object,
    default: () => ({})
  },
  selectedComp: {
    type: Object,
    default: () => { }
  }
})
defineOptions({
  slotsOption: {
    default: true
  }
})
const emit = defineEmits(['update:modelValue'])
const value = useVModel(props, 'modelValue', emit)
const getOptionItemI18n = (optionItems) => {
  return optionItems.map(item => {
    const langStr = t('attrs.' + props.keyName + '.' + item)
    return {
      label: langStr === item ? t('attrs.' + item) : langStr,
      value: item
    }
  })
}
const currentTypeIndex = ref(0)
const type = computed(() => {
  if (Array.isArray(props.propData.type)) {
    return props.propData.type[currentTypeIndex.value]
  } else {
    return props.propData.type
  }
})

const visible = ref(false)
const codeMode = ref('javascript')
const cacheValue = ref('')

const getI18n = (key, name) => {
  const langStr = t('attrs.' + name + '.' + key)
  return langStr === key ? t('attrs.' + key) : langStr
}

const tabType = () => {
  if (!Array.isArray(props.propData.type)) return false
  value.value = null
  currentTypeIndex.value = props.propData.type.length - 1 === currentTypeIndex.value ? 0 : currentTypeIndex.value + 1
}

const showDialog = (type) => {
  if (type === 'object' || type === 'array') {
    codeMode.value = "json"
  } else {
    codeMode.value = "javascript"
  }
  cacheValue.value = value.value
  visible.value = true
}
</script>

<template>
  <div class="data2form-item">
    <div class="data2form-item__label">{{ getI18n(keyName, selectedComp && selectedComp.name || '') }}</div>
    <div class="data2form-item__input">
      <transition name="fade">
        <customSwitch size="small" v-model="value" v-if="type === 'boolean'" />
        <customSelect :options="getOptionItemI18n(propData.optionItems)" size="small" v-model="value"
          v-else-if="propData.optionItems" />
        <customInputNumber size="small" v-model="value" v-else-if="type === 'number'">
        </customInputNumber>
        <customButton size="small" v-else-if="type === 'promise'" @click="showDialog('promise')">
          {{ t('options.edit') + t('options.function') }}</customButton>
        <customButton size="small" v-else-if="type === 'function'" @click="showDialog('function')">
          {{ t('options.edit') + t('options.function') }}</customButton>
        <customButton size="small" v-else-if="type === 'object'" @click="showDialog('object')">
          {{ t('options.edit') + t('options.object') }}</customButton>
        <customButton size="small" v-else-if="type === 'array'" @click="showDialog('array')">
          {{ t('options.edit') + t('options.array') }}</customButton>
        <customInput size="small" v-model="value" v-else></customInput>
      </transition>
    </div>
    <div :class="['data2form-item__icon', !Array.isArray(propData.type) && 'disabled']" @click="tabType">
      <svg-icon icon="switch" class="data2form-item__svg-icon" />
    </div>
  </div>
  <customDialog attach="body" :header="t('options.edit') + t(`options.${codeMode}`)" width="80%" :close-on-click-modal="false"
    @escKeydown="visible = false" @closeBtnClick="visible = false" :visible="visible">
    <codeEditor :mode="codeMode" v-model="cacheValue"></codeEditor>
    <template #footer>
        <customButton theme="default" @click="visible = false">{{ t('options.cancel') }}</customButton>
        <customButton theme="primary" @click="visible = false;value = cacheValue">{{ t('options.confirm') }}</customButton>
    </template>
  </customDialog>
</template>

<style scoped lang="scss">
.data2form-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--ml-bg-color);
  padding: var(--ml-pd-base);
  border-radius: var(--ml-radius-base);

  .data2form-item__label {
    width: 100px;
    font-size: 14px;
    font-weight: bold;
    padding-right: var(--ml-pd-base);
    overflow: hidden;
  }

  .data2form-item__input {
    width: 120px;
    position: relative;
  }

  .data2form-item__icon {
    width: 24px;
    padding: 3px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: var(--ml-radius-base);
    user-select: none;

    &:not(&.disabled) {
      background-color: var(--ml-bg-page-color);
      transition: var(--ml-transition-base);
      cursor: pointer;

      &:hover {
        background-color: var(--ml-fill-color-3);
      }
    }

    .data2form-item__svg-icon {
      margin: 0;
      width: 12px;
    }

    &.disabled {
      .data2form-item__svg-icon {
        color: var(--ml-fill-color-2);
      }
    }
  }
}
</style>