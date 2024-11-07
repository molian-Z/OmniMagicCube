<script setup lang="ts">
import { inject, ref, computed } from 'vue'
import { selectedComp } from '@molianComps/Designer/designerData'
import colorPicker from '@molianComps/ColorPicker/index.vue'
import svgIcon from '@molianComps/SvgIcon/index.vue'
import textComp from '@molianComps/Designer/optionsDesigner/tooltip/customDirectives.vue'
import {useI18n} from 'vue-i18n'
const {t} = useI18n()
const customComps:any = inject('customComps')
const { customInput, customSelect, customTooltip } = customComps

const fontFamily = ref(['微软雅黑', '宋体', '新宋体', '仿宋', '黑体', '楷体', '等线', 'SimSun-ExtB', 'Arial Nova', 'Arial', 'Corbel'])
document.fonts.forEach(item => {
    fontFamily.value.push(item.family)
})
const fontWeight = ref(['100', '200', '300', '400', '500', '600', '700', '800', '900', 'bold', 'bolder', 'lighter', 'normal'])
const fontSize = ref(['10', '12', '14', '16', '20', '22', '28', '36', '48', '60', '72'])

const css:any = computed(() => {
    return selectedComp.value && selectedComp.value.css || {color:{}}
})

const clickIcon = function (key: string | number, value: any) {
    if (!selectedComp.value) return false
    if (css.value[key] === value) {
        css.value[key] = ''
    } else {
        css.value[key] = value
    }
}
</script>

