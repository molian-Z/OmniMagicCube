<script setup lang="ts">
import { defineOptions, inject } from "vue";
import { hoverComp } from "../../draggable";
import { useI18n } from "vue-i18n";
import { watchDebounced } from "@vueuse/core";
const { t } = useI18n();
defineOptions({
  name: "basicComp",
});
const customComps: any = inject("customComps");
const { customInput } = customComps;
const comps:any = inject('mlComps')

/**
 * 计算属性用于获取和设置悬浮元素的副标题
 * 它根据悬浮元素的存在及其属性来决定显示的副标题
 */
const hoverSubTitle = computed({
  /**
   * 获取副标题
   * 优先使用悬浮元素直接关联的副标题，如果未定义，则尝试从指令中获取
   * @returns {string} 悬浮元素的副标题或指令中定义的文本值，如果没有找到则返回空字符串
   */
  get() {
    // 检查悬浮元素是否存在及其副标题属性
    if (hoverComp.value && (hoverComp.value.subTitle || hoverComp.value.subTitle === "")) {
        return hoverComp.value.subTitle;
    }
    // 如果悬浮元素存在且包含特定指令，则使用指令中定义的文本值作为副标题
    if (
      hoverComp.value &&
      hoverComp.value.directives &&
      hoverComp.value.directives.text &&
      hoverComp.value.directives.text.type === "string" &&
      !!hoverComp.value.directives.text.value
    ) {
      return hoverComp.value.directives.text.value;
    }
    // 如果以上条件都不满足，返回空字符串
    return "";
  },
  /**
   * 设置副标题
   * 直接在悬浮元素上设置副标题属性
   * @param {string} val 要设置的副标题值
   */
  set(val) {
    hoverComp.value.subTitle = val;
  },
});

/**
 * 监听hoverSubTitle值的变化，当值变化时，更新相关组件的属性值
 * 此处使用了防抖技术，当hoverSubTitle在指定时间内（500毫秒）多次变化时，只触发一次回调函数
 * 这样做是为了避免在用户频繁悬停或快速浏览时，频繁地执行后续的更新操作，从而提高性能
 * 
 * @param {string} hoverSubTitle - 悬停子标题的值，这是防抖动监听的目标值
 * @param {function} callback - 当hoverSubTitle值变化时执行的回调函数
 * @param {object} options - 配置对象，定义了防抖动的时间间隔
 * @param {number} options.debounce - 防抖动的时间间隔，单位为毫秒
 */
watchDebounced(hoverSubTitle, (val) => {
    // 检查是否有组件正在悬停，如果没有，则直接返回false，终止后续操作
    if(!hoverComp.value) return false

    // 获取当前悬停组件的属性集合，如果不存在，则props为undefined
    const props = comps.value[hoverComp.value.name]?.props

    // 如果当前悬停组件有属性集合，则遍历这些属性
    if(props) {
        Object.keys(props).forEach(key => {
            // 检查当前属性是否有绑定自定义文本的需求
            if(props[key].bindSubTitle) {
                // 如果悬停组件的属性中包含当前遍历到的属性，则更新其值为hoverSubTitle的值
                if(hoverComp.value.attrs[key]) {
                    hoverComp.value.attrs[key].value = val
                }
            }
        })
    }
}, {
    debounce: 500,
})

</script>
<template>
  <div class="basic-list">
    <template v-if="hoverComp">
      <div class="data2form-item">
        <div class="data2form-item__label">{{ t("options.id") }}</div>
        <div class="data2form-item__input">
          <customInput size="small" v-model="hoverComp.id" />
        </div>
        <div style="width: 24px"></div>
      </div>
      <div class="data2form-item">
        <div class="data2form-item__label">{{ t("options.key") }}</div>
        <div class="data2form-item__input">
          <customInput size="small" v-model="hoverComp.key" />
        </div>
        <div style="width: 24px"></div>
      </div>
      <div class="data2form-item">
        <div class="data2form-item__label">{{ t("options.subTitle") }}</div>
        <div class="data2form-item__input">
          <customInput size="small" v-model="hoverSubTitle" />
        </div>
        <div style="width: 24px"></div>
      </div>
      <div class="data2form-item">
        <div class="data2form-item__label">{{ t("options.currentComponent") }}</div>
        <div class="data2form-item__input">
          <customInput size="small" readonly v-model="hoverComp.name" />
        </div>
        <div style="width: 24px"></div>
      </div>
    </template>
  </div>
</template>
