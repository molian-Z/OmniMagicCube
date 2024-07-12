<script setup lang="ts">
import { ref, computed, inject, watch } from 'vue'
import { selectedComp } from '@molianComps/Designer/designerData'
import svgIcon from '@molianComps/SvgIcon/index.vue'
const customComps: any = inject('customComps')
const t: any = inject('mlLangs')
const { customInput, customTooltip } = customComps

const css = computed(() => {
  return selectedComp.value && selectedComp.value.css || {
    margin: ['0', '0', '0', '0'],
    padding: ['0', '0', '0', '0']
  }
})

const activeMargin = ref(false)
const activePadding = ref(false)

watch(selectedComp, (val: any) => {
  if (val) {
    ['margin', 'padding'].forEach((item) => {
      if (val.css[item]) {
        let value = ''
        let btn = true
        val.css[item].forEach((fitem: string, index: number) => {
          if (index === 0) {
            value = fitem
          }
          if (fitem != value || fitem == '0') {
            btn = false
          }
        })
        if (item === 'margin') {
          activeMargin.value = btn
        } else if (item === 'padding') {
          activePadding.value = btn
        }
      }
    })
  }
})

const changeMarign = function (type: string) {
  let val = css.value[type][0]
  css.value[type] = [val, val, val, val]
  if (type === 'margin') {
    activeMargin.value = !activeMargin.value
  } else if (type === 'padding') {
    activePadding.value = !activePadding.value
  }
}

const updateModelValue = function (prop: string, obj: { value: any; index: string | number; }) {
  if (css.value && !isNaN(Number(obj.value))) {
    let newVal = Number(obj.value).toString()
    if (prop === 'margin' && activeMargin.value || prop === 'padding' && activePadding.value) {
      css.value[prop] = [newVal, newVal, newVal, newVal]
    } else {
      css.value[prop][obj.index] = Number(obj.value).toString()
    }
  }
}
</script>
<template>
  <div :class="['designer-container', !selectedComp && 'disabled']">
    <div class="designer-container__body-title">
      <span>{{ t('css.margin.margin') }}</span>
    </div>
    <div class="designer-container__body">
      <div class="designer-list-item">
        <customInput class="designer-input-base" size="small" :modelValue="Array.isArray(css.margin) && css.margin[0]"
          @update:modelValue="updateModelValue('margin', { index: 0, value: $event })" :disabled="!selectedComp"
          placeholder="">
          <template #prefixIcon>
            <customTooltip :content="t('css.margin.top')">
              <svg-icon icon="margin-top"></svg-icon>
            </customTooltip>
          </template>
          <template #suffix>
            <span class="suffix-tag">px</span>
          </template>
        </customInput>
        <customInput class="designer-input-base" size="small" :modelValue="Array.isArray(css.margin) && css.margin[2]"
          @update:modelValue="updateModelValue('margin', { index: 2, value: $event })" :disabled="!selectedComp"
          placeholder="">
          <template #prefixIcon>
            <customTooltip :content="t('css.margin.bottom')">
              <svg-icon icon="margin-bottom"></svg-icon>
            </customTooltip>
          </template>
          <template #suffix>
            <span class="suffix-tag">px</span>
          </template>
        </customInput>
        <div :class="['link-icon', activeMargin && 'is-active']" @click="changeMarign('margin')">
          <customTooltip :content="t('css.link')">
            <svg-icon class="svg" icon="link" />
          </customTooltip>
        </div>
      </div>
      <div class="designer-list-item">
        <customInput class="designer-input-base" size="small" :modelValue="Array.isArray(css.margin) && css.margin[3]"
          @update:modelValue="updateModelValue('margin', { index: 3, value: $event })" :disabled="!selectedComp"
          placeholder="">
          <template #prefixIcon>
            <customTooltip :content="t('css.margin.left')">
              <svg-icon icon="margin-left"></svg-icon>
            </customTooltip>
          </template>
          <template #suffix>
            <span class="suffix-tag">px</span>
          </template>
        </customInput>
        <customInput class="designer-input-base" size="small" :modelValue="Array.isArray(css.margin) && css.margin[1]"
          @update:modelValue="updateModelValue('margin', { index: 1, value: $event })" :disabled="!selectedComp"
          placeholder="">
          <template #prefixIcon>
            <customTooltip :content="t('css.margin.right')">
              <svg-icon icon="margin-right"></svg-icon>
            </customTooltip>
          </template>
          <template #suffix>
            <span class="suffix-tag">px</span>
          </template>
        </customInput>
      </div>
    </div>

    <div class="designer-container__body-title designer-mg-top">
      <span>{{ t('css.padding.padding') }}</span>
    </div>
    <div class="designer-container__body">
      <div class="designer-list-item">
        <customInput class="designer-input-base" size="small" :modelValue="Array.isArray(css.padding) && css.padding[0]"
          @update:modelValue="updateModelValue('padding', { index: 0, value: $event })" :disabled="!selectedComp"
          placeholder="">
          <template #prefixIcon>
            <customTooltip :content="t('css.padding.top')">
              <svg-icon icon="padding-top"></svg-icon>
            </customTooltip>
          </template>
          <template #suffix>
            <span class="suffix-tag">px</span>
          </template>
        </customInput>
        <customInput class="designer-input-base" size="small" :modelValue="Array.isArray(css.padding) && css.padding[2]"
          @update:modelValue="updateModelValue('padding', { index: 2, value: $event })" :disabled="!selectedComp"
          placeholder="">
          <template #prefixIcon>
            <customTooltip :content="t('css.padding.bottom')">
              <svg-icon icon="padding-bottom"></svg-icon>
            </customTooltip>
          </template>
          <template #suffix>
            <span class="suffix-tag">px</span>
          </template>
        </customInput>
        <div :class="['link-icon', activePadding && 'is-active']" @click="changeMarign('padding')">
          <customTooltip :content="t('css.link')">
          <svg-icon class="svg" icon="link" />
          </customTooltip>
        </div>
      </div>
      <div class="designer-list-item">
        <customInput class="designer-input-base" size="small" :modelValue="Array.isArray(css.padding) && css.padding[3]"
          @update:modelValue="updateModelValue('padding', { index: 3, value: $event })" :disabled="!selectedComp"
          placeholder="">
          <template #prefixIcon>
            <customTooltip :content="t('css.padding.left')">
              <svg-icon icon="padding-left"></svg-icon>
            </customTooltip>
          </template>
          <template #suffix>
            <span class="suffix-tag">px</span>
          </template>
        </customInput>
        <customInput class="designer-input-base" size="small" :modelValue="Array.isArray(css.padding) && css.padding[1]"
          @update:modelValue="updateModelValue('padding', { index: 1, value: $event })" :disabled="!selectedComp"
          placeholder="">
          <template #prefixIcon>
            <customTooltip :content="t('css.padding.right')">
              <svg-icon icon="padding-right"></svg-icon>
            </customTooltip>
          </template>
          <template #suffix>
            <span class="suffix-tag">px</span>
          </template>
        </customInput>
      </div>
    </div>
  </div>
</template>


<style scoped lang="scss">
.between {
  .designer-input-base {
    width: calc(50% - 15px);
  }
}

.designer-list-item {
  align-items: center;
}

.link-icon {
  cursor: pointer;
  transition: var(--ml-transition-base);
  padding: 5px 0;
  border-radius: var(--ml-radius-small);
  margin-left: var(--ml-mg-small);

  &:hover {
    background-color: var(--ml-bg-page-color);
  }

  &.is-active {
    background-color: var(--ml-fill-color-4);
  }
}
</style>