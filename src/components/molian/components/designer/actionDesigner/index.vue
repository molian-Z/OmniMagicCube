<script setup>
import { ref } from 'vue'
import { actionPanel, globalMenu } from '../designerData'
import floatPanel from '@molianComps/float-panel/index.vue'
const menus = ref([])

const closeFloatPanel = function () {
    globalMenu.value = ''
}
</script>
<template>
    <div class="css-designer">
        <float-panel float="right" :list="menus" v-model="actionPanel" @clickClose="closeFloatPanel"
            :isShow="globalMenu === 'action'">
            <template v-slot:default="{ activeData }">
                <div class="float-panel">
                    43243
                </div>
            </template>
        </float-panel>
    </div>
</template>

<style scoped lang="scss">
.float-panel {
    background-color: var(--ml-bg-color);
    height: 100%;
}
</style>