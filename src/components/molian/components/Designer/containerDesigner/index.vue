<script setup lang="ts">
import { ref, inject } from "vue";
import { useCloned, useElementSize, useStyleTag, useElementBounding } from "@vueuse/core";
import { throttle } from "es-toolkit";
import deepComps from "./deepTreeToDesigner.vue";
import toolTip from "./toolTip/index.vue";
import toolBar from "./toolBar/index.vue";
import { createComponent } from '@molian/utils/componentCore'
import {
  modelValue,
  selectedComp,
  selectedDom,
  screenRatioInfo,
  zoomModeModelValue,
  zoomModeName,
  setZoomMode,
} from "../designerData";
import {
  resetHover,
  dragNodes,
  dragIndex,
  dropIndex,
  resetDraggable,
  onDragenter,
} from "../draggable";
import { calculateRatio, scaleCalculate } from "@molian/utils/util";
import { createCss } from "@molian/utils/css-generator";
// 按比例更新Cover背景
interface CoverStyle {
  left: number;
  width: number;
  top: number;
  height: number;
  borderRadius: number[];
}
const comps: any = inject("mlComps");
const containerRef = ref();
const onDrop = function (evt: DragEvent) {
  const name = evt.dataTransfer?.getData("compName");
  const isCreate = evt.dataTransfer?.getData("isCreate");
  if (!name) return;
  if (isCreate) {
    const comp = comps.value[name];
    if (!comp) return;
    const { cloned }: { cloned: any } = useCloned(createComponent(comp));
    const insertIndex = dropIndex.value ?? modelValue.value.length;
    modelValue.value.splice(insertIndex, 0, cloned.value);
  } else {
    const moveComp = dragNodes.value?.[dragIndex.value];
    if (!moveComp) return;
    dragNodes.value?.splice(dragIndex.value, 1);
    modelValue.value.splice(dropIndex.value, 0, moveComp);
  }
  resetDraggable();
};

const onClick = function () {
  selectedComp.value = null;
  selectedDom.value = null;
  resetHover();
};
const containerSize = useElementSize(containerRef);
const layoutSize = computed(() => {
  const { width, height, rotate } = screenRatioInfo.value;
  const containerWidth = containerSize.width.value;
  const containerHeight = containerSize.height.value;
  const actualWidth = rotate ? height : width;
  const actualHeight = rotate ? width : height;
  const { heightRatio, widthRatio } = calculateRatio(actualWidth, actualHeight);
  const divisor = Math.min(
    Math.floor(containerWidth / widthRatio),
    Math.floor(containerHeight / heightRatio)
  );
  return {
    autoDivisor: divisor,
    width: divisor * widthRatio,
    height: divisor * heightRatio,
    widthRatio,
    heightRatio,
  };
});
const getCoverStyle = (cover: CoverStyle) => {
  const { left, width, top, height, borderRadius } = cover;
  const { rotate } = screenRatioInfo.value;
  const { width: screenWidth, height: screenHeight } = screenRatioInfo.value;
  const { width: layoutWidth, height: layoutHeight } = layoutSize.value;

  if (rotate) {
    const { x: newWidth, y: newHeight } = scaleCalculate(
      screenWidth,
      screenHeight,
      height,
      width,
      layoutHeight,
      layoutWidth
    );
    const { x: newRight, y: newTop } = scaleCalculate(
      screenWidth,
      screenHeight,
      top,
      left,
      layoutHeight,
      layoutWidth
    );

    return {
      borderRadius: [borderRadius[3], borderRadius[1], borderRadius[0], borderRadius[2]]
        .map((r) => `${r}px`)
        .join(" "),
      top: `${newTop - 2.5}px`,
      height: `${newHeight - 2.5}px`,
      right: `${newRight}px`,
      width: `${newWidth}px`,
    };
  }

  const { x: newWidth, y: newHeight } = scaleCalculate(
    screenWidth,
    screenHeight,
    width,
    height,
    layoutWidth,
    layoutHeight
  );
  const { x: newLeft, y: newTop } = scaleCalculate(
    screenWidth,
    screenHeight,
    left,
    top,
    layoutWidth,
    layoutHeight
  );

  return {
    borderRadius: borderRadius.map((r) => `${r}px`).join(" "),
    left: `${newLeft - 2.5}px`,
    width: `${newWidth - 2.5}px`,
    top: `${newTop}px`,
    height: `${newHeight}px`,
  };
};
const confirmDropContainer = async () => {
  onDragenter(-1, modelValue, null, modelValue);
};

const { css, unload } = useStyleTag("", {
  id: "omni-magic-cube-designer",
});
const throttledCreateCss = throttle((newVal: any) => {
  css.value = createCss(newVal);
}, 300);
watch(
  () => modelValue.value,
  (newVal) => {
    throttledCreateCss(newVal);
  },
  {
    immediate: true,
    deep: true,
  }
);

