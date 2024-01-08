<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { cssPanel, selectedComp, globalMenu } from '../designerData'
import svgIcon from '@molianComps/svg-icon/index.vue'
import floatPanel from '@molianComps/float-panel/index.vue'
import effect from './css-tool-panel/effect.vue'
import fill from './css-tool-panel/fill.vue'
import font from './css-tool-panel/font.vue'
import stroke from './css-tool-panel/stroke.vue'
import transform from './css-tool-panel/transform.vue'
import margin from './css-tool-panel/margin.vue'
const customComps:any = inject('customComps')
const t:any = inject('mlLangs')
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
    icon: 'space',
    type: 'v'
}, {
    label: t('css.space.hbetween'),
    value: 'space-between',
    icon: 'space',
    type: 'h'
}])

const menus = ref([{
    icon: 'transform',
    text: t('css.transform'),
    name: 'transform'
}, {
    icon: 'margin',
    text: t('css.margins'),
    name: 'margin'
}, {
    icon: 'font',
    text: t('css.text'),
    name: 'font'
}, {
    icon: 'fill',
    text: t('css.fill'),
    name: 'fill'
}, {
    icon: 'stroke',
    text: t('css.stroke'),
    name: 'stroke'
}, {
    icon: 'effect',
    text: t('css.effect'),
    name: 'effect'
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
        } else {
            css.value.justifyContent = value
        }
    } else if (type === 'v') {
        if (css.value.alignItems === value) {
            css.value.alignItems = ''
        } else {
            css.value.alignItems = value
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
            :title="t('css.styleEdit')" :foldWidth="365" :isShow="globalMenu === 'style'">
            <template #toolbar>
                <customTooltip :content="item.label" v-for="item in toolbarData" :key="item.value">
                    <svg-icon
                        :class="['css-svg-icon', 'toolbar-icon', actived(item) && 'is-active', !selectedComp && 'disabled']"
                        :icon="`flex-${item.type}-${item.icon}`" @click="flexSwitch(item.type, item.value)" />
                </customTooltip>
                <!-- <svg-icon class="css-svg-icon" icon="flex-v-space" @click="flexSwitch('v','space-around')" />
                <svg-icon class="css-svg-icon" icon="flex-v-space" @click="flexSwitch('v','space-evenly')" />
                <svg-icon class="css-svg-icon" icon="flex-h-space" @click="flexSwitch('h','space-around')" />
                <svg-icon class="css-svg-icon" icon="flex-h-space" @click="flexSwitch('h','space-evenly')" /> -->
            </template>
            <template v-slot:default="{ activeData }">
                <transform v-if="activeData.name === 'transform'" />
                <margin v-else-if="activeData.name ==='margin'"></margin>
                <font v-else-if="activeData.name === 'font'" />
                <fill v-else-if="activeData.name === 'fill'" />
                <stroke v-else-if="activeData.name === 'stroke'" />
                <effect v-else-if="activeData.name === 'effect'" />
            </template>
        </float-panel>
    </div>
</template>