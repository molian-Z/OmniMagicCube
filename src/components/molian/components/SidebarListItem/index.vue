<script setup lang="ts">
defineOptions({
  name: "SidebarListItem",
});
</script>

<template>
  <div class="sidebar-list-item">
    <div class="sidebar-list-item-content">
      <slot></slot>
    </div>
    <div class="sidebar-list-item-tag">
      <slot name="tag"></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.sidebar-list-item {
    width: 100%;
    user-select: none;
    &-content{
        font-weight: bold;
        display: flex;
        justify-content: space-between;
    }
    &-tag{
        font-size: 12px;
        
    }
}
.sidebar-list-item+.sidebar-list-item{
    margin-top: var(--ml-mg-small);
}
</style>
