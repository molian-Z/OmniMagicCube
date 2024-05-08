<script lang="ts" setup>
import { useAttrs } from 'vue'
defineOptions({
    name: 'MlVerticalContainer',
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
const attrs = useAttrs()
const { isDesigner } = attrs
</script>

<template>
    <div class="molian-vertical-container" :style="{ flexWrap: props.flexWrap ? 'wrap' : 'nowrap' }">
        <slot></slot>
    </div>
</template>

<style lang="scss" scoped>
.molian-vertical-container {
    display: flex;
    flex-direction: column;
}
</style>