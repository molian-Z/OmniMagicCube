<script setup lang="ts">
import { ref, computed, defineOptions, inject } from "vue";
import { useCloned } from "@vueuse/core";
import { selectedComp, createComp } from "../../designerData";
import svgIcon from "@molianComps/SvgIcon/index.vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
defineOptions({
  name: "SlotComp",
});
const comps: any = inject("mlComps");
const customComps: any = inject("customComps");
const { customButton, customInput, customPopup } = customComps;

const tempSlot = ref("");
const showKeyName = ref("");
const slots: any = computed(() => {
  if (selectedComp.value) {
    return comps.value[selectedComp.value.name]?.slots;
  }
});
/**
 * 向选中的组件追加插槽
 *
 * 此函数用于处理组件插槽的添加当指定的插槽已存在时，会删除该插槽；
 * 如果插槽不存在，则会创建一个新的插槽并将其添加到选中组件的插槽列表中
 *
 * @param {string | number} key 插槽的键，可以是字符串或数字
 * @param {any} val 要添加到插槽的值，可以是任意类型
 * @returns {boolean} 如果插槽已存在并被删除，则返回false；否则返回true
 */
const appendSlot = function (key: string | number, val: any) {
  // 检查选中组件的插槽是否存在，如果存在，则删除该插槽
  if (selectedComp.value.slots && selectedComp.value.slots[key]) {
    delete selectedComp.value.slots[key];
    return false;
  }

  // 使用 useCloned 函数获取 val 的克隆状态
  const { cloned } = useCloned(val);

  // 根据克隆状态初始化插槽的 children 数组
  if (cloned.value === true || cloned.value === "auto") {
    cloned.value = {
      children: [],
    };
  } else {
    cloned.value.children = [];
  }

  // 将新的插槽添加到选中组件的插槽列表中，如果列表不存在，则创建一个新的插槽列表
  if (selectedComp.value.slots) {
    selectedComp.value.slots[key] = cloned.value;
  } else {
    selectedComp.value.slots = {
      [key]: cloned.value,
    };
  }
};

/**
 * 根据键值获取选定组件的插槽内容
 *
 * @param {any} key - 插槽的键值
 * @returns 返回对应键值的插槽内容，如果不存在则返回undefined
 */
const useComp = (key: any) => {
  // 检查选定组件是否存在，并且其slots属性中包含指定的键值
  return selectedComp.value && selectedComp.value.slots && selectedComp.value.slots[key];
};

/**
 * 检查给定的key对应的插槽是否存在并且有附加组件
 *
 * @param {string} key - 插槽的键值
 * @returns {boolean} - 如果插槽存在且有附加组件，则返回true；否则返回false
 */
const existSlot = (key: any) => {
  // 检查selectedComp是否存在且有name属性
  if (selectedComp.value && selectedComp.value.name) {
    // 根据selectedComp的name属性获取对应的组件配置，并尝试获取指定key的插槽对象
    const slotObj = slots.value[key];
    // 检查插槽对象是否存在、有appendComps属性且长度大于0
    return slotObj && slotObj.appendComps && slotObj.appendComps.length > 0;
  } else {
    // 如果selectedComp不存在或没有name属性，直接返回false
    return false;
  }
};

/**
 * 向选定组件的指定插槽中添加子组件
 *
 * @param {any} key - 插槽的键
 * @param {any} comp - 要添加的子组件的信息
 */
const appendChildComp = (key: any, comp: any) => {
  // 创建子组件实例
  let obj = createComp(comps.value[comp.name], comp);
  // 将创建的子组件实例添加到选定组件的对应插槽中
  selectedComp.value.slots[key].children.push(obj);
};

/**
 * 更新模型的值
 * 此函数用于根据传入的按钮状态来更新显示的键名
 * @param {any} key - 传入的键值，用于更新显示
 * @param {boolean} btn - 按钮状态，决定是否更新显示的键名
 */
const updateModelValue = (key: any, btn: boolean) => {
  // 当按钮状态为false时，清空显示的键名
  if (btn === false) {
    showKeyName.value = "";
  } else {
    // 否则，更新显示的键名为传入的键值
    showKeyName.value = key;
  }
};

