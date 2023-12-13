<script setup>
import { computed, inject, defineOptions, defineProps, defineEmits } from 'vue'
import { selectedComp, compsRef } from '../designerData'
import { isDraggable, dragIndex, dropIndex, dropKey, useDraggable } from '../draggable'
import { parseStyle } from '@molian/utils/css-generator'
defineOptions({
    name: 'deepTree'
})

const props = defineProps({
    modelValue: {
        type: Array,
        default: () => []
    }
})
const emit = defineEmits(['update:modelValue'])
const comps = inject('mlComps')
const message = inject('ml-message')
const t = inject('mlLangs')
const compData = computed({
    get() {
        return props.modelValue
    },
    set(val) {
        emit('update:modelValue', val)
    }
})

const { onDragenter, onDrop, onDropSlot, onDragend, showToolbar } = useDraggable(comps, compData, message)

const onMouseEnter = function (evt, comp, index) {
    showToolbar(evt, comp, index, compData.value)
}

const onClick = function (comp) {
    selectedComp.value = comp
}

const setRef = (el, comp, nest) => {
    if (el && el.$el && el.$el.nodeName === '#text' && !nest) {
        comp.nest = true
    }
    compsRef[comp.key] = el
}
</script>

<template>
    <template v-for="(comp, index) in compData" :key="comp.key">
        <component :is="comp.name" :ref="(el) => setRef(el, comp)" :data-key="comp.key" :style="parseStyle(comp.css)"
            @dragenter.self="onDragenter(index, comp)" @dragover.self.prevent @drop.self.stop="onDrop"
            @click.self="onClick(comp)" @dragend="onDragend"
            @mouseenter.self.native="onMouseEnter($event, comp, index)" v-bind="comp.attrs"
            :class="['designer-comp', dragIndex === index && 'hiddenComps', isDraggable && 'is-margin', selectedComp && selectedComp.key === comp.key && 'selectedComp']"
            v-if="!comp.nest">
            <template v-for="(slotVal, slotKey) in comp.slots" :key="slotKey" #[slotKey]="slotProps">
                <template v-if="slotVal && slotVal.children">
                    <div :class="['prefix-drop-slot designer-comp__empty']" v-if="isDraggable" @dragover.prevent
                        @drop.stop="onDrop($event, index)"></div>
                        <template v-if="JSON.stringify(slotProps) !== '{}'">
                            <deepTree v-model="slotVal.children" :slotProp="slotProps"></deepTree>
                        </template>
                        <deepTree v-else v-model="slotVal.children"></deepTree>
                    <div :class="['designer-comp__empty', dropKey === comp.key && 'dropping-comp']" @dragover.prevent
                        @drop.self.stop="onDropSlot($event, slotVal)" v-if="isDraggable">
                        <template v-if="dropKey !== comp.key">
                            {{ t('container.dropSlot') + t('slot.' + slotKey) + t('container.slot') }}
                        </template>
                        <template v-else>
                            {{ t("container.dropComp") + t('component.' + comp.name) + t('container.component') }}
                        </template>
                    </div>
                </template>
            </template>
        </component>
        <div :data-key="comp.key" :style="parseStyle(comp.css)" v-else @dragenter.self="onDragenter(index)"
            @dragover.self.prevent @drop.self.stop="onDrop" @click.self="onClick(comp)" @dragend="onDragend"
            @mouseenter.self.native="onMouseEnter($event, comp, index)"
            :class="['designer-comp comp-inline', dragIndex === index && 'hiddenComps', dropIndex === index && isDraggable && 'is-margin', selectedComp && selectedComp.key === comp.key && 'selectedComp']">
            <component :ref="(el) => setRef(el, comp, true)" :is="comp.name" v-bind="comp.attrs">
                <template v-for="(slotVal, slotKey) in comp.slots" :key="slotKey" #[slotKey]="slotProps">
                    <template v-if="slotVal && slotVal.children && slotVal.children.length > 0">
                        <template v-if="JSON.stringify(slotProps) !== '{}'">
                            <deepTree v-model="slotVal.children" :slotProp="slotProps"></deepTree>
                        </template>
                        <deepTree v-else v-model="slotVal.children"></deepTree>
                        <div :class="['designer-comp__empty', dropKey === comp.key && 'dropping-comp']" @dragover.prevent
                            @drop.self.stop="onDropSlot($event, slotVal, slotKey)" v-if="isDraggable">
                            <template v-if="dropKey !== comp.key">
                                {{ t('container.dropSlot') + t('slot.' + slotKey) + t('container.slot') }}
                            </template>
                            <template v-else>
                                {{ t("container.dropComp") + t('component.' + comp.name) + t('container.component') }}
                            </template>
                        </div>
                    </template>
                </template>
            </component>
        </div>
    </template>
</template>

<style scoped lang="scss">
@use '../../../assets/styles/global.scss';

.designer-comp {
    min-height: 28px;
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
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        transition: var(--ml-transition-base);
        z-index: -1;
    }

    &.is-margin {
        margin: 8px;
    }

    &.selectedComp {
        &::after {
            border: 2px solid var(--ml-primary-color);
        }
    }

    .prefix-drop-slot {
        position: absolute;
        left: -20px;
        padding: var(--ml-pd-small);
    }

    .designer-comp__empty {
        height: 50px;
        margin: 5px;
        border: 2px dashed var(--ml-info-color-1);
        padding: 0 var(--ml-pd-small);
        text-align: center;
        line-height: 50px;
        font-weight: bold;
        color: var(--ml-info-color-1);
        user-select: none;
        transition: var(--ml-transition-base);
    }

    .dropping-comp {
        border-color: var(--ml-primary-color) !important;
        color: var(--ml-primary-color) !important;
    }
}</style>