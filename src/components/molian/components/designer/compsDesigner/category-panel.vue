<script setup lang="ts">
import { computed, defineProps, inject } from 'vue'
import { hiddenAllPanel } from '../designerData'
import { isDraggable, resetDraggable } from '../draggable'
import { UIData } from '@molian/utils/UIMap'
import { setting } from "@molian/utils/defaultData";
import svgIcon from '@molianComps/SvgIcon/index.vue'
import { createFuse } from '@molian/utils/fuse'
import {useI18n} from 'vue-i18n'
const {t} = useI18n()
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

const comps: any = inject('mlComps')

// 定义类型接口
interface CompItem {
    name: string
    title: string
    prefix?: string
    category: string
    orderIndex: number
}

// 优化计算属性的类型声明
const getCurrentUI = computed(() => {
    return props.currentUI !== 'all' ? UIData.find(item => item.name === props.currentUI) || 'all' : 'all'
})

const allCompsData = computed<CompItem[]>(() => {
    return Object.values(comps.value)
})

// 优化过滤逻辑
const compList = computed<CompItem[]>(() => {
    return allCompsData.value.filter((item) => {
        const isCurrentCategory = props.currentData.name === 'all' || item.category === props.currentData.name
        const isValidUI = getCurrentUI.value === 'all' || item.prefix === getCurrentUI.value.prefix || item.category === 'basic'
        return isCurrentCategory && isValidUI
    }).sort((a, b) => a.orderIndex - b.orderIndex)
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
// 优化事件处理函数
const onDragStart = (evt: DragEvent, item: CompItem) => {
    if (!evt.dataTransfer) return
    evt.dataTransfer.setData('compName', item.name)
    evt.dataTransfer.setData('isCreate', 'true')
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
        <div class="comps-panel-search" :class="[!setting.immerseLeftMode && 'no-border-radius']">
            <customInput :placeholder="t('component.search')" v-model="search" clearable>
                <template #prefixIcon>
                    <svg-icon icon="search"></svg-icon>
                </template>
            </customInput>
        </div>
        <div class="comps-panel-list" :class="{'full-height': !setting.immerseLeftMode}">
            <transition-group name="list2top" tag="div" class="comps-list-container">
                <div v-for="item in filterCompList" 
                     :key="item.name" 
                     class="comps-panel-list-item" 
                     draggable="true"
                     @dragstart="onDragStart($event, item)" 
                     @dragend="onDragend">
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

        &.no-border-radius{
            border-radius: 0;
            margin-bottom: 0;
        }
    }

    &-list {
        display: flex;
        align-items: center;
        align-content: flex-start;
        flex-wrap: wrap;
        overflow: auto;
        height: calc(100% - 60px);
        background-color: var(--ml-bg-color);
        border-radius: var(--ml-radius-lg);
        padding: var(--ml-pd-base);

        .comps-list-container {
            display: flex;
            flex-wrap: wrap;
            width: 100%;
        }

        .comps-panel-list-item {
            padding: var(--ml-pd-base);
            margin: var(--ml-mg-small);
            border-radius: var(--ml-radius-base);
            cursor: all-scroll;
            width: calc(50% - 12px);
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

        &.full-height{
            height: calc(100% - 44px - 48px);
            padding: var(--ml-pd-base) 0;
        }
    }


}
</style>