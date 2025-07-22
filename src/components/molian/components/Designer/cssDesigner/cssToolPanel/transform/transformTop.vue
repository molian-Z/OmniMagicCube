<script setup lang="ts">
import { ref, computed, inject, watch, onMounted } from 'vue'
import { selectedComp, updateSelectedCompCss } from '@molianComps/Designer/designerData'
import svgIcon from '@molianComps/SvgIcon/index.vue'
import SuffixUnit from '@molianComps/SuffixUnit/index.vue'
import {useI18n} from 'vue-i18n'
const {t} = useI18n()
const customComps: any = inject('customComps')
const { customInput, customTooltip } = customComps

const css = computed(() => {
    if(selectedComp.value){
        if(selectedComp.value.css && !selectedComp.value.css.units){
            selectedComp.value.css.units = {}
        }
        return selectedComp.value && selectedComp.value.css
    }
    return {
        borderRadius: ['0', '0', '0', '0'],
        units:{}
    }
})

const activeLink = ref(false)
const activeRadius = ref(false)

watch(selectedComp, (val) => {
    if (val && val.css && val.css.borderRadius) {
        let value: string | number = ''
        let btn = false
        if (Array.isArray(val.css.borderRadius)) {
            val.css.borderRadius?.forEach((item: string | number, index: number) => {
                if (index === 0) {
                    value = item
                }
                if (item !== value) {
                    btn = true
                }
            })
        }
        activeRadius.value = btn
    }
})

onMounted(() => {
    if (selectedComp.value && selectedComp.value.css && selectedComp.value.css.borderRadius) {
        let value: string | number = ''
        let btn = false
        if (Array.isArray(selectedComp.value.css.borderRadius)) {
            selectedComp.value.css.borderRadius.forEach((item: string | number, index: number) => {
                if (index === 0) {
                    value = item
                }
                if (item !== value) {
                    btn = true
                }
            })
        }
        activeRadius.value = btn
    }
})

const switchRadius = function () {
    if (css.value && Array.isArray(css.value.borderRadius)) {
        let val: any = css.value.borderRadius[0]
        css.value.borderRadius = [val, val, val, val]
        updateSelectedCompCss('borderRadius', [val, val, val, val]);
        activeRadius.value = !activeRadius.value
    }
}

