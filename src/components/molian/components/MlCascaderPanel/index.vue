<script setup lang="ts">
import { debounce } from "lodash-es";
interface CascaderOption {
  label: string;
  value: string | number;
  children?: CascaderOption[];
  disabled?: boolean;
}
defineOptions({
  name: "MlCascaderPanel",
});

const emit = defineEmits(["update:modelValue", "selected"]);

const props = defineProps({
  modelValue: {
    type: Array as PropType<(string | number)[]>,
    default: () => [],
  },
  options: {
    type: Array as PropType<CascaderOption[]>,
    default: () => [],
  },
  title: {
    type: String,
    default: "",
  },
  allowCustomInput: {
    type: Boolean,
    default: true,
  },
});

const emitUpdate = debounce((value) => {
  emit("update:modelValue", value);
}, 100);
// 建议在组件卸载时取消防抖：
onUnmounted(() => {
  emitUpdate.cancel();
});

const cacheValue = ref<(string | number)[]>([]);
const optionTreeArr = ref<CascaderOption[][]>([]);
/**
 * 设置值到缓存数组中，并更新绑定的model值
 * 此函数用于处理值的更新与管理，确保值能够在缓存数组中正确存储和检索
 *
 * @param value 任意类型的值，代表需要存储的数据
 * @param level 数值类型，代表存储值的层级或索引，默认为0
 */
const setValue = (value: any, level: number = 0) => {
  if (!Array.isArray(cacheValue.value)) {
    cacheValue.value = [];
  }
  // 根据当前level与缓存数组长度的关系，进行相应的操作
  if (cacheValue.value.length > level) {
    // 如果缓存数组的长度大于level，则截断数组至该level，并在该位置存储新值
    cacheValue.value.splice(level);
    cacheValue.value[level] = value;
  } else if (cacheValue.value.length < level) {
    // 如果缓存数组的长度小于level，则直接在该位置存储新值，扩展数组长度
    cacheValue.value[level] = value;
  } else {
    // 如果缓存数组的长度等于level，则将值追加到数组末尾
    cacheValue.value.push(value);
  }
  // 调用差值更新函数，计算当前缓存值与绑定模型值之间的差异索引
  let diffIndex = cmtdSplice(cacheValue.value, props.modelValue);
  // 根据差值更新选项树数组
  optionTreeArr.value.splice(diffIndex);
  // 发射更新事件，将缓存值更新到绑定的model值
  emit("selected", cacheValue.value);
  emitUpdate(cacheValue.value);
};

/**
 * 设置当前选中的值
 * 此函数用于更新多级缓存值，确保在指定层级上的值被正确更新
 * @param value 要设置的当前值，可以是任何类型
 * @param level 要更新的层级，默认为0，表示最外层
 */
const setCurrentedValue = (value: any, level: number = 0) => {
  if (!Array.isArray(cacheValue.value)) {
    cacheValue.value = [];
  }
  // 克隆缓存值，以避免直接修改原始值
  let currentArr: (string | number)[] = [...cacheValue.value];
  // 如果当前数组长度大于等于要更新的层级，则直接更新该层级的值
  if (currentArr.length > level) {
    currentArr.splice(level);
    currentArr[level] = value;
    // 如果当前数组长度小于要更新的层级，则直接在该层级插入值
  } else if (currentArr.length < level) {
    currentArr[level] = value;
    // 如果当前数组长度等于要更新的层级，则将值添加到数组末尾
  } else {
    currentArr.push(value);
  }
  // 更新缓存值
  setOptions(currentArr, cacheValue.value);
  cacheValue.value = currentArr;
  emit("selected", cacheValue.value);
};

/**
 * 计算新旧数组差异索引
 * @return 第一个不同元素的索引，若全部相同但长度不同返回较短数组长度，完全相同返回-1
 */
const cmtdSplice = (newValue: (string | number)[], oldValue: (string | number)[]) => {
  const minLength = Math.min(newValue.length, oldValue.length);
  for (let i = 0; i < minLength; i++) {
    if (newValue[i] !== oldValue[i]) {
      return i;
    }
  }
  return newValue.length !== oldValue.length ? minLength : -1;
};

/**
 * 更新选项树数组
 * @param newValue 新值数组
 * @param oldValue 旧值数组
 */
const setOptions = (
  newValue: (string | number)[] = [],
  oldValue: (string | number)[] = []
) => {
  if (!Array.isArray(newValue) || !Array.isArray(oldValue)) {
    console.warn("setOptions 接收到非数组参数");
    return;
  }

  const diffIndex = cmtdSplice(newValue, oldValue);
  if (diffIndex >= 0) {
    optionTreeArr.value.splice(diffIndex);
  }

  // 从差异点开始重建选项树
  for (let index = diffIndex >= 0 ? diffIndex : 0; index < newValue.length + 1; index++) {
    if (optionTreeArr.value.length === 0) {
      optionTreeArr.value.push(props.options);
    } else if (index === 0) {
      // 保持第一级选项不变
      continue;
    } else {
      const parentOptions = optionTreeArr.value[index - 1];
      if (!Array.isArray(parentOptions)) {
        optionTreeArr.value[index] = [];
        continue;
      }

      const lastOptions = parentOptions.find(
        (item: CascaderOption) => item.value === newValue[index - 1]
      );

      optionTreeArr.value[index] = lastOptions?.children?.length
        ? lastOptions.children
        : [];
    }
  }
};

watch(
  () => props.modelValue,
  (newValue, oldValue) => {
    setOptions(newValue, oldValue);
    cacheValue.value = newValue;
  },
  {
    deep: true,
    immediate: true,
  }
);
const handleCustomInput = (value: string, level: number) => {
  if (!value?.trim()) return;
  const newOptions = [...(optionTreeArr.value[level] || [])];
  const customOption = {
    label: value,
    value: value,
    isCustom: true,
  };
  newOptions.push(customOption);
  optionTreeArr.value[level] = newOptions;
  setValue(value, level);
};
/**
 * 检查指定层级之前的所有层级是否匹配
 */
const isAllPreviousMatch = (level: number) => {
  for (let i = 0; i < level; i++) {
    if (cacheValue.value[i] !== props.modelValue[i]) {
      return false;
    }
  }
  return true;
};
</script>

<template>
  <div class="ml-cascader-panel">
    <MlCascaderPanelItems
      :modelValue="modelValue[0]"
      @update:modelValue="setValue"
      @update:currented="setCurrentedValue"
      :options="options"
      :level="0"
      :allowCustomInput="allowCustomInput"
      @custom-input="handleCustomInput"
    />
    <template v-for="(item, index) in optionTreeArr" :key="index">
      <Transition name="cascader-slide" mode="out-in">
        <MlCascaderPanelItems
          v-if="index > 0 && item.length > 0"
          :modelValue="isAllPreviousMatch(index) ? modelValue[index] : undefined"
          @update:modelValue="setValue($event, index)"
          @update:currented="setCurrentedValue($event, index)"
          :options="item"
          :level="index"
          :allowCustomInput="allowCustomInput"
          @custom-input="handleCustomInput"
        />
      </Transition>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.ml-cascader-panel {
  display: flex;
  position: relative;
}

.cascader-slide-enter-active,
.cascader-slide-leave-active {
  transition: all 0.15s ease;
}

.cascader-slide-enter-from,
.cascader-slide-leave-to {
  transform: translateX(30px);
}

.cascader-slide-enter-to,
.cascader-slide-leave-from {
  transform: translateX(0);
}
</style>
