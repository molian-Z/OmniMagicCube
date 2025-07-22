<script setup lang="ts">
import { inject, ref, computed } from "vue";
import { selectedComp, updateSelectedCompCss } from "@molianComps/Designer/designerData";
import colorPicker from "@molianComps/ColorPicker/index.vue";
import svgIcon from "@molianComps/SvgIcon/index.vue";
import textComp from "@molianComps/Designer/optionsDesigner/tooltip/customDirectives.vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const customComps: any = inject("customComps");
const { customInput, customSelect, customTooltip } = customComps;

const fontFamily = ref([
  "微软雅黑",
  "宋体",
  "新宋体",
  "仿宋",
  "黑体",
  "楷体",
  "等线",
  "SimSun-ExtB",
  "Arial Nova",
  "Arial",
  "Corbel",
]);
document.fonts.forEach((item) => {
  fontFamily.value.push(item.family);
});
const fontWeight = ref([
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "bold",
  "bolder",
  "lighter",
  "normal",
]);
const fontSize = ref(["10", "12", "14", "16", "20", "22", "28", "36", "48", "60", "72"]);

const css: any = computed(() => {
  return (selectedComp.value && selectedComp.value.css) || { color: {} };
});

const clickIcon = function (key: string | number | any, value: any) {
  if (!selectedComp.value) return false;
  if (css.value[key] === value) {
    updateSelectedCompCss(key, "");
  } else {
    updateSelectedCompCss(key, value);
  }
};

const updateFontProperty = function (prop: string, value: any) {
  if (!selectedComp.value) return;
  updateSelectedCompCss(prop, value);
};

const updateColorProperty = function (prop: string, value: any) {
  if (!selectedComp.value) return;
  const currentColor = selectedComp.value.css?.color || css.value.color;
  const newColor = { ...currentColor, [prop]: value };
  updateSelectedCompCss('color', newColor);
};
</script>

