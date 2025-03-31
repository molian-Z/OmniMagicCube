<script setup lang="ts">
import { inject, computed } from "vue";
import { selectedComp } from "@molianComps/Designer/designerData";
import colorPicker from "@molianComps/ColorPicker/index.vue";
import svgIcon from "@molianComps/SvgIcon/index.vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const customComps: any = inject("customComps");
const { customInput, customSelect, customRadioButton, customRadioGroup } = customComps;
const css = computed(() => {
  return (
    (selectedComp.value && selectedComp.value.css) || {
      mixBlendMode: {},
      blur: {},
      boxShadow: [],
    }
  );
});
const mode = [
  ["normal"],
  ["darken", "multiply", "color-burn"],
  ["lighten", "screen", "color-dodge"],
  ["overlay", "soft-light", "hard-light"],
  ["difference", "exclusion"],
  ["hue", "saturation", "color", "luminosity"],
];
const modeInfo = ["normal", "darken", "lighten", "overlay", "difference", "color"];
const mixBlendModeData = computed(() => {
  return mode.map((item, index) => {
    const children = item.map((cItem) => {
      return { label: t("css.effectObj." + cItem), value: cItem };
    });
    return {
      label: t("css.effectObj.modeInfo." + modeInfo[index]),
      type: "group",
      group: t("css.effectObj.modeInfo." + modeInfo[index]),
      isGroup: true,
      children: children,
      options: children,
    };
  });
});

const iconClick = function (prop: string | number) {
  css.value[prop].isShow = !css.value[prop].isShow;
};

const iconClickVar = function (prop: { isShow: boolean }) {
  prop.isShow = !prop.isShow;
};

const addShadow = function () {
  if (!selectedComp.value) return false;
  css.value.boxShadow.push({
    h: "", // 水平偏移
    v: "", // 垂直偏移
    blur: "", // 模糊距离
    spread: "", // 扩展距离
    color: "", // 颜色
    type: "outset", // inset 内部阴影 / outset 外部阴影
    isShow: true,
  });
};

const deleteShadow = function (index: any) {
  if (!selectedComp.value) return false;
  css.value.boxShadow.splice(index, 1);
};

const updateModelValue = function (props: string | number, val: any) {
  if (!isNaN(Number(val)) && Number(val) <= 100 && Number(val) >= 0) {
    css.value[props] = Number(val).toString();
  }
};

const updateBlurValue = function (val: any) {
  if (!isNaN(Number(val))) {
    css.value.blur.modelValue = Number(val).toString();
  }
};
</script>

