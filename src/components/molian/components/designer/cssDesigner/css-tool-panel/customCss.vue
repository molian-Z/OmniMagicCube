<script setup lang="ts">
import { inject, computed } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { selectedComp } from '@molianComps/Designer/designerData'
import CodeEditor from '@molianComps/MlCodeEditor/index.vue'
const t:any = inject('mlLangs')
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
    <div :class="['designer-container', !selectedComp && 'disabled']">
        <div class="designer-container__body-title">{{ t('css.customCssObj.title') }}</div>
        <div class="designer-container__body" >
            <codeEditor ref="codeRef" mode="json" class="ml-code-editor" :modelValue="currentValue" @update:modelValue="setData" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.ml-code-editor{
    border-radius: var(--ml-radius-base);
    overflow: hidden;
}
</style>