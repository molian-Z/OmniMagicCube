<script setup lang="ts">
import { ref } from 'vue'
import { actionPanel, globalMenu } from '../designerData'
import floatPanel from '@molianComps/FloatPanel/index.vue'
import { setting } from '@molian/utils/defaultData'
import ActionList from './components/ActionList.vue'
const menus = ref([])

const closeFloatPanel = function () {
    globalMenu.value = ''
}
</script>
<template>
    <div class="action-designer">
        <float-panel float="right" :list="menus" v-model="actionPanel" @clickClose="closeFloatPanel"
            :isShow="globalMenu === 'action'"  v-if="!!setting.immerseMode">
            <template v-slot:default="{ activeData }">
                <div class="float-panel">
                    <actionList />
                </div>
            </template>
        </float-panel>
        <div class="is-side-bar" v-else>
            <actionList />
        </div>
    </div> 
</template>

<style lang="scss" scoped>
.action-designer{
    height: 100%;
    background-color: var(--ml-bg-color);
}
</style>