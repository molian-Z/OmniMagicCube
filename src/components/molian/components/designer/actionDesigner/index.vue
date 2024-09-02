<script setup lang="ts">
import { ref } from 'vue'
import { actionPanel, globalMenu } from '../designerData'
import floatPanel from '@molianComps/FloatPanel/index.vue'
import { setting } from '@molian/utils/defaultData'
import ActionList from './components/ActionList.vue'
const t:any = inject('mlLangs')
const menus = ref([{
    icon: 'action-run',
    text: t('actions.pageAction'),
    name: 'actions'
}])

const closeFloatPanel = function () {
    globalMenu.value = ''
}
</script>
<template>
    <div class="action-designer">
        <float-panel float="right" :list="menus" v-model="actionPanel" @clickClose="closeFloatPanel" :foldWidth="420"
            :isShow="globalMenu === 'action'"  v-if="!!setting.immerseRightMode">
            <template v-slot:default="{ activeData }">
                <div class="float-panel">
                    <actionList v-if="activeData.name === 'actions'" />
                </div>
            </template>
        </float-panel>
        <div class="is-side-bar" v-else>
            <actionList />
        </div>
    </div> 
</template>

<style lang="scss" scoped>

</style>