const updateModelValue = function (prop: string, val: any) {
    if (!selectedComp.value) return;
    
    if(css.value && css.value.units && css.value.units[prop] && css.value.units[prop] === 'calc'){
        if (activeLink.value && ['width', 'height'].indexOf(prop) > -1) {
            updateSelectedCompCss('width', val);
            updateSelectedCompCss('height', val);
        } else if (prop === 'borderRadius'){
            // borderRadius的calc处理逻辑
        } else {
            updateSelectedCompCss(prop, val);
        }
        return false
    }
    if (css.value && !isNaN(Number(val)) && Number(val) >= 0) {
        let newVal = val === '' ? '' : Number(val).toString()
        if (activeLink.value && ['width', 'height'].indexOf(prop) > -1) {
            updateSelectedCompCss('width', newVal);
            updateSelectedCompCss('height', newVal);
        } else if (prop === 'borderRadius') {
            updateSelectedCompCss('borderRadius', [newVal, newVal, newVal, newVal]);
        } else {
            updateSelectedCompCss(prop, newVal);
        }
    } else if (css.value && /^(?:0|-|-?[1-9]\d*)$/.test(val)) {
        updateSelectedCompCss(prop, val);
    } else if (css.value && !isNaN(Number(val.value))) {
        if (activeRadius.value) {
            if (Array.isArray(css.value.borderRadius)) {
                const newBorderRadius = [...css.value.borderRadius];
                newBorderRadius[val.index] = Number(val.value).toString();
                updateSelectedCompCss('borderRadius', newBorderRadius);
            }
        }
    }
}
</script>
<template>
  <div class="css-panel">
    <div class="css-panel__header">
      <span class="css-panel__title">{{ t('css.transform') }}</span>
      <div class="css-panel__actions">
        <!-- 可能的操作按钮 -->
      </div>
    </div>
    <div class="css-panel__body">
      <!-- 位置控制 -->
      <div class="css-panel__row css-panel__row--between">
        <div class="css-panel__input-wrapper">
          <customInput 
            :modelValue="css.moveX" 
            @update:modelValue="updateModelValue('moveX', $event)"
            :disabled="!selectedComp" 
            placeholder="">
            <template #prefixIcon>
              <customTooltip :content="t('css.moveX')">
                <svg-icon icon="posX"></svg-icon>
              </customTooltip>
            </template>
            <template #suffix>
              <suffix-unit v-model="css.units.moveX" />
            </template>
          </customInput>
        </div>
        <div class="css-panel__input-wrapper">
          <customInput 
            :modelValue="css.moveY" 
            @update:modelValue="updateModelValue('moveY', $event)"
            :disabled="!selectedComp" 
            placeholder="">
            <template #prefixIcon>
              <customTooltip :content="t('css.moveY')">
                <svg-icon icon="posY"></svg-icon>
              </customTooltip>
            </template>
            <template #suffix>
              <suffix-unit v-model="css.units.moveY" />
            </template>
          </customInput>
        </div>
      </div>
      
      <!-- 尺寸控制 -->
      <div class="css-panel__row css-panel__row--between">
        <div class="css-panel__input-wrapper">
          <customInput 
            :modelValue="css.width" 
            @update:modelValue="updateModelValue('width', $event)"
            :disabled="!selectedComp" 
            placeholder="">
            <template #prefixIcon>
              <customTooltip :content="t('css.width')">
                <svg-icon icon="width"></svg-icon>
              </customTooltip>
            </template>
            <template #suffix>
              <suffix-unit v-model="css.units.width" />
            </template>
          </customInput>
        </div>
        <div class="css-panel__input-wrapper" style="flex: 0 0 auto;">
          <svg-icon 
            class="css-panel__icon-btn" 
            :class="{'css-panel__icon-btn--active': activeLink}" 
            icon="link" 
            @click="activeLink = !activeLink" 
          />
        </div>
        <div class="css-panel__input-wrapper">
          <customInput 
            :modelValue="css.height" 
            @update:modelValue="updateModelValue('height', $event)"
            :disabled="!selectedComp" 
            placeholder="">
            <template #prefixIcon>
              <customTooltip :content="t('css.height')">
                <svg-icon icon="height"></svg-icon>
              </customTooltip>
            </template>
            <template #suffix>
              <suffix-unit v-model="css.units.height" />
            </template>
          </customInput>
        </div>
      </div>
      
      <!-- 圆角控制 -->
      <div v-if="!activeRadius" class="css-panel__row">
        <div class="css-panel__input-wrapper">
          <customInput 
            :modelValue="Array.isArray(css.borderRadius) ? css.borderRadius[0] : css.borderRadius" 
            @update:modelValue="updateModelValue('borderRadius', $event)"
            :disabled="!selectedComp" 
            placeholder="">
            <template #prefixIcon>
              <customTooltip :content="t('css.borderRadius')">
                <svg-icon icon="ic_corner"></svg-icon>
              </customTooltip>
            </template>
            <template #suffix>
              <span class="css-panel__suffix">px</span>
            </template>
          </customInput>
        </div>
        <div class="css-panel__input-wrapper" style="flex: 0 0 auto;">
          <svg-icon 
            class="css-panel__icon-btn" 
            :class="{'css-panel__icon-btn--active': !activeRadius}" 
            icon="link" 
            @click="switchRadius" 
          />
        </div>
      </div>
      
      <!-- 多圆角设置 -->
      <template v-if="activeRadius">
        <div class="css-panel__row css-panel__row--between" style="position: relative; margin-bottom: 8px;">
          <div class="css-panel__input-wrapper">
            <customInput 
              :modelValue="Array.isArray(css.borderRadius) && css.borderRadius[0] || '0'"
              @update:modelValue="updateModelValue('borderRadius', { index: 0, value: $event })"
              :disabled="!selectedComp" 
              placeholder="">
              <template #prefixIcon>
                <svg-icon icon="ic_corner"></svg-icon>
              </template>
              <template #suffix>
                <span class="css-panel__suffix">px</span>
              </template>
            </customInput>
          </div>
          <div class="css-panel__input-wrapper">
            <customInput 
              :modelValue="Array.isArray(css.borderRadius) && css.borderRadius[1] || '0'"
              @update:modelValue="updateModelValue('borderRadius', { index: 1, value: $event })"
              :disabled="!selectedComp" 
              placeholder="">
              <template #prefixIcon>
                <svg-icon icon="ic_corner" style="transform: rotate(90deg);"></svg-icon>
              </template>
              <template #suffix>
                <span class="css-panel__suffix">px</span>
              </template>
            </customInput>
          </div>
        </div>
        
        <div class="css-panel__row css-panel__row--between" style="position: relative;">
          <div class="css-panel__input-wrapper">
            <customInput 
              :modelValue="Array.isArray(css.borderRadius) && css.borderRadius[3] || '0'"
              @update:modelValue="updateModelValue('borderRadius', { index: 3, value: $event })"
              :disabled="!selectedComp" 
              placeholder="">
              <template #prefixIcon>
                <svg-icon icon="ic_corner" style="transform: rotate(270deg);"></svg-icon>
              </template>
              <template #suffix>
                <span class="css-panel__suffix">px</span>
              </template>
            </customInput>
          </div>
          <div class="css-panel__input-wrapper">
            <customInput 
              :modelValue="Array.isArray(css.borderRadius) && css.borderRadius[2] || '0'"
              @update:modelValue="updateModelValue('borderRadius', { index: 2, value: $event })"
              :disabled="!selectedComp" 
              placeholder="">
              <template #prefixIcon>
                <svg-icon icon="ic_corner" style="transform: rotate(180deg);"></svg-icon>
              </template>
              <template #suffix>
                <span class="css-panel__suffix">px</span>
              </template>
            </customInput>
          </div>
          
          <div class="css-panel__radius-link-container">
            <svg-icon 
              class="css-panel__icon-btn css-panel__radius-link-icon" 
              :class="{'css-panel__icon-btn--active': !activeRadius}" 
              icon="link" 
              @click="switchRadius" 
            />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>