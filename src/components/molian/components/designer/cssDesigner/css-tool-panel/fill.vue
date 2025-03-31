<script setup lang="ts">
import { computed } from 'vue'
import { selectedComp } from '@molianComps/Designer/designerData'
import colorPicker from '@molianComps/ColorPicker/index.vue';
import svgIcon from '@molianComps/SvgIcon/index.vue'
import {useI18n} from 'vue-i18n'
const {t} = useI18n()
const css = computed(() => {
    return selectedComp.value && selectedComp.value.css.background || {}
})
</script>
<template>
  <div class="css-panel">
    <div class="css-panel__header">
      <span class="css-panel__title">{{ t('css.fill') }}</span>
      <div class="css-panel__actions">
        <!-- 可能的操作按钮 -->
      </div>
    </div>
    <div class="css-panel__body">
      <div class="css-panel__row css-panel__row--between">
        <div class="css-panel__input-wrapper">
          <colorPicker use-type="pure" :disabled="!selectedComp" v-model="css.modelValue" />
        </div>
        <div class="css-panel__input-wrapper" style="flex: 0 0 auto;">
          <svg-icon 
            class="css-panel__icon-btn" 
            :icon="css.isShow ? 'ic_eye' : 'ic_eye_close'"
            @click="css.isShow = !css.isShow" 
          />
        </div>
      </div>
    </div>
  </div>
</template>