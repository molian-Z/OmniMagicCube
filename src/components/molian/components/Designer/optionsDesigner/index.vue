<script setup lang="ts">
import { ref, inject, computed } from "vue";
import { optionsPanel, globalMenu, selectedComp, currentEmits } from "../designerData";
import { setting } from "@molian/utils/defaultData";
import svgIcon from "@molianComps/SvgIcon/index.vue";
import floatPanel from "@molianComps/FloatPanel/index.vue";
import { useI18n } from "vue-i18n";
import MlAnimate from "@molianComps/AnimateHeight/index.vue";
import { usePerformance } from "./composables/usePerformance";
import type { ToolbarItem, PageDataItem, MenuItem } from "./types";

import basicComp from "./pages/basic.vue";
import parentPropComp from './pages/parentProp.vue';
import propComp from "./pages/prop.vue";
import moreProp from "./pages/moreProp.vue";
import slotComp from "./pages/slot.vue";
import nativeOnComp from "./pages/nativeOn.vue";
import jsComp from "./pages/javascript.vue";
import lifecycleComp from "./pages/lifecycle.vue";
import variable from "./tooltip/variable.vue";
import vuefor from "./tooltip/for.vue";
import CustomDirectives from "./tooltip/customDirectives.vue";
import animationComp from "./pages/animation.vue";

const { t } = useI18n();
const customComps: any = inject("customComps");
const { customTooltip, customPopup } = customComps;

const currentTab = ref("prop");

// 配置数据
const tabMenus = ref<MenuItem[]>([
  { name: "prop", text: t("options.properties"), icon: "" },
  { name: "slot", text: t("options.slot"), icon: "" },
  { name: "on", text: t("options.js"), icon: "" },
  { name: "animate", text: t("options.animation"), icon: "" },
  { name: "global", text: t("options.lifecycle"), icon: "" },
]);

const menus = ref<MenuItem[]>([
  { icon: "basic", text: t("options.basic"), name: "basic" },
  { icon: "properties", text: t("options.properties"), name: "prop" },
  { icon: "insert", text: t("options.slot"), name: "slot" },
  { icon: "js", text: t("options.js"), name: "javascript" },
  { icon: "nativeOn", text: t("options.nativeOn"), name: "nativeOn" },
  { icon: "lifecycle", text: t("options.lifecycle"), name: "lifecycle" },
  { icon: "animation", text: t("options.animation"), name: "animation" },
]);

const toolbarData = ref<ToolbarItem[]>([
  {
    label: t("options.for"),
    value: "for",
    icon: "for",
    show: false,
    component: vuefor,
  },
  {
    label: t("options.if"),
    value: "if",
    icon: "if",
    show: false,
    component: CustomDirectives,
    methods: ["function", "variable"],
  },
  {
    label: t("options.show"),
    value: "show",
    icon: "show",
    show: false,
    component: CustomDirectives,
    methods: ["function", "variable"],
  },
  {
    label: t("options.text"),
    value: "text",
    icon: "text",
    show: false,
    component: CustomDirectives,
    methods: ["string", "function", "variable"],
  },
]);

const pageData = ref<PageDataItem[]>([
  {
    component: basicComp,
    value: "basic",
    text: t("options.basic"),
    group: ["prop", "slot", "on", "animate", "global"],
  },
  {
    component: parentPropComp,
    value: "parentProp",
    text: t("options.parentProperties"),
    group: ["prop"],
  },
  {
    component: propComp,
    value: "prop",
    text: t("options.properties"),
    group: ["prop"],
  },
  {
    component: moreProp,
    value: "moreProp",
    text: t("options.moreProperties"),
    group: ["prop"],
  },
  {
    component: slotComp,
    value: "slot",
    text: t("options.slot"),
    group: ["slot"],
  },
  {
    component: jsComp,
    value: "js",
    text: t("options.js"),
    show: computed(() => currentEmits?.value?.length > 0),
    group: ["on"],
  },
  {
    component: nativeOnComp,
    value: "nativeOn",
    text: t("options.nativeOn"),
    show: computed(() => !!selectedComp?.value),
    group: ["on"],
  },
  {
    component: lifecycleComp,
    value: "lifecycle",
    text: t("options.lifecycle"),
    group: ["global"],
  },
  {
    component: animationComp,
    value: "animation",
    text: t("options.animation"),
    group: ["animate"],
  },
]);

// 计算属性
const filterData = computed(() => {
  return pageData.value.filter((item) => item.group.includes(currentTab.value));
});

