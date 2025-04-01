<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
const customComps: any = inject("customComps");
const { customInput, customInputNumber, customSelect, customButton } = customComps;

// 定义效果类型接口
interface EffectProperty {
  [key: string]: string | number | undefined;
}

interface EffectTo {
  opacity?: number;
  scale?: number;
  rotation?: number;
  [key: string]: any;
}

interface AnimationEffect {
  type: string;
  duration: number;
  delay: number;
  ease: string;
  direction?: string;
  to?: EffectTo;
  properties?: EffectProperty;
}

// 定义选项类型
interface OptionType {
  label: string;
  value: string;
}

const props = defineProps({
  modelValue: {
    type: Array as () => AnimationEffect[],
    default: () => [
      {
        type: "fade",
        duration: 0.5,
        delay: 0,
        ease: "power2.out",
        to: { opacity: 1 },
      },
    ],
  },
});

const emit = defineEmits<{
  (e: "update:modelValue", value: AnimationEffect[]): void;
}>();

const { t } = useI18n();

// 效果类型选项
const effectTypeOptions: OptionType[] = [
  { label: t("animation.effect.fade"), value: "fade" },
  { label: t("animation.effect.slide"), value: "slide" },
  { label: t("animation.effect.scale"), value: "scale" },
  { label: t("animation.effect.rotate"), value: "rotate" },
  { label: t("animation.effect.custom"), value: "custom" },
];

// 缓动函数选项
const easeOptions = [
  { label: t("animation.ease.linear"), value: "none" },
  { label: t("animation.ease.easeIn"), value: "power2.in" },
  { label: t("animation.ease.easeOut"), value: "power2.out" },
  { label: t("animation.ease.easeInOut"), value: "power2.inOut" },
  { label: t("animation.ease.elastic"), value: "elastic.out" },
  { label: t("animation.ease.bounce"), value: "bounce.out" },
  { label: t("animation.ease.back"), value: "back.out" }
];

// 方向选项 (用于滑动效果)
const directionOptions = [
  { label: t("animation.effect.direction.up"), value: "up" },
  { label: t("animation.effect.direction.down"), value: "down" },
  { label: t("animation.effect.direction.left"), value: "left" },
  { label: t("animation.effect.direction.right"), value: "right" },
  { label: t("animation.effect.direction.topLeft", "左上"), value: "topLeft" },
  { label: t("animation.effect.direction.topRight", "右上"), value: "topRight" },
  { label: t("animation.effect.direction.bottomLeft", "左下"), value: "bottomLeft" },
  { label: t("animation.effect.direction.bottomRight", "右下"), value: "bottomRight" },
];

// 当前编辑的效果索引
const currentEffectIndex = ref<number>(0);

// 当前编辑的效果
const currentEffect = computed<AnimationEffect>(() => {
  return props.modelValue[currentEffectIndex.value] || props.modelValue[0];
});

// 更新效果配置
const updateEffect = (key: string, value: any): void => {
  const updatedEffects = [...props.modelValue];
  updatedEffects[currentEffectIndex.value] = {
    ...updatedEffects[currentEffectIndex.value],
    [key]: value,
  };

  // 根据效果类型初始化必要的属性
  const effect = updatedEffects[currentEffectIndex.value];
  if (key === "type") {
    initEffectProperties(effect, value);
  }

  emit("update:modelValue", updatedEffects);
};

// 初始化效果属性
const initEffectProperties = (effect: AnimationEffect, type: string): void => {
  switch (type) {
    case "fade":
      if (!effect.to) effect.to = {};
      if (effect.to.opacity === undefined) effect.to.opacity = 1;
      break;
    case "scale":
      if (!effect.to) effect.to = {};
      if (effect.to.scale === undefined) effect.to.scale = 1;
      break;
    case "rotate":
      if (!effect.to) effect.to = {};
      if (effect.to.rotation === undefined) effect.to.rotation = 0;
      break;
    case "slide":
      if (!effect.direction) effect.direction = "up";
      if (!effect.properties) effect.properties = {};
      if (effect.properties.distance === undefined) effect.properties.distance = "100%";
      
      // 确保to对象存在
      if (!effect.to) effect.to = {};
      
      // 根据方向设置初始x和y值
      if (effect.direction === "up" || effect.direction === "down") {
        effect.to.x = undefined; // 重置x值
      } else if (effect.direction === "left" || effect.direction === "right") {
        effect.to.y = undefined; // 重置y值
      }
      break;
  }
};

