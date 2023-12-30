<script setup>
import { ref, inject, defineProps, defineEmits, defineExpose } from 'vue'
import { useVModel } from '@vueuse/core'
const t = inject('mlLangs')
const customComps = inject('customComps')
const { customButton } = customComps
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Array,
    default: () => []
  },
  isAdd: {
    type: Boolean,
    default: true
  },
  isAppend: {
    type: Boolean,
    default: true
  },
  isDelete: {
    type: Boolean,
    default: true
  }
})
const emit = defineEmits(['update:modelValue'])
const data = useVModel(props, 'modelValue', emit)

const setData = () => {
  const defaultcolumns = props.columns.filter(fitem => {
    return fitem.default
  })
  const obj = {}
  defaultcolumns.forEach(item => {
    obj[item.prop] = item.default
  })
  return obj
}

const addNew = () => {
  if (props.isAdd) {
    data.value.push(setData())
  }
}

const appendRow = (index) => {
  if (props.isAppend) {
    data.value.splice(index, 0, setData())
  }
}

const deleteRow = (index) => {
  if (props.isDelete) {
    data.value.splice(index, 1)
  }
}

const validate = () => {
  let btn = true
  const requiredColumn = props.columns.filter(fitem => {
    return !!fitem.required
  })
  for (let index = 0; index < data.value.length; index++) {
    const item = data.value[index];
    requiredColumn.forEach(fitem => {
      if (!item[fitem.prop]) {
        btn = false
      }
    })
  }
  return btn
}

defineExpose({
  addNew,
  appendRow,
  deleteRow,
  data,
  validate
})
</script>
<template>
  <div class="ml-sub-form-list">
    <div class="ml-sub-form-list__header">
      <div class="ml-sub-form-list__item" v-for="column in columns" :key="column.prop">
        <div class="ml-sub-form-list__item-label"><span v-if="column.required"
            class="ml-sub-form-list__item-required"></span>{{ column.label || column.prop }}</div>
      </div>
      <div class="ml-sub-form-list__item">
        <div class="ml-sub-form-list__item-label">
          {{ t('options.operate') }}
        </div>
      </div>
    </div>
    <div class="ml-sub-form-list__content">
      <template v-for="(item, index) in data" :key="index">
        <div class="ml-sub-form-list__item">
          <div class="ml-sub-form-list__item-label" v-for="column in columns" :key="column.prop">
            <slot name="item" :column="column" :item="item" :columns="columns" :index="index">
              {{ item[column.prop] }}
            </slot>
          </div>
          <div class="ml-sub-form-list__item-label">
            <customButton theme="primary" :text="true" size="small" @click="appendRow(index)" v-if="isAdd">{{
              t('options.append') }}</customButton>
            <customButton theme="primary" :text="true" size="small" @click="deleteRow(index)" v-if="isDelete">{{
              t('options.remove') }}</customButton>
          </div>
        </div>
      </template>
    </div>
    <div class="ml-sub-form-list__footer">
      <div class="ml-sub-form-list__footer-add">
        <customButton theme="primary" :text="true" @click="addNew" v-if="isAdd">{{ t('options.addNew') }}</customButton>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ml-sub-form-list {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: var(--ml-radius-base);
  padding: var(--ml-mg-small);
  border: 1px solid var(--ml-fill-color-4);

  .ml-sub-form-list__header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .ml-sub-form-list__content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .ml-sub-form-list__item {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 100%;
    padding: var(--ml-mg-base);
    border-radius: var(--ml-radius-base);

    .ml-sub-form-list__item-label {
      text-align: center;
      font-size: 14px;
      font-weight: bold;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;

      .ml-sub-form-list__item-required::before {
        content: "*";
        color: var(--el-color-danger);
        margin-right: 4px;
      }
    }
  }
}

.ml-sub-form-list__footer-add {
  padding: 12px 0 8px 0;
  border-top: 1px solid var(--ml-fill-color-4);
  text-align: center;
}
</style>