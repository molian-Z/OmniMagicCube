<script setup lang="ts">
import { ref, inject } from 'vue'
import { createCss } from '@molian/utils/css-generator'
import { createTemplate } from '@molian/utils/template-generator'
import { createJS } from '@molian/utils/js-generator'
import { modelValue,globalAttrs } from '../../designerData'
import codeEditor from '@molianComps/code-editor/index.vue';
import { useBroadcastChannel } from '@vueuse/core'
import render from '@molianComps/render/index.vue'

const customComps:any = inject('customComps')
const t:any = inject('mlLangs')
const { customButton, customTooltip, customDialog } = customComps
const message:any = inject('ml-message')
const {
  isSupported,
  post,
  error,
} = useBroadcastChannel({ name: 'molian_createVue' })
const showDialog = ref(false)
const showRenderDialog = ref(false)
const showTemplateDialog = ref(false)
const codeData = ref(``)
const langMode = ref(``)
const cacheImportTemplateData = ref(``)

const createSFC = function (type: string | any) {
  const template = createTemplate(modelValue.value)
  const css = createCss(modelValue.value)
  const js = createJS(modelValue.value, globalAttrs, type)
  const code = `${js}
  <template>${template}\n</template>
  <style>${css}</style>`
  // console.log(codeData)
  return code
}

const sendChannel = function () {
  if (isSupported.value) {
    post({
      type: 'create',
      data: createSFC(null)
    })
  } else {
    message.error(error.value)
  }
}

const exportModelData = function () {
  langMode.value = 'json'
  codeData.value = JSON.stringify({
    designerCode:modelValue.value,
    globalAttrs
  })
  showDialog.value = true
}

const showCode = function (type: string | null) {
  langMode.value = 'html'
  codeData.value = createSFC(type)
  showDialog.value = true
}

const showRender = function(){
  showRenderDialog.value = true
}

const importTemplate = function(){
  showTemplateDialog.value = true
}

</script>

<template>
  <div class="create-list">
    <div class="create-item">
      <div>
        <customButton theme="primary" size="small" @click="showCode('options')">
          {{ t('global.createOptionsVue') }}
        </customButton>
      </div>
    </div>
    <div class="create-item">
      <div>
        <customButton theme="primary" size="small" @click="showCode('composition')">
          {{ t('global.createCompositionVue') }}
        </customButton>
      </div>
    </div>
    <div class="create-item">
      <customTooltip :content='t(`global.onChannel`) + `：molian_createVue`'>
        <customButton theme="primary" size="small" @click="sendChannel">
          {{ t('global.sendToChannel') }}
        </customButton>
      </customTooltip>
    </div>
    <div class="create-item">
      <customButton theme="primary" size="small" @click="exportModelData">
        查看原始数据
      </customButton>
    </div>
    <div class="create-item">
      <customButton theme="primary" size="small" @click="showRender">
        同步render
      </customButton>
    </div>
    <div class="create-item">
      <customButton theme="primary" size="small" @click="importTemplate">
        导入Template
      </customButton>
    </div>
  </div>
  <customDialog appendToBody header="生成SFC" width="80%" :close-on-click-modal="false" @escKeydown="showDialog = false"
      @closeBtnClick="showDialog = false" v-model:visible="showDialog" destroyOnClose>
    <div>
      <codeEditor v-model="codeData" :lang="langMode" />
    </div>
  </customDialog>
  <customDialog  appendToBody header="同步render" width="1200px" :close-on-click-modal="false" @escKeydown="showRenderDialog = false"
      @closeBtnClick="showRenderDialog = false" v-model:visible="showRenderDialog" destroyOnClose>
      <render :modelValue="modelValue" :globalAttrs="globalAttrs" />
  </customDialog>
  <customDialog  appendToBody header="导入Template" width="1200px" :close-on-click-modal="false" @escKeydown="showTemplateDialog = false"
      @closeBtnClick="showTemplateDialog = false" v-model:visible="showTemplateDialog" destroyOnClose>
      <codeEditor v-model="cacheImportTemplateData"></codeEditor>
  </customDialog>
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