const showVar = ref<any>({
  basic: true,
  parentProp: true,
  prop: true,
  moreProp: true,
  slot: true,
  js: true,
  nativeOn: true,
  lifecycle: true,
  animation: true,
});
const varRef = ref();
const directives = computed(() => {
  return (selectedComp.value && selectedComp.value.directives) || {};
});

const closeFloatPanel = function () {
  globalMenu.value = "";
};

const actived = function (
  item:
    | {
        label: string;
        value: string;
        icon: string;
        show: boolean;
        type?: string | undefined;
      }
    | "variable"
) {
  return !!directives.value[typeof item === "string" ? item : item.value];
};

const showFn = (type: any, value: any) => {
  // console.log(type, value)
};

const openDialog = (type: string) => {
  if (type === "variable") {
    varRef.value.show();
  }
};
</script>
<template>
  <div class="options-designer">
    <float-panel
      class="float-panel"
      float="right"
      :list="menus"
      v-model="optionsPanel"
      @clickClose="closeFloatPanel"
      :foldWidth="365"
      :foldHeight="510"
      :isShow="globalMenu === 'option'"
      v-if="!!setting.immerseRightMode"
    >
      <template #toolbar>
        <div>
          <template v-for="item in toolbarData" :key="item.value">
            <customPopup
              trigger="click"
              placement="bottom"
              :destroyOnClose="true"
              :disabled="!selectedComp"
              :visible="item.show && !!selectedComp"
              @update:visible="($event: boolean) => { item.show = $event }"
            >
              <svg-icon
                :class="[
                  'css-svg-icon',
                  'toolbar-icon',
                  actived(item) && 'is-active',
                  !selectedComp && 'disabled',
                ]"
                :icon="`option-${item.icon}`"
                @click="showFn(item.type, item.value)"
              />
              <template #content>
                <component
                  :is="item.component"
                  :title="item.label"
                  :methods="item.methods"
                  :name="item.value"
                  @close="item.show = false"
                />
              </template>
            </customPopup>
          </template>
        </div>
        <customTooltip :content="t('options.variable')">
          <svg-icon
            :class="['css-svg-icon', 'toolbar-icon', actived('variable') && 'is-active']"
            icon="option-variable"
            @click="openDialog('variable')"
          />
        </customTooltip>
      </template>
      <template v-slot:default="{ activeData }">
        <template v-for="item in pageData" :key="item.value">
          <component :is="item.component" v-if="activeData.name === item.value" />
        </template>
      </template>
    </float-panel>
    <div class="is-side-bar" v-else>
      <div class="designer-toolbar">
        <div>
          <template v-for="item in toolbarData" :key="item.value">
            <customPopup
              trigger="click"
              placement="bottom"
              :destroyOnClose="true"
              :disabled="!selectedComp"
              :visible="item.show && !!selectedComp"
              @update:visible="($event: boolean) => { item.show = $event }"
            >
              <svg-icon
                :class="[
                  'css-svg-icon',
                  'toolbar-icon',
                  actived(item) && 'is-active',
                  !selectedComp && 'disabled',
                ]"
                :icon="`option-${item.icon}`"
                @click="showFn(item.type, item.value)"
              />
              <template #content>
                <component
                  :is="item.component"
                  :title="item.label"
                  :methods="item.methods"
                  :name="item.value"
                  @close="item.show = false"
                />
              </template>
            </customPopup>
          </template>
        </div>
        <customTooltip :content="t('options.variable')">
          <svg-icon
            :class="['css-svg-icon', 'toolbar-icon', actived('variable') && 'is-active']"
            icon="option-variable"
            @click="openDialog('variable')"
          />
        </customTooltip>
      </div>
      <div style="height: 44px"></div>
      <switchButton :optionItems="tabMenus" v-model="currentTab" />
      <div class="comp-container" v-for="item in filterData" :key="item.value">
        <template v-if="item.show !== false">
          <div
            class="designer-container__body-title"
            @click="showVar[item.value] = !showVar[item.value]"
          >
            <div class="designer-container__body-title__text">{{ item.text }}</div>
            <div class="designer-container__body-title__expand">
              <svg-icon
                icon="ic_arrow"
                :flip="!showVar[item.value] ? 'vertical' : ''"
                size="16"
                color="var(--ml-text-color-1)"
              />
            </div>
          </div>
          <MlAnimate>
            <component
              :is="item.component"
              class="comp-content"
              v-if="showVar[item.value]"
            />
          </MlAnimate>
        </template>
      </div>
    </div>
    <variable ref="varRef" />
  </div>
</template>

<style scoped lang="scss">
:deep(.css-svg-icon) {
  margin: 0 var(--ml-mg-small) !important;
}
</style>
