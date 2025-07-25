<script setup lang="ts">
import {
  inject,
  defineProps,
  defineExpose,
  defineOptions,
  defineEmits,
  watch,
} from "vue";
import { useSortable } from "@vueuse/integrations/useSortable.mjs";
import gsap from "gsap";
import { generateRandomString } from "@molian/utils/componentCore";
import Data2Input from "@molianComps/Data2Input/index.vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const customComps: any = inject("customComps");
const { customButton } = customComps;
defineOptions({
  name: "MlSubForm",
  slotsOption: {
    row: true,
    default: true,
  },
});
const props = defineProps({
  modelValue: {
    type: Array as () => any[],
    default: () => [],
  },
  columns: {
    type: Array as () => any[],
    default: () => {
      return [];
    },
  },
  isIndex: {
    type: Boolean,
    default: true,
  },
  isAdd: {
    type: Boolean,
    default: true,
  },
  isAppend: {
    type: Boolean,
    default: true,
  },
  isDelete: {
    type: Boolean,
    default: true,
  },
  isSortable: {
    type: Boolean,
    default: true,
  },
  maxHeight: {
    type: [Number, String],
  },
  height: {
    type: [Number, String],
  },
  formatColumns: {
    type: Function,
    default: (column: any, item: any) => {
      if (column.prop === "value") {
        return { ...column, type: item.type };
      } else {
        return column;
      }
    },
  },
});
const emit = defineEmits(["update:modelValue"]);
const formContent = useTemplateRef<HTMLElement>("formContent");
const formItem:any = useTemplateRef<HTMLElement>("formItem");
const data: any = ref<any[]>([]);

watch(
  () => props.modelValue,
  (newVal) => {
    data.value = newVal;
    data.value &&
      data.value.forEach((item: any) => {
        if (!item.$key) {
          item.$key = generateRandomString(3, "index_");
        }
      });
  },
  {
    immediate: true,
    deep: true,
  }
);

const updateValue = (value: any, item: any, column: any) => {
  item[column.prop] = value;
};
const setData = async () => {
  const defaultcolumns = props.columns.filter((fitem: any) => {
    return fitem.default;
  });
  const obj: {
    [key: string]: any;
  } = {};
  defaultcolumns.forEach((item: any) => {
    obj[item.prop] = item.default;
  });
  return obj;
};

const addNew = async () => {
  if (props.isAdd) {
    data.value.push(await setData());
    // 延迟滚动，等待动画开始后再滚动
    if (formContent.value) {
      setTimeout(() => {
        formContent.value?.scrollTo({
          top: formContent.value.scrollHeight,
          behavior: "smooth", // 平滑滚动
        });
      }, 100); // 减少延迟时间，使滚动与动画更协调
    }
  }
};

const appendRow = async (index: number) => {
  if (props.isAppend) {
    data.value.splice(index, 0, await setData());
    // 延迟滚动，等待动画开始后再滚动
    setTimeout(() => {
      formContent.value?.scrollTo({
        top:
          formItem.value?.length === index + 1
            ? formContent.value.scrollHeight
            : formItem.value[index].offsetTop - formContent.value.offsetTop,
        behavior: "smooth", // 平滑滚动
      });
    }, 100); // 减少延迟时间，使滚动与动画更协调
  }
};

const deleteRow = (index: number) => {
  if (props.isDelete) {
    data.value.splice(index, 1);
  }
};

const validate = () => {
  let btn = true;
  const requiredColumn = props.columns.filter((fitem: any) => {
    return !!fitem.required;
  });
  for (let index = 0; index < data.value.length; index++) {
    const item: any = data.value[index];
    requiredColumn.forEach((fitem: any) => {
      if (!item[fitem.prop]) {
        btn = false;
      }
    });
  }
  return btn;
};

function onBeforeEnter(el: any) {
  el.style.opacity = 0;
  el.style.height = 0;
}

function onEnter(el: any, done: any) {
  // 先将元素设为可见但不显示在流中
  el.style.opacity = 0;
  el.style.position = "absolute";
  el.style.visibility = "hidden";
  el.style.height = "auto";

  // 获取自然高度
  const height = el.offsetHeight;

  // 重置为初始动画状态
  el.style.position = "";
  el.style.visibility = "";
  el.style.height = "0";

  // 延迟一帧执行动画，确保DOM已更新
  requestAnimationFrame(() => {
    gsap.to(el, {
      opacity: 1,
      height: height + "px",
      duration: 0.5, // 增加动画时长
      ease: "power2.out", // 添加缓动函数，使动画更自然
      delay: el.dataset.index * 0.08, // 减小延迟时间，使连续添加更流畅
      onComplete: () => {
        // 动画完成后重置为auto以适应内容变化
        el.style.height = "auto";
        done();
      },
    });
  });
}

function onLeave(el: any, done: any) {
  // 先设置为固定高度以便动画
  el.style.height = el.offsetHeight + "px";

  gsap.to(el, {
    padding: 0,
    duration: 0.3, // 添加持续时间
    ease: "power1.in", // 添加缓动函数
  });
  gsap.to(el, {
    opacity: 0,
    height: 0,
    duration: 0.4, // 增加动画时长
    ease: "power2.inOut", // 添加缓动函数，使动画更自然
    onComplete: done,
  });
}

