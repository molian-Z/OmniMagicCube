<script setup lang="ts">
import { inject, computed } from 'vue'
import { selectedComp } from '@molianComps/Designer/designerData'
import colorPicker from '@molianComps/ColorPicker/index.vue';
import svgIcon from '@molianComps/SvgIcon/index.vue'
import {useI18n} from 'vue-i18n'
const {t} = useI18n()
const customComps:any = inject('customComps')
const { customInput, customSelect, customRadioButton, customRadioGroup } = customComps
const css = computed(() => {
    return selectedComp.value && selectedComp.value.css || { mixBlendMode: {}, blur:{},boxShadow:[] }
})
const mode = [['normal'], ['darken', 'multiply', 'color-burn'], ['lighten', 'screen', 'color-dodge'], ['overlay', 'soft-light', 'hard-light'], ['difference', 'exclusion'], ['hue', 'saturation', 'color', 'luminosity']]
const modeInfo = ['normal', 'darken', 'lighten', 'overlay', 'difference', 'color']
const mixBlendModeData = computed(() => {
    return mode.map((item, index) => {
        const children = item.map(cItem => {
            return { label: t('css.effectObj.' + cItem), value: cItem }
        })
        return {
            label:t('css.effectObj.modeInfo.' + modeInfo[index]),
            type: 'group',
            group: t('css.effectObj.modeInfo.' + modeInfo[index]),
            isGroup:true,
            children: children,
            options: children
        }
    })
})

const iconClick = function (prop: string | number) {
    css.value[prop].isShow = !css.value[prop].isShow
}

const iconClickVar = function(prop: { isShow: boolean; }){
    prop.isShow = !prop.isShow
}

const addShadow = function () {
    if (!selectedComp.value) return false
    css.value.boxShadow.push({
        h: '', // 水平偏移
        v: '', // 垂直偏移
        blur: '', // 模糊距离
        spread: '', // 扩展距离
        color: '', // 颜色
        type:'outset', // inset 内部阴影 / outset 外部阴影
        isShow:true
    })
}

const deleteShadow = function(index: any){
    if (!selectedComp.value) return false
    css.value.boxShadow.splice(index,1)
}

const updateModelValue = function (props: string | number,val: any) {
    if (!isNaN(Number(val)) && Number(val) <= 100 && Number(val) >= 0) {
        css.value[props] = Number(val).toString()
    }
}

const updateBlurValue = function(val: any){
    if (!isNaN(Number(val))) {
        css.value.blur.modelValue = Number(val).toString()
    }
}
</script>
<template>
    <div :class="['designer-container', !selectedComp && 'disabled']">
        <div class="designer-container__body-title">{{ t('css.effectObj.colorMixMode') }}</div>
        <div class="designer-container__body">
            <div class="designer-list-item between">
                <customSelect size="small" :options="mixBlendModeData" :placeholder="t('css.layer')" class="designer-input-lg" :disabled="!selectedComp" v-model="css.mixBlendMode.modelValue">
                    <template #prefixIcon>
                        <svg-icon icon="ic_layer_style"></svg-icon>
                    </template>
                </customSelect>
                <customInput size="small" placeholder="0-100" :disabled="!selectedComp" class="designer-input-small"
                    :modelValue="css.opacity" @update:modelValue="updateModelValue('opacity',$event)">
                    <template #suffix>
                        <span class="suffix-tag">%</span>
                    </template>
                </customInput>
                <svg-icon class="css-svg-icon link-icon" :icon="!!css.mixBlendMode.isShow ? 'ic_eye' : 'ic_eye_close'"
                    @click="iconClick('mixBlendMode')" />
            </div>
        </div>

        <div class="designer-container__body-title designer-mg-top">{{ t('css.effectObj.blur') }}</div>
        <div class="designer-container__body">
            <div class="designer-list-item between">
                <customRadioGroup size="small" variant="default-filled" :disabled="!selectedComp" v-model="css.blur.field">
                    <customRadioButton value="">
                        {{ t('css.effectObj.null') }}
                    </customRadioButton>
                    <customRadioButton value="backdropFilter">
                        {{ t('css.effectObj.backdropFilter') }}
                    </customRadioButton>
                    <customRadioButton value="filter">
                        {{ t('css.effectObj.filter') }}
                    </customRadioButton>
                </customRadioGroup>
                <customInput size="small" placeholder="" :disabled="!selectedComp" class="designer-input-mini"
                    :modelValue="css.blur.modelValue" @update:modelValue="updateBlurValue">
                    <template #suffix>
                        <span class="suffix-tag">px</span>
                    </template>
                </customInput>
                <svg-icon class="css-svg-icon link-icon" :icon="!!css.blur.isShow ? 'ic_eye' : 'ic_eye_close'"
                    @click="iconClick('blur')" />
            </div>
        </div>

        <div class="designer-container__body-title designer-mg-top">
            <span>{{ t('css.effectObj.shadow') }}</span>
            <svg-icon class="css-svg-icon link-icon" icon="add" @click="addShadow"></svg-icon>
        </div>
        <div :class="['designer-container__body', index > 0 && 'designer-mg-top']" v-for="(item, index) in css.boxShadow" :key="index">
            <div class="designer-list-item between">
                <colorPicker class="designer-input" size="small" use-type="pure" :disabled="!selectedComp" v-model="item.color" />
                <div style="display:flex;">
                    <svg-icon class="css-svg-icon link-icon" :icon="!!item.isShow ? 'ic_eye' : 'ic_eye_close'"
                    @click="iconClickVar(item)" />
                    <svg-icon class="css-svg-icon link-icon" icon="delete" @click="deleteShadow(index)"></svg-icon>
                </div>
            </div>
            <div class="designer-list-item">
                <customInput class="designer-input-base" size="small" :placeholder="t('css.hX')" v-model="item.h">
                    <template #prefixIcon>
                        <svg-icon icon="ic_const_left"></svg-icon>
                    </template>
                    <template #suffix>
                        <span class="suffix-tag">px</span>
                    </template>
                </customInput>
                <customInput class="designer-input-base" size="small" :placeholder="t('css.vY')" v-model="item.v">
                    <template #prefixIcon>
                        <svg-icon icon="ic_const_top"></svg-icon>
                    </template>
                    <template #suffix>
                        <span class="suffix-tag">px</span>
                    </template>
                </customInput>
            </div>
            <div class="designer-list-item">
                <customInput class="designer-input-base" size="small" :placeholder="t('css.blur')" v-model="item.blur">
                    <template #prefixIcon>
                        <svg-icon icon="mohu"></svg-icon>
                    </template>
                    <template #suffix>
                        <span class="suffix-tag">px</span>
                    </template>
                </customInput>
                <customInput class="designer-input-base" size="small" :placeholder="t('css.spread')" v-model="item.spread">
                    <template #prefixIcon>
                        <svg-icon icon="expand"></svg-icon>
                    </template>
                    <template #suffix>
                        <span class="suffix-tag">px</span>
                    </template>
                </customInput>
            </div>
            <div class="designer-list-item">
                <customRadioGroup size="small" variant="default-filled" :disabled="!selectedComp" v-model="item.type">
                    <customRadioButton value="inset">
                        {{ t('css.effectObj.inset') }}
                    </customRadioButton>
                    <customRadioButton value="outset">
                        {{ t('css.effectObj.outset') }}
                    </customRadioButton>
                </customRadioGroup>
            </div>
        </div>
    </div>
</template>