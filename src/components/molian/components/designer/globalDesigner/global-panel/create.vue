<script setup lang="ts">
import { ref, inject } from "vue";
import { createCss, conciseCss, restoreCss } from "@molian/utils/css-generator";
import { createTemplate } from "@molian/utils/template-generator";
import { createJS, conciseJs } from "@molian/utils/js-generator";
// import { TemplateParser } from '@molian/utils/template-parser';
import { modelValue, globalAttrs } from "../../designerData";
import CodeEditor from "@molianComps/MlCodeEditor/index.vue";
import { useBroadcastChannel } from "@vueuse/core";
import { useI18n } from "vue-i18n";
import { validateComponentTree, validateGlobalAttrs } from "@molian/utils/componentCore";

const { t } = useI18n();
const customComps: any = inject("customComps");
const { customButton, customTooltip, customDialog } = customComps;
const message: any = inject("mlMessage");
const comps: any = inject("mlComps");
const { isSupported, post, error } = useBroadcastChannel({ name: "molian_createVue" });
const showDialog = ref(false);
const showImportDialog = ref(false);
const showTemplateDialog = ref(false);
const codeData = ref(``);
const langMode = ref(``);
const cacheImportTemplateData = ref(`<template>
  <div v-if="show">
    <span v-for="item in items" :key="item.id">{{ item.name }}</span>
  </div>
</template>`);

const createSFC = function (type: string | any) {
  const template = createTemplate(conciseJs(conciseCss(modelValue.value), comps.value));
  const css = createCss(modelValue.value);
  const js = createJS(conciseJs(conciseCss(modelValue.value), comps.value), globalAttrs, type);
  const code = `${js}
  <template>${template}\n</template>
  <style scoped>${css}</style>`;
  return code;
};

const sendChannel = function () {
  if (isSupported.value) {
    post({
      type: "create",
      data: createSFC(null),
    });
  } else {
    message.error(error.value);
  }
};

const importModelData = function () {
  let createCode: any = {};
  try {
    createCode = JSON.parse(codeData.value);
  } catch (error) {
    message.error(t("global.dataformatError"));
    createCode = null;
  }
  
  if (!!createCode) {
    // 验证和补全全局属性
    const validatedGlobalAttrs = validateGlobalAttrs(createCode.globalAttrs || {});
    
    // 更新全局属性
    for (let key in validatedGlobalAttrs) {
      if (Object.prototype.hasOwnProperty.call(validatedGlobalAttrs, key)) {
        const element = validatedGlobalAttrs[key];
        globalAttrs[key] = element;
      }
    }
    
    // 验证和补全组件数据
    const restoredModelValue = restoreCss(createCode.modelValue || []);
    modelValue.value = validateComponentTree(restoredModelValue);
  }
  
  codeData.value = ``;
  showImportDialog.value = false;
};

const exportModelData = function () {
  langMode.value = "json";
  codeData.value = JSON.stringify({
    modelValue: conciseJs(conciseCss(modelValue.value), comps.value),
    globalAttrs,
  });
  showDialog.value = true;
};

const showCode = function (type: string | null) {
  langMode.value = "html";
  codeData.value = createSFC(type);
  showDialog.value = true;
};

const importTemplate = function () {
    console.log(cacheImportTemplateData.value)
    // const parser = new TemplateParser()
    // console.log(parser.createAst(cacheImportTemplateData.value))
    showTemplateDialog.value = false;
};
</script>

<template>
  <div class="create-list">
    <div class="create-item">
      <div>
        <customButton theme="primary" size="small" @click="showCode('options')">
          {{ t("global.createOptionsVue") }}
        </customButton>
      </div>
    </div>
    <div class="create-item">
      <div>
        <customButton theme="primary" size="small" @click="showCode('composition')">
          {{ t("global.createCompositionVue") }}
        </customButton>
      </div>
    </div>
    <div class="create-item">
      <customTooltip :content="t(`global.onChannel`) + `：molian_createVue`">
        <customButton theme="primary" size="small" @click="sendChannel">
          {{ t("global.sendToChannel") }}
        </customButton>
      </customTooltip>
    </div>
    <div class="create-item">
      <customButton theme="primary" size="small" @click="showImportDialog = true">
        {{ t("global.importData") }}
      </customButton>
    </div>
    <div class="create-item">
      <customButton theme="primary" size="small" @click="exportModelData">
        {{ t("global.exportData") }}
      </customButton>
    </div>
    <div class="create-item">
      <customButton theme="primary" size="small" @click="showTemplateDialog = true">
        {{ t("global.importTemplate") }}
      </customButton>
    </div>
  </div>
  <customDialog
    appendToBody
    :header="t('global.createSFC')"
    width="80%"
    top="5vh"
    :close-on-click-modal="false"
    @escKeydown="showDialog = false"
    @closeBtnClick="showDialog = false"
    v-model:visible="showDialog"
    destroyOnClose
    v-if="showDialog"
  >
    <div>
      <codeEditor :maxLines="50" v-model="codeData" :lang="langMode" />
    </div>
  </customDialog>

  <customDialog
    appendToBody
    :header="t('global.importData')"
    width="80%"
    top="5vh"
    :close-on-click-modal="false"
    @escKeydown="showImportDialog = false"
    @closeBtnClick="showImportDialog = false"
    v-model:visible="showImportDialog"
    destroyOnClose
    v-if="showImportDialog"
  >
    <div>
      <codeEditor :maxLines="50" v-model="codeData" lang="json" />
    </div>
    <template #footer>
      <customButton theme="default" @click="showImportDialog = false">{{
        t("options.cancel")
      }}</customButton>
      <customButton theme="primary" @click="importModelData">{{
        t("global.importData")
      }}</customButton>
    </template>
  </customDialog>

  <customDialog
    appendToBody
    :header="t('global.importTemplate')"
    width="1200px"
    top="5vh"
    :close-on-click-modal="false"
    @escKeydown="showTemplateDialog = false"
    @closeBtnClick="showTemplateDialog = false"
    v-model:visible="showTemplateDialog"
    destroyOnClose
    v-if="showTemplateDialog"
  >
    <codeEditor :maxLines="50" v-model="cacheImportTemplateData"></codeEditor>
    <template #footer>
      <customButton theme="default" @click="showTemplateDialog = false">{{
        t("options.cancel")
      }}</customButton>
      <customButton theme="primary" @click="importTemplate">{{
        t("global.importTemplate")
      }}</customButton>
    </template>
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
@/components/molian/utils/template-parser