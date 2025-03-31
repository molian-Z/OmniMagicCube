<script setup lang="ts">
import { inject, computed, ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { selectedComp } from '@molianComps/Designer/designerData'
import CodeEditor from '@molianComps/MlCodeEditor/index.vue'
import {useI18n} from 'vue-i18n'
const {t} = useI18n()
const codeRef = ref<any>()
const css = ref<any>({customCss: {}})
watch(() => selectedComp.value, (newVal:any) => {
    if(newVal) {
        css.value = newVal.css
    }else{
        css.value = { customCss: {}}
    }
    if(!!codeRef.value){
        codeRef.value.setValue(JSON.stringify(css.value.customCss))
    }
},{
    immediate:true
})

const currentValue = computed(() => {
    try {
        return JSON.stringify(css.value.customCss)
    } catch (error) {
        return `{}`
    }
})

const debouncedFn = useDebounceFn((val) => {
    if(selectedComp.value && selectedComp.value.css) {
        if(!selectedComp.value.css.customCss) {
            selectedComp.value.css.customCss = ``
        }
        try {
            selectedComp.value.css.customCss = JSON.parse(val)
        } catch (error) {
            
        }
    }
}, 500)

const setData = (val: any) => {
    debouncedFn(val)
}
</script>

<template>
  <div class="css-panel">
    <div class="css-panel__header">
      <span class="css-panel__title">{{ t('css.customCssObj.title') }}</span>
      <div class="css-panel__actions">
        <!-- 可能的操作按钮 -->
      </div>
    </div>
    <div class="css-panel__body">
      <div class="css-panel__row">
        <div class="css-panel__code-wrapper">
          <codeEditor 
            ref="codeRef" 
            mode="json" 
            class="css-panel__code-editor" 
            :modelValue="currentValue" 
            @update:modelValue="setData" 
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.css-panel {
  &__code-wrapper {
    width: 100%;
    height: 200px;
  }
  
  &__code-editor {
    width: 100%;
    height: 100%;
    border-radius: var(--ml-radius-base);
    overflow: hidden;
    border: 1px solid var(--ml-border-color);
  }
}
</style>