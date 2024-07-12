<script setup lang="ts">
import { defineOptions, defineProps } from "vue";
const customComps: any = inject("customComps");
const { customPopconfirm, customPopup } = customComps;
const t: any = inject("mlLangs");
defineOptions({
  name: "ListCard",
});
defineProps({
  list: {
    type: Array,
    default: () => [],
  } as any,
});

const emit = defineEmits(["expand", "delete"]);
</script>

<template>
  <div class="card-list">
    <div class="card-item" v-for="(item, index) in list" :key="index">
      <customPopup width="60%" trigger="click" placement="left" :destroyOnClose="true">
        <div class="card-item-tip" @click="emit('expand', { item, index })">
          <svg-icon class="card-item-tip-arrow" icon="ri:arrow-left-wide-line"></svg-icon>
        </div>
        <template #content>
          <slot name="popItem" :item="item" :index="index" />
        </template>
      </customPopup>
      <div class="card-item-content">
        <div class="card-item-content-top">
          <div class="card-item-content__title">{{ item.title }}</div>
          <div class="card-item-content__index">
            <div class="card-item-content__index-desc">索引</div>
            <div class="card-item-content__index-number">{{ index + 1 }}</div>
          </div>
          <!-- <tag-group
            class="card-item-content__tags"
            :data="item.tags"
            v-if="!!item.tags && item.tags.length > 0"
          ></tag-group> -->
        </div>
        <div class="card-item-content-bottom">
          <div class="card-item-content__desc">{{ item.desc }}</div>
          <div class="card-item-content__tooltip">
            <customPopconfirm
              width="auto"
              :confirmBtn="t('actions.confirmText')"
              :cancelBtn="t('actions.cancelText')"
              :content="t('actions.deleteAction')"
              @confirm="emit('delete', { item, index })"
            >
              <template #reference>
                <div class="card-icon-bg">
                  <svg-icon
                    :size="16"
                    class="card-icon-bg-icon"
                    icon="ri:delete-bin-3-line"
                  ></svg-icon>
                </div>
              </template>
            </customPopconfirm>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.card-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 76px;
  background-color: var(--ml-fill-color-5);
  border-radius: var(--ml-radius-base);
  overflow: hidden;
  margin: var(--ml-mg-lg) 0;
  &-tip {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    background-color: var(--ml-fill-color-4);
    height: 76px;
    transition: var(--ml-transition-base);
    cursor: pointer;
    &-arrow {
      color: var(--ml-text-color-1);
      transition: var(--ml-transition-base);
    }
    &:hover {
      background-color: var(--ml-fill-color-3);
      .card-item-tip-arrow {
        color: var(--ml-primary-color);
      }
    }
  }
  &-content {
    width: calc(100% - 16px);
    height: 76px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: var(--ml-pd-12);
    user-select: none;
    letter-spacing: .5px;
    &-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--ml-mg-small);
    }

    &-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    &__title {
      font-size: 16px;
      font-weight: 600;
      color: var(--ml-text-color-2);
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 160px;
      flex: 1;
      padding-right: var(--ml-pd-base);
    }

    &__index {
      background: var(--ml-fill-color-4);
      border-radius: var(--ml-radius-small);
      padding: var(--ml-pd-small) var(--ml-pd-12);
      display: flex;
      align-items: center;

      &-number {
        font-size: 16px;
        font-weight: bold;
        color: var(--ml-text-color-4);
        text-align: center;
      }

      &-desc {
        font-size: 12px;
        font-weight: 400;
        color: var(--ml-text-color-4);
        text-align: center;
        padding-right: var(--ml-pd-small);
      }
    }

    &__tags {
      padding-right: 6px;
      max-width: calc(100% - 160px);
      overflow: hidden;
    }

    &__desc {
      font-size: 14px;
      font-weight: 400;
      color: var(--ml-text-color-5);
      overflow: hidden;
      text-overflow: ellipsis;
      padding-right: var(--ml-pd-base);
    }
  }
  .card-icon-bg {
    border-radius: var(--ml-radius-round);
    padding: var(--ml-pd-small);
    background-color: var(--ml-danger-color-1);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: var(--ml-transition-base);
    &-icon {
      color: var(--ml-danger-color);
    }
    &:hover {
      background-color: var(--ml-danger-color-2);
    }
  }

  &:first-child {
    margin-top: 0;
  }
  &:last-child {
    margin-bottom: 0;
  }
}
</style>