// 添加更新效果目标属性的函数
const updateEffectTo = (key: string, value: any): void => {
  const updatedEffects = [...props.modelValue];
  const effect = updatedEffects[currentEffectIndex.value];

  if (!effect.to) {
    effect.to = {};
  }

  effect.to[key] = value;
  emit("update:modelValue", updatedEffects);
};

// 添加更新效果属性的函数
const updateEffectProperty = (key: string, value: string | number | undefined): void => {
  const updatedEffects = [...props.modelValue];
  const effect = updatedEffects[currentEffectIndex.value];

  if (!effect.properties) {
    effect.properties = {};
  }

  if (value === undefined) {
    // 如果值为undefined，则删除该属性
    delete effect.properties[key];
  } else {
    // 确保值的类型正确
    effect.properties[key] = value;
  }

  emit("update:modelValue", updatedEffects);
};

// 添加自定义属性相关变量
const customPropertyKey = ref<string>("");
const customPropertyValue = ref<string>("");

// 添加自定义属性
const addCustomProperty = (): void => {
  if (!customPropertyKey.value || !customPropertyValue.value) return;

  // 尝试将值转换为数字，如果是有效数字则使用数字类型
  const numValue = Number(customPropertyValue.value);
  const value = !isNaN(numValue) ? numValue : customPropertyValue.value;

  updateEffectProperty(customPropertyKey.value, value);

  // 清空输入
  customPropertyKey.value = "";
  customPropertyValue.value = "";
};

// 删除效果
const deleteEffect = (): void => {
  if (props.modelValue.length <= 1) return;

  const updatedEffects = [...props.modelValue];
  updatedEffects.splice(currentEffectIndex.value, 1);

  // 更新当前索引
  if (currentEffectIndex.value >= updatedEffects.length) {
    currentEffectIndex.value = updatedEffects.length - 1;
  }

  emit("update:modelValue", updatedEffects);
};

// 添加activeNames变量
const activeNames = ref<string[]>(["basic"]);

// 添加新效果
const addEffect = (): void => {
  const newEffect: AnimationEffect = {
    type: "fade",
    duration: 0.5,
    delay: 0,
    ease: "power2.out",
    to: { opacity: 1 }, // 初始化默认值
  };

  const updatedEffects = [...props.modelValue, newEffect];
  emit("update:modelValue", updatedEffects);
  currentEffectIndex.value = updatedEffects.length - 1;
};

// 确保当前效果有正确的初始化属性
const ensureEffectProperties = (): void => {
  if (!currentEffect.value) return;

  const updatedEffects = [...props.modelValue];
  const effect = updatedEffects[currentEffectIndex.value];
  let updated = false;

  // 确保 to 对象存在
  if (!effect.to) {
    effect.to = {};
    updated = true;
  }

  // 确保 properties 对象存在
  if (!effect.properties) {
    effect.properties = {};
    updated = true;
  }

  // 根据效果类型初始化属性
  if (effect.type === "fade" && effect.to.opacity === undefined) {
    effect.to.opacity = 1;
    updated = true;
  } else if (effect.type === "scale" && effect.to.scale === undefined) {
    effect.to.scale = 1;
    updated = true;
  } else if (effect.type === "rotate" && effect.to.rotation === undefined) {
    effect.to.rotation = 0;
    updated = true;
  } else if (effect.type === "slide") {
    if (!effect.direction) {
      effect.direction = "up";
      updated = true;
    }
    if (effect.properties.distance === undefined) {
      effect.properties.distance = "100%";
      updated = true;
    }
  }

  if (updated) {
    emit("update:modelValue", updatedEffects);
  }
};

