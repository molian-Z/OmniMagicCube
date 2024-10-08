<script setup lang="ts">
import { ref, inject, computed } from 'vue'
import { optionsPanel, globalMenu, selectedComp, currentEmits } from '../designerData'
import { setting } from '@molian/utils/defaultData'
import svgIcon from '@molianComps/SvgIcon/index.vue'
import floatPanel from '@molianComps/FloatPanel/index.vue'
import basicComp from './pages/basic.vue'
import propComp from './pages/prop.vue'
import slotComp from './pages/slot.vue'
import nativeOnComp from './pages/nativeOn.vue'
import javascriptComp from './pages/javascript.vue'
import lifecycleComp from './pages/lifecycle.vue'
import variable from './tooltip/variable.vue'
import vueif from './tooltip/if.vue'
import vuefor from './tooltip/for.vue'
import vueshow from './tooltip/show.vue'
import vuetext from './tooltip/text.vue'
import {useI18n} from 'vue-i18n'
const {t} = useI18n()
const customComps: any = inject('customComps')
const { customTooltip, customPopup } = customComps
const menus = ref([{
    icon: 'basic',
    text: t('options.basic'),
    name: 'basic'
}, {
    icon: 'properties',
    text: t('options.properties'),
    name: 'prop'
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
    type?: string;
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
}, {
    label: t('options.text'),
    value: 'text',
    icon: 'text',
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
    return !!directives.value[typeof item === 'string' ? item : item.value]
}

const showFn = (type: any, value: any) => {
    // console.log(type, value)
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
            :foldWidth="365" :foldHeight="600" :isShow="globalMenu === 'option'" v-if="!!setting.immerseRightMode">
            <template #toolbar>
                <div>
                    <template v-for="item in toolbarData" :key="item.value">
                        <customPopup trigger="click" placement="bottom" :destroyOnClose="true" :disabled="!selectedComp"
                            :visible="item.show && !!selectedComp"
                            @update:visible="($event: boolean) => { item.show = $event }">
                            <svg-icon
                                :class="['css-svg-icon', 'toolbar-icon', actived(item) && 'is-active', !selectedComp && 'disabled']"
                                :icon="`option-${item.icon}`" @click="showFn(item.type, item.value)" />
                            <template #content>
                                <vueif :title="item.label" @close="item.show = false" v-if="item.value === 'if'" />
                                <vuefor :title="item.label" @close="item.show = false" v-else-if="item.value === 'for'" />
                                <vueshow :title="item.label" @close="item.show = false" v-else-if="item.value === 'show'" />
                                <vuetext :title="item.label" @close="item.show = false" v-else-if="item.value === 'text'" />
                            </template>
                        </customPopup>
                    </template>
                </div>
                <customTooltip :content="t('options.variable')">
                    <svg-icon :class="['css-svg-icon', 'toolbar-icon', actived('variable') && 'is-active']"
                        icon="option-variable" @click="openDialog('variable')" />
                </customTooltip>
            </template>
            <template v-slot:default="{ activeData }">
                <basicComp v-if="activeData.name === 'basic'" />
                <propComp v-else-if="activeData.name === 'prop'" />
                <slotComp v-else-if="activeData.name === 'slot'" />
                <javascriptComp v-else-if="activeData.name === 'javascript'" />
                <nativeOnComp v-else-if="activeData.name === 'nativeOn'" />
                <lifecycleComp v-else-if="activeData.name === 'lifecycle'" />
            </template>
        </float-panel>
        <div class="is-side-bar" v-else>
            <div class="designer-toolbar">
                <div>
                    <template v-for="item in toolbarData" :key="item.value">
                        <customPopup trigger="click" placement="bottom" :destroyOnClose="true" :disabled="!selectedComp"
                            :visible="item.show && !!selectedComp"
                            @update:visible="($event: boolean) => { item.show = $event }">
                            <svg-icon
                                :class="['css-svg-icon', 'toolbar-icon', actived(item) && 'is-active', !selectedComp && 'disabled']"
                                :icon="`option-${item.icon}`" @click="showFn(item.type, item.value)" />
                            <template #content>
                                <vueif :title="item.label" @close="item.show = false" v-if="item.value === 'if'" />
                                <vuefor :title="item.label" @close="item.show = false" v-else-if="item.value === 'for'" />
                                <vueshow :title="item.label" @close="item.show = false" v-else-if="item.value === 'show'" />
                                <vuetext :title="item.label" @close="item.show = false" v-else-if="item.value === 'text'" />
                            </template>
                        </customPopup>
                    </template>
                </div>
                <customTooltip :content="t('options.variable')">
                    <svg-icon :class="['css-svg-icon', 'toolbar-icon', actived('variable') && 'is-active']"
                        icon="option-variable" @click="openDialog('variable')" />
                </customTooltip>
            </div>
            <div class="comp-content">
                <div class="designer-container__body-title">{{t('options.basic')}}</div>
                <basicComp class="comp-content" />
            </div>
            <div class="comp-content">
                <div class="designer-container__body-title">{{t('options.properties')}}</div>
                <propComp class="comp-content" />
            </div>
            <div class="comp-content">
                <div class="designer-container__body-title">{{t('options.slot')}}</div>
                <slotComp class="comp-content" />
            </div>
            <div class="comp-content" v-if="currentEmits.length > 0">
                <div class="designer-container__body-title">{{t('options.js')}}</div>
                <javascriptComp class="comp-content" />
            </div>
            <div class="comp-content" v-if="!!selectedComp">
                <div class="designer-container__body-title">{{ t('options.nativeOn') }}</div>
                <nativeOnComp class="comp-content" />
            </div>
            <div class="comp-content">
                <div class="designer-container__body-title">{{ t('options.lifecycle') }}</div>
                <lifecycleComp class="comp-content" />
            </div>
        </div>
        <variable ref="varRef" />
    </div>
</template>

<style scoped lang="scss">
.options-designer {
    .float-panel {
        height: 600px;
    }
}

.comp-content {
    background-color: var(--ml-bg-color);
    margin-bottom: var(--ml-mg-base);

    .comp-content {
        padding: 0 var(--ml-pd-lg);
    }
}

:deep(.css-svg-icon){
    margin: 0 var(--ml-mg-small) !important;
}
</style>