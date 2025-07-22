<script setup lang="ts">
import { ref, computed, inject, watch } from "vue";
import { selectedComp, updateSelectedCompCss } from "@molianComps/Designer/designerData";
import svgIcon from "@molianComps/SvgIcon/index.vue";
import SuffixUnit from "@molianComps/SuffixUnit/index.vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const customComps: any = inject("customComps");
const { customInput, customTooltip } = customComps;

const css = computed(() => {
  if (selectedComp.value && selectedComp.value.css) {
    return selectedComp.value.css;
  }
  return {
    marginTop: "",
    marginLeft: "",
    marginRight: "",
    marginBottom: "",
    paddingTop: "",
    paddingLeft: "",
    paddingRight: "",
    paddingBottom: "",
    units: {},
  };
});

const activeMargin = ref(false);
const activePadding = ref(false);

// 监听selectedComp的变化，以便在选择的组件更改时更新界面状态
watch(selectedComp, (val: any) => {
  if (val) {
    // 将选中组件的四个方向的外边距存储到数组中，以便后续统一处理
    const margins = [
      val.css.marginTop,
      val.css.marginLeft,
      val.css.marginRight,
      val.css.marginBottom,
    ];

    // 检查四个方向的外边距是否都相等且不为undefined，如果是，则激活外边距的绑定状态
    if (
      margins.every((margin) => margin === val.css.marginTop) &&
      val.css.marginTop !== undefined &&
      val.css.marginTop !== ""
    ) {
      activeMargin.value = true;
    } else {
      activeMargin.value = false;
    }

    // 将选中组件的四个方向的内边距存储到数组中，以便后续统一处理
    const paddings = [
      val.css.paddingTop,
      val.css.paddingLeft,
      val.css.paddingRight,
      val.css.paddingBottom,
    ];

    // 检查四个方向的内边距是否都相等且不为undefined，如果是，则激活内边距的绑定状态
    if (
      paddings.every((padding) => padding === val.css.paddingTop) &&
      val.css.paddingTop !== undefined &&
      val.css.paddingTop !== ""
    ) {
      activePadding.value = true;
    } else {
      activePadding.value = false;
    }
  }
});

/**
 * 修改边距或内边距的值
 * 此函数用于将指定的边距（margin）或内边距（padding）的四个方向（上、右、下、左）的值设置为相同
 * 它首先获取指定类型（margin 或 padding）的上边距的值，然后将这个值应用到所有四个方向
 * 如果类型是边距（margin），它还会切换 activeMargin 的值；如果是内边距（padding），则切换 activePadding 的值
 *
 * @param type - 需要修改的类型，可以是 'margin' 或 'padding'
 */
const changeMarign = function (type: "margin" | "padding") {
  if (!selectedComp.value) return;
  
  if (
    (type === "margin" && !activeMargin.value) ||
    (type === "padding" && !activePadding.value)
  ) {
    // 获取指定类型（margin 或 padding）的上边距的值
    const val = css.value[type + "Top"];
    const unit = css.value.units[type + "Top"];
    
    // 更新四个方向的值
    updateSelectedCompCss(type + "Top", val);
    updateSelectedCompCss(type + "Right", val);
    updateSelectedCompCss(type + "Bottom", val);
    updateSelectedCompCss(type + "Left", val);
    
    // 更新单位
    const currentUnits = { ...css.value.units };
    currentUnits[type + "Right"] = unit;
    currentUnits[type + "Bottom"] = unit;
    currentUnits[type + "Left"] = unit;
    updateSelectedCompCss('units', currentUnits);
  }

  // 根据类型切换对应的 active 值
  if (type === "margin") {
    activeMargin.value = !activeMargin.value;
  } else if (type === "padding") {
    activePadding.value = !activePadding.value;
  }
};

/**
 * 更新model的值
 * 此函数用于根据传入的属性和对象来更新CSS样式中的margin或padding属性
 * 它会根据对象中的type字段判断是更新margin还是padding，并且在满足条件时更新对应的四个方向的值
 *
 * @param prop 要更新的CSS属性名称，例如marginTop、paddingLeft等
 * @param obj 包含type和value的对象，type表示样式类型（'margin'或'padding'），value是要设置的值
 */
const updateModelValue = (
  prop: string,
  obj: { type: "margin" | "padding"; value: any }
) => {
  if (!selectedComp.value) return;
  
  // 检查css.value是否存在且obj.value可以转换为数字
  if (css.value && !isNaN(Number(obj.value))) {
    // 将obj.value转换为字符串形式的数字
    const newVal = obj.value != "" ? Number(obj.value).toString() : "";
    // 判断是否需要更新四个方向的值
    if (
      (obj.type === "margin" && activeMargin.value) ||
      (obj.type === "padding" && activePadding.value)
    ) {
      // 如果需要，分别为四个方向的属性赋值
      updateSelectedCompCss(obj.type + "Top", newVal);
      updateSelectedCompCss(obj.type + "Right", newVal);
      updateSelectedCompCss(obj.type + "Bottom", newVal);
      updateSelectedCompCss(obj.type + "Left", newVal);
    } else {
      // 否则，只更新传入的prop对应的值
      updateSelectedCompCss(prop, newVal);
    }
  }
};

