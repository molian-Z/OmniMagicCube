<script setup lang="ts">
import { ref, computed, defineOptions, inject, defineProps, withDefaults } from "vue";
import { deepObjToArray } from "@molian/utils/util";
import svgIcon from "@molianComps/SvgIcon/index.vue";
import IconPicker from "@molianComps/IconPicker/index.vue";
import colorPicker from "@molianComps/ColorPicker/index.vue";
import codeInput from "@molianComps/MlCodeInput/index.vue";
import { globalAttrs } from "@molianComps/Designer/designerData";
const t: any = inject("mlLangs");
const message: any = inject("mlMessage");
const customComps: any = inject("customComps");
const {
  customInputNumber,
  customInput,
  customSwitch,
  customSelect,
} = customComps;
const props = withDefaults(
  defineProps<{
    modelValue: any;
    keyName: string | number | any;
    attrs:
      | {
          [key: string]: any;
        }
      | any;
    propData:
      | {
          [key: string]: any;
        }
      | any;
    selectedComp:
      | {
          [key: string]: any;
        }
      | any;
    isModifiers: boolean;
  }>(),
  {
    modelValue: "",
    keyName: "",
    attrs: {},
    propData: {},
    selectedComp: {},
    isModifiers: true,
  }
);
defineOptions({
  name: "AnyData2Form",
  slotsOption: {
    default: true,
  },
});
const emit = defineEmits(["update:modelValue"]);
const value = computed({
  get() {
    return (props.modelValue && props.modelValue.value) || null;
  },
  set(val) {
    emit("update:modelValue", {
      type: type.value,
      value: val,
    });
  },
});

const variableValue = computed({
  get() {
    return (!!value.value && value.value) || [];
  },
  set(val) {
    emit("update:modelValue", {
      type: type.value,
      value: val,
    });
  },
});

const getOptionItemI18n = (optionItems: any[]) => {
  return optionItems.map((item) => {
    let langStr = t(
      `attrs.${props.selectedComp.name}.${props.keyName}_optionItems.${item}`
    );
    if (!langStr || langStr === item) {
      langStr = t(`attrs.${props.keyName}_optionItems.${item}`);
    }
    return {
      label: langStr === item ? t("attrs." + item) : langStr,
      value: item,
    };
  });
};
const types = computed(() => {
  let currentType = [];
  if (Array.isArray(props.propData.type)) {
    currentType = props.propData.type.concat(["variable"]);
  } else {
    currentType = [props.propData.type, "variable"];
  }
  return currentType;
});
const currentTypeIndex = ref(0);

watch(() => props.modelValue, (newVal) => {
    if(newVal && types.value.indexOf(props.modelValue.type) > -1){
        currentTypeIndex.value = types.value.indexOf(props.modelValue.type)
    }
}, {
    immediate: true
})

const type = computed(() => {
  return types.value[currentTypeIndex.value];
});
const variableList = computed(() => {
  let variableList = [];
  if (globalAttrs.variable) {
    variableList = Object.keys(globalAttrs.variable).map((key) => {
      if (globalAttrs.variable) {
        const variableValue = globalAttrs.variable[key];
        if (variableValue.type === "object") {
          const currentObjValue: {
            label: string;
            value: string;
            children?: any;
          } = {
            label: globalAttrs.variable[key].label || key,
            value: key,
          };
          let children = [];
          try {
            children = deepObjToArray(variableValue.value);
          } catch (error) {
            message.error(currentObjValue.label + t("options.isNotJSONFormatData"));
          }
          if (children.length > 0) {
            currentObjValue.children = children;
          }
          return currentObjValue;
        } else {
          return {
            label: globalAttrs.variable[key].label || key,
            value: key,
          };
        }
      }
    });
  } else {
    return [];
  }
  return variableList;
});

const getI18n = (key: string | number, name: string) => {
  const langStr = t("attrs." + name + "." + key);
  return langStr === key ? t("attrs." + key) : langStr;
};

const tabType = () => {
  currentTypeIndex.value =
    types.value.length - 1 === currentTypeIndex.value ? 0 : currentTypeIndex.value + 1;
    value.value = null;
};

// 指令支持
</script>

<template>
  <div class="data2form-item">
    <div class="data2form-item__label">
      {{ getI18n(keyName, (selectedComp && selectedComp.name) || "") }}
    </div>
    <div class="data2form-item__input">
      <transition name="fade">
        <!-- <customCascader size="small" :options="variableList" :checkStrictly="true" :clearable="true"
                    v-model="variableValue" valueType="full" v-if="type === 'variable'" /> -->
        <VariablePicker
          size="small"
          clearable
          :placeholder="t('options.pleaseSelectVariable')"
          :options="variableList"
          v-model="variableValue"
          v-if="type === 'variable'"
        />
        <customSwitch size="small" v-model="value" v-else-if="type === 'boolean'" />
        <customSelect
          :options="getOptionItemI18n(propData.optionItems)"
          size="small"
          v-model="value"
          :clearable="true"
          v-else-if="propData.optionItems"
        />
        <customInputNumber size="small" v-model="value" v-else-if="type === 'number'">
        </customInputNumber>
        <icon-picker v-model="value" :size="28" v-else-if="type === 'icon'"></icon-picker>
        <colorPicker
          size="small"
          use-type="pure"
          v-model="value"
          v-else-if="type === 'color'"
        />
        <codeInput
          :isModifiers="isModifiers"
          :defaultData="propData"
          :mode="type"
          :keyName="keyName"
          v-model="value"
          v-else-if="['promise', 'function', 'object', 'array'].indexOf(type) > -1"
        />
        <customInput size="small" v-model="value" v-else></customInput>
      </transition>
    </div>
    <div :class="['data2form-item__icon']" @click="tabType">
      <svg-icon icon="switch" class="data2form-item__svg-icon" />
    </div>
  </div>
</template>
