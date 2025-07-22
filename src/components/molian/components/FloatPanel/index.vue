<script setup lang="ts">
import { ref, defineProps, nextTick, computed, defineEmits, watch, withDefaults, defineOptions } from 'vue'
import { useDraggable, useWindowSize } from '@vueuse/core'
import svgIcon from '@molianComps/SvgIcon/index.vue'
import mlAnimate from '@molianComps/AnimateHeight/index.vue'
defineOptions({
    name:"FloatPanel"
})
const props = withDefaults(defineProps<{
    shape?: 'square' | 'round';
    offset: any;
    title?: string;
    list: any;
    modelValue: string | number;
    foldWidth: number;
    foldHeight?: number;
    isShow?: boolean;
    float: 'left' | 'right';
    isClose: boolean;
}>(), {
    shape: 'square',
    offset: [15, 105],
    title: '',
    list: [],
    modelValue: '',
    foldWidth: 300,
    foldHeight: 0,
    isShow: true,
    float: 'left',
    isClose: true
})

const emit = defineEmits(['update:modelValue', 'iconClick', 'clickClose'])

const activeName = computed({
    get() {
        return props.modelValue || ''
    },
    set(val) {
        emit('update:modelValue', val)
    }
})
const activeObj: any = ref({})
const el = ref(null)
const dragHeader = ref(null)
const isFold = ref(true)
const { x, y } = useDraggable(dragHeader)
const { width } = useWindowSize()
const floatPos = computed(() => {
    const foldWidth = isFold.value ? 60 : props.foldWidth
    const foldHeight = props.foldHeight || 'auto'
    if (props.float === 'left') {
        return {
            left: x.value + 'px',
            top: y.value + 'px',
            width: foldWidth + 'px',
        }
    }
     else {
        return {
            right: width.value - x.value - 40 + 'px',
            top: y.value - 46 + 'px',
            width: foldWidth + 'px',
        }
    }
})
nextTick(() => {
    if (props.float === 'right') {
        x.value = width.value - props.offset[0] - 40
    } else {
        x.value = props.offset[0]
    }
    y.value = props.offset[1] + 46
})

watch(() => props.isShow, (newVal) => {
    if (!newVal) {
        closePanel(null)
    }
})

const clickIcon = function (item: { name?: any; }, index: any) {
    if (activeName.value === item.name) {
        isFold.value = true
        activeName.value = ''
        activeObj.value = {}
    } else {
        isFold.value = false
        activeName.value = item.name
        activeObj.value = item
    }
    emit('iconClick', { item, index })
}

const closePanel = function (evt: any) {
    isFold.value = true
    activeName.value = ''
    activeObj.value = {}
    if (evt) {
        emit('clickClose')
    }
}

</script>

<template>
    <ml-animate :height="foldHeight">
        <div ref="el" :style="floatPos" :class="['float-panel-container', shape === 'round' && 'round']" v-if="isShow">
            <div :class="['float-panel-content', !isFold && 'is-fold', float === 'left' && 'float-left']">
                <div class="float-panel-list">
                    <div class="float-panel-header__close" v-if="isClose || (!!$slots.toolbar && !isFold)">
                        <svg-icon class="float-panel-icon" icon="close" @click="closePanel" v-if="isClose"></svg-icon>
                    </div>
                    <div :class="['float-panel-header-toolbar', !$slots.toolbar && !isFold && 'none-toolbar']">
                        <div ref="dragHeader" v-if="isFold">
                            <svg-icon class="float-panel-icon move-icon" icon="ic_styles"></svg-icon>
                        </div>
                        <template v-else-if="!!$slots.toolbar">
                            <div class="float-panel-header-toolbar__fold">
                                <slot name="toolbar"></slot>
                            </div>
                        </template>
                    </div>
                    <template v-for="(item, index) in list" :key="index">
                        <div :class="['float-panel-item', activeName === item.name && 'is-active']"
                            @click="clickIcon(item, index)">
                            <svg-icon class="float-panel-icon" :icon="item.icon"></svg-icon>
                            <div class="float-panel-item-text">{{ item.text }}</div>
                        </div>
                    </template>
                </div>
                <div class="float-panel-content-detail" v-if="!isFold">
                    <div class="float-panel-header__title-holder" />
                    <div class="float-panel-header__title" :class="[!isClose && 'max-width']" v-if="!isFold">
                        <span>
                            {{ title || activeObj.text }}
                        </span>
                    </div>
                    <div class="float-panel-toolbar-holder" v-if="$slots.toolbar" />
                    <div :class="['float-panel-content-detail__content', float === 'left' ? 'is-left' : 'is-right']"
                        :style="{ width: foldWidth - 77 + 'px', height: $slots.toolbar ? 'calc(100% - 72px)' : 'calc(100% - 40px)' }">
                        <transition name="list2top">
                            <slot :activeData="activeObj"></slot>
                        </transition>
                    </div>
                </div>
            </div>
        </div>
    </ml-animate>
