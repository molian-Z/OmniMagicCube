<script lang="ts" setup>
import { defineOptions } from "vue";
import { currentEmits, currentNativeOn, currentLifecycle, globalAttrs, generateRandomString } from "@molianComps/Designer/designerData";
import ActionDetail from "./ActionDetail.vue";
import {useI18n} from 'vue-i18n'
const {t} = useI18n()
defineOptions({
  name: "ActionList",
});
const actionFlowData = computed(() => {
  return {
    lifecycle: currentLifecycle,
    emits: currentEmits,
    nativeOn: currentNativeOn,
  };
});
const groupData = ref([
  {
    label: t('actions.add'),
    value: "add",
    icon: "mdi:file-plus-outline",
  },
  {
    label: t('actions.import'),
    value: "import",
    icon: "mdi:import",
    disabled: true
  },
  {
    label: t('actions.export'),
    value: "export",
    icon: "mdi:export",
    disabled: true
  },
]);

const deleteItem = ({item, index}:any) => {
    globalAttrs.actions.splice(index, 1)
}

const buttonClick = ({item, index} : any) => {
    if(item.value === 'add'){
        if(!globalAttrs.actions || !Array.isArray(globalAttrs.actions)){
            globalAttrs.actions = []
        }
        globalAttrs.actions.push({
            key:generateRandomString(3, 'index_'),
            index:globalAttrs.actions.length,
            title:'NewAction_'+index,
            tags:[],
            desc:'',
            on: [],
            verify:[],
            run:[],
        })
    }
}
</script>

<template>
  <div class="action-container">
    <list-card :list="globalAttrs.actions" @delete="deleteItem">
        <template #popItem="{item, index}">
            <ActionDetail v-model="globalAttrs.actions[index]" :index="index"></ActionDetail>
        </template>
    </list-card>
    <div class="action-container-buttons">
        <button-group :list="groupData" @itemClick="buttonClick"></button-group>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.action-container {
  padding: var(--ml-pd-lg);
  &-buttons{
    padding: var(--ml-pd-lg);
  }
}
</style>
