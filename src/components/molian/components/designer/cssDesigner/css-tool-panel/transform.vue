<script setup lang="ts">
import transformTop from './transform/transform-top.vue'
import transformBottom from './transform/transform-bottom.vue'
</script>
<template>
    <div class="designer-container">
        <transformTop></transformTop>
        <transformBottom></transformBottom>
    </div>
</template>

<style lang="scss" scoped>
.designer-container {
    overflow: auto;

    :deep(.transform-container__body) {
        background-color: var(--ml-bg-color);
        border-radius: var(--ml-radius-small);

        .transform-container__body-title {
            font-size: 12px;
            font-weight: bold;
            padding: var(--ml-pd-lg);
            user-select: none;
            color:var(--ml-text-color-1);
        }

        .transform-container__body-list {
            padding: 0 var(--ml-pd-lg);
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            padding-bottom: var(--ml-pd-base);
        }
    }
}
</style>