/**
 * 根据给定的键获取国际化文本
 *
 * 此函数尝试从国际化对象中获取与给定键对应的文本如果给定的键在国际化对象中未找到，
 * 则返回原始键本身此函数有助于在应用程序中实现国际化和本地化
 *
 * @param {string | number} key - 要获取国际化文本的键
 * @returns {string} - 如果找到则返回国际化文本，否则返回原始键
 */
const getI18n = (key: string | number) => {
  // 构造国际化对象中的完整键路径
  const rootKey = `attrs.${key}`;
  // 检查构造的键是否存在于国际化对象中
  if (t(rootKey) === rootKey) {
    // 如果键不存在，则返回原始键
    return key;
  } else {
    // 如果键存在，则返回对应的国际化文本
    return t(rootKey);
  }
};
</script>
<template>
  <!-- 插槽列表，用于展示和操作组件的插槽 -->
  <div class="slots-list">
    <!-- 遍历组件的插槽，生成插槽项 -->
    <template v-for="(val, key) in slots" :key="key">
      <div class="slot-item">
        <!-- 插槽项的标题，包括图标和文本 -->
        <div class="slot-item__title">
          <svg-icon class="slot-item__icon" icon="appendSlot" />
          <span class="slot-item__text">{{ getI18n(key) }}</span>
        </div>
        <!-- 自定义弹窗，用于展示插槽内的子组件 -->
        <customPopup
          trigger="click"
          placement="bottom"
          :destroyOnClose="true"
          :disabled="!selectedComp"
          :visible="String(showKeyName) === String(key) && !!selectedComp"
          @update:visible="(btn:boolean)=>updateModelValue(key, btn)"
          v-if="existSlot(key)"
        >
          <customButton theme="primary" :text="true" :disabled="!useComp(key)">
            {{ t("options.appendComponent") }}
          </customButton>
          <!-- 弹窗内容，展示可添加到插槽的子组件列表 -->
          <template #content>
            <div>
              <div
                class="designer-slot__selected-item"
                v-for="comp in val.appendComps"
                :key="comp.name"
                @click="appendChildComp(key, comp)"
              >
                {{ comps[comp.name].title || comp.name }}
              </div>
            </div>
          </template>
        </customPopup>
        <!-- 按钮，用于添加或移除插槽 -->
        <customButton theme="primary" :text="true" @click="appendSlot(key, val)">
          {{ useComp(key) ? t("options.remove") : t("options.append") }}
        </customButton>
      </div>
    </template>
    <!-- 用于添加自定义插槽的输入框和按钮 -->
    <div class="slot-item">
      <div class="slot-item__title">
        <svg-icon class="slot-item__icon" icon="appendSlot" />
        <customInput class="slot-item__input" v-model="tempSlot" size="small" />
      </div>
      <!-- 添加或移除自定义插槽的按钮 -->
      <customButton theme="primary" :text="true" @click="appendSlot(tempSlot, true)">
        {{
          selectedComp && selectedComp.slots && selectedComp.slots[tempSlot] && true
            ? t("options.remove")
            : t("options.append")
        }}
      </customButton>
    </div>
  </div>
</template>
<style scoped lang="scss">
.slot-list {
  display: flex;
  width: 100%;
  height: 510px;
}
.slot-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--ml-pd-base) var(--ml-pd-lg);
  border-radius: var(--ml-radius-base);
  margin-bottom: var(--ml-mg-base);
  width: 100%;
  background-color: var(--ml-fill-color-blank);
  border: 1px solid var(--ml-border-color-light);
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--ml-fill-color-4);
    border-color: var(--ml-border-color);
  }

  .slot-item__title {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex: 1;
    overflow: hidden;

    .slot-item__icon {
      min-width: 20px;
      height: 20px;
      margin-right: var(--ml-mg-base);
      color: var(--ml-primary-color);
    }

    .slot-item__text {
      font-size: 14px;
      font-weight: 500;
      color: var(--ml-text-color-1);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .slot-item__input {
      width: 110px;
      margin-left: var(--ml-mg-small);
    }
  }
  
  .el-button, .ant-btn, .tiny-button {
    margin-left: var(--ml-mg-base);
  }
}

.slots-list {
  margin: var(--ml-pd-base);
  padding: 0;
  border-radius: var(--ml-radius-base);
}

.designer-slot__selected-item {
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateX(2px);
  }
}
</style>
