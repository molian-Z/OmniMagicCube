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
    <div class="designer-container">
        <div class="designer-container__body-title">{{t('css.fill')}}</div>
        <div class="designer-container__body">
            <div class="designer-list-item between">
                <colorPicker size="small" :disabled="!selectedComp" v-model="css.modelValue" />
                <svg-icon class="css-svg-icon mg-left-base link-icon" :icon="css.isShow ? 'ic_eye' : 'ic_eye_close'" @click.stop="css.isShow = !css.isShow" />
            </div>
        </div>
    </div>
</template>