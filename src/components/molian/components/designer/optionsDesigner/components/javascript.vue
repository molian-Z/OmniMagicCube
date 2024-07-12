<script setup lang="ts">
import { computed, defineOptions, inject } from 'vue';
import anyData2Form from '@molianComps/AnyData2Form/index.vue'
import { selectedComp, selectedOn, getEmits } from '@molianComps/Designer/designerData'

defineOptions({
  name: 'Javascript'
})
const comps:any = inject('mlComps')

const currentEmits = getEmits(comps)

defineExpose(selectedOn)

</script>
<template>
  <div class="basic-list">
    <template v-if="selectedComp">
      <template v-for="(item) in currentEmits" :key="item.key">
        <anyData2Form :selectedComp="selectedComp" v-model="selectedOn[item.key]" :propData="item" :keyName="item.key">
        </anyData2Form>
      </template>
    </template>
  </div>
</template>