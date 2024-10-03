<script setup lang="ts">
import { inject, computed } from "vue";
import floatPanel from "@molianComps/FloatPanel/index.vue";
import categroyPanel from "./category-panel.vue";
import { compPanel } from "../designerData";
import { categoryList } from "@molian/utils/compsConfig";
import { useUI, UIData } from "@molian/utils/UIMap";
import { setting } from "@molian/utils/defaultData";
import svgIcon from "@molianComps/SvgIcon/index.vue";
import {useI18n} from 'vue-i18n'
const {t} = useI18n()
const comps: any = inject("mlComps");
const customComps: any = inject("customComps");
const { customTooltip } = customComps;
const compList = Object.values(comps.value);
const allUI = computed(() => {
  return UIData.filter((item: any) => {
    return compList.find((fitem: any) => fitem.prefix === item.prefix);
  });
});
const i18nList = computed(() => {
  return categoryList.value.map((item) => {
    return {
      ...item,
      text: item.title || t("component.category." + item.name),
    };
  });
});

const activeDivData = computed(() => {
  return {
    name: compPanel.value,
  };
});
</script>
<template>
  <float-panel
    float="left"
    :list="i18nList"
    v-model="compPanel"
    :offset="[5, 150]"
    :foldWidth="500"
    :isClose="false"
    v-if="!!setting.immerseLeftMode"
  >
    <template #toolbar>
      <svg-icon
        :class="['css-svg-icon', 'toolbar-icon', useUI === 'all' && 'is-actived']"
        icon="uiLib-all"
        @click="useUI = 'all'"
      />
      <customTooltip v-for="item in allUI" :key="item.name">
        <svg-icon
          :class="['css-svg-icon', 'toolbar-icon', useUI === item.name && 'is-actived']"
          :icon="`uiLib-${item.icon}`"
          @click="useUI = item.name"
        />
        <template #content>
          <div class="link-container">
            <span style="user-select: none">{{ item.name }}</span>
            <a class="ml-link" :href="item.docUrl" target="_blank" v-if="!!item.docUrl">
              <svg-icon icon="outLink"></svg-icon>
            </a>
          </div>
        </template>
      </customTooltip>
    </template>
    <template v-slot:default="{ activeData }">
      <categroy-panel :currentData="activeData" :currentUI="useUI" />
    </template>
  </float-panel>
  <div class="comps-designer" v-else>
    <div class="comps-designer__header">
      <svg-icon
        :class="['css-svg-icon', 'toolbar-icon', useUI === 'all' && 'is-actived']"
        icon="uiLib-all"
        @click="useUI = 'all'"
      />
      <customTooltip v-for="item in allUI" :key="item.name">
        <svg-icon
          size="14"
          :class="['css-svg-icon', useUI === item.name && 'is-actived']"
          :icon="`uiLib-${item.icon}`"
          @click="useUI = item.name"
        />
        <template #content>
          <div class="link-container">
            <span style="user-select: none;">{{ item.name }}</span>
            <a class="ml-link" :href="item.docUrl" target="_blank" v-if="!!item.docUrl">
              <svg-icon icon="outLink"></svg-icon>
            </a>
          </div>
        </template>
      </customTooltip>
    </div>
    <div class="comps-designer-container">
      <div class="comps-designer-container__category">
        <div
          class="comps-designer-container__category-item"
          :class="[compPanel === item.name && 'category-is-actived']"
          v-for="item in i18nList"
          :key="item.name"
          @click="compPanel = item.name"
        >
          <SvgIcon size="26" :icon="item.icon"></SvgIcon>
          <div class="comps-designer-container__category-item-text">{{ item.text }}</div>
        </div>
      </div>
      <categroy-panel :currentData="activeDivData" :currentUI="useUI" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
:deep(.css-svg-icon) {
  // fill: var(--ml-primary-color);
  cursor: pointer;
  padding: 5px;
  transition: var(--ml-transition-base);
  border-radius: var(--ml-radius-small);
  margin: 0 var(--ml-mg-small) !important;
  &:hover {
    background-color: var(--ml-fill-color-4);
  }
}

:deep(.float-panel-header-toolbar__fold) {
  justify-content: flex-start !important;
  padding: 0 var(--ml-pd-lg);
}

.is-actived {
  background-color: var(--ml-fill-color-4) !important;
}

.link-container {
  display: flex;
  align-items: center;
}

.ml-link {
  padding-left: var(--ml-pd-base);
  color: var(--ml-primary-color);
  display: flex;
  align-items: center;
}

.comps-designer {
  width: 330px;
  height: 100%;
  &__header {
    padding: var(--ml-pd-base);
    background-color: var(--ml-bg-color);
    display: flex;
    align-items: center;
  }

  &-container {
    height: 100%;
    display: flex;
    background-color: var(--ml-bg-color);
    &__category {
      display: flex;
      flex-direction: column;
      flex: 1;

      &-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        transition: var(--ml-transition-base);
        color: var(--ml-fill-color);
        font-size: 12px;
        cursor: pointer;

        margin: var(--ml-mg-base);
        // padding: 6px;
        border-radius: var(--ml-radius-lg);
        width: 60px;
        height: 60px;

        &-text {
          padding-top: var(--ml-pd-small);
        }

        &:hover {
          color: var(--ml-primary-color);

          &-text {
            color: var(--ml-primary-color);
          }
        }
      }
    }
  }
}

.category-is-actived {
  color: var(--ml-primary-color);
  box-shadow: var(--ml-shadow-small-inset);
}
</style>
