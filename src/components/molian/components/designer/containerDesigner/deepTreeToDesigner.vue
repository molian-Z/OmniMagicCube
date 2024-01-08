<script setup lang="ts">
import { computed, inject, defineOptions, defineProps, defineEmits } from 'vue'
import { directives } from './directives'
import { compsRef } from '../designerData'
import { isDraggable, dropKey, useDraggable, dropType } from '../draggable'
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
    }
})
const emit = defineEmits(['update:modelValue'])
const comps:any = inject('mlComps')
const message:any = inject('ml-message')
const t:any = inject('mlLangs')
const treeIndexNext = computed(()=>{
    return props.treeIndex + 1
})
const compData:any = computed({
    get() {
        return props.modelValue
    },
    set(val) {
        emit('update:modelValue', val)
    }
})

const { onDragenter, onDrop, onDropSlot } = useDraggable(comps, compData, message)

const setRef = (el: any, comp: { key: string | number; }) => {
    // if (el && el.$el && el.$el.nodeName === '#text' && !nest) {
    //     comp.nest = true
    // }
    compsRef[comp.key] = el
}
</script>

<template>
    <template v-for="(comp, index) in compData" :key="comp.key">
        <transition name="fade">
            <div :class="['prefix-drop-slot designer-comp__empty', dropKey === comp.key && dropType === 'prev' && 'dropping-comp']"
                v-if="isDraggable && index === 0" @drop.self.stop="onDrop($event, index)"
                @dragover.self.prevent="onDragenter(index, comp, 'prev')">{{ t('container.drop') }}</div>
        </transition>
        <directives :ref="(el:any) => setRef(el, comp)" :comp="comp" :index="index" :modelValue="compData">
            <template v-for="(slotVal, slotKey) in comp.slots" :key="slotKey" #[slotKey]="slotProps">
                <template v-if="slotVal && slotVal.children">
                    <template v-if="JSON.stringify(slotProps) !== '{}'">
                        <deepTree v-model="slotVal.children" :slotProp="slotProps"></deepTree>
                    </template>
                    <deepTree v-else v-model="slotVal.children" :treeIndex="treeIndex + 1"></deepTree>
                    <div :class="['designer-comp__empty', dropKey === comp.key && !dropType && 'dropping-comp']"
                        @dragover.self.prevent.stop="onDragenter(index, comp)"
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
                @drop.self.stop="onDrop($event, index + 1)">{{ t('container.drop') }}</div>
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