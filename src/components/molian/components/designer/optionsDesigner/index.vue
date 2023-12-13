<script setup>
import { ref, inject } from 'vue'
import { optionsPanel, panelType, globalMenu } from '../designerData'
import floatPanel from '@molianComps/float-panel/index.vue'
import basicComp from './components/basic.vue'
import slotComp from './components/slot.vue'
import javascriptComp from './components/javascript.vue'
const t = inject('mlLangs')
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
}])

const closeFloatPanel = function () {
    globalMenu.value = ''
    panelType.value = ''
}
</script>
<template>
    <div class="options-designer">
        <float-panel class="float-panel" float="right" :list="menus" v-model="optionsPanel" @clickClose="closeFloatPanel" :foldWidth="365" :foldHeight="600"
            :isShow="panelType === 'option'">
            <template v-slot:default="{ activeData }">
                <basicComp v-if="activeData.name === 'basic'"></basicComp>
                <slotComp v-else-if="activeData.name === 'slot'"></slotComp>
                <javascriptComp v-else-if="activeData.name === 'javascript'" />
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