<template>
    <div :class="['designer-container', !selectedComp && 'disabled']">
        <div class="designer-container__body-title">{{ t('css.text') }}</div>
        <div class="designer-container__body">
            <customSelect size="small" style="width:100%;" :disabled="!selectedComp" v-model="css.fontFamily" :filterable="true"
                :placeholder="t('css.font')" :creatable="true"
                :options="fontFamily.map(item => { return { label: item, value: item } })" />
            <div class="designer-list-item">
                <customSelect class="designer-input-base" size="small" :disabled="!selectedComp" v-model="css.fontWeight"
                    :placeholder="t('css.fontWeight')" :filterable="true" :creatable="true"
                    :options="fontWeight.map(item => { return { label: item, value: item } })" />
                <customSelect class="designer-input-base" size="small" :disabled="!selectedComp" v-model="css.fontSize"
                    :placeholder="t('css.fontSize')" :filterable="true" :creatable="true"
                    :options="fontSize.map(item => { return { label: item, value: item } })" />
            </div>
            <div class="designer-list-item">
                <customInput class="designer-input-base" size="small" :disabled="!selectedComp" v-model="css.lineHeight"
                    placeholder="Auto">
                    <template #prefixIcon>
                        <customTooltip :content="t('css.lineHeight')">
                            <svg-icon icon="ic_line_height" />
                        </customTooltip>
                    </template>
                    <template #suffix>
                        <span class="suffix-tag">px</span>
                    </template>
                </customInput>
                <customInput class="designer-input-base" size="small" :disabled="!selectedComp" v-model="css.letterSpacing"
                    placeholder="0">
                    <template #prefixIcon>
                        <customTooltip :content="t('css.letterSpacing')">
                            <svg-icon icon="ic_letter_spacing" />
                        </customTooltip>
                    </template>
                    <template #suffix>
                        <span class="suffix-tag">%</span>
                    </template>
                </customInput>
            </div>
            <div class="designer-list-item">
                <customInput class="designer-input-bas" style="width:95px;" size="small" :disabled="!selectedComp"
                    v-model="css.paragraphSpacing" placeholder="Auto">
                    <template #prefixIcon>
                        <customTooltip :content="t('css.paragraphSpacing')">
                            <svg-icon icon="ic_paragraph_spacing" />
                        </customTooltip>
                    </template>
                    <template #suffix>
                        <span class="suffix-tag">px</span>
                    </template>
                </customInput>
                <div :class="['designer-btn-group', !selectedComp && 'disabledBtns']">
                    <customTooltip :content="t('css.lineThrough')">
                        <svg-icon :class="['css-svg-icon','f-icon', css.textDecoration === 'line-through' && 'is-active']"
                            icon="strikethrough" @click="clickIcon('textDecoration', 'line-through')" />
                    </customTooltip>
                    <customTooltip :content="t('css.underline')">
                        <svg-icon :class="['css-svg-icon','f-icon', css.textDecoration === 'underline' && 'is-active']"
                            icon="underline" @click="clickIcon('textDecoration', 'underline')" />
                    </customTooltip>
                    <customTooltip :content="t('css.italic')">
                        <svg-icon :class="['css-svg-icon','f-icon', css.fontStyle == 'italic' && 'is-active']" icon="italic"
                            @click="clickIcon('fontStyle', 'italic')" />
                    </customTooltip>
                    <customTooltip :content="t('css.ellipsis')">
                        <svg-icon :class="['css-svg-icon','f-icon', css.textOverflow === 'ellipsis' && 'is-active']" icon="ellipsis"
                            @click="clickIcon('textOverflow', 'ellipsis')" />
                    </customTooltip>
                </div>
            </div>
            <div :class="['designer-bottom-btn-group', !selectedComp && 'disabledBtns']">
                <customTooltip :content="t('css.textAlign.left')">
                    <div :class="['designer-bottom-icon no-mg', css.textAlign === 'left' && 'is-active']"
                        @click="clickIcon('textAlign', 'left')">
                        <svg-icon class="bottom-icon" icon="text-align-ic_left" />
                    </div>
                </customTooltip>
                <customTooltip :content="t('css.textAlign.center')">
                    <div :class="['designer-bottom-icon', css.textAlign === 'center' && 'is-active']"
                        @click="clickIcon('textAlign', 'center')">
                        <svg-icon class="bottom-icon" icon="text-align-ic_center" />
                    </div>
                </customTooltip>
                <customTooltip :content="t('css.textAlign.right')">
                    <div :class="['designer-bottom-icon', css.textAlign === 'right' && 'is-active']"
                        @click="clickIcon('textAlign', 'right')">
                        <svg-icon class="bottom-icon" icon="text-align-ic_right" />
                    </div>
                </customTooltip>
                <customTooltip :content="t('css.verticalAlign.top')">
                    <div :class="['designer-bottom-icon', css.verticalAlign === 'top' && 'is-active']"
                        @click="clickIcon('verticalAlign', 'top')">
                        <svg-icon class="bottom-icon" icon="text-align-ic_top" />
                    </div>
                </customTooltip>
                <customTooltip :content="t('css.verticalAlign.middle')">
                    <div :class="['designer-bottom-icon', css.verticalAlign === 'middle' && 'is-active']"
                        @click="clickIcon('verticalAlign', 'middle')">
                        <svg-icon class="bottom-icon" icon="text-align-ic_middle" />
                    </div>
                </customTooltip>
                <customTooltip :content="t('css.verticalAlign.bottom')">
                    <div :class="['designer-bottom-icon', css.verticalAlign === 'bottom' && 'is-active']"
                        @click="clickIcon('verticalAlign', 'bottom')">
                        <svg-icon class="bottom-icon" icon="text-align-ic_bottom" />
                    </div>
                </customTooltip>
            </div>
        </div>
        <div class="designer-mg-top">
            <div class="designer-container__body-title title-bottom">
                <span>{{ t('css.textColor') }}</span>
                <!-- <svg-icon class="title-icon" icon="add"></svg-icon> -->
            </div>
            <div class="designer-container__body">
                <div class="designer-list-item between">
                    <colorPicker size="small" use-type="pure" :disabled="!selectedComp" v-model="css.color.modelValue" />
                    <svg-icon class="css-svg-icon mg-left-base link-icon" :icon="css.color.isShow ? 'ic_eye' : 'ic_eye_close'"
                        @click="css.color.isShow = !css.color.isShow" />
                </div>
            </div>
        </div>
        <div class="designer-mg-top">
            <div class="designer-container__body">
                <textComp :title="t('css.textContent')" :methods="['string', 'function','variable']" name="text"></textComp>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.f-icon {
    width: 24px !important;
    height: 24px !important;
    font-size:24px;
    margin-left: var(--ml-mg-base) !important;
    padding: 0 !important;
}

.designer-bottom-btn-group {
    display: flex;
    margin-top: var(--ml-mg-lg);

    .designer-bottom-icon {
        padding: 5px;
        cursor: pointer;
        transition: var(--ml-transition-base);
        border-radius: var(--ml-radius-small);
        margin-left: var(--ml-mg-base);

        &:hover {
            background-color: var(--ml-fill-color-4);
        }

        &.is-active {
            background-color: var(--ml-fill-color-3);
        }

        &.no-mg {
            margin-left: 0;
        }

        .bottom-icon {
            width: 16px;
            height: 16px;
            margin: 0;
        }
    }
}

.disabledBtns {
    .designer-bottom-icon {
        background-color: var(--ml-bg-color);
        cursor: auto;

        &:hover {
            background-color: var(--ml-bg-color);
        }
    }
}
</style>