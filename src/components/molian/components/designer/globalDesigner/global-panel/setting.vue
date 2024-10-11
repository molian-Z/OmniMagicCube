<script lang="ts" setup>
import { inject } from 'vue'
import { setting } from '@molian/utils/defaultData'
import { deleteAll } from '@/components/molian/utils/indexedDB'
import { getCloudData } from '@molian/utils/getCloudData'
import {useI18n} from 'vue-i18n'
const {t} = useI18n()
const customComps: any = inject('customComps')
const { customSwitch, customButton } = customComps
const i18n = useI18n()
const syncCloudData = async () => {
    await deleteAll()
    getCloudData(i18n)
        .catch((err: any) => {
            console.log('cloudData is error', err)
        })
        .finally()
}
</script>

<template>
  <div class="setting-container">
    <div class="setting-item">
      <div>{{ t('global.setting.immerseLeftMode') }}</div>
      <customSwitch v-model="setting.immerseLeftMode"></customSwitch>
    </div>
    <div class="setting-item">
      <div>{{ t('global.setting.immerseRightMode') }}</div>
      <customSwitch v-model="setting.immerseRightMode"></customSwitch>
    </div>
    <div class="setting-item">
        <div>{{ t('global.setting.syncComponentData') }}</div>
      <customButton theme="primary" size="small" @click="syncCloudData">{{t('global.setting.sync')}}</customButton>
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