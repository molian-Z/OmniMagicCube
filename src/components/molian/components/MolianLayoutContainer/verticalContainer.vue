<script lang="ts" setup>
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

const containerStyle = computed(() => ({
    'flexWrap': props.flexWrap ? 'wrap' : 'nowrap',
    'flexBasis': props.flexBasis,
    'flexGrow': props.flexGrow || '0',
    'flexShrink': props.flexShrink || '0',
    'overflow': props.overflow,
    'order': props.order
}))
</script>

<template>
    <div class="molian-vertical-container" :style="containerStyle">
        <slot></slot>
    </div>
</template>

<style lang="scss" scoped>
.molian-vertical-container {
    display: flex;
    flex-direction: column;
}
</style>