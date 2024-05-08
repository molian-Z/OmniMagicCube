<script lang="ts" setup>

defineOptions({
    name: 'MlHorizontalContainer',
    slotsOption: {
        default: {
            auto: true,
            allowComps: ['MlSubContainer']
        }
    }
})
const props = defineProps({
    flexWrap: {
        type: Boolean,
        default: false
    }
})
</script>

<template>
    <div class="molian-horizontal-container" :style="{ flexWrap: props.flexWrap ? 'wrap' : 'nowrap' }">
        <slot></slot>
    </div>
</template>

<style lang="scss" scoped>
.molian-horizontal-container {
    display: flex;
    flex-direction: row;
}
</style>