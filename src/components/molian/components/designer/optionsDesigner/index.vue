<script setup lang="ts">
import { ref, inject, computed } from 'vue'
import { optionsPanel, globalMenu, selectedComp } from '../designerData'
import svgIcon from '@molianComps/svg-icon/index.vue'
import floatPanel from '@molianComps/float-panel/index.vue'
import basicComp from './components/basic.vue'
import slotComp from './components/slot.vue'
import nativeOnComp from './components/nativeOn.vue'
import javascriptComp from './components/javascript.vue'
import lifecycleComp from './components/lifecycle.vue'
import variable from './tooltip/variable.vue'
import vueif from './tooltip/if.vue'
import vuefor from './tooltip/for.vue'
import vueshow from './tooltip/show.vue'
const t: any = inject('mlLangs')
const customComps: any = inject('customComps')
const { customTooltip, customPopup } = customComps
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

const toolbarData = ref<{
    label: string;
    value: string;
    icon: string;
    show: boolean;
    type?:string;
}[]>([{
    label: t('options.for'),
    value: 'for',
    icon: 'for',
    show: false
}, {
    label: t('options.if'),
    value: 'if',
    icon: 'if',
    show: false
}, {
    label: t('options.show'),
    value: 'show',
    icon: 'show',
    show: false
}])

const varRef = ref()

const directives = computed(() => {
    return selectedComp.value && selectedComp.value.directives || {}
})

const closeFloatPanel = function () {
    globalMenu.value = ''
}

const actived = function (item: { label: string; value: string; icon: string; show: boolean; type?: string | undefined } | 'variable') {
    return !!directives.value[typeof item === 'string'? item : item.value]
}

const showFn = (type: any, value: any) => {
    console.log(type, value)
}

const openDialog = (type: string) => {
    if (type === 'variable') {
        varRef.value.show()
    }
}
</script>
<template>
    <div class="options-designer">
        <float-panel class="float-panel" float="right" :list="menus" v-model="optionsPanel" @clickClose="closeFloatPanel"
            :foldWidth="365" :foldHeight="600" :isShow="globalMenu === 'option'">
            <template #toolbar>
                <div style="height: 32px;align-items: center;display: flex;">
                    <customTooltip :content="item.label" v-for="item in toolbarData" :key="item.value">
                        <customPopup trigger="click" placement="bottom" :destroyOnClose="true" v-model:visible="item.show">
                            <svg-icon
                                :class="['css-svg-icon', 'toolbar-icon', actived(item) && 'is-active', !selectedComp && 'disabled']"
                                :icon="`option-${item.icon}`" @click="showFn(item.type, item.value)" />
                            <template #content>
                                <vueif @close="item.show = false" v-if="item.value === 'if'" />
                                <vuefor @close="item.show = false" v-else-if="item.value === 'for'" />
                                <vueshow @close="item.show = false" v-else-if="item.value === 'show'" />
                            </template>
                        </customPopup>
                    </customTooltip>
                </div>
                <customTooltip :content="t('options.variable')">
                    <svg-icon :class="['css-svg-icon', 'toolbar-icon', actived('variable') && 'is-active']"
                        icon="option-variable" @click="openDialog('variable')" />
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
        <variable ref="varRef" />
    </div>
</template>

<style scoped lang="scss">
.options-designer {
    .float-panel {
        height: 600px;
    }
}
</style>