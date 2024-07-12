<script setup lang="ts">
import {
  inject,
  defineProps,
  defineEmits,
  defineExpose,
  withDefaults,
  defineOptions,
  defineModel,
  watch,
} from "vue";
import gsap from "gsap";
import { generateRandomString } from "@molianComps/Designer/designerData";
const t: any = inject("mlLangs");
const customComps: any = inject("customComps");
const { customButton } = customComps;
defineOptions({
  name: "SubForm",
});
const props = withDefaults(
  defineProps<{
    modelValue: any;
    columns: any;
    isAdd: boolean;
    isAppend: boolean;
    isDelete: boolean;
    maxHeight: number | string;
    height: number | string;
  }>(),
  {
    modelValue: [],
    columns: [],
    isAdd: true,
    isAppend: true,
    isDelete: true,
    maxHeight: "auto",
    height: "auto",
  }
);
const formContent = ref();
const formItem = ref();
const emit = defineEmits(["update:modelValue"]);
const data: any = defineModel();
watch(
  () => data.value,
  (newVal) => {
    newVal.forEach((item: any) => {
      if (!item.$key) {
        item.$key = generateRandomString(8);
      }
    });
  },
  {
    immediate: true,
    deep: true,
  }
);
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
    padding: "8px",
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
        <template v-for="(item, index) in data" :key="item.$key" v-if="data.length > 0">
          <div class="ml-sub-form-list__item" ref="formItem">
            <div
              class="ml-sub-form-list__item-label"
              v-for="column in columns"
              :key="column.prop"
            >
              <slot
                name="item"
                :column="column"
                :item="item"
                :columns="columns"
                :index="index"
              >
                {{ item[column.prop] }}
              </slot>
            </div>
            <div class="ml-sub-form-list__item-label">
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
            </div>
          </div>
        </template>
      </TransitionGroup>
      <template v-if="data.length === 0">
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
    padding: var(--ml-mg-base);
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
</style>
