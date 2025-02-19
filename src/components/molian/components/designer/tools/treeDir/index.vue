<script setup lang="ts">
import { onClickOutside } from "@vueuse/core";
import { modelValue, treeDirRef } from "@molianComps/Designer/designerData";
import { setting } from "@molian/utils/defaultData";
import deepTree from "./deepTreeToData.vue";
import floatBall from "@molianComps/FloatBall/index.vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

onClickOutside(treeDirRef, (evt: any) => {
  const { classList } = evt.target;
  if (
    !classList.contains("container-main") &&
    !classList.contains("container-draggable-body")
  )
    return;
  if (treeDirRef.value.expand) {
    treeDirRef.value.switchExpand(false);
  }
});

const openedObj = ref({});
provide("openedObj", openedObj);
onMounted(() => {
  watch(
    () => treeDirRef.value.expand,
    (newVal) => {
      if (newVal) {
        nextTick(() => {
          const treeDirDom = document.querySelector(".tree-dir-container");
          const activeDom = treeDirDom?.querySelector('.tree-node-header.is-active') as HTMLElement | null
          if(activeDom) {
            treeDirDom?.scrollTo({  top: Number(activeDom.offsetTop - 200) })
          }
        });
      }
    }
  );
});
</script>

<template>
  <floatBall
    :title="t('container.treeDir')"
    :offsetX="!setting.immerseRightMode ? '330px' : '0px'"
    ref="treeDirRef"
  >
    <div class="tree-dir-container">
      <deepTree v-model="modelValue"></deepTree>
    </div>
  </floatBall>
</template>

<style lang="scss">
.tree-dir-container {
  width: 100%;
  height: 100%;
  background-color: var(--ml-bg-color);
  border-radius: var(--ml-radius-base);
  overflow-y: auto;

  .tree-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: var(--ml-pd-small) 0;
  }

  .tree-node {
    .tree-node-header {
      cursor: pointer;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      transition: var(--ml-transition-base);
      border-radius: var(--ml-radius-base);

      &-expand-icon {
        width: 14px;
        height: 14px;
        transition: var(--ml-transition-base);
        font-size: 14px;
        color: var(--ml-fill-color-1);
      }

      &:hover {
        background-color: var(--ml-fill-color-4);
      }

      &.is-active {
        background-color: var(--ml-fill-color-3);
      }

      .tree-node-header__title {
        flex: 1;
        user-select: none;
        padding: var(--ml-pd-base) 0;
        padding-left: var(--ml-pd-base);
        color: var(--ml-text-color-2);
        font-weight: bold;
        font-size: 14px;
        display: flex;
        align-items: center;
        &-icon {
          margin-left: var(--ml-mg-small);
          transition: var(--ml-transition-base);
          color: var(--ml-primary-color);
          &:hover {
            color: var(--ml-primary-color-light-hover);
          }
        }
      }
    }

    .tree-node-content {
      // margin-left: var(--ml-mg-lg);

      .slot-container {
        .slotTitle {
          font-size: 13px;
          color: var(--ml-text-color-6);
          user-select: none;
          padding: var(--ml-pd-base) 0;
          padding-left: var(--ml-pd-lg);
        }
      }
    }
  }

  .append-line {
    transition: var(--ml-transition-base);
    position: relative;
    height: 1px;
    background: var(--ml-primary-color-6);

    .append-line-text {
      position: absolute;
      width: 140px;
      text-align: center;
      top: -8px;
      left: 50%;
      transform: translate(-50%, 0);
      background: #fff;
      color: var(--ml-primary-color-6);
      pointer-events: none;
      font-size: 12px;
    }
  }
}
</style>
