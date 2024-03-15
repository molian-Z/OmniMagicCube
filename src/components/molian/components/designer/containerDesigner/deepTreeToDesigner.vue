<script setup lang="ts">
import { computed, inject, defineOptions, defineProps, defineEmits, nextTick } from 'vue'
import { directives } from './directives'
import { compsRef, globalAttrs } from '../designerData'
import { isDraggable, dropKey, useDraggable, dropType } from '../draggable'
import { getValue } from '@molian/utils/useCore'
import { useElementBounding } from '@vueuse/core'
defineOptions({
    name: 'deepTree'
})

const props = defineProps({
    modelValue: {
        type: Array,
        default: () => []
    },
    treeIndex: {
        type: Number,
        default: 1
    },
    slotKey: {
        type: [String, Number],
        default: ''
    },
    slotVal: {
        type: Object,
        default: () => { }
    }
})
const emit = defineEmits(['update:modelValue'])
const comps: any = inject('mlComps')
const message: any = inject('ml-message')
const t: any = inject('mlLangs')
const treeIndexNext = computed(() => {
    return props.treeIndex + 1
})
const compData: any = computed({
    get() {
        return props.modelValue
    },
    set(val) {
        emit('update:modelValue', val)
    }
})

const empty = computed(()=>{
    return t('container.empty')
})

const variable = computed(() => {
    return globalAttrs.variable
})

const value = getValue(compData.value, variable)

const { onDragenter, onDrop, onDropSlot } = useDraggable(comps, compData, message)

const setRef = async (el: any, comp: any) => {
    await nextTick()
    const elDoc = document.getElementById(comp.id)
    compsRef[comp.key] = elDoc
    const { width, height } = useElementBounding(elDoc)
    if(width.value < 10){
        comp.css.padding[1] = '26'
        comp.css.padding[3] = '26'
    }

    if(height.value < 10){
        comp.css.padding[0] = '10'
        comp.css.padding[2] = '10'
    }
}
</script>

<template>
    <template v-for="(comp, index) in compData" :key="comp.key">
        <transition name="fade">
            <div :class="['prefix-drop-slot designer-comp__empty', dropKey === comp.key && dropType === 'prev' && 'dropping-comp']"
                v-if="isDraggable && index === 0" @drop.self.stop="onDrop($event, index, slotVal)"
                @dragover.self.prevent="onDragenter(index, comp, 'prev')">{{ t('container.drop') }}</div>
        </transition>
        <directives :ref="(el: any) => setRef(el, comp)" :comp="value[index]" :index="index" :modelValue="compData">
            <template v-for="(slotVal, slotKey) in comp.slots" :key="slotKey" #[slotKey]="slotProps">
                <template v-if="slotVal && slotVal.children">
                    <template v-if="JSON.stringify(slotProps) !== '{}'">
                        <deepTreeToDesigner v-model="slotVal.children" :slotProp="slotProps" :slotKey="slotKey"
                            :slotVal="slotVal" />
                    </template>
                    <deepTreeToDesigner v-else v-model="slotVal.children" :slotKey="slotKey" :slotVal="slotVal"
                        :treeIndex="treeIndex + 1" />
                    <div :class="['designer-comp__empty', dropKey === comp.key && !dropType && 'dropping-comp']"
                        @dragover.self.prevent.stop="onDragenter(index, comp, null)"
                        @drop.self.stop="onDropSlot($event, slotVal)" v-if="isDraggable && slotVal.children.length === 0">
                        {{ t("container.dropComp") + t('component.' + comps[comp.name].title) +
                            t('container.component') + t('slot.' + slotKey) + t('container.slot') }}
                    </div>
                </template>
            </template>
        </directives>
        <transition name="fade">
            <div :class="['suffix-drop-slot designer-comp__empty', dropKey === comp.key && dropType === 'next' && 'dropping-comp']"
                v-if="isDraggable" @dragover.self.prevent="onDragenter(index, comp, 'next')"
                @drop.self.stop="onDrop($event, index + 1, slotVal)">{{ t('container.drop') }}</div>
        </transition>
    </template>
</template>

<style lang="scss">
@use '../../../assets/styles/global.scss';

.designer-comp {
    min-height: 28px !important;
    margin: var(--ml-mg-base) 0;
    position: relative;
    transition: var(--ml-transition-base);
    min-width: 60px;
    padding:var(--ml-pd-small);

    &.comp-inline {
        display: inline-flex;

        &::after {
            z-index: 1000;
        }
    }

    &.hiddenComps {
        opacity: .1;
    }

    &::after {
        border: 2px solid var(--ml-info-color-1);
        border-radius: var(--ml-radius-base);
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        transition: var(--ml-transition-base);
        z-index: v-bind(treeIndex);
    }

    &.is-margin {
        margin: 8px;
    }

    &.selectedComp {
        &::after {
            border: 2px solid var(--ml-primary-color);
        }
    }
}

.is-empty::after{
    content: "空内容";
    font-size: 12px;
    color:var(--ml-info-color-1);
    display: flex;
    justify-content: center;
    align-items: center;
}

.prefix-drop-slot {
    padding: var(--ml-pd-small);
}

.designer-comp__empty {
    border: 2px dashed var(--ml-info-color-1);
    padding: 0 var(--ml-pd-small);
    text-align: center;
    font-weight: bold;
    color: var(--ml-info-color-1);
    user-select: none;
    line-height: 36px;
    transition: var(--ml-transition-base);
    flex: 1;
    position: relative;
    z-index: v-bind(treeIndexNext);
}

.dropping-comp {
    border-color: var(--ml-primary-color) !important;
    color: var(--ml-primary-color) !important;
}
</style>