<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { cssPanel, selectedComp, globalMenu } from '../designerData'
import svgIcon from '@molianComps/SvgIcon/index.vue'
import floatPanel from '@molianComps/FloatPanel/index.vue'
import { setting } from '@molian/utils/defaultData'
import effect from './css-tool-panel/effect.vue'
import fill from './css-tool-panel/fill.vue'
import font from './css-tool-panel/font.vue'
import stroke from './css-tool-panel/stroke.vue'
import transform from './css-tool-panel/transform.vue'
import margin from './css-tool-panel/margin.vue'
import customCss from './css-tool-panel/customCss.vue'
import {useI18n} from 'vue-i18n'
const {t} = useI18n()
const customComps: any = inject('customComps')
const { customTooltip } = customComps
const toolbarData = ref([{
    label: t('css.textAlign.left'),
    value: 'flex-start',
    icon: 'left',
    type: 'h'
}, {
    label: t('css.textAlign.center'),
    value: 'center',
    icon: 'center',
    type: 'h'
}, {
    label: t('css.textAlign.right'),
    value: 'flex-end',
    icon: 'right',
    type: 'h'
}, {
    label: t('css.space.hbetween'),
    value: 'space-between',
    icon: 'space-between',
    type: 'h'
}, {
    label: t('css.space.haround'),
    value: 'space-around',
    icon: 'space-around',
    type: 'h'
}, {
    label: t('css.space.hevenly'),
    value: 'space-evenly',
    icon: 'space-evenly',
    type: 'h'
}, {
    label: t('css.verticalAlign.top'),
    value: 'flex-start',
    icon: 'top',
    type: 'v'
}, {
    label: t('css.verticalAlign.middle'),
    value: 'center',
    icon: 'center',
    type: 'v'
}, {
    label: t('css.verticalAlign.bottom'),
    value: 'flex-end',
    icon: 'bottom',
    type: 'v'
}, {
    label: t('css.space.vbetween'),
    value: 'space-between',
    icon: 'space-between',
    type: 'v'
}, {
    label: t('css.space.varound'),
    value: 'space-around',
    icon: 'space-around',
    type: 'v'
}, {
    label: t('css.space.vevenly'),
    value: 'space-evenly',
    icon: 'space-evenly',
    type: 'v'
}])

const menus = ref([{
    component: transform,
    icon: 'transform',
    text: t('css.transform'),
    name: 'transform'
}, {
    component: margin,
    icon: 'margin',
    text: t('css.margins'),
    name: 'margin'
}, {
    component: font,
    icon: 'font',
    text: t('css.text'),
    name: 'font'
}, {
    component: fill,
    icon: 'fill',
    text: t('css.fill'),
    name: 'fill'
}, {
    component: stroke,
    icon: 'stroke',
    text: t('css.stroke'),
    name: 'stroke'
}, {
    component: effect,
    icon: 'effect',
    text: t('css.effect'),
    name: 'effect'
}, {
    component: customCss,
    icon: 'customCss',
    text: 'CSS',
    name: 'customCss'
}])

const css = computed(() => {
    return selectedComp.value && selectedComp.value.css || {}
})

const closeFloatPanel = function () {
    globalMenu.value = ''
}

const flexSwitch = function (type: string, value: any) {
    if (!selectedComp.value) return false
    if (type === 'h') {
        if (css.value.justifyContent === value) {
            css.value.justifyContent = ''
            if (!css.value.alignItems) {
                delete css.value.display
            }
        } else {
            css.value.display = 'flex'
            css.value.justifyContent = value
        }
    } else if (type === 'v') {
        if (css.value.alignContent === value) {
            css.value.alignContent = ''
            if (!css.value.justifyContent) {
                delete css.value.display
            }
            delete css.value.flexWrap
        } else {
            css.value.display = 'flex'
            css.value.alignContent = value
            css.value.flexWrap = 'wrap'
        }
    }
}

const actived = function (item: { type: string; value: any }) {
    if (item.type === 'h') {
        return css.value.justifyContent === item.value
    } else if (item.type === 'v') {
        return css.value.alignItems === item.value
    }
}

</script>

<template>
    <div class="css-designer">
        <float-panel float="right" :list="menus" v-model="cssPanel" @clickClose="closeFloatPanel"
            :title="t('css.styleEdit')" :foldWidth="400" :isShow="globalMenu === 'style'" v-if="!!setting.immerseRightMode">
            <template #toolbar>
                <customTooltip :content="item.label" v-for="item in toolbarData" :key="item.value">
                    <svg-icon
                        :class="['css-svg-icon', 'toolbar-icon', actived(item) && 'is-active', !selectedComp && 'disabled']"
                        :icon="`flex-${item.type}-${item.icon}`" @click="flexSwitch(item.type, item.value)" />
                </customTooltip>
            </template>
            <template v-slot:default="{ activeData }">
                <template v-for="item in menus" :key="item.name">
                    <component :is="item.component" style="margin-top: var(--ml-mg-base);" v-if="activeData.name === item.name" />
                </template>
            </template>
        </float-panel>
        <div class="is-side-bar" v-else>
            <div class="designer-toolbar">
                <customTooltip :content="item.label" v-for="item in toolbarData" :key="item.value">
                    <svg-icon
                        :class="['css-svg-icon', 'toolbar-icon', actived(item) && 'is-active', !selectedComp && 'disabled']"
                        :icon="`flex-${item.type}-${item.icon}`" @click="flexSwitch(item.type, item.value)" />
                </customTooltip>
            </div>
            <div style="height:45px;"></div>
            <template v-for="item in menus" :key="item.value">
                <component :is="item.component" style="margin-top: var(--ml-mg-base);" />
            </template>
        </div>
    </div>
</template>

<style scoped>
:deep(.float-panel-content-detail__content){
    max-height: 511px;
}
</style>