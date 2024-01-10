<script setup lang="ts">
import { ref, inject, defineExpose } from 'vue'
import { globalAttrs } from '../../designerData'
import subForm from '@molianComps/sub-form/index.vue'
import data2input from '@molianComps/data2input/index.vue'
const t:any = inject('mlLangs')
const customComps:any = inject('customComps')
const message:any = inject('ml-message')
const { customDialog, customButton } = customComps
const subFormColumns = ref([{
  prop: "name",
  label: t("options.variable"),
  type: "string",
  required: true
}, {
  prop: "label",
  label: t("options.label"),
  type: "string",
  default:null
}, {
  prop: "type",
  label: t("options.dataType"),
  type: "string",
  default:"string",
  required: true,
  optionItems: [{
    label: t("options.string"),
    value: "string"
  }, {
    label: t("options.number"),
    value: "number"
  }, {
    label: t("options.boolean"),
    value: "boolean"
  }, {
    label: t("options.array"),
    value: "array"
  }, {
    label: t("options.object"),
    value: "object"
  }, {
    label: t("options.function"),
    value: 'function'
  }, {
    label: t("options.computed"),
    value: "computed"
  }]
}, {
  prop: "value",
  label: t("options.modelValue"),
  default:null
}])
const visible = ref(false)
const subFormRef = ref()
const modelValue = ref<any[]>([])
defineExpose({
  show: function () {
    const variable:any[] = []
    Object.keys(globalAttrs.variable).forEach(key => {
      variable.push({
        name: key,
        label: globalAttrs.variable[key].label,
        type: globalAttrs.variable[key].type,
        value: globalAttrs.variable[key].value
      })
    })
    modelValue.value = variable
    visible.value = true
  }
})

const createVariable = function () {
  if(subFormRef.value.validate()){
    const obj:{
      [key:string]:{
        label:string,
        type:string,
        value:any
      }
    } = {}
    modelValue.value.forEach(item =>{
      obj[item.name] = {
        label: item.label,
        type: item.type,
        value: item.value
      }
    })
    globalAttrs.variable = obj
    visible.value = false
  }else{
    message.error(t('options.validateError'))
  }
}

const newProp = function (column: { prop: string; }, item: { type: any; }) {
  if (column.prop === 'value') {
    return {...column,type:item.type}
  }else{
    return column
  }
}

</script>
<template>
  <customDialog appendToBody :header="t('options.variable')" width="80%" :close-on-click-modal="false" @escKeydown="visible = false"
    @closeBtnClick="visible = false" v-model:visible="visible">
    <subForm ref="subFormRef" :columns="subFormColumns" v-model="modelValue">
      <template #item="{ column, item }">
        <data2input v-model="item[column.prop]" :propData="newProp(column, item)"></data2input>
      </template>
    </subForm>
    <template #footer>
      <customButton theme="default" @click="visible = false">{{ t('options.cancel') }}</customButton>
      <customButton theme="primary" @click="createVariable">{{ t('options.confirm') }}</customButton>
    </template>
  </customDialog>
</template>