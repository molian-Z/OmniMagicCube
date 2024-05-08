<script setup lang="ts">
import { inject, ref, computed } from 'vue'
import { selectedComp } from '@molianComps/designer/designerData'
import colorPicker from '@molianComps/color-picker/index.vue'
import svgIcon from '@molianComps/svg-icon/index.vue'
const customComps:any = inject('customComps')
const t:any = inject('mlLangs')
const { customInput, customSelect, customRadioButton, customRadioGroup } = customComps
const css = computed(() => {
    return selectedComp.value && selectedComp.value.css && selectedComp.value.css.border || []
})

const borderPosData = ref(['all', 'top', 'bottom', 'left', 'right'])
const borderStyleData = ref(['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset', 'none', 'hidden'])

const addBorder = function () {
    if (!selectedComp.value) return false
    css.value.push({
        color: '#000',
        width: '1',
        style: 'solid',
        type: 'all',
        isShow: true
    })
}

const updateBorder = function (props: { width: string; }, val: any) {
    if (!isNaN(Number(val))) {
        props.width = Number(val).toString()
    }
}

const deleteBorder = function (index: number) {
    if (!selectedComp.value) return false
    css.value.splice(index, 1)
}
</script>
<template>
    <div :class="['designer-container', !selectedComp && 'disabled']">
        <div class="designer-container__body-title">
            <span>{{ t('css.stroke') }}</span>
            <svg-icon class="css-svg-icon link-icon" icon="add" @click="addBorder"></svg-icon>
        </div>
        <div :class="['designer-container__body', index > 0 && 'designer-mg-top']" v-for="(border, index) in css"
            :key="index">
            <div class="designer-top-tool">
                <customRadioGroup size="small" variant="default-filled" :disabled="!selectedComp" v-model="border.type">
                    <customRadioButton :value="item" v-for="item in borderPosData" :key="item">
                        <svg-icon :icon="item === 'all' ? `border` : `border-${item}`"></svg-icon>
                    </customRadioButton>
                </customRadioGroup>
                <div style="display:flex;">
                    <svg-icon class="css-svg-icon link-icon" :icon="border.isShow ? 'ic_eye' : 'ic_eye_close'"
                    @click="border.isShow = !border.isShow" />
                <svg-icon class="css-svg-icon link-icon" icon="delete" @click="deleteBorder(index)"></svg-icon>
                </div>
                
            </div>
            <div class="designer-list-item">
                <colorPicker class="designer-input" size="small" use-type="pure" :disabled="!selectedComp"
                    v-model="border.color" />
            </div>
            <div class="designer-list-item">
                <customInput size="small" :disabled="!selectedComp" class="designer-input-base" :modelValue="border.width"
                    @update:modelValue="updateBorder(border, $event)">
                    <template #prefixIcon>
                        <svg-icon icon="ic_stroke"></svg-icon>
                    </template>
                    <template #suffix>
                        <span class="suffix-tag">px</span>
                    </template>
                </customInput>
                <customSelect size="small" :disabled="!selectedComp"
                    :options="borderStyleData.map(item => { return { label: t('css.borderObj.' + item), value: item } })"
                    class="designer-input-base" v-model="border.style" />
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">

:deep(.el-radio-button--small .el-radio-button__inner){
    padding: 5px 6px;
}

:deep(.ant-radio-group-small :where(.css-dev-only-do-not-override-185kyl0).ant-radio-button-wrapper){
    padding-inline: 5px;
}

:deep(.tiny-radio-button--mini .tiny-radio-button__inner){
    padding: 5px 8px;
}
</style>