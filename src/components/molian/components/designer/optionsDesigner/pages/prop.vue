<script setup lang="ts">
import { computed, defineOptions, inject } from "vue";
import anyData2Form from "@molianComps/AnyData2Form/index.vue";
import { selectedComp } from "../../designerData";

defineOptions({
  name: "propComp",
});
const comps: any = inject("mlComps");

const currentAttrs: any = computed(() => {
  if (!selectedComp.value) return {};
  return selectedComp.value.attrs;
});

const currentEmits = computed(() => {
  if (!selectedComp.value) return {};
  
  // 检查组件是否存在及其emits属性
  const component = comps.value[selectedComp.value.name];
  if (!component || !component.emits) {
    // console.warn(`组件 ${selectedComp.value.name} 不存在或未定义emits`);
    return [];
  }

  return component.emits
    .filter((item: any) => {
      return item.indexOf("update:") === 0;
    })
    .map((item: any) => {
      return {
        prop: item.replace("update:", ""),
        emit: item,
      };
    });
});

const currentProps = computed(() => {
  if (!selectedComp.value) return {};
  const objData = {
    ...comps.value[selectedComp.value.name] && comps.value[selectedComp.value.name].props || {}
  }
  currentEmits.value.forEach((item: any) => {
    delete objData[item.prop];
  });
  Object.keys(objData).forEach((key) => {
    const val = objData[key];
    if (val && val.hidden) {
        if((typeof val.hidden === 'function' && val.hidden(currentAttrs.value)) || (typeof val.hidden === 'boolean' && val.hidden)) {
            delete objData[key];
        }
    }
    if(isRemoveAttr(key)) {
        delete objData[key];
    }
  });
  return sortObjectByKeys(objData)
});

function sortObjectByKeys(obj:any) {
  // 获取对象键的数组并排序
  const sortedKeys = Object.keys(obj).sort((a,b) => {
    if(obj[a].order === undefined) {
        obj[a].order = 100
    }
    if(obj[b].order === undefined) {
        obj[b].order = 100
    }
    return obj[a].order - obj[b].order;
  });
  // 创建一个新的对象，按照排序后的键顺序添加属性
  const sortedObj:any = {};
  sortedKeys.forEach(key => {
    sortedObj[key] = obj[key];
  });
  return sortedObj;
}

/**
 * 更新组件属性和事件处理函数
 * 此函数用于根据提供的项和值更新当前组件的属性以及可能的事件处理函数
 * 它主要关注于处理变量类型的值，并据此更新组件的属性和事件处理逻辑
 *
 * @param {any} item - 包含要更新的属性信息的对象，包括属性名(prop)和事件名(emit)
 * @param {any} value - 要更新的新值，可能是一个变量类型对象，包含值(value)和类型(type)
 */
const updateAttrs = (item: any, value: any) => {
  // 检查值的类型是否为变量
  if (value.type === "variable") {
    // 如果变量的值未定义，则在当前属性和选定组件的事件中移除相应的项
    if (value.value == undefined) {
      currentAttrs.value[item.prop] = undefined;
      selectedComp.value.on[item.emit] = undefined;
    } else {
      // 如果变量的值已定义，则更新当前属性
      currentAttrs.value[item.prop] = value;
      // 如果选定的组件和变量的值存在，并且变量的值可以被连接成一个有效的路径
      if (!!selectedComp.value && !!value.value.join(".")) {
        // 更新组件的事件处理函数，使其能够通过变量路径访问值
        selectedComp.value.on[item.emit] = {
          type: "function",
          value: {
            // 生成代码字符串，用于在事件处理函数中更新变量的值
            code: `this.vars.${value.value.join(".")} = value;`,
            codeVar: ["value"],
            functionMode: "function",
            modifiers: [],
          },
        };
      }
    }
  } else {
    // 如果值的类型不是变量，则直接更新当前属性
    currentAttrs.value[item.prop] = value;
  }
};

/**
 * 根据属性名称获取选中组件的对应属性值
 *
 * @param keyName 属性名称，用于获取组件的具体属性值
 * @returns 如果选中组件存在，则返回对应属性值；否则返回undefined
 */
const getProp = (keyName: string) => {
  if (!!selectedComp.value) {
    return comps.value[selectedComp.value.name].props[keyName];
  }
};

/**
 * 判断给定的键名是否应该移除属性
 *
 * 此函数用于检查当前选中的组件是否需要移除特定属性它通过检查属性是否存在`removeAttr`标志来决定
 *
 * @param {any} keyName - 要检查的属性名
 * @returns {boolean} - 如果当前选中的组件存在且该属性应被移除，则返回true；否则返回false
 */
const isRemoveAttr = (keyName: any) => {
  // 检查当前是否有选中的组件，若没有则直接返回false
  if (!!selectedComp.value) {
    // 如果存在选中的组件，则进一步检查指定属性名是否具有`removeAttr`标志
    return !!getProp(keyName).removeAttr;
  }
};
</script>
<template>
  <div class="basic-list">
    <template v-if="selectedComp">
      <template v-for="item in currentEmits" :key="item.prop">
        <anyData2Form
          :selectedComp="selectedComp"
          :modelValue="currentAttrs[item.prop]"
          @update:modelValue="(value) => updateAttrs(item, value)"
          :propData="getProp(item.prop)"
          :keyName="item.prop"
        />
      </template>
      <template v-for="(val, key) in currentProps" :key="key">
          <anyData2Form
            :selectedComp="selectedComp"
            v-model="currentAttrs[key]"
            :propData="val"
            :keyName="key"
          />
      </template>
    </template>
  </div>
</template>
