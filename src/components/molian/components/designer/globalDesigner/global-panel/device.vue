<script setup lang="ts">
import { inject, computed } from 'vue'
import { deviceList } from '@molian/utils/device'
import { screenRatioInfo } from '@molianComps/Designer/designerData'
const customComps:any = inject('customComps')
const t:any = inject('mlLangs')
const { customInput, customRadioGroup, customRadioButton } = customComps

// 增加横屏竖屏转换功能
const categoryList = ref(deviceList.value.reduce((result: any, item) => {
  const key = item.deviceType;
  if (!result[key]) {
    result[key] = [];
  }
  result[key].push(item);
  return result;
}, {}))

const setValue = (val: any) => {
  screenRatioInfo.value = deviceList.value.find((item: any) => item.name === val)
}

</script>

<template>
  <div class="device-container">
    <div class="cate-group">
      <div class="cate-group-title">{{ t('global.deviceOrientation') }}</div>
    <customRadioGroup size="small" style="padding:var(--ml-pd-base) 0;" v-model="screenRatioInfo.rotate">
      <customRadioButton :label="false">{{ t('global.deviceOrientationLandscape') }}</customRadioButton>
      <customRadioButton :label="true">{{ t('global.deviceOrientationPortrait') }}</customRadioButton>
    </customRadioGroup>
    </div>
    <template v-for="(cateValue, cateKey) in categoryList" :key="cateKey">
      <div class="cate-group">
        <div class="cate-group-title">{{ t("global."+cateKey) }}</div>
        <div class="cate-group-list">
        <template v-for="device in cateValue" :key="device.name">
          <div :class="['cate-group-item', screenRatioInfo.name === device.name ? 'is-active' : '']"
            @click="setValue(device.name)">{{ device.resolutionRatio === 'custom' ?  t("global."+device.resolutionRatio) : device.resolutionRatio }}
          </div>
          <div class="customSize" v-if="device.name === 'custom'">
            <customInput size="small" v-model="device.width" /> X 
            <customInput size="small" v-model="device.height" />
          </div>
        </template>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.device-container {
  background-color: var(--ml-bg-color);
  padding: var(--ml-pd-base);
  border-radius: var(--ml-radius-base);

  .cate-group {
    padding: var(--ml-pd-small);
    .cate-group-title {
      font-weight: bold;
    }

    .cate-group-list {
      padding: var(--ml-pd-base) 0;
      display: flex;
      flex-wrap: wrap;

      .cate-group-item {
        border: 1px solid var(--ml-fill-color-3);
        padding: var(--ml-pd-small) var(--ml-pd-base);
        border-radius: var(--ml-radius-base);
        font-size: 12px;
        user-select: none;
        cursor: pointer;
        transition: var(--ml-transition-base);
        margin: var(--ml-mg-small);

        &:hover {
          border-color: var(--ml-primary-color);
        }

        &.is-active {
          background-color: var(--ml-primary-color);
          color: var(--ml-fill-color-3);
        }
      }
    }
  }

  .customSize{
    display: flex;
    align-items: center;
    >*{
      padding: var(--ml-pd-base);
    }
  }
}
</style>