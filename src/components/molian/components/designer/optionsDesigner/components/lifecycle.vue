<script setup lang="ts">
import { defineOptions } from 'vue';
import anyData2Form from '@molianComps/AnyData2Form/index.vue'
import { globalAttrs, getLifecycle } from '@molianComps/Designer/designerData'

defineOptions({
  name: 'Lifecycle'
})

const { lifecycle } = globalAttrs

const currentLifecycle = getLifecycle()
</script>
<template>
  <div class="basic-list">
    <template v-for="item in currentLifecycle" :key="item.key">
      <anyData2Form v-model="lifecycle[item.key]" :propData="item" :keyName="item.key" :isModifiers="false" />
    </template>
  </div>
</template>