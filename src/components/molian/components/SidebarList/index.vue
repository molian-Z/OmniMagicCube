<script setup lang="ts">
defineOptions({
    name:"SidebarList"
})
</script>

<template>
    <div class="sidebar-list">
        <div class="sidebar-list-item" v-for="(item,index) in 10">
            {{ index }}
        </div>
    </div>
</template>

<style lang="scss" scoped>
.sidebar-list{
    width: 60px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-direction: column;

    &-item{
        padding: var(--ml-pd-base);
    }
}
</style>