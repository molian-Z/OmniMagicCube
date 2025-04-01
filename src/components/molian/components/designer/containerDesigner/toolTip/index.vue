<script setup lang="ts">
import { computed, inject } from "vue";
import { hoverComp, hoverBounding, startDraggable, useDraggable } from "../../draggable";
import svgIcon from "@molianComps/SvgIcon/index.vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const customComps: any = inject("customComps");
const { customInput } = customComps;
const { onDragend } = useDraggable(null, null, null);
const { top, left, height } = hoverBounding;
const mlComps: any = inject("mlComps");
const currentBounding = computed(() => {
  if (hoverComp.value) {
    let obj: any = {
      //left: left.value + width.value / 2 <= (isWidth / 2) ? '5px' : Number(left.value - (isWidth / 2)) + width.value / 2 + 'px',
      left: left.value + "px",
      // width: isWidth + 'px'
    };
    if (top.value < 60) {
      obj.top = top.value + height.value + 5 + "px";
    } else {
      // obj.top = top.value - 60 + 'px'
      obj.top = top.value - 65 + "px";
    }
    return obj;
  }
});
const editSubTitle = ref(false);
const currentTitle = computed(() => {
  if (!!hoverComp.value.subTitle) return hoverComp.value.subTitle;
  if (
    hoverComp.value &&
    hoverComp.value.directives &&
    hoverComp.value.directives.text &&
    hoverComp.value.directives.text.type === "string" && 
    !!hoverComp.value.directives.text.value
  ) {
    return hoverComp.value.directives.text.value;
  }
  return (mlComps.value[hoverComp.value.name] && mlComps.value[hoverComp.value.name].title) || hoverComp.value.name;
});
</script>

<template>
  <div class="drag-shadow" @click.stop :style="currentBounding" v-if="hoverComp">
    <div class="drag-tips">
      <svg-icon size="22" class="drag-icon" :icon="hoverComp.icon || 'comps-default'" />
      <div class="drag-title">
        <div class="drag-title-text">
          <div v-if="!editSubTitle">{{ currentTitle }}</div>
          <customInput
            size="small"
            v-model="hoverComp.subTitle"
            @blur="editSubTitle = false"
            v-else
          ></customInput>
          <svg-icon
            class="drag-title-text__icon"
            icon="edit"
            @click="editSubTitle = true"
            v-if="!editSubTitle"
          ></svg-icon>
          <svg-icon
            class="drag-title-text__icon"
            icon="select"
            v-else
            @click="editSubTitle = false"
          ></svg-icon>
        </div>
        <div class="drag-title__desc">{{ hoverComp.name }}</div>
      </div>
    </div>

    <div
      class="drag-handler"
      draggable="true"
      @dragstart="startDraggable($event, hoverComp)"
      @dragend="onDragend"
    >
      <svgIcon icon="drag-move"></svgIcon>
      <!-- <span>{{ t('container.moveComp') }}</span> -->
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../../../../assets/styles/global.scss';

.drag-shadow {
  position: absolute;
  background-color: rgba(global.$bgColor, 0.15);
  box-shadow: var(--ml-shadow-lg);
  backdrop-filter: saturate(150%) var(--ml-bg-blur-base);
  border-radius: var(--ml-radius-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
  user-select: none;
  padding: 12px var(--ml-pd-base);
  transition: var(--ml-transition-base);

  .drag-tips {
    display: flex;
    align-items: center;

    .drag-icon {
      width: 22px;
      height: 22px;
      color: var(--ml-text-color-1);
    }

    .drag-title {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-start;
      padding: 0 var(--ml-pd-small);

      .drag-title-text {
        font-weight: bold;
        padding-bottom: var(--ml-pd-small);
        color: var(--ml-text-color-1);
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;

        &__icon {
          padding-left: var(--ml-pd-small);
          color: var(--ml-primary-color-4);
          cursor: pointer;
          transition: var(--ml-transition-base);

          &:hover {
            color: var(--ml-primary-color-light-hover);
          }
        }
      }

      .drag-title__desc {
        font-size: 12px;
        color: var(--ml-fill-color-1);
      }
    }
  }

  .drag-handler {
    color: var(--ml-primary-color);
    font-size: 22px;
    cursor: all-scroll;
    transition: var(--ml-transition-base);
    padding-right: var(--ml-pd-base);

    &:hover {
      color: var(--ml-primary-color-light-hover);
    }
  }
}
</style>