/**
 * 更新CSS单位信息
 *
 * 此函数用于根据传入的属性名称和对象，更新CSS单位信息它主要处理两种情况：margin和padding
 * 当传入的对象类型为'margin'或'padding'时，如果相应的activeMargin或activePadding为真，则更新四个方向的单位信息
 * 否则，仅更新与传入属性名称对应的单位信息
 *
 * @param prop CSS属性的字符串表示，如'marginTop'、'paddingLeft'等
 * @param obj 包含类型和值的对象，类型为'margin'或'padding'，值为要更新的单位值
 */
const updateUnit = (prop: string, obj: { type: "margin" | "padding"; value: any }) => {
  if (!selectedComp.value) return;
  
  const currentUnits = { ...css.value.units };
  
  // 当类型为'margin'且activeMargin为真时，更新四个方向的margin单位信息
  if (obj.type === "margin" && activeMargin.value) {
    currentUnits[obj.type + "Top"] = obj.value;
    currentUnits[obj.type + "Bottom"] = obj.value;
    currentUnits[obj.type + "Left"] = obj.value;
    currentUnits[obj.type + "Right"] = obj.value;
  } else if (obj.type === "padding" && activePadding.value) {
    // 当类型为'padding'且activePadding为真时，更新四个方向的padding单位信息
    currentUnits[obj.type + "Top"] = obj.value;
    currentUnits[obj.type + "Bottom"] = obj.value;
    currentUnits[obj.type + "Left"] = obj.value;
    currentUnits[obj.type + "Right"] = obj.value;
  } else {
    // 否则，仅更新指定的margin或padding单位信息
    currentUnits[prop] = obj.value;
  }
  
  updateSelectedCompCss('units', currentUnits);
};
</script>
<template>
  <div class="css-panel">
    <div class="css-panel__header">
      <span class="css-panel__title">{{ t("css.margin.margin") }}</span>
      <div class="css-panel__actions">
        <!-- 可能的操作按钮 -->
      </div>
    </div>
    <div class="css-panel__body">
      <!-- 外边距控制 -->
      <div
        class="css-panel__row css-panel__row--between"
        style="position: relative; margin-bottom: 8px"
      >
        <div class="css-panel__input-wrapper">
          <customInput
            :modelValue="css.marginTop"
            @update:modelValue="
              updateModelValue('marginTop', { type: 'margin', value: $event })
            "
            :disabled="!selectedComp"
            placeholder=""
          >
            <template #prefixIcon>
              <customTooltip :content="t('css.margin.top')">
                <svg-icon icon="margin-top"></svg-icon>
              </customTooltip>
            </template>
            <template #suffix>
              <suffix-unit
                :modelValue="css.units.marginTop"
                @update:modelValue="
                  updateUnit('marginTop', { type: 'margin', value: $event })
                "
              />
            </template>
          </customInput>
        </div>
        <div class="css-panel__input-wrapper">
          <customInput
            :modelValue="css.marginBottom"
            @update:modelValue="
              updateModelValue('marginBottom', { type: 'margin', value: $event })
            "
            :disabled="!selectedComp || activeMargin"
            placeholder=""
          >
            <template #prefixIcon>
              <customTooltip :content="t('css.margin.bottom')">
                <svg-icon icon="margin-bottom"></svg-icon>
              </customTooltip>
            </template>
            <template #suffix>
              <suffix-unit
                :modelValue="css.units.marginBottom"
                @update:modelValue="
                  updateUnit('marginBottom', { type: 'margin', value: $event })
                "
              />
            </template>
          </customInput>
        </div>
      </div>

      <div class="css-panel__row css-panel__row--between" style="position: relative">
        <div class="css-panel__input-wrapper">
          <customInput
            :modelValue="css.marginLeft"
            @update:modelValue="
              updateModelValue('marginLeft', { type: 'margin', value: $event })
            "
            :disabled="!selectedComp || activeMargin"
            placeholder=""
          >
            <template #prefixIcon>
              <customTooltip :content="t('css.margin.left')">
                <svg-icon icon="margin-left"></svg-icon>
              </customTooltip>
            </template>
            <template #suffix>
              <suffix-unit
                :modelValue="css.units.marginLeft"
                @update:modelValue="
                  updateUnit('marginLeft', { type: 'margin', value: $event })
                "
              />
            </template>
          </customInput>
        </div>
        <div class="css-panel__input-wrapper">
          <customInput
            :modelValue="css.marginRight"
            @update:modelValue="
              updateModelValue('marginRight', { type: 'margin', value: $event })
            "
            :disabled="!selectedComp || activeMargin"
            placeholder=""
          >
            <template #prefixIcon>
              <customTooltip :content="t('css.margin.right')">
                <svg-icon icon="margin-right"></svg-icon>
              </customTooltip>
            </template>
            <template #suffix>
              <suffix-unit
                :modelValue="css.units.marginRight"
                @update:modelValue="
                  updateUnit('marginRight', { type: 'margin', value: $event })
                "
              />
            </template>
          </customInput>
        </div>

        <!-- 链接图标绝对定位在中心 -->
        <div class="css-panel__radius-link-container">
          <svg-icon
            class="css-panel__icon-btn css-panel__radius-link-icon"
            :class="{ 'css-panel__icon-btn--active': activeMargin }"
            icon="link"
            @click="changeMarign('margin')"
          />
        </div>
      </div>
    </div>
  </div>
  <div class="css-panel">
    <div class="css-panel__header css-panel__header--divider">
      <span class="css-panel__title">{{ t("css.padding.padding") }}</span>
      <div class="css-panel__actions">
        <!-- 可能的操作按钮 -->
      </div>
    </div>
    <div class="css-panel__body">
      <!-- 内边距控制 -->
      <div
        class="css-panel__row css-panel__row--between"
        style="position: relative; margin-bottom: 8px"
      >
        <div class="css-panel__input-wrapper">
          <customInput
            :modelValue="css.paddingTop"
            @update:modelValue="
              updateModelValue('paddingTop', { type: 'padding', value: $event })
            "
            :disabled="!selectedComp"
            placeholder=""
          >
            <template #prefixIcon>
              <customTooltip :content="t('css.padding.top')">
                <svg-icon icon="padding-top"></svg-icon>
              </customTooltip>
            </template>
            <template #suffix>
              <suffix-unit
                :modelValue="css.units.paddingTop"
                @update:modelValue="
                  updateUnit('paddingTop', { type: 'padding', value: $event })
                "
              />
            </template>
          </customInput>
        </div>
        <div class="css-panel__input-wrapper">
          <customInput
            :modelValue="css.paddingBottom"
            @update:modelValue="
              updateModelValue('paddingBottom', { type: 'padding', value: $event })
            "
            :disabled="!selectedComp || activePadding"
            placeholder=""
          >
            <template #prefixIcon>
              <customTooltip :content="t('css.padding.bottom')">
                <svg-icon icon="padding-bottom"></svg-icon>
              </customTooltip>
            </template>
            <template #suffix>
              <suffix-unit
                :modelValue="css.units.paddingBottom"
                @update:modelValue="
                  updateUnit('paddingBottom', { type: 'padding', value: $event })
                "
              />
            </template>
          </customInput>
        </div>
      </div>

      <div class="css-panel__row css-panel__row--between" style="position: relative">
        <div class="css-panel__input-wrapper">
          <customInput
            :modelValue="css.paddingLeft"
            @update:modelValue="
              updateModelValue('paddingLeft', { type: 'padding', value: $event })
            "
            :disabled="!selectedComp || activePadding"
            placeholder=""
          >
            <template #prefixIcon>
              <customTooltip :content="t('css.padding.left')">
                <svg-icon icon="padding-left"></svg-icon>
              </customTooltip>
            </template>
            <template #suffix>
              <suffix-unit
                :modelValue="css.units.paddingLeft"
                @update:modelValue="
                  updateUnit('paddingLeft', { type: 'padding', value: $event })
                "
              />
            </template>
          </customInput>
        </div>
        <div class="css-panel__input-wrapper">
          <customInput
            :modelValue="css.paddingRight"
            @update:modelValue="
              updateModelValue('paddingRight', { type: 'padding', value: $event })
            "
            :disabled="!selectedComp || activePadding"
            placeholder=""
          >
            <template #prefixIcon>
              <customTooltip :content="t('css.padding.right')">
                <svg-icon icon="padding-right"></svg-icon>
              </customTooltip>
            </template>
            <template #suffix>
              <suffix-unit
                :modelValue="css.units.paddingRight"
                @update:modelValue="
                  updateUnit('paddingRight', { type: 'padding', value: $event })
                "
              />
            </template>
          </customInput>
        </div>

        <!-- 链接图标绝对定位在中心 -->
        <div class="css-panel__radius-link-container">
          <svg-icon
            class="css-panel__icon-btn css-panel__radius-link-icon"
            :class="{ 'css-panel__icon-btn--active': activePadding }"
            icon="link"
            @click="changeMarign('padding')"
          />
        </div>
      </div>
    </div>
  </div>
</template>
