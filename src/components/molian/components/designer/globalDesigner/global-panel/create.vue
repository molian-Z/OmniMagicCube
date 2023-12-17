<script setup>
import { ref, inject } from 'vue'
import { createCss } from '@molian/utils/css-generator'
import codeEditor from '@molianComps/code-editor/index.vue';
import { createTemplate } from '@molian/utils/template-generator'
import { modelValue } from '../../designerData'
import { useBroadcastChannel } from '@vueuse/core'

const customComps = inject('customComps')
const t = inject('mlLangs')
const { customButton, customTooltip } = customComps
const message = inject('ml-message')
const {
  isSupported,
  post,
  error,
} = useBroadcastChannel({ name: 'molian_createVue' })
const showDialog = ref(false)
const codeData = ref(``)
const langMode = ref(``)

const createSFC = function () {
  const template = createTemplate(modelValue)
  const css = createCss(modelValue)
  const code = `<template>${template}\n</template>
    <style>${css}</style>`
  // console.log(codeData)
  return code
}

const sendChannel = function () {
  if (isSupported.value) {
    post({
      type: 'create',
      data: createSFC()
    })
  } else {
    message.error(error.value)
  }
}

const exportModelData = function () {
  langMode.value = 'json'
  codeData.value = JSON.stringify(modelValue)
  showDialog.value = true
}

const showCode = function () {
  langMode.value = 'html'
  codeData.value = createSFC()
  showDialog.value = true
}
</script>

<template>
  <div class="create-list">
    <div class="create-item">
      <div @click="showCode">
        <customButton @click="sendChannel">
          {{ t('global.createVue') }}
        </customButton>
      </div>
    </div>
    <div class="create-item">
      <customTooltip :content='t(`global.onChannel`) + `：molian_createVue`'>
        <customButton @click="sendChannel">
          {{ t('global.sendToChannel') }}
        </customButton>
      </customTooltip>
    </div>
    <div class="create-item">
      <customButton @click="exportModelData">
        导出训练数据
      </customButton>
    </div>
  </div>
  <el-dialog v-model="showDialog" title="生成SFC" width="800px" append-to-body destroyOnClose>
    <div>
      <codeEditor v-model="codeData" :lang="langMode" />
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
.create-list {

  .create-item {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--ml-bg-color);
    padding: var(--ml-pd-lg) var(--ml-pd-base);
    border-radius: var(--ml-radius-base);
    margin-bottom: var(--ml-mg-base);
    cursor: pointer;
  }
}
</style>