<template>
  <div class="css-panel">
    <!-- 混合模式部分 -->
    <div class="css-panel__header">
      <span class="css-panel__title">{{ t("css.effectObj.colorMixMode") }}</span>
    </div>
    <div class="css-panel__body">
      <div class="css-panel__row css-panel__row--between">
        <div class="css-panel__input-wrapper" style="flex: 2">
          <customSelect
            :options="mixBlendModeData"
            :placeholder="t('css.layer')"
            :disabled="!selectedComp"
            v-model="css.mixBlendMode.modelValue"
          >
            <template #prefixIcon>
              <svg-icon icon="ic_layer_style"></svg-icon>
            </template>
          </customSelect>
        </div>
        <div class="css-panel__input-wrapper">
          <customInput
            placeholder="0-100"
            :disabled="!selectedComp"
            :modelValue="css.opacity"
            @update:modelValue="updateModelValue('opacity', $event)"
          >
            <template #suffix>
              <span class="css-panel__suffix">%</span>
            </template>
          </customInput>
        </div>
        <div class="css-panel__input-wrapper" style="flex: 0 0 auto">
          <svg-icon
            class="css-panel__icon-btn"
            :icon="!!css.mixBlendMode.isShow ? 'ic_eye' : 'ic_eye_close'"
            @click="iconClick('mixBlendMode')"
          />
        </div>
      </div>
    </div>
  </div>
  <!-- 模糊效果部分 -->
  <div class="css-panel">
    <div class="css-panel__header css-panel__header--divider">
      <span class="css-panel__title">{{ t("css.effectObj.blur") }}</span>
    </div>
    <div class="css-panel__body">
      <div class="css-panel__row css-panel__row--between">
        <div class="css-panel__radio-group">
          <customRadioGroup
            variant="default-filled"
            :disabled="!selectedComp"
            v-model="css.blur.field"
          >
            <customRadioButton value="">
              {{ t("css.effectObj.null") }}
            </customRadioButton>
            <customRadioButton value="backdropFilter">
              {{ t("css.effectObj.backdropFilter") }}
            </customRadioButton>
            <customRadioButton value="filter">
              {{ t("css.effectObj.filter") }}
            </customRadioButton>
          </customRadioGroup>
        </div>
        <div class="css-panel__input-wrapper" style="flex: 0 0 80px">
          <customInput
            placeholder=""
            :disabled="!selectedComp"
            :modelValue="css.blur.modelValue"
            @update:modelValue="updateBlurValue"
          >
            <template #suffix>
              <span class="css-panel__suffix">px</span>
            </template>
          </customInput>
        </div>
        <div class="css-panel__input-wrapper" style="flex: 0 0 auto">
          <svg-icon
            class="css-panel__icon-btn"
            :icon="!!css.blur.isShow ? 'ic_eye' : 'ic_eye_close'"
            @click="iconClick('blur')"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- 阴影效果部分 -->
  <div class="css-panel">
    <div class="css-panel__header css-panel__header--divider">
      <span class="css-panel__title">{{ t("css.effectObj.shadow") }}</span>
      <div class="css-panel__actions">
        <svg-icon class="css-panel__icon-btn" icon="add" @click="addShadow" />
      </div>
    </div>

    <div
      v-for="(item, index) in css.boxShadow"
      :key="index"
      class="css-panel__body"
      :class="{ 'css-panel__body--divider': index > 0 }"
    >
      <!-- 阴影颜色 -->
      <div class="css-panel__row css-panel__row--between">
        <div class="css-panel__input-wrapper">
          <colorPicker use-type="pure" :disabled="!selectedComp" v-model="item.color" />
        </div>
        <div class="css-panel__button-group">
          <svg-icon
            class="css-panel__icon-btn"
            :icon="!!item.isShow ? 'ic_eye' : 'ic_eye_close'"
            @click="iconClickVar(item)"
          />
          <svg-icon
            class="css-panel__icon-btn"
            icon="delete"
            @click="deleteShadow(index)"
          />
        </div>
      </div>

      <!-- 水平垂直偏移 -->
      <div class="css-panel__row css-panel__row--between">
        <div class="css-panel__input-wrapper">
          <customInput :placeholder="t('css.hX')" v-model="item.h">
            <template #prefixIcon>
              <svg-icon icon="ic_const_left"></svg-icon>
            </template>
            <template #suffix>
              <span class="css-panel__suffix">px</span>
            </template>
          </customInput>
        </div>
        <div class="css-panel__input-wrapper">
          <customInput :placeholder="t('css.vY')" v-model="item.v">
            <template #prefixIcon>
              <svg-icon icon="ic_const_top"></svg-icon>
            </template>
            <template #suffix>
              <span class="css-panel__suffix">px</span>
            </template>
          </customInput>
        </div>
      </div>

      <!-- 模糊和扩展 -->
      <div class="css-panel__row css-panel__row--between">
        <div class="css-panel__input-wrapper">
          <customInput :placeholder="t('css.blur')" v-model="item.blur">
            <template #prefixIcon>
              <svg-icon icon="mohu"></svg-icon>
            </template>
            <template #suffix>
              <span class="css-panel__suffix">px</span>
            </template>
          </customInput>
        </div>
        <div class="css-panel__input-wrapper">
          <customInput :placeholder="t('css.spread')" v-model="item.spread">
            <template #prefixIcon>
              <svg-icon icon="expand"></svg-icon>
            </template>
            <template #suffix>
              <span class="css-panel__suffix">px</span>
            </template>
          </customInput>
        </div>
      </div>

      <!-- 阴影类型 -->
      <div class="css-panel__row">
        <div class="css-panel__radio-group">
          <customRadioGroup
            variant="default-filled"
            :disabled="!selectedComp"
            v-model="item.type"
          >
            <customRadioButton value="inset">
              {{ t("css.effectObj.inset") }}
            </customRadioButton>
            <customRadioButton value="outset">
              {{ t("css.effectObj.outset") }}
            </customRadioButton>
          </customRadioGroup>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
:deep(.el-radio-button__inner) {
  padding: 8px 12px;
}
</style>
