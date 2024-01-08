<script setup lang="ts">
import { ref, inject, computed } from 'vue'
import floatPanel from '@molianComps/float-panel/index.vue'
import categroyPanel from './category-panel.vue'
import { compPanel } from '../designerData'
import { categoryList } from '@molian/utils/compsConfig'
import { uiMapping } from '@molian/utils/defaultData'
import svgIcon from '@molianComps/svg-icon/index.vue'

const customComps:any = inject('customComps')
const t:any = inject('mlLangs')
const { customTooltip } = customComps
const { current, data } = uiMapping

const currentUI = ref(current)

const i18nList = computed(()=>{
    return categoryList.value.map(item =>{
        return {
            ...item,
            text:t('component.category.'+item.name)
        }
    })
})

</script>
<template>
    <float-panel float="left" :list="i18nList" v-model="compPanel" :offset="[5, 150]" :foldWidth="500" :isClose="false">
        <template #toolbar>
            <svg-icon :class="['css-svg-icon', 'toolbar-icon', currentUI === 'all' && 'is-actived']"
                    icon="uiLib-all" @click="currentUI = 'all'" />
            <customTooltip :content="item.name" v-for="item in data" :key="item.name">
                <svg-icon :class="['css-svg-icon', 'toolbar-icon', currentUI === item.name && 'is-actived']"
                    :icon="`uiLib-${item.icon}`" @click="currentUI = item.name" />
            </customTooltip>
        </template>
        <template v-slot:default="{ activeData }">
            <categroy-panel :currentData="activeData" :currentUI="currentUI" />
        </template>
    </float-panel>
</template>

<style lang="scss" scoped>
.toolbar-icon {
    font-size: 22px;
    width: 26px;
    height: 26px;
}

:deep(.css-svg-icon) {
    // fill: var(--ml-primary-color);
    cursor: pointer;
    padding: 5px;
    transition: var(--ml-transition-base);
    border-radius: var(--ml-radius-small);

    &:hover {
        background-color: var(--ml-fill-color-4);
    }
}

:deep(.float-panel-header-toolbar__fold) {
    justify-content: flex-start !important;
    padding: 0 var(--ml-pd-lg);
}

.is-actived {
    background-color: var(--ml-fill-color-4) !important;
}
</style>