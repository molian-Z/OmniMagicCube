<script lang="ts" setup>

defineOptions({
    name: 'MlSubContainer',
    slotsOption: {
        default: {
            auto: true
        }
    }
})
defineProps({
    flexBasis: {
        type: String,
        default: '100px'
    },
    flexGrow: {
        type: Number,
        default: 0
    },
    flexShrink: {
        type: Number,
        default: 0
    },
})

</script>

<template>
    <div class="sub-container" :style="{ flex: `${flexBasis} ${flexGrow} ${flexShrink}` }">
        <slot></slot>
    </div>
</template>