// 监听当前效果索引变化，确保属性初始化
watch(currentEffectIndex, () => {
  ensureEffectProperties();
});

// 初始化时确保属性
onMounted(() => {
  ensureEffectProperties();
});
</script>

<template>
  <div class="effect-editor">
    <!-- 效果选择器 -->
    <div class="effect-tabs">
      <div
        v-for="(effect, index) in modelValue"
        :key="index"
        :class="['effect-tab', { active: index === currentEffectIndex }]"
        @click="currentEffectIndex = index"
      >
        {{ t(`animation.effect.${effect.type}`) || t("animation.effect.effect") }}
        {{ index + 1 }}
      </div>

      <customButton
        type="text"
        class="add-effect-btn"
        @click="addEffect"
        :disabled="modelValue.length >= 5"
      >
        <i class="el-icon-plus"></i>
      </customButton>
    </div>

    <div class="form-container">
      <!-- 基础属性区域 - 使用更紧凑的布局 -->
      <div class="form-section">
        <div class="form-row three-columns">
          <!-- 效果类型 -->
          <div class="form-item">
            <div class="form-label">{{ t('animation.effect.type') }}</div>
            <customSelect
              v-model="currentEffect.type"
              class="control-input"
              @change="(val: any) => updateEffect('type', val)"
              :options="effectTypeOptions"
            />
          </div>
          
          <!-- 缓动函数 -->
          <div class="form-item">
            <div class="form-label">{{ t('animation.effect.ease') }}</div>
            <customSelect
              v-model="currentEffect.ease"
              class="control-input"
              @change="(val: any) => updateEffect('ease', val)"
              :options="easeOptions"
            />
          </div>

          <!-- 持续时间 -->
          <div class="form-item">
            <div class="form-label">{{ t('animation.effect.duration') }}</div>
            <customInputNumber
              v-model="currentEffect.duration"
              :min="0"
              :step="0.01"
              :precision="2"
              class="full-width"
              @change="(val: any) => updateEffect('duration', val)"
              controls-position="right"
            />
          </div>
        </div>

        <div class="form-row three-columns">
          <!-- 延迟时间 -->
          <div class="form-item">
            <div class="form-label">{{ t('animation.effect.delay') }}</div>
            <customInputNumber
              v-model="currentEffect.delay"
              :min="0"
              :step="0.01"
              :precision="2"
              class="full-width"
              @change="(val: any) => updateEffect('delay', val)"
              
              controls-position="right"
            />
          </div>

          <!-- 根据效果类型显示不同的配置选项 -->
          <template v-if="currentEffect.type === 'fade' && currentEffect.to">
            <div class="form-item">
              <div class="form-label">{{ t('animation.effect.opacity') }}</div>
              <customInputNumber
                v-model="currentEffect.to.opacity"
                :min="0"
                :max="1"
                :step="0.1"
                :precision="1"
                class="full-width"
                @change="(val: any) => updateEffectTo('opacity', val)"
                
                controls-position="right"
              />
            </div>
          </template>

          <template v-else-if="currentEffect.type === 'slide'">
            <div class="form-item">
              <div class="form-label">{{ t('animation.effect.direction.title') }}</div>
              <customSelect
                v-model="currentEffect.direction"
                class="control-input-small"
                @change="(val: any) => updateEffect('direction', val)"
                :options="directionOptions"
              />
            </div>

            <div class="form-item" v-if="currentEffect.properties">
              <div class="form-label">{{ t('animation.effect.distance') }}</div>
              <customInput
                v-model="currentEffect.properties.distance"
                @input="(val: any) => updateEffectProperty('distance', val)"
                class="control-input-small"
                
              />
            </div>
          </template>

          <template v-else-if="currentEffect.type === 'scale' && currentEffect.to">
            <div class="form-item">
              <div class="form-label">{{ t('animation.effect.scale') }}</div>
              <customInputNumber
                v-model="currentEffect.to.scale"
                :min="0"
                :step="0.1"
                :precision="1"
                class="full-width"
                @change="(val: any) => updateEffectTo('scale', val)"
                
                controls-position="right"
              />
            </div>
          </template>

          <template v-else-if="currentEffect.type === 'rotate' && currentEffect.to">
            <div class="form-item">
              <div class="form-label">{{ t('animation.effect.rotation') }}</div>
              <customInputNumber
                v-model="currentEffect.to.rotation"
                :step="15"
                class="full-width"
                @change="(val: any) => updateEffectTo('rotation', val)"
                
                controls-position="right"
              />
            </div>
          </template>
        </div>
      </div>

      <!-- 自定义属性区域 -->
      <template v-if="currentEffect.type === 'custom'">
        <div class="form-section custom-section">
          <div class="section-title">{{ t('animation.effect.customProperties') }}</div>
          <div class="custom-property-form">
            <customInput
              v-model="customPropertyKey"
              :placeholder="t('animation.effect.propertyName')"
              class="property-key"
              
            />
            <customInput
              v-model="customPropertyValue"
              :placeholder="t('animation.effect.propertyValue')"
              class="property-value"
              
            />
            <customButton type="primary"  @click="addCustomProperty">
              {{ t("animation.effect.add") }}
            </customButton>
          </div>

          <!-- 显示已添加的自定义属性 -->
          <div class="custom-properties-list">
            <div
              v-for="(value, key) in currentEffect.properties"
              :key="key"
              class="custom-property-item"
            >
              <span class="property-name">{{ key }}:</span>
              <span class="property-value">{{ value }}</span>
              <customButton
                class="delete-btn"
                @click="updateEffectProperty(String(key), undefined)"
                
              >
                <svg-icon icon="remove"></svg-icon>
              </customButton>
            </div>
          </div>
        </div>
      </template>
    </div>

    <div class="effect-actions">
      <!-- 添加效果按钮 -->
      <customButton
        type="primary"
        
        @click="addEffect"
        :disabled="modelValue.length >= 5"
        style="margin-right: 8px"
      >
        <i class="el-icon-plus"></i>
        {{ t("animation.effect.add") }}
      </customButton>
      <!-- 删除效果按钮 -->
      <customButton
        type="danger"
        
        @click="deleteEffect"
        :disabled="modelValue.length <= 1"
      >
        {{ t("animation.effect.delete") }}
      </customButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
