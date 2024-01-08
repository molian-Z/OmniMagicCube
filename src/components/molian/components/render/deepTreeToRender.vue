<script setup lang="ts">
import { defineProps, reactive } from 'vue'
import { toKebabCase } from '@molian/utils/util'
const props = defineProps(<{
  modelValue: any
  variables?: any
  setRef: any
}>{
    modelValue: {
      type: Array,
      default: () => []
    },
    variables: {
      type: Object,
      default: () => { }
    },
    setRef: Function
  })


</script>
<template>
  <template v-for="(comp, index) in modelValue" :key="comp.key">
    <component :id="comp.id" :is="comp.name" :ref="(el: any) => setRef(el, comp)" :data-key="comp.key" v-bind="comp.attrs"
      :class="toKebabCase(comp.name + '__' + comp.key)">
      <template v-for="(slotVal, slotKey) in comp.slots" :key="slotKey" #[slotKey]="slotProps">
        <template v-if="slotVal && slotVal.children">
          <template v-if="JSON.stringify(slotProps) !== '{}'">
            <deepTree v-model="slotVal.children" :slotProp="slotProps"></deepTree>
          </template>
          <deepTree v-else v-model="slotVal.children"></deepTree>
        </template>
      </template>
    </component>
  </template>
</template>

<style scoped lang="scss"></style>