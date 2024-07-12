<script setup lang="ts">
import { defineOptions, defineProps, inject, defineModel, watch } from "vue";
defineOptions({
  name: "ActionDetail",
});
const t: any = inject("mlLangs");
const props = defineProps({
  index: {
    type: Number,
    default: -1,
  },
  modelValue: {
    type: Object,
    default: () => {},
  },
});
const cacheModelValue = ref<CubeData.GlobalAttrs["action"]>({
  key: "",
  index: -1,
  title: "",
  on: [],
  verify: [],
  run: [],
});
const customComps: any = inject("customComps");
const {
  customButton,
  customInput,
  customSelect,
  customRadioButton,
  customRadioGroup,
} = customComps;
const showInputTitle = ref(false);
const VModel: any = defineModel();
watch(
  () => props.modelValue,
  (newVal) => {
    const dataObj = JSON.parse(JSON.stringify(newVal));
    cacheModelValue.value = Object.assign(cacheModelValue.value, dataObj);
  },
  {
    immediate: true,
  }
);

const saveTitle = () => {
  VModel.value.title = cacheModelValue.value.title;
  showInputTitle.value = false;
};

const saveAction = () => {
  VModel.value = cacheModelValue.value;
};

// 监听开始事件列内容
const onColumns = ref([
  {
    prop: "bind",
    label: t("actions.bind"),
    required: true,
    default: "variable",
  },
  {
    prop: "component",
    label: t("actions.component"),
    required: true,
  },
  {
    prop: "data",
    label: t("actions.variable/event"),
    required: true,
  },
]);

// 验证流程
const verifyColumns = ref([
  {
    prop: "verify",
    label: t("actions.verifyVariable"),
    required: true,
    default: "variable",
  },
  {
    prop: "variable",
    label: t("actions.variable/attr"),
    required: true,
  },
  {
    prop: "op",
    label: t("actions.op"),
    required: true,
  },
  {
    prop: "data",
    label: t("actions.data"),
    required: true,
  },
]);

// 执行结果指令列内容
const runColumns = ref([
  {
    prop: "change",
    label: t("actions.change"),
    required: true,
    default: "variable",
  },
  {
    prop: "variable",
    label: t("actions.variable/attr"),
    required: true,
  },
  {
    prop: "op",
    label: t("actions.op"),
    required: true,
  },
  {
    prop: "data",
    label: t("actions.data"),
    required: true,
  },
]);
</script>

<template>
  <div class="action-detail">
    <div class="action-detail__header" @dblclick="showInputTitle = true">
      <div class="action-detail__header-title">
        <template v-if="!showInputTitle">{{ cacheModelValue.title }}</template>
        <customInput
          v-else
          v-model="cacheModelValue.title"
          @blur="saveTitle"
        ></customInput>
      </div>
      <div class="action-detail__header-toolbar">
        <customButton theme="primary" size="small" @click="saveAction">{{
          t("actions.save")
        }}</customButton>
      </div>
    </div>
    <div class="action-detail__container-desc">
      <div class="form-item-title">内容描述</div>
      <customInput v-model="cacheModelValue.desc" />
    </div>
    <div class="action-detail__container">
      <div class="action-detail__container-left">
        <sidebar-list></sidebar-list>
      </div>
      <div class="action-detail__container-content">
        <div class="action-detail__container-subTitle" v-if="false">
          注：当其中一项变动时都会激活验证流程
        </div>
        <sub-form :modelValue="modelValue.on" :columns="onColumns" v-if="false">
          <template #item="{ column, item }">
            <customRadioGroup
              size="small"
              v-model="item[column.prop]"
              variant="primary-filled"
              v-if="column.prop === 'bind'"
            >
              <customRadioButton value="variable">{{
                t("actions.variable")
              }}</customRadioButton>
              <customRadioButton value="event">{{
                t("actions.event")
              }}</customRadioButton>
            </customRadioGroup>
            <customSelect :options="[]" v-else-if="column.prop === 'component'" />
            <template v-else-if="column.prop === 'use'">
              <customSelect v-if="item.bind === 'variable'" :options="[]"></customSelect>
              <customSelect
                v-else-if="item.bind === 'event'"
                :options="[{ label: 123, value: 456 }]"
              ></customSelect>
            </template>
            <div v-else>{{ column }}</div>
          </template>
        </sub-form>

        <div class="action-detail__container-subTitle">
          注：当所有条件被满足时会通过验证
        </div>
        <sub-form :modelValue="cacheModelValue.verify" :columns="verifyColumns" height="220px">
          <template #item="{ column, item }">
            <customRadioGroup
              v-model="item[column.prop]"
              variant="primary-filled"
              v-if="column.prop === 'verify'"
            >
              <customRadioButton value="variable">{{
                t("actions.variable")
              }}</customRadioButton>
              <customRadioButton value="event">{{
                t("actions.event")
              }}</customRadioButton>
            </customRadioGroup>
            <customSelect :options="[]" v-else-if="column.prop === 'component'" />
            <template v-else-if="column.prop === 'use'">
              <customSelect v-if="item.bind === 'variable'" :options="[]"></customSelect>
              <customSelect
                v-else-if="item.bind === 'event'"
                :options="[{ label: 123, value: 456 }]"
              ></customSelect>
            </template>
            <div v-else>{{ item }}</div>
          </template>
        </sub-form>

        <div class="action-detail__container-subTitle">
          注：当验证流程通过时执行以下变更
        </div>
        <sub-form :modelValue="cacheModelValue.run" :columns="runColumns" height="220px">
          <template #item="{ column, item }">
            <customRadioGroup
              v-model="item[column.prop]"
              variant="primary-filled"
              v-if="column.prop === 'change'"
            >
              <customRadioButton value="variable">{{
                t("actions.variable")
              }}</customRadioButton>
              <customRadioButton value="event">{{
                t("actions.event")
              }}</customRadioButton>
            </customRadioGroup>
            <customSelect :options="[]" v-else-if="column.prop === 'component'" />
            <template v-else-if="column.prop === 'use'">
              <customSelect v-if="item.bind === 'variable'" :options="[]"></customSelect>
              <customSelect
                v-else-if="item.bind === 'event'"
                :options="[{ label: 123, value: 456 }]"
              ></customSelect>
            </template>
            <div v-else>{{ column }}</div>
          </template>
        </sub-form>
      </div>
      <div class="action-detail__container-right">
        <sidebar-list></sidebar-list>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.action-detail {
  &__header {
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    &-title {
      font-size: 16px;
      font-weight: bold;
      color: var(--ml-text-color-3);
    }
    &-toolbar {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      flex: 1;
      > *:not(:nth-last-child(1)) {
        margin-right: var(--ml-pd-base);
      }
    }
  }
  
  &__container {
    width: 800px;
    // padding: var(--ml-pd-lg);
    display: flex;

    &-subTitle {
      margin-top: var(--ml-mg-lg);
      margin-bottom: var(--ml-pd-base);
      font-size: 14px;
      font-weight: bold;
      color: var(--ml-fill-color);
    }

    &-desc{
        display: flex;
        align-items: center;
    }

    &-flex {
      display: flex;
      justify-content: space-between;
      > * {
        margin: 0 8px;
      }
    }

    &-left, &-right{
        margin-top: calc(var(--ml-mg-lg) + var(--ml-mg-lg) + var(--ml-mg-12));
    }

    &-content {
      overflow: auto;
      flex:1;
    }
  }
  .form-item-title {
      width: 70px;
      font-size: 14px;
      font-weight: 600;
      color: var(--ml-fill-color);
    }
}
</style>