.effect-editor {
  margin-bottom: 12px;

  .form-container {
    margin-bottom: 12px;
  }

  .form-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 12px;
  }

  .effect-tabs {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 12px;
    border-bottom: 1px solid var(--ml-border-color-light);
    padding-bottom: 4px;

    .effect-tab {
      padding: 4px 10px;
      margin-right: 4px;
      margin-bottom: 0;
      border-radius: var(--ml-radius-small) var(--ml-radius-small) 0 0;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 13px;

      &:hover {
        background-color: var(--ml-fill-color-light);
      }

      &.active {
        background-color: var(--ml-primary-color-light);
        color: var(--ml-primary-color);
      }
    }

    .add-effect-btn {
      margin-left: auto;
      padding: 4px 6px;
      font-size: 13px;
    }
  }

  .custom-property-form {
    display: flex;
    margin-bottom: 8px;
    width: 100%;
    gap: 8px;

    .property-key {
      flex: 1;
    }

    .property-value {
      flex: 1;
    }
  }

  .custom-properties-list {
    margin-top: 8px;
    margin-bottom: 12px;

    .custom-property-item {
      display: flex;
      align-items: center;
      padding: 4px 8px;
      margin-bottom: 4px;
      background-color: var(--ml-fill-color-light);
      border-radius: var(--ml-radius-small);
      font-size: 13px;

      .property-name {
        font-weight: 500;
        margin-right: 4px;
      }

      .property-value {
        flex: 1;
        color: var(--ml-text-color-secondary);
      }

      .delete-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        border: none;
        background: transparent;
        color: var(--ml-text-color-secondary);
        cursor: pointer;
        border-radius: 50%;
        transition: all 0.2s;
        padding: 0;

        &:hover {
          color: var(--ml-danger-color);
        }
      }
    }
  }

  .effect-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
    gap: 8px;
  }
}
</style>
