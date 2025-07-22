<script setup lang="ts">
import { defineOptions, inject } from 'vue';
import anyData2Form from '@molianComps/AnyData2Form/index.vue'
import { selectedComp, selectedOn, currentEmits } from '@molianComps/Designer/designerData'

defineOptions({
  name: 'Javascript'
})
const comps: any = inject("mlComps")
const isRemoveAttr = (keyName: any) => {
    if(!!selectedComp.value && comps.value[selectedComp.value.name].props[keyName]){
        return !!comps.value[selectedComp.value.name].props[keyName].removeAttr
    }
}

defineExpose(selectedOn)

</script>
<template>
  <div class="basic-list">
    <template v-if="selectedComp">
      <template v-for="item in currentEmits" :key="item.key">
        <anyData2Form :selectedComp="selectedComp" v-model="selectedOn[item.key]" :propData="item" :keyName="item.key" v-if="!isRemoveAttr(item.key)">
        </anyData2Form>
      </template>
    </template>
  </div>
</template>