</template>

<style scoped lang="scss">
@use '../../assets/styles/global.scss';

.float-panel-container {
    position: fixed;
    border-radius: var(--ml-radius-lg);
    border: 1px solid var(--color-fill-3, #E5E6EB);
    background-color: rgba(global.$bgColor, 0.55);
    box-shadow: var(--ml-shadow-lg);
    backdrop-filter:saturate(150%) var(--ml-bg-blur-base);
    transition: width var(--ml-transition-base);
    z-index: 1001;

    &.round {
        border-radius: var(--ml-radius-round);
        padding: 15px 0;
    }

    .float-panel-content {
        display: flex;
        flex-direction: row-reverse;
        justify-content: flex-start;

        &.float-left {
            flex-direction: row;

            .float-panel-list {
                .float-panel-header__close {
                    border-top-left-radius: var(--ml-radius-base);
                }
            }

            .float-panel-header__title {
                border-top-right-radius: var(--ml-radius-base);

                &.max-width {
                    left: 0;
                    width: 100%;
                }
            }
        }

        .float-panel-list {
            display: flex;
            flex-direction: column;
            align-items: center;
            overflow: scroll;

            .float-panel-header__close {
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 16px;
                height: 40px;
                transition: var(--ml-transition-base);
                width: 100%;

                .float-panel-icon {
                    cursor: pointer;
                }
            }

            .float-panel-header-toolbar {
                height: 32px;
                display: flex;
                justify-content: center;
                align-items: center;
                transition: var(--ml-transition-base);
                overflow: hidden;

                &.none-toolbar {
                    height: 0px;
                }

                .float-panel-header-toolbar__fold {
                    position: absolute;
                    top: 40px;
                    left: 0;
                    right: 0;
                    height: 32px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background-color: var(--ml-bg-color);
                    border-top: 1px solid var(--ml-fill-color-4);
                    overflow: hidden;
                }
            }

            .float-panel-item {
                width: 60px;
                padding: var(--ml-pd-small) 0;
                cursor: pointer;
                transition: var(--ml-transition-base);
                border-radius: var(--ml-radius-small);
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                margin: var(--ml-mg-base) 0;
                user-select: none;

                .float-panel-icon {
                    font-size: 32px;
                    fill: var(--ml-fill-color);
                }

                .float-panel-item-text {
                    font-size: 12px;
                    color: var(--ml-fill-color);
                }

                &:hover,
                &.is-active {
                    .float-panel-icon {
                        fill: var(--ml-primary-color-hover);
                        color: var(--ml-primary-color-hover);
                    }

                    .float-panel-item-text {
                        transition: var(--ml-transition-base);
                        color: var(--ml-primary-color-hover);
                    }
                }

                &.is-active {
                    background-color: var(--ml-bg-color);
                    box-shadow: var(--ml-shadow-mini-inset);
                }

                &.margin-top-32 {
                    margin-top: 32px;
                }
            }
        }

        .float-panel-content-detail {
            width: 100%;
            overflow: hidden;

            .float-panel-header__title-holder {
                height: 40px;
                background-color: var(--ml-bg-color);
            }

            .float-panel-header__title {
                position: absolute;
                top: 0;
                display: flex;
                align-items: center;
                padding-left: 12px;
                font-weight: 600;
                font-size: 14px;
                color: var(--ml-text-color-1);
                width: calc(100% - 76px);
                overflow: hidden;
                white-space: nowrap;
                background-color: var(--ml-bg-color);
                border-top-left-radius: var(--ml-radius-base);
                height: 40px;
            }

            .float-panel-toolbar-holder {
                height: 32px;
            }

            .float-panel-content-detail__content {
                position: relative;
                padding: var(--ml-pd-base);
                height: calc(100% - 40px);
                overflow: auto;

                &.is-left {
                    padding-left: 0;
                }

                &.is-right {
                    padding-right: 0;
                }
            }
        }

        &.is-fold {
            justify-content: space-between;

            .float-panel-header__close {
                border-radius: 0 var(--ml-radius-lg) 0 0;
                background-color: var(--ml-bg-color);
            }

            .float-panel-item {
                margin: var(--ml-mg-base);
            }
        }
    }


    .float-panel-icon {
        cursor: pointer;
        transition: var(--ml-transition-base);

        &:hover {
            fill: var(--ml-primary-color);
        }
    }

    .move-icon {
        cursor: move;
    }
}
</style>