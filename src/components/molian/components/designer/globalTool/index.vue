<script setup>
import { ref, inject } from 'vue'
import stickyTool from '@molianComps/sticky-tool/index.vue'
import { panelType, globalMenu } from '../designerData'
const t = inject('mlLangs')
const menus = ref([{
    icon: 'style',
    text: t('globalTool.style'),
    name: 'style'
}, {
    icon: 'component',
    text: t('globalTool.component'),
    name: 'option'
},
{
    icon: 'action',
    text: t('globalTool.action'),
    name: 'action'
}, {
    icon: 'setting',
    text: t('globalTool.global'),
    name: 'global'
}
])
const clickTool = function ({ item }) {
    panelType.value = item.name
}
</script>
<template>
    <sticky-tool :list="menus" v-model="globalMenu" @clickTool="clickTool"></sticky-tool>
</template>