const cmtdModelValue: any = computed(() => {
  if (zoomModeName.value) {
    return [zoomModeModelValue.value];
  } else {
    return modelValue.value;
  }
});
const pointsStyle = computed(() => {
  if (!selectedDom.value) {
    return { opacity: 0 };
  }

  const { top, left, width, height } = useElementBounding(selectedDom.value);

  return {
    top: `${Math.max(0, Number(top.value - 2))}px`,
    left: `${Math.max(0, Number(left.value - 2))}px`,
    width: `${Number(width.value + 6)}px`,
    height: `${Number(height.value + 6)}px`,
    opacity: 1,
  };
});
onUnmounted(() => {
  unload();
});
</script>
<template>
  <div class="container-designer" @click="onClick">
    <div class="container-body" @dblclick="setZoomMode(null)">
      <toolBar class="container-toolbar">
        <template v-slot:left>
          <slot name="toolbarLeft"></slot>
        </template>
        <template v-slot:center>
          <slot name="toolbarCenter"></slot>
        </template>
        <template v-slot:right>
          <slot name="toolbarRight"></slot>
        </template>
      </toolBar>
      <div class="container-main" ref="containerRef">
        <div
          class="container-draggable-body"
          :style="{ width: layoutSize.width + 'px', height: layoutSize.height + 'px' }"
          @dragover.prevent
          @dragenter.self="confirmDropContainer"
          @drop="onDrop"
        >
          <deepComps v-model="cmtdModelValue"></deepComps>
          <div
            class="container-draggable-cover"
            :style="getCoverStyle(item)"
            :key="index"
            v-for="(item, index) in screenRatioInfo.coverBackground"
            v-if="
              !!screenRatioInfo.coverBackground &&
              screenRatioInfo.coverBackground.length > 0
            "
          ></div>
        </div>
      </div>
    </div>
    <!-- 组件提示栏 -->
    <!-- <div class="drag-tips" v-if="isDraggable">{{ t('container.dropContent') }}</div> -->
    <!-- 组件打点框 -->
    <div class="points-container" :style="pointsStyle"></div>
    <!-- 组件工具栏 -->
    <toolTip></toolTip>
    
  </div>
</template>

<style scoped lang="scss">
// @use '../../../assets/styles/global.scss';

.container-designer {
  width: 100%;
  height: 100%;
  flex: 1;

  .container-body {
    height: 100%;
    width: 100%;

    .container-toolbar {
      position: relative;
      background-color: var(--ml-bg-color);
      height: 42px;
    }

    .container-main {
      height: calc(100% - 42px);
      width: 100%;
      position: relative;
      padding: var(--ml-pd-lg);
    }
  }

  .container-draggable-body {
    border: 5px solid var(--ml-fill-color);
    border-radius: var(--ml-radius-xlg);
    overflow-y: auto;
    overflow-x: hidden;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transition: var(--ml-transition-base);
  }

  .container-draggable-cover {
    background-color: black;
    position: absolute;
    z-index: 1001;
  }

  .drag-tips {
    position: absolute;
  }

  .designer-page-delete-comp {
    position: fixed;
    bottom: 10px;
    left: 10px;
    border-radius: var(--ml-radius-circle);
    border: 1px solid var(--color-fill-3, #e5e6eb);
    background-color: rgba(var(--ml-bg-color), 0.15);
    box-shadow: var(--ml-shadow-lg);
    backdrop-filter: saturate(150%) var(--ml-bg-blur-base);
    display: flex;
    justify-content: center;
    align-items: center;
    width: 68px;
    height: 68px;

    .svg-icon-transh {
      color: var(--ml-danger-color);
      font-size: 26px;
    }
  }

  .points-container {
    position: fixed;
    pointer-events: none;
    border: 4px solid var(--ml-primary-color-4);
    border-radius: var(--ml-radius-small);
    transition: 0.2s;
    z-index: 998;
  }
}
</style>

<style lang="scss">
.designer-comp {
  // min-height: 28px !important;
  margin: var(--ml-mg-base) 0;
  transition: var(--ml-transition-base);
  // min-width: 20px;
  padding: var(--ml-pd-small);

  &.comp-inline {
    display: inline-flex;

    &::after {
      z-index: 1000;
    }
  }

  &.hiddenComps {
    opacity: 0.7;
  }

  &::after {
    border: 2px solid var(--ml-info-color-1);
    border-radius: var(--ml-radius-base);
    content: "";
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    transition: var(--ml-transition-base);
  }

  &.is-margin {
    margin: 8px;
  }

  //   &.selectedComp {
  //     &::after {
  //       border: 2px solid var(--ml-primary-color);
  //       display: block;
  //     }
  //   }
}

.designer-comp-is-empty::after {
  content: "空内容" !important;
  font-size: 12px;
  color: var(--ml-info-color-1);
  display: flex !important;
  justify-content: center;
  align-items: center;
}

.drop__empty {
  position: relative;
  &:hover {
    z-index: 9999 !important;
  }
}

.prefix-drop-slot,
.suffix-drop-slot {
  position: absolute !important;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--ml-pd-small);
  border: 2px dashed var(--ml-warning-color-1);
  width: 100%;
  min-width: 200px;
  text-align: center;
  font-weight: bold;
  color: var(--ml-warning-color-6);
  user-select: none;
  line-height: 24px;
  transition: var(--ml-transition-base);
  background-color: var(--ml-primary-color-1);

  &:hover {
    font-size: 14px;
    z-index: 9999 !important;
  }
}

.designer-comp__empty {
  pointer-events: none; // 默认不接收鼠标事件
  flex: 1;
  position: relative;
  width: 260.99px;
  &-content {
    pointer-events: auto; // 恢复内容区域的鼠标事件
    position: absolute;
    border: 2px dashed var(--ml-info-color-1);
    padding: 0 var(--ml-pd-small);
    text-align: center;
    font-weight: bold;
    color: var(--ml-info-color-1);
    user-select: none;
    line-height: 24px;
    transition: var(--ml-transition-base);
    backdrop-filter: blur(4px);
    &:hover {
      background-color: var(--ml-primary-color-2) !important;
      transform: scale(1.02);
    }
  }
}

.dropping-comp {
  border-color: var(--ml-primary-color) !important;
  color: var(--ml-primary-color) !important;
}
</style>
