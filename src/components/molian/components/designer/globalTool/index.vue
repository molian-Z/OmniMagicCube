<script setup lang="ts">
import { ref, inject } from 'vue'
import stickyTool from '@molianComps/StickyTool/index.vue'
import switchButton from '@molianComps/SwitchButton/index.vue'
import { setting } from '@molian/utils/defaultData'
import { globalMenu } from '../designerData'
const t:any = inject('mlLangs')
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
}
/* , {
    icon: 'setting',
    text: t('globalTool.global'),
    name: 'global'
} */
])
</script>
<template>
    <sticky-tool :optionItems="menus" v-model="globalMenu"  v-if="!!setting.immerseRightMode"></sticky-tool>
    <switchButton :optionItems="menus" v-model="globalMenu" v-else></switchButton>
</template>