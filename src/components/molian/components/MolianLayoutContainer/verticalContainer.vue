<script lang="ts" setup>
import { useAttrs } from 'vue'
defineOptions({
    name: 'MlVerticalContainer',
    slotsOption: {
        default: {
            auto: true
        }
    }
})
const props = defineProps({
    flexWrap: {
        type: Boolean,
        default: false
    },
    flexBasis: {
        type: String,
        default: ''
    },
    flexGrow: {
        type: Number,
        default: 0
    },
    flexShrink: {
        type: Number,
        default: 0
    },
    order:{
        type: Number,
        default: 0
    },
    overflow: {
        type: String,
        default: 'visible',
        optionItems:['auto', 'visible', 'hidden', 'scroll', 'clip']
    }
})
const attrs = useAttrs()
const { isDesigner } = attrs

const flexWrap = computed(() => {
    return props.flexWrap ? 'wrap' : 'nowrap'
})

const flex = computed(() => {
    return `${props.flexBasis} ${props.flexGrow} ${props.flexShrink}`
})
</script>

<template>
    <div class="molian-vertical-container">
        <slot></slot>
    </div>
</template>

<style lang="scss" scoped>
.molian-vertical-container {
    display: flex;
    flex-direction: column;
    flex-wrap: v-bind(flexWrap);
    flex: v-bind(flex);
    order: v-bind(order);
    overflow: v-bind(overflow);
}
</style>