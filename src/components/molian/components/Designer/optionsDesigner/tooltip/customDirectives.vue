<script setup lang="ts">
import { inject, computed, defineEmits, defineProps, watch, ref, nextTick } from "vue";
import { deepObjToArray } from "@molian/utils/util";
import { selectedComp, globalAttrs } from "../../designerData";
import codeInput from "@molianComps/MlCodeInput/index.vue";
import svgIcon from "@molianComps/SvgIcon/index.vue";
import { useI18n } from "vue-i18n";
import { useErrorHandler } from "../composables/useErrorHandler";
import type { ComponentDirective, VariableConfig } from "../types";

const { t } = useI18n();
const { withErrorHandling, error } = useErrorHandler();

const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  name: {
    type: String,
    default: "",
  },
  methods: {
    type: Array,
    default: () => ["string", "function", "variable"],
  },
});
const emit = defineEmits(["close"]);
const customComps: any = inject("customComps");
const {
  customCascaderPanel,
  customRadioGroup,
  customRadioButton,
  customInput,
} = customComps;
const message: any = inject("mlMessage");

/**
 * 计算属性：生成变量列表
 * 从全局属性中提取变量信息，生成用于级联选择器的数据结构
 */
const variableList = computed<VariableConfig[]>(() => {
  try {
    const variables = globalAttrs.variable || {};
    return Object.keys(variables).map((key) => {
      const variableValue = variables[key];

      if (variableValue.type === "object") {
        const currentObjValue: VariableConfig = {
          label: variableValue.label || key,
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
          label: variableValue.label || key,
          value: key,
        };
      }
    });
  } catch (error) {
    console.error('生成变量列表失败:', error);
    return [];
  }
});

const directives = computed({
  /**
   * 获取选中组件的文本指令值
   *
   * 本函数通过访问 selectedComp.value 的嵌套属性，安全地获取文本指令的值
   * 如果在任何层级上属性不存在，函数将返回 null，避免了访问未定义属性的风险
   *
   * @returns {string | null} 返回文本指令的值，如果不存在则返回 null
   */
  get() {
    return (
      (selectedComp.value &&
        selectedComp.value.directives &&
        selectedComp.value.directives[props.name] &&
        selectedComp.value.directives[props.name].value) ||
      null
    );
  },
  /**
   * 设置选中组件的文本指令
   *
   * 当传入的值为null时，移除文本指令；否则，将文本指令设置为传入的值
   * 如果选中组件不存在，则不执行任何操作
   *
   * @param {string | null} val - 要设置的文本指令的值，null表示移除文本指令
   */
  set(val) {
    // 如果没有选中的组件，则不进行任何操作
    if (!selectedComp.value) return;

    // 如果选中组件没有指令属性，则初始化其指令属性为空对象
    if (!selectedComp.value.directives) {
      selectedComp.value.directives = {};
    }
    // 根据传入值是否为null，分别处理移除文本指令和设置文本指令的情况
    if (val === null) {
      selectedComp.value.directives[props.name] = null;
    } else {
      selectedComp.value.directives[props.name] = val;
    }
  },
});

/**
 * 计算得到当前选中组件的指令类型
 *
 * 该计算属性用于获取当前选中组件（selectedComp）的指令类型
 * 如果选中组件存在，并且其具有指令属性（directives），且指令中包含自定义类型（props.name），
 * 则返回该自定义指令的类型（type）；如果上述条件不满足，则返回null
 */
const directiveType = computed(() => {
  return (
    (selectedComp.value &&
      selectedComp.value.directives &&
      selectedComp.value.directives[props.name] &&
      selectedComp.value.directives[props.name].type) ||
    null
  );
});

const switchTab = ref("string");

/**
 * 清除数据并关闭组件
 *
 * 本函数首先将directives的值设置为null，以清除其内容
 * 然后触发'close'事件，通知父组件或其他监听者关闭当前组件
 */
const clearData = () => {
  directives.value = null;
  emit("close");
};

/**
 * 修改值的函数
 *
 * 该函数旨在根据输入的值和路径值数组来更新指令的值
 * 它主要处理两种情况：当输入值是字符串且路径值数组有效时，或者在其他所有情况下
 *
 * @param {any} val - 要设置的值，可以是任何类型
 * @param {any} option - 未使用的参数，保留以备将来可能的使用
 * @param {any} pathValues - 路径值数组，包含一系列值对象
 */
