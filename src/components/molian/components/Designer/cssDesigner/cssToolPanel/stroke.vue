<script setup lang="ts">
import { inject, ref, computed } from 'vue'
import { selectedComp, updateSelectedCompCss } from '@molianComps/Designer/designerData'
import colorPicker from '@molianComps/ColorPicker/index.vue'
import svgIcon from '@molianComps/SvgIcon/index.vue'
import {useI18n} from 'vue-i18n'
const {t} = useI18n()
const customComps:any = inject('customComps')
const { customInput, customSelect, customRadioButton, customRadioGroup } = customComps

const css = computed(() => {
    return selectedComp.value?.css?.border || []
})

const borderPosData = ref(['all', 'top', 'bottom', 'left', 'right'])
const borderStyleData = ref(['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset', 'none', 'hidden'])

const addBorder = function () {
    if (!selectedComp.value) return false
    const currentBorders = [...css.value]
    currentBorders.push({
        color: '#000',
        width: '1',
        style: 'solid',
        type: 'all',
        isShow: true
    })
    updateSelectedCompCss('border', currentBorders)
}

const updateBorder = function (index: number, prop: string, val: any) {
    if (!selectedComp.value) return false
    const currentBorders = [...css.value]
    if (prop === 'width' && !isNaN(Number(val))) {
        currentBorders[index][prop] = Number(val).toString()
    } else {
        currentBorders[index][prop] = val
    }
    updateSelectedCompCss('border', currentBorders)
}

const deleteBorder = function (index: number) {
    if (!selectedComp.value) return false
    const currentBorders = [...css.value]
    currentBorders.splice(index, 1)
    updateSelectedCompCss('border', currentBorders)
}
</script>

<template>
  <div class="css-panel">
    <div class="css-panel__header">
      <span class="css-panel__title">{{ t('css.stroke') }}</span>
      <div class="css-panel__actions">
        <svg-icon 
          class="css-panel__icon-btn" 
          icon="add" 
          @click="addBorder"
        />
      </div>
    </div>
    
    <div 
      v-for="(border, index) in css" 
      :key="index" 
      class="css-panel__body"
      :class="{'css-panel__body--divider': index > 0}"
    >
      <!-- 边框位置选择 -->
      <div class="css-panel__row css-panel__row--between">
        <div class="css-panel__radio-group">
          <customRadioGroup 
            size="small" 
            variant="default-filled" 
            :disabled="!selectedComp" 
            :modelValue="border.type"
            @update:modelValue="updateBorder(index, 'type', $event)"
          >
            <customRadioButton 
              v-for="item in borderPosData" 
              :key="item" 
              :value="item"
            >
              <svg-icon :icon="item === 'all' ? `border` : `border-${item}`"></svg-icon>
            </customRadioButton>
          </customRadioGroup>
        </div>
        <div class="css-panel__button-group">
          <svg-icon 
            class="css-panel__icon-btn" 
            :icon="border.isShow ? 'ic_eye' : 'ic_eye_close'"
            @click="updateBorder(index, 'isShow', !border.isShow)" 
          />
          <svg-icon 
            class="css-panel__icon-btn" 
            icon="delete" 
            @click="deleteBorder(index)"
          />
        </div>
      </div>
      
      <!-- 边框颜色 -->
      <div class="css-panel__row">
        <div class="css-panel__input-wrapper" style="width: 100%;">
          <colorPicker
            use-type="pure" 
            :disabled="!selectedComp"
            :modelValue="border.color"
            @update:modelValue="updateBorder(index, 'color', $event)" 
          />
        </div>
      </div>
      
      <!-- 边框宽度和样式 -->
      <div class="css-panel__row css-panel__row--between">
        <div class="css-panel__input-wrapper">
          <customInput
            :disabled="!selectedComp" 
            :modelValue="border.width"
            @update:modelValue="updateBorder(index, 'width', $event)"
          >
            <template #prefixIcon>
              <svg-icon icon="ic_stroke"></svg-icon>
            </template>
            <template #suffix>
              <span class="css-panel__suffix">px</span>
            </template>
          </customInput>
        </div>
        <div class="css-panel__input-wrapper">
          <customSelect
            :disabled="!selectedComp"
            :options="borderStyleData.map(item => { return { label: t('css.borderObj.' + item), value: item } })"
            :modelValue="border.style"
            @update:modelValue="updateBorder(index, 'style', $event)" 
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

:deep(.ant-radio-group-small :where(.css-dev-only-do-not-override-185kyl0).ant-radio-button-wrapper){
    padding-inline: 5px;
}

:deep(.tiny-radio-button--mini .tiny-radio-button__inner){
    padding: 5px 8px;
}
</style>