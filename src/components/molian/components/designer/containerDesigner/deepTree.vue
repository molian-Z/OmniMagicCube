<script setup>
import { computed, inject, defineOptions, defineProps, defineEmits } from 'vue'
import { selectedComp, compsRef } from '../designerData'
import { isDraggable, dragIndex, dropIndex, dropKey, useDraggable, dropType } from '../draggable'
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
        <component :id="comp.id" :is="comp.name" :ref="(el) => setRef(el, comp)" :data-key="comp.key"
            :style="parseStyle(comp.css)" @dragover.self.prevent="onDragenter(index, comp)" @drop.self.stop="onDrop"
            @click.self="onClick(comp)" @dragend="onDragend" @mouseenter.self.native="onMouseEnter($event, comp, index)"
            v-bind="comp.attrs"
            :class="['designer-comp', dragIndex === index && 'hiddenComps', isDraggable && 'is-margin', selectedComp && selectedComp.key === comp.key && 'selectedComp']"
            v-if="!comp.nest">
            <template v-for="(slotVal, slotKey) in comp.slots" :key="slotKey" #[slotKey]="slotProps">
                <template v-if="slotVal && slotVal.children">
                    <template v-if="JSON.stringify(slotProps) !== '{}'">
                        <deepTree v-model="slotVal.children" :slotProp="slotProps"></deepTree>
                    </template>
                    <deepTree v-else v-model="slotVal.children"></deepTree>
                    <div :class="['designer-comp__empty', dropKey === comp.key && !dropType && 'dropping-comp']"
                        @dragover.self.prevent="onDragenter(index, comp)" @drop.self.stop="onDropSlot($event, slotVal)"
                        v-if="isDraggable && slotVal.children.length === 0">
                        {{ t("container.dropComp") + t('component.' + comp.name.substring(comps[comp.name].prefix.length)) +
                            t('container.component') + t('slot.' + slotKey) + t('container.slot') }}
                    </div>
                </template>
            </template>
        </component>
        <div :data-key="comp.key" :style="parseStyle(comp.css)" v-else @dragenter.self="onDragenter(index, comp)"
            @dragover.self.prevent @drop.self.stop="onDrop" @click.self="onClick(comp)" @dragend="onDragend"
            @mouseenter.self.native="onMouseEnter($event, comp, index)"
            :class="['designer-comp comp-inline', dragIndex === index && 'hiddenComps', dropIndex === index && isDraggable && 'is-margin', selectedComp && selectedComp.key === comp.key && 'selectedComp']">
            <component :id="comp.id" :ref="(el) => setRef(el, comp, true)" :is="comp.name" v-bind="comp.attrs">
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
        <transition name="fade">
            <div :class="['suffix-drop-slot designer-comp__empty', dropKey === comp.key && dropType === 'next' && 'dropping-comp']"
                v-if="isDraggable" @dragover.self.prevent="onDragenter(index, comp, 'next')"
                @drop.self.stop="onDrop($event, index + 1)">{{ t('container.drop') }}</div>
        </transition>
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
}

.dropping-comp {
    border-color: var(--ml-primary-color) !important;
    color: var(--ml-primary-color) !important;
}
</style>