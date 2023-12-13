<script setup>
import { defineProps } from 'vue'

defineProps({
    icon: {
        type: String,
        default: ''
    }
})
</script>

<template>
    <svg class="svg-icon" aria-hidden="true">
        <use :xlink:href="`#icon-${icon}`"  rel="external nofollow"></use>
    </svg>
</template>
<style scoped>
.svg-icon {
    width: 1.1em;
    height: 1.1em;
    margin-left: 0.35em;
    margin-right: 0.35em;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
    outline: none;
    display: inline-block;
    user-select: none;
}
</style>