useSortable(formContent, data, {
  handle: ".handle",
  animation: 200,
  onStart: () => {
    // 开始拖动时禁用动画
    document.body.classList.add("dragging");
  },
  onEnd: () => {
    // 结束拖动时启用动画
    document.body.classList.remove("dragging");
  },
});

defineExpose({
  addNew,
  appendRow,
  deleteRow,
  data,
  validate,
});
</script>
<template>
  <div class="ml-sub-form-list">
    <div class="ml-sub-form-list__header">
      <div class="ml-sub-form-list__item index" v-if="isIndex">
        <div class="ml-sub-form-list__item-label">
          {{ t("options.index") }}
        </div>
      </div>
      <div class="ml-sub-form-list__item sort" v-if="isSortable">
        <div class="ml-sub-form-list__item-label">
          {{ t("options.sortable") }}
        </div>
      </div>
      <div class="ml-sub-form-list__item" v-for="column in columns" :key="column.prop">
        <div class="ml-sub-form-list__item-label">
          <span v-if="column.required" class="ml-sub-form-list__item-required"></span
          >{{ column.label || column.prop }}
        </div>
      </div>
      <div class="ml-sub-form-list__item" v-if="isDelete || isAppend">
        <div class="ml-sub-form-list__item-label">
          {{ t("options.operate") }}
        </div>
      </div>
    </div>
    <div
      ref="formContent"
      class="ml-sub-form-list__content"
      :style="{
        maxHeight: typeof maxHeight === 'number' ? maxHeight + 'px' : maxHeight,
        height: typeof height === 'number' ? height + 'px' : height,
      }"
    >
      <TransitionGroup
        :css="false"
        @before-enter="onBeforeEnter"
        @enter="onEnter"
        @leave="onLeave"
      >
        <template v-if="data && data.length > 0">
          <div
            class="ml-sub-form-list__item"
            ref="formItem"
            v-for="(item, index) in data"
            :key="item.$key"
          >
            <div class="ml-sub-form-list__item-label index" v-if="isIndex">
              {{ index + 1 }}
            </div>
            <div class="ml-sub-form-list__item-label sort" v-if="isSortable">
              <SvgIcon class="css-svg-icon handle" size="24" icon="drag"></SvgIcon>
            </div>
            <slot name="row" :row="item" :rowIndex="index">
              <div
                class="ml-sub-form-list__item-label"
                v-for="column in columns"
                :key="item.$key + '_' + column.prop"
              >
                <slot name="default" :row="item" :column="column">
                  <Data2Input
                    :modelValue="item[column.prop]"
                    @update:modelValue="updateValue($event, item, column)"
                    :propData="formatColumns(column, item)"
                  ></Data2Input>
                </slot>
              </div>
            </slot>
            <div class="ml-sub-form-list__item-label" v-if="isDelete || isAppend">
              <slot name="toolbar" :row="item" :rowIndex="index">
                <customButton
                  theme="primary"
                  :text="true"
                  size="small"
                  @click="appendRow(index)"
                  v-if="isAdd"
                  >{{ t("options.append") }}</customButton
                >
                <customButton
                  theme="primary"
                  :text="true"
                  size="small"
                  @click="deleteRow(index)"
                  v-if="isDelete"
                  >{{ t("options.remove") }}</customButton
                >
              </slot>
            </div>
          </div>
        </template>
      </TransitionGroup>
      <template v-if="data && data.length === 0">
        <div class="ml-sub-form-list__empty">
          <svg-icon icon="empty" size="108" />
          <div class="ml-sub-form-list__empty-text">{{ t("options.empty") }}</div>
        </div>
      </template>
    </div>
    <div class="ml-sub-form-list__footer" v-if="isAdd">
      <div class="ml-sub-form-list__footer-add">
        <customButton theme="primary" :text="true" @click="addNew">{{
          t("options.addNew")
        }}</customButton>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ml-sub-form-list {
  width: 100%;
  overflow-x: hidden;
  border-radius: var(--ml-radius-base);
  padding: var(--ml-mg-small);
  border: 1px solid var(--ml-fill-color-4);

  &__header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  &__content {
    display: flex;
    flex-direction: column;
    // justify-content: space-between;
    overflow: auto;
  }

  &__item {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: var(--ml-mg-base) 0;
    border-radius: var(--ml-radius-base);

    &-label {
      text-align: center;
      font-size: 14px;
      font-weight: bold;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      padding: 0 var(--ml-pd-base);

      .ml-sub-form-list__item-required::before {
        content: "*";
        color: var(--ml-color-danger);
        margin-right: 4px;
      }

      &.index {
        min-width: 68px;
        max-width: 68px;
        user-select: none;
      }

      &.sort {
        min-width: 68px;
        max-width: 68px;
      }
    }

    &.index {
      min-width: 68px;
      max-width: 68px;
    }

    &.sort {
      min-width: 68px;
      max-width: 68px;
    }

    &.content {
      padding: 0;
    }
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 32px 0;
    &-text {
      font-size: 14px;
      color: var(--ml-fill-color-2);
      user-select: none;
      letter-spacing: 6px;
    }
  }
}

.ml-sub-form-list__footer-add {
  padding-top: var(--ml-pd-small);
  border-top: 1px solid var(--ml-fill-color-4);
  text-align: center;
}

.css-svg-icon:hover {
  color: var(--ml-primary-color);
  cursor: all-scroll;
}
</style>