const changeValue = function (val: any, option: any, pathValues: any) {
  // 检查val是否为字符串且pathValues是否为数组，以决定如何更新指令的值
  if (typeof val === "string" && Array.isArray(pathValues)) {
    // 当val是字符串且pathValues是数组时，将指令的值更新为变量类型，并将pathValues的值映射到新数组
    directives.value = {
      type: "variable",
      value: pathValues.map((item) => item.value),
    };
  } else {
    // 在所有其他情况下，将指令的值更新为val的值，作为变量类型处理
    directives.value = {
      type: "variable",
      value: val,
    };
  }
};

/**
 * 更新指令的值
 *
 * 此函数用于更新一个名为directives的响应式对象的值
 * 它接受一个字符串作为输入，并将其作为新值分配给指令对象
 * 这在需要动态更新界面元素属性时非常有用
 *
 * @param val - 一个字符串值，用于更新指令的对象值
 */
const changeInput = function (val: string) {
  directives.value = {
    type: "string",
    value: val,
  };
};

/**
 * 更新指令的值
 * 此函数用于动态更改指令配置，允许在运行时更新指令的行为
 *
 * @param {any} val - 指令的新值它可以是任意类型的数据，具体取决于指令的实现
 */
const changeCode = function (val: any) {
  directives.value = {
    type: "function",
    value: val,
  };
};

/**
 * 切换标签页的函数
 * 此函数的作用是重置指令值，以响应用户切换到不同的标签页
 * 参数:
 *   val: string - 表示新选中的标签页的值或标识
 */
const changeTab = function () {
  // 在切换标签页时，将指令值设置为null，以确保界面状态得到正确处理
  if (typeof directives.value === "string") {
    directives.value = "";
  }
  nextTick(() => {
    directives.value = null;
  });
};

watch(
  () => directiveType,
  (newType: any) => {
    // 当newVal的value和code都为null时，根据switchTab的值类型来决定其值
    if (newType.value === null) {
      switchTab.value = switchTab.value === "function" ? "function" : "variable";
    }
    // 当newType的value为"string"，且switchTab的值不为"string"时，将switchTab的值设为"string"
    else if (newType.value === "string" && switchTab.value !== "string") {
      switchTab.value = "string";
    }
    // 当newType的value为"variable"，且switchTab的值不为"variable"时，将switchTab的值设为"variable"
    else if (newType.value === "variable" && switchTab.value !== "variable") {
      switchTab.value = "variable";
    }
    // 当newType的value为"function"，且switchTab的值不为"function"时，将switchTab的值设为"function"
    else if (newType.value === "function" && switchTab.value !== "function") {
      switchTab.value = "function";
    }
  },
  {
    immediate: true, // 在watcher创建时立即执行回调函数
    deep: true
  }
);
</script>
<template>
  <div class="flex-container">
    <span class="sub-title">{{ title }}</span>
    <svgIcon class="svg-icon" icon="clear" @click="clearData"></svgIcon>
  </div>
  <div class="switch-tab">
    <customRadioGroup
      v-model="switchTab"
      variant="primary-filled"
      size="small"
      @change="changeTab"
      :disabled="!selectedComp"
    >
      <customRadioButton v-for="method in methods" :key="method" :value="method">{{
        t(`options.${method}`)
      }}</customRadioButton>
    </customRadioGroup>
  </div>
  <customInput
    size="small"
    :modelValue="directives"
    @update:modelValue="changeInput"
    :textarea="true"
    :disabled="!selectedComp"
    v-if="switchTab === 'string'"
  />
  <div style="text-align: center" v-else-if="switchTab === 'function'">
    <code-input
      isVariable
      mode="function"
      @update:modelValue="changeCode"
      :modelValue="directives"
    />
  </div>
  <customCascaderPanel
    size="small"
    :options="variableList"
    :checkStrictly="true"
    :clearable="true"
    valueType="full"
    :modelValue="directives"
    @update:modelValue="changeValue"
    v-else-if="switchTab === 'variable'"
  />
</template>

<style scoped lang="scss">
.flex-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 120px;
}

.switch-tab {
  text-align: center;
  margin-bottom: var(--ml-mg-small);
}

.svg-icon {
  cursor: pointer;
  transition: var(--ml-transition-base);
  padding: var(--ml-pd-small);
  margin-top: var(--ml-mg-small);
  width: 26px;
  height: 26px;
  border-radius: var(--ml-radius-base);

  &:hover {
    background-color: var(--ml-fill-color-5);
  }
}
</style>
