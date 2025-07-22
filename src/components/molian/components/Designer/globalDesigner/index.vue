<script setup lang="ts">
import { ref, inject } from 'vue'
import { globalPanel, globalMenu } from '../designerData'
import floatPanel from '@molianComps/FloatPanel/index.vue'
import create from './globalPanel/create.vue'
import device from './globalPanel/device.vue'
import {useI18n} from 'vue-i18n'
const {t} = useI18n()
const menus = ref([{
    icon: 'device',
    text: t('global.device'),
    name: 'device'
},{
    icon: 'create',
    text: t('global.create'),
    name: 'create'
}])

const closeFloatPanel = function () {
    globalMenu.value = ''
}
</script>
<template>
    <div class="global-designer">
        <float-panel float="right" :list="menus" v-model="globalPanel" @clickClose="closeFloatPanel" :foldHeight="500"
            :isShow="globalMenu === 'global'">
            <template v-slot:default="{ activeData }">
                <create v-if="activeData.name === 'create'" />
                <device v-else-if="activeData.name === 'device'"></device>
            </template>
        </float-panel>
    </div>
</template>
