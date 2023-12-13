<script setup>
import { ref, defineProps, nextTick, defineExpose, defineEmits, computed } from 'vue'
import { useDraggable, useElementBounding, useWindowSize } from '@vueuse/core'
import svgIcon from '@molianComps/svg-icon/index.vue'

const props = defineProps({
    shape: {
        type: String,
        default: 'round'
    },
    offset: {
        type: Array,
        default: function () { return [0, 15] }
    },
    list: {
        type: Array,
        default: () => []
    },
    modelValue: {
        type: String,
        default: ''
    }
})
const emit = defineEmits(['clickTool', 'update:modelValue'])
const activeName = computed({
    get() {
        return props.modelValue || ''
    },
    set(value) {
        emit('update:modelValue', value)
    }
})
const el = ref(null)
const { x, y, style } = useDraggable(el)
nextTick(() => {
    const pageSize = useWindowSize()
    const { width, height } = useElementBounding(el)
    x.value = pageSize.width.value / 2  -  (width.value / 2) - props.offset[0]
    y.value = pageSize.height.value - height.value - props.offset[1]
})

const setActive = (item, index) => {
    activeName.value = item.name
    emit('clickTool', { item, index })
}

const closeAll = function () {
    activeName.value = ''
}

defineExpose({
    closeAll
})

</script>

<template>
    <div ref="el" :style="style" :class="['sticky-tool-container', shape === 'round' && 'round']">
        <div class="sticky-tool-content">
            <template v-for="(item, index) in list" :key="index">
                <div :class="['sticky-tool-button', shape === 'round' && 'round', activeName == item.name && 'active']"
                    @click="setActive(item, index)">
                    <svg-icon class="sticky-tool-content-svg-icon" :icon="item.icon"></svg-icon>
                    <span class="sticky-tool-content-text" v-if="activeName == item.name">{{ item.text }}</span>
                </div>
            </template>
        </div>
    </div>
</template>

<style scoped lang="scss">
@use '../../assets/styles/global.scss';

.sticky-tool-container {
    position: fixed;
    border-radius: var(--ml-radius-lg);
    border: 1px solid var(--color-fill-3, #E5E6EB);
    background-color: rgba(global.$bgColor, 0.15);
    box-shadow: var(--ml-shadow-lg);
    backdrop-filter: var(--ml-bg-blur-base);
    z-index: 1000;

    &.round {
        border-radius: var(--ml-radius-round);
    }

    .sticky-tool-header {
        cursor: all-scroll;
        padding: var(--ml-pd-base) var(--ml-pd-lg);
    }

    .sticky-tool-content {
        display: flex;
        padding: var(--ml-pd-base);
    }

    .sticky-tool-button {
        width: 46px;
        height: 46px;
        user-select: none;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid var(--color-fill-5, #FAFAFB);
        background: var(--color-fill-white, #FFF);
        box-shadow: var(--ml-shadow-mini-inset);
        border-radius: var(--ml-radius-lg);
        cursor: pointer;
        transition: var(--ml-transition-base);

        .sticky-tool-content-svg-icon {
            width: 24px;
            height: 24px;
            fill: var(--ml-fill-color-1);
            transition: var(--ml-transition-base);
        }

        .sticky-tool-content-text {
            white-space: nowrap;
            overflow: hidden;
        }

        &.round {
            border-radius: var(--ml-radius-round);
        }

        &:hover {
            border-color: var(--ml-primary-color-2);
            .sticky-tool-content-svg-icon{
                fill:var(--ml-primary-color);
            }
            color: var(--ml-primary-color);
        }

        &.active {
            border-color: var(--ml-primary-color-1);
            width: 160px;
        }
    }

    .sticky-tool-button+.sticky-tool-button {
        margin-left: var(--ml-mg-base);
    }
}
</style>