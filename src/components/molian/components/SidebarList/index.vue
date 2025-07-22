<script setup lang="ts">
defineOptions({
    name:"SidebarList"
})

defineProps({
    title:{
        type:String,
        default: ''
    }
})

</script>

<template>
    <div class="sidebar-list">
        <div class="sidebar-list-title" v-if="!!title">{{ title }}</div>
        <slot></slot>
    </div>
</template>

<style lang="scss" scoped>
.sidebar-list{
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-direction: column;

    &-title{
        font-size: 14px;
        font-weight: 600;
        margin-bottom: var(--ml-mg-base);
    }
}
</style>