<template>
    <div class="css-panel">
      <div class="css-panel__header">
        <span class="css-panel__title">{{ t("css.text") }}</span>
        <div class="css-panel__actions">
          <!-- 可能的操作按钮 -->
        </div>
      </div>
      <div class="css-panel__body">
        <!-- 字体选择 -->
        <div class="css-panel__row">
          <div class="css-panel__input-wrapper" style="width: 100%">
            <customSelect
              :modelValue="css.fontFamily"
              @update:modelValue="updateFontProperty('fontFamily', $event)"
              :disabled="!selectedComp"
              :filterable="true"
              :placeholder="t('css.font')"
              :creatable="true"
              :options="
                fontFamily.map((item) => {
                  return { label: item, value: item };
                })
              "
            />
          </div>
        </div>

        <!-- 字重和字号 -->
        <div class="css-panel__row css-panel__row--between">
          <div class="css-panel__input-wrapper">
            <customSelect
              :modelValue="css.fontWeight"
              @update:modelValue="updateFontProperty('fontWeight', $event)"
              :disabled="!selectedComp"
              :filterable="true"
              :placeholder="t('css.fontWeight')"
              :creatable="true"
              :options="
                fontWeight.map((item) => {
                  return { label: item, value: item };
                })
              "
            />
          </div>
          <div class="css-panel__input-wrapper">
            <customSelect
              :modelValue="css.fontSize"
              @update:modelValue="updateFontProperty('fontSize', $event)"
              :disabled="!selectedComp"
              :filterable="true"
              :placeholder="t('css.fontSize')"
              :creatable="true"
              :options="
                fontSize.map((item) => {
                  return { label: item, value: item };
                })
              "
            />
          </div>
        </div>

        <!-- 行高和字间距 -->
        <div class="css-panel__row css-panel__row--between">
          <div class="css-panel__input-wrapper">
            <customInput
              :modelValue="css.lineHeight"
              @update:modelValue="updateFontProperty('lineHeight', $event)"
              :disabled="!selectedComp"
              placeholder="Auto"
            >
              <template #prefixIcon>
                <customTooltip :content="t('css.lineHeight')">
                  <svg-icon icon="ic_line_height" />
                </customTooltip>
              </template>
              <template #suffix>
                <span class="css-panel__suffix">px</span>
              </template>
            </customInput>
          </div>
          <div class="css-panel__input-wrapper">
            <customInput
              :modelValue="css.letterSpacing"
              @update:modelValue="updateFontProperty('letterSpacing', $event)"
              :disabled="!selectedComp"
              placeholder="0"
            >
              <template #prefixIcon>
                <customTooltip :content="t('css.letterSpacing')">
                  <svg-icon icon="ic_letter_spacing" />
                </customTooltip>
              </template>
              <template #suffix>
                <span class="css-panel__suffix">%</span>
              </template>
            </customInput>
          </div>
        </div>

        <!-- 段落间距和文本装饰 -->
        <div class="css-panel__row css-panel__row--between">
          <div class="css-panel__input-wrapper">
            <customInput
              :modelValue="css.paragraphSpacing"
              @update:modelValue="updateFontProperty('paragraphSpacing', $event)"
              :disabled="!selectedComp"
              placeholder="Auto"
            >
              <template #prefixIcon>
                <customTooltip :content="t('css.paragraphSpacing')">
                  <svg-icon icon="ic_paragraph_spacing" />
                </customTooltip>
              </template>
              <template #suffix>
                <span class="css-panel__suffix">px</span>
              </template>
            </customInput>
          </div>
          <div class="css-panel__button-group">
            <customTooltip :content="t('css.lineThrough')">
              <svg-icon
                class="css-panel__icon-btn"
                :class="{
                  'css-panel__icon-btn--active': css.textDecoration === 'line-through',
                }"
                icon="strikethrough"
                @click="clickIcon('textDecoration', 'line-through')"
              />
            </customTooltip>
            <customTooltip :content="t('css.underline')">
              <svg-icon
                class="css-panel__icon-btn"
                :class="{
                  'css-panel__icon-btn--active': css.textDecoration === 'underline',
                }"
                icon="underline"
                @click="clickIcon('textDecoration', 'underline')"
              />
            </customTooltip>
            <customTooltip :content="t('css.italic')">
              <svg-icon
                class="css-panel__icon-btn"
                :class="{ 'css-panel__icon-btn--active': css.fontStyle == 'italic' }"
                icon="italic"
                @click="clickIcon('fontStyle', 'italic')"
              />
            </customTooltip>
            <customTooltip :content="t('css.ellipsis')">
              <svg-icon
                class="css-panel__icon-btn"
                :class="{
                  'css-panel__icon-btn--active': css.textOverflow === 'ellipsis',
                }"
                icon="ellipsis"
                @click="clickIcon('textOverflow', 'ellipsis')"
              />
            </customTooltip>
          </div>
        </div>

        <!-- 文本对齐方式 -->
        <div class="css-panel__row">
          <div class="css-panel__align-group">
            <customTooltip :content="t('css.textAlign.left')">
              <div
                class="css-panel__align-btn"
                :class="{ 'css-panel__align-btn--active': css.textAlign === 'left' }"
                @click="clickIcon('textAlign', 'left')"
              >
                <svg-icon icon="text-align-ic_left" />
              </div>
            </customTooltip>
            <customTooltip :content="t('css.textAlign.center')">
              <div
                class="css-panel__align-btn"
                :class="{ 'css-panel__align-btn--active': css.textAlign === 'center' }"
                @click="clickIcon('textAlign', 'center')"
              >
                <svg-icon icon="text-align-ic_center" />
              </div>
            </customTooltip>
            <customTooltip :content="t('css.textAlign.right')">
              <div
                class="css-panel__align-btn"
                :class="{ 'css-panel__align-btn--active': css.textAlign === 'right' }"
                @click="clickIcon('textAlign', 'right')"
              >
                <svg-icon icon="text-align-ic_right" />
              </div>
            </customTooltip>
            <customTooltip :content="t('css.verticalAlign.top')">
              <div
                class="css-panel__align-btn"
                :class="{ 'css-panel__align-btn--active': css.verticalAlign === 'top' }"
                @click="clickIcon('verticalAlign', 'top')"
              >
                <svg-icon icon="text-align-ic_top" />
              </div>
            </customTooltip>
            <customTooltip :content="t('css.verticalAlign.middle')">
              <div
                class="css-panel__align-btn"
                :class="{
                  'css-panel__align-btn--active': css.verticalAlign === 'middle',
                }"
                @click="clickIcon('verticalAlign', 'middle')"
              >
                <svg-icon icon="text-align-ic_middle" />
              </div>
            </customTooltip>
            <customTooltip :content="t('css.verticalAlign.bottom')">
              <div
                class="css-panel__align-btn"
                :class="{
                  'css-panel__align-btn--active': css.verticalAlign === 'bottom',
                }"
                @click="clickIcon('verticalAlign', 'bottom')"
              >
                <svg-icon icon="text-align-ic_bottom" />
              </div>
            </customTooltip>
          </div>
        </div>
      </div>
    </div>
    <div class="css-panel">
      <div class="css-panel__header css-panel__header--divider">
        <span class="css-panel__title">{{ t("css.textColor") }}</span>
        <div class="css-panel__actions">
          <!-- 可能的操作按钮 -->
        </div>
      </div>
      <div class="css-panel__body">
        <div class="css-panel__row css-panel__row--between">
          <div class="css-panel__input-wrapper">
            <colorPicker
              use-type="pure"
              :disabled="!selectedComp"
              :modelValue="css.color.modelValue"
              @update:modelValue="updateColorProperty('modelValue', $event)"
            />
          </div>
          <div class="css-panel__input-wrapper" style="flex: 0 0 auto">
            <svg-icon
              class="css-panel__icon-btn"
              :icon="css.color.isShow ? 'ic_eye' : 'ic_eye_close'"
              @click="updateColorProperty('isShow', !css.color.isShow)"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="css-panel">
      <div class="css-panel__body">
        <textComp
          :title="t('css.textContent')"
          :methods="['string', 'function', 'variable']"
          name="text"
        ></textComp>
      </div>
    </div>
</template>

<style scoped lang="scss">
:deep(.sub-title) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
  user-select: none;
  font-size: 14px;
  font-weight: 600;
  color: var(--ml-text-color-1);
}
:deep(.svg-icon){
    margin-top: 0;
}
</style>
