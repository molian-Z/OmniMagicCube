<script lang="ts" setup>
defineOptions({
    name: 'MlSubContainer',
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
        default: '100%'
    },
    flexGrow: {
        type: Number,
        default: 0
    },
    flexShrink: {
        type: Number,
        default: 0
    },
    overflow: {
        type: String,
        default: 'visible',
        optionItems:['auto', 'visible', 'hidden', 'scroll', 'clip']
    }
})

const flexWrap = computed(() => {
    return props.flexWrap ? 'wrap' : 'nowrap'
})

const flex = computed(() => {
    return `${props.flexBasis} ${props.flexGrow} ${props.flexShrink}`
})
</script>

<template>
    <div class="sub-container">
        <slot></slot>
    </div>
</template>

<style lang="scss" scoped>
.sub-container{
    display:flex;
    flex-direction: row;
    flex-wrap: v-bind(flexWrap);
    flex: v-bind(flex);
    overflow: v-bind(overflow);
}
</style>