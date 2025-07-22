<script lang="ts" setup>
import { ref, unref, onMounted, watch, nextTick, onUnmounted } from "vue";
import { onClickOutside } from "@vueuse/core";
import { createPopper } from "@popperjs/core";
defineOptions({
  name: "Popper",
});
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["update:visible", "beforeLeave", "hide", "show"]);
const referenceRef = ref<HTMLElement | any>(null);
const popperRef = ref<HTMLElement | any>(null);
const isShow = ref<boolean>(false)
const popperInstance: any = ref(null);
// 创建 popper 实例
const createPopperInstance = () => {
  popperInstance.value = createPopper(unref(referenceRef), unref(popperRef), {
    strategy: "fixed",
    modifiers: [
      {
        // 偏移值 左右，上下
        name: "offset",
        options: {
          offset: [0, 5],
        },
      },
      {
        // 禁用计算样式，使用 transition 动画
        name: "computeStyles",
        options: {
          gpuAcceleration: false,
          adaptive: false,
        },
      },
    ],
  });
  nextTick(() => {
    // 异步更新
    popperInstance.value.update();
  });
};

// 销毁 popper 实例
const destroyPopperInstance = () => {
  popperInstance.value?.destroy?.();
  popperInstance.value = null;
};

// 监听 visible 属性
watch(
  () => props.visible,
  (visible) => {
    nextTick(() => {
      if (visible && props.disabled === false) {
        isShow.value = true
        createPopperInstance();
        emit("show");
      } else {
        isShow.value = false
        emit("hide");
      }
    });
  }
);

onMounted(() => {
  createPopperInstance();
});

onUnmounted(() => {
  destroyPopperInstance();
});

const togglePopperShow = () => {
  if (!props.disabled) emit("update:visible", true);
};
defineExpose({
  referenceRef,
  popperRef,
  togglePopperShow,
  popperInstance,
});

onClickOutside(popperRef, () => isShow.value = false);
const transitionEnd = () => {
  emit("update:visible", false)
  destroyPopperInstance();
};

const transitionBeforeEnd = () => {
    emit("beforeLeave")
}

</script>

<template>
  <div
    :class="['reference', !!disabled && 'is-disabled']"
    ref="referenceRef"
    @click.stop.prevent="togglePopperShow"
  >
    <slot></slot>
  </div>
  <teleport to="body" v-if="!!visible">
    <transition @before-leave="transitionBeforeEnd" @after-leave="transitionEnd">
      <div ref="popperRef" class="popper-container" v-show="!!isShow">
        <slot name="content"></slot>
      </div>
    </transition>
  </teleport>
</template>

<style scoped lang="scss">
.reference {
  display: inline-block;
  cursor: pointer;
  user-select: none;
}
.is-disabled {
  cursor: not-allowed !important;
}
.popper-container {
  border-radius: var(--ml-radius-base);
  z-index: 2000;
}
.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
  opacity: 1;
  transform: scaleY(1);
  transform-origin: center top;
}

[data-popper-placement="top"] {
  transform-origin: center bottom;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: scaleY(0);
}
</style>
