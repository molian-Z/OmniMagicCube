<script setup lang="ts">
import {
  inject,
  defineProps,
  defineExpose,
  defineOptions,
  defineEmits,
  watch,
} from "vue";
import { useSortable, moveArrayElement } from "@vueuse/integrations/useSortable";
import gsap from "gsap";
import { generateRandomString } from "@molianComps/Designer/designerData";
import Data2Input from "@molianComps/Data2Input/index.vue";
const t: any = inject("mlLangs");
const customComps: any = inject("customComps");
const { customButton } = customComps;
defineOptions({
  name: "MlSubForm",
  slotsOption: {
    row: true,
    // default: true
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
      return [
        {
          prop: "name",
          label: "变量名",
          type: "string",
          required: true,
        },
        {
          prop: "label",
          label: "文本名",
          type: "string",
          default: null,
        },
        {
          prop: "type",
          label: "数据格式",
          type: "string",
          default: "string",
          required: true,
          optionItems: [
            {
              label: "string",
              value: "string",
            },
            {
              label: "number",
              value: "number",
            },
            {
              label: "boolean",
              value: "boolean",
            },
            {
              label: "array",
              value: "array",
            },
            {
              label: "object",
              value: "object",
            },
            {
              label: "function",
              value: "function",
            },
            {
              label: "computed",
              value: "computed",
            },
          ],
        },
        {
          prop: "value",
          label: "数据值",
          default: null,
        },
      ];
    },
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
const formContent = ref();
const formItem = ref();
const data: any = ref<any[]>([]);

watch(
  () => props.modelValue,
  (newVal) => {
    data.value = newVal;
    data.value &&
      data.value.forEach((item: any) => {
        if (!item.$key) {
          item.$key = generateRandomString(3, 'index_');
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
    setTimeout(() => {
      formContent.value.scrollTo({
        top: formContent.value.scrollHeight,
        behavior: "smooth", // 平滑滚动
      });
    }, 200);
  }
};

const appendRow = async (index: number) => {
  if (props.isAppend) {
    data.value.splice(index, 0, await setData());
    setTimeout(() => {
      formContent.value.scrollTo({
        top:
          formItem.value.length === index + 1
            ? formContent.value.scrollHeight
            : formItem.value[index].offsetTop - formContent.value.offsetTop,
        behavior: "smooth", // 平滑滚动
      });
    }, 200);
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
  gsap.to(el, {
    opacity: 1,
    height: "100%",
    delay: el.dataset.index * 0.45,
  });
  gsap.to(el, {
    padding: "0px",
    onComplete: done,
  });
}

function onLeave(el: any, done: any) {
  gsap.to(el, {
    padding: 0,
  });
  gsap.to(el, {
    opacity: 0,
    height: 0,
    onComplete: done,
  });
}

useSortable(formContent, data, {
  handle: ".handle",
  animation: 300,
  onUpdate: (e: any) => {
    moveArrayElement(data.value, e.oldIndex, e.newIndex);
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
      <div class="ml-sub-form-list__item index">
        <div class="ml-sub-form-list__item-label">
          {{ t("options.index") }}
        </div>
      </div>
      <div class="ml-sub-form-list__item sort">
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
      <div class="ml-sub-form-list__item">
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
            <div class="ml-sub-form-list__item-label index">
              {{ index + 1 }}
            </div>
            <div class="ml-sub-form-list__item-label sort">
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
            <div class="ml-sub-form-list__item-label">
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
