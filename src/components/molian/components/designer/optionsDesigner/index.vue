<script setup>
import { ref, inject, computed } from 'vue'
import { optionsPanel, globalMenu, selectedComp, globalAttrs } from '../designerData'
import svgIcon from '@molianComps/svg-icon/index.vue'
import floatPanel from '@molianComps/float-panel/index.vue'
import basicComp from './components/basic.vue'
import slotComp from './components/slot.vue'
import nativeOnComp from './components/nativeOn.vue'
import javascriptComp from './components/javascript.vue'
import lifecycleComp from './components/lifecycle.vue'
import variable from './tooltip/variable.vue'
const t = inject('mlLangs')
const customComps = inject('customComps')
const { customTooltip } = customComps
const menus = ref([{
    icon: 'basic',
    text: t('options.basic'),
    name: 'basic'
}, {
    icon: 'insert',
    text: t('options.slot'),
    name: 'slot'
}, {
    icon: 'js',
    text: t('options.js'),
    name: 'javascript'
}, {
    icon: 'nativeOn',
    text: t('options.nativeOn'),
    name: 'nativeOn'
}, {
    icon: 'lifecycle',
    text: t('options.lifecycle'),
    name: 'lifecycle'
}])

const toolbarData = ref([{
    label: t('options.for'),
    value: 'for',
    icon: 'for'
}, {
    label: t('options.if'),
    value: 'if',
    icon: 'if'
}, {
    label: t('options.show'),
    value: 'show',
    icon: 'show'
}])

const directives = computed(() => {
    return selectedComp.value && selectedComp.value.directives || {}
})

const closeFloatPanel = function () {
    globalMenu.value = ''
}

const actived = function (item) {
    return false
    // if (item.type === 'h') {
    //     return css.value.justifyContent === item.value
    // } else if (item.type === 'v') {
    //     return css.value.alignItems === item.value
    // }
}

const showFn = () => {
    
}
</script>
<template>
    <div class="options-designer">
        <float-panel class="float-panel" float="right" :list="menus" v-model="optionsPanel" @clickClose="closeFloatPanel"
            :foldWidth="365" :foldHeight="600" :isShow="globalMenu === 'option'">
            <template #toolbar>
                <div style="height: 32px;align-items: center;display: flex;">
                    <customTooltip :content="item.label" v-for="item in toolbarData" :key="item.value">
                        <svg-icon
                            :class="['css-svg-icon', 'toolbar-icon', actived(item) && 'is-active', !selectedComp && 'disabled']"
                            :icon="`option-${item.icon}`" @click="showFn(item.type, item.value)" />
                    </customTooltip>
                </div>
                <customTooltip :content="t('options.variable')">
                    <svg-icon
                        :class="['css-svg-icon', 'toolbar-icon', actived('variable') && 'is-active']"
                        icon="option-variable" @click="openVariable" />
                </customTooltip>
            </template>
            <template v-slot:default="{ activeData }">
                <basicComp v-if="activeData.name === 'basic'" />
                <slotComp v-else-if="activeData.name === 'slot'" />
                <javascriptComp v-else-if="activeData.name === 'javascript'" />
                <nativeOnComp v-else-if="activeData.name === 'nativeOn'" />
                <lifecycleComp v-else-if="activeData.name === 'lifecycle'" />
            </template>
        </float-panel>
    </div>
</template>

<style scoped lang="scss">
.options-designer {
    .float-panel {
        height: 600px;
    }
}
</style>