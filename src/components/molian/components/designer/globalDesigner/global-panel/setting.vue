<script lang="ts" setup>
import { ref, inject } from 'vue'
import { setting } from '@molian/utils/defaultData'
const customComps: any = inject('customComps')
const { customSwitch } = customComps
const t: any = inject('mlLangs')
</script>

<template>
  <div class="setting-container">
    <div class="setting-item">
      <div>{{ t('global.setting.immerseMode') }}</div>
      <customSwitch v-model="setting.immerseMode"></customSwitch>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .setting-container{
    .setting-item{
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }
</style>