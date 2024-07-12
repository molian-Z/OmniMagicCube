<script setup lang="ts">
import { computed, defineProps, inject } from 'vue'
import { hiddenAllPanel } from '../designerData'
import { isDraggable, resetDraggable } from '../draggable'
import { UIData } from '@molian/utils/UIMap'
import svgIcon from '@molianComps/SvgIcon/index.vue'
import { createFuse } from '@molian/utils/fuse'
const props = defineProps({
    currentData: {
        type: Object,
        default: () => { }
    },
    currentUI: {
        type: String,
        default: 'tdesign-vue-next'
    }
})
const customComps:any = inject('customComps')
const { customInput } = customComps

const t:any = inject('mlLangs')
const comps: any = inject('mlComps')

const getCurrentUI = computed(() => {
    return props.currentUI !== 'all' ? UIData.find(item => item.name === props.currentUI) || 'all' : 'all'
})

const compList: any = computed(() => {
    return Object.values(comps.value).filter((item: any) => {
        if(props.currentData.name === 'all'){
            return getCurrentUI.value === 'all' || item.prefix === getCurrentUI.value.prefix || item.category === 'basic'
        }else if(item.category === props.currentData.name){
            return getCurrentUI.value === 'all' || item.prefix === getCurrentUI.value.prefix || item.category === 'basic'
        }
    }).sort((a:any,b:any) => {
        return a.orderIndex - b.orderIndex
    })
    
})
const filterCompList: any = computed(() => {
    if(!search.value) return compList.value
    const fuseInfo = createFuse(compList.value, {
        keys: [
            "name",
            "title"
        ]
    })
    const filterComps: any = fuseInfo.search(search.value)
    return filterComps.map((item:any) => item.item)
})

const search = ref('')
const onDragStart = function (evt: any, item: { name: any }) {
    evt.dataTransfer.setData('compName', item.name)
    evt.dataTransfer.setData('isCreate', true)
    isDraggable.value = true
}

const onDragleave = function () {
    hiddenAllPanel.value = true
}

const onDragend = function () {
    resetDraggable()
}

</script>
<template>
    <div class="comps-panel" @dragleave="onDragleave">
        <div class="comps-panel-search">
            <customInput :placeholder="t('component.search')" v-model="search" clearable>
                <template #prefixIcon>
                    <svg-icon icon="ep:search"></svg-icon>
                </template>
            </customInput>
        </div>
        <div class="comps-panel-list">
            <transition-group name="list2top">
                <div v-for="item in filterCompList" :key="item.name" class="comps-panel-list-item" draggable="true"
                    @dragstart="onDragStart($event, item)" @dragend="onDragend">
                    <svg-icon class="comps-panel-list-item__icon" icon="comps-default"></svg-icon>
                    <span class="comps-panel-list-item__text">
                        {{ item.title }}
                    </span>
                    <span class="comps-panel-list-item__text——2">
                        {{ item.name }}
                    </span>
                </div>
            </transition-group>
        </div>
    </div>
</template>

<style scoped lang="scss">
@use '../../../assets/styles/global.scss';

.comps-panel {
    height: 100%;
    position: relative;

    &-search{
        padding: var(--ml-pd-base);
        background-color: var(--ml-bg-color);
        margin-bottom: var(--ml-mg-base);
        border-radius: var(--ml-radius-lg);
    }

    &-list {
        display: flex;
        align-items: center;
        align-content: flex-start;
        flex-wrap: wrap;
        overflow: auto;
        height: 510px;
        background-color: var(--ml-bg-color);
        border-radius: var(--ml-radius-lg);
        padding: var(--ml-pd-base);

        .comps-panel-list-item {
            padding: var(--ml-pd-base);
            margin: var(--ml-mg-base);
            border-radius: var(--ml-radius-base);
            cursor: all-scroll;
            width: 110px;
            display: flex;
            justify-content: space-between;
            flex-direction: column;
            align-items: center;
            border: 1px solid var(--ml-fill-color-3, #E5E6EB);
            background-color: rgba(global.$bgColor, 0.15);
            box-shadow: var(--ml-shadow-small);
            backdrop-filter: saturate(150%) drop-shadow(4px 4px 10px var(--ml-primary-color-light-hover)) var(--ml-bg-blur-base);
            color: var(--ml-fill-color-1);
            transition: var(--ml-transition-base);

            &:hover {
                border: 1px solid var(--ml-primary-color-hover);
            }

            .comps-panel-list-item__icon {
                width: 16px;
                height: 16px;
                margin-bottom: var(--ml-pd-base);
            }

            .comps-panel-list-item__text {
                user-select: none;
                overflow: hidden;
                font-size: 12px;
                font-weight: bold;
            }

            .comps-panel-list-item__text——2{
                margin-top: 3px;
                user-select: none;
                overflow: hidden;
                font-size: 10px;
            }
        }
    }


}
</style>