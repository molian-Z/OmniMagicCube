<script setup lang="ts">
import { computed, inject } from 'vue'
import { selectedComp } from '@molianComps/designer/designerData'
import colorPicker from '@molianComps/color-picker/index.vue';
import svgIcon from '@molianComps/svg-icon/index.vue'

const t:any = inject('mlLangs')
const css = computed(() => {
    return selectedComp.value && selectedComp.value.css.background || {}
})
</script>
<template>
    <div class="designer-container">
        <div class="designer-container__body-title">{{t('css.fill')}}</div>
        <div class="designer-container__body">
            <div class="designer-list-item between">
                <colorPicker size="small" :disabled="!selectedComp" v-model="css.modelValue" />
                <svg-icon class="css-svg-icon mg-left-base" :icon="css.isShow ? 'ic_eye' : 'ic_eye_close'" @click.native.stop="css.isShow = !css.isShow" />
            </div>
        </div>
    </div>
</template>