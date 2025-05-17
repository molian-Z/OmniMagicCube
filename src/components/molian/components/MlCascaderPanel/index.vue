<script setup lang="ts">
import { defineOptions, defineProps } from "vue";
defineOptions({
  name: "MlCascaderPanel",
});

const emit = defineEmits(["update:modelValue", "selected"]);

const props = defineProps({
  modelValue: {
    type: Array as any,
    default: () => [],
  },
  options: {
    type: Array as any,
    default: () => [],
  },
  title: {
    type: String,
    default: "",
  },
});

const cacheValue = ref<any>();

const optionTreeArr = ref<any>([]);
/**
 * 设置值到缓存数组中，并更新绑定的model值
 * 此函数用于处理值的更新与管理，确保值能够在缓存数组中正确存储和检索
 *
 * @param value 任意类型的值，代表需要存储的数据
 * @param level 数值类型，代表存储值的层级或索引，默认为0
 */
const setValue = (value: any, level: number = 0) => {
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
  emit("update:modelValue", cacheValue.value);
};

/**
 * 设置当前选中的值
 * 此函数用于更新多级缓存值，确保在指定层级上的值被正确更新
 * @param value 要设置的当前值，可以是任何类型
 * @param level 要更新的层级，默认为0，表示最外层
 */
const setCurrentedValue = (value: any, level: number = 0) => {
  // 克隆缓存值，以避免直接修改原始值
  let currentArr: any = [].concat(cacheValue.value);

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

const cmtdSplice = (newValue: string | any[], oldValue: any[]) => {
  // 比对新旧数据重新拆解拼接optionTreeArr数组
  let diffIndex = 0;
  for (let i = 0; i < newValue.length; i++) {
    if (newValue[i] !== oldValue[i]) {
      diffIndex = i;
      break;
    }
  }
  return diffIndex;
};

/**
 * 更新选项树数组根据新旧值的差异
 *
 * @param newValue 新的选项值数组
 * @param oldValue 旧的选项值数组
 */
const setOptions = (newValue: any = [], oldValue: any = []) => {
  // 计算新旧值之间的差异索引
  let diffIndex = cmtdSplice(newValue, oldValue);
  // 根据差异索引裁剪选项树数组
  optionTreeArr.value.splice(diffIndex);
  // 遍历新值，更新选项树数组
  for (let index = diffIndex; index < newValue.length + 1; index++) {
    // 当选项树数组为空时，初始化为根选项
    if (optionTreeArr.value.length === 0) {
      optionTreeArr.value.push(props.options);
    } else {
      // 查找前一个选项，并根据其值查找对应的孩子选项
      const lastOptions = optionTreeArr.value[index - 1].find(
        (item: any) => item.value === newValue[index - 1]
      );
      // 如果找到的选项有孩子且孩子选项不为空，则将其作为当前选项
      if (!!lastOptions && !!lastOptions.children && lastOptions.children.length > 0) {
        optionTreeArr.value[index] = lastOptions.children;
      } else {
        // 如果没有孩子选项，则在当前索引处放入空数组
        optionTreeArr.value[index] = [];
      }
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
</script>

<template>
  <div class="ml-cascader-panel" :class="[!!isPicker && 'shadow']">
    <MlCascaderPanelItems
      :modelValue="modelValue[0]"
      @update:modelValue="setValue"
      @update:currented="setCurrentedValue"
      :options="options"
      :level="0"
    />
    <template v-for="(item, index) in optionTreeArr" :key="index">
      <!-- <transition name="slide-left"> -->
        <MlCascaderPanelItems
          :modelValue="modelValue[index]"
          @update:modelValue="setValue($event, index)"
          @update:currented="setCurrentedValue($event, index)"
          :options="item"
          :level="index"
          v-if="index > 0 && item.length > 0"
        />
      <!-- </transition> -->
    </template>
  </div>
</template>

<style lang="scss" scoped>
.ml-cascader-panel {
  display: flex;
}
</style>
