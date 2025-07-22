<script lang="ts" setup>
import { defineProps, defineEmits, ref, computed, nextTick, watch, onMounted } from "vue";
defineOptions({
  name: "SwitchButton",
});
const props = defineProps({
  optionItems: {
    type: Array,
    default: () => [],
  } as any,
  modelValue: {
    type: String,
    default: "",
  },
});
const emit = defineEmits(["tabClick", "update:modelValue"]);
const bodyRef = ref();
const switchRefs = ref([]);
const rectStyle = ref({});
const clickTab = function (item: any) {
  emit("update:modelValue", item.name);
  emit("tabClick", item);
};

const currentIndex = computed(() => {
  return props.optionItems.findIndex((item: any) => {
    return item.name === props.modelValue;
  });
});

const currentDom = computed(() => {
  return switchRefs.value && switchRefs.value[currentIndex.value];
});

// 计算活动指示器位置的函数
const updateRectStyle = async () => {
  await nextTick();
  
  if (!currentDom.value || !bodyRef.value) {
    rectStyle.value = {};
    return;
  }
  
  try {
    const bodyRect = bodyRef.value.getBoundingClientRect();
    const currentRect = currentDom.value.getBoundingClientRect();
    
    // 确保获取到有效的边界信息
    if (bodyRect.width === 0 || currentRect.width === 0) {
      rectStyle.value = {};
      return;
    }
    
    rectStyle.value = {
      top: "5px",
      left: currentRect.left - bodyRect.left + "px",
      bottom: "5px",
      right: bodyRect.right - currentRect.right + "px",
    };
  } catch (error) {
    console.warn('计算位置时出错:', error);
    rectStyle.value = {};
  }
};

// 监听当前选中项变化
watch([currentIndex, () => props.modelValue], updateRectStyle, { immediate: true });

// 组件挂载后初始化位置
onMounted(() => {
  updateRectStyle();
});

const getRectStyle = computed(() => rectStyle.value);
</script>

<template>
  <div class="switch-button">
    <div class="switch-button-body" ref="bodyRef">
      <div class="switch-button__active" :style="getRectStyle"></div>
      <div
        :ref="(el) => { if (el) switchRefs[index] = el }"
        :class="['switch-button__item', index === currentIndex && 'active']"
        :style="{ width: `${100 / optionItems.length}%` }"
        v-for="(item, index) in optionItems"
        :key="item.name || index"
        @click="clickTab(item)"
      >
        <div class="switch-button__item-title">{{ item.title || item.text }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.switch-button {
  padding: var(--ml-pd-base);
  cursor: pointer;
  user-select: none;

  .switch-button-body {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    background-color: #eee;
    border: 1px solid var(--ml-border-color);
    border-radius: var(--ml-radius-base);
    padding: var(--ml-pd-small);
    position: relative;

    .switch-button__item {
      padding: var(--ml-pd-small);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--ml-radius-base);
      position: relative;

      .switch-button__item-title {
        font-size: 14px;
        color: var(--ml-text-color-1);
        padding: var(--ml-pd-small);
        text-wrap: nowrap;
      }

      &.active {
        font-weight: bold;

        .switch-button__item-title {
          color: var(--ml-primary-color);
        }
      }
    }

    .switch-button__active {
      position: absolute;
      background-color: var(--ml-bg-color);
      border-radius: var(--ml-radius-base);
      box-shadow: var(--ml-shadow-small) var(--ml-shadow-small-inset);
      transition: var(--ml-transition-base);
    }
  }
}
</style>
