<script setup lang="ts">
import { computed, ref, reactive, watch } from "vue";
import { useI18n } from "vue-i18n";
import AnimationPreview from "./AnimationPreview.vue";
import EffectEditor from "./components/EffectEditor.vue";
// 导入可视化效果编辑器
import VisualEffectEditor from "./components/VisualEffectEditor/index.vue";
import TriggerEditor from "./components/TriggerEditor.vue";
import TimelineEditor from "./components/TimelineEditor.vue";
import AnimationList from "./components/AnimationList.vue";
import { getDefaultAnimationConfig } from "./services/animation-service";
const customComps: any = inject("customComps");
const { customInput, customSwitch, customSelect, customButton, customTooltip, customCollapse, customCollapseItem } = customComps;
const props = defineProps({
  // 组件ID或引用
  componentId: {
    type: [String, Object],
    required: true
  },
  // 初始动画配置
  animations: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:animations', 'preview']);

const { t } = useI18n();

const engineOptions = ref([{label: 'GSAP',value: 'gsap'},{label: 'CSS',value: 'css'}]);

// 动画类型选项
const animationTypes = ref([
  { label: t("animation.enter"), value: "enter" },
  { label: t("animation.leave"), value: "leave" },
  // 先暂时不开放这两个 仍需调试
//   { label: t("animation.stateChange"), value: "stateChange" },
//   { label: t("animation.interaction"), value: "interaction" },
]);

// 当前选中的动画类型
const currentAnimationType = ref("enter");

// 当前类型下的所有动画列表
const currentTypeAnimations = computed(() => {
  const animations = props.animations[currentAnimationType.value];
  if (!animations) return [];
  
  // 如果是对象而不是数组，转换为数组
  if (!Array.isArray(animations)) {
    return [animations]; // 兼容旧数据结构
  }
  
  return animations;
});

// 当前选中的动画索引
const currentAnimationIndex = ref(0);

// 当前选中的动画
const currentAnimation = computed(() => {
  if (currentTypeAnimations.value.length === 0) return null;
  return currentTypeAnimations.value[currentAnimationIndex.value];
});

// 当前编辑的动画配置
const currentConfig = reactive<AnimationConfig>(getDefaultAnimationConfig("enter"));

// 重置配置为默认值
const resetConfig = () => {
  const defaultConfig:any = getDefaultAnimationConfig(currentAnimationType.value);
  Object.keys(defaultConfig).forEach(key => {
    currentConfig[key] = JSON.parse(JSON.stringify(defaultConfig[key]));
  });
};

// 监听当前动画类型和索引变化，更新表单数据
watch([currentAnimationType, currentAnimationIndex, currentTypeAnimations], () => {
  const animation = currentAnimation.value;
  
  if (animation) {
    // 深拷贝配置到当前编辑对象
    Object.keys(currentConfig).forEach(key => {
      if (key in animation) {
        if (typeof animation[key] === 'object' && animation[key] !== null) {
          currentConfig[key] = JSON.parse(JSON.stringify(animation[key]));
        } else {
          currentConfig[key] = animation[key];
        }
      }
    });
  } else {
    // 重置为默认值
    resetConfig();
  }
}, { immediate: true });

// 添加新动画
const addNewAnimation = () => {
  resetConfig();
  currentAnimationIndex.value = currentTypeAnimations.value.length;
  updateAnimation(true); // 立即保存新动画
};

// 删除当前动画
const deleteCurrentAnimation = () => {
  const animationType = currentAnimationType.value;
  const animations = props.animations[animationType];
  if (!animations || !Array.isArray(animations)) return;
  
  // 创建新的动画数组副本
  const newAnimations = { ...props.animations };
  const animationsCopy = [...animations];
  
  // 删除当前索引的动画
  animationsCopy.splice(currentAnimationIndex.value, 1);
  
  // 更新新的动画对象
  newAnimations[animationType] = animationsCopy;
  
  // 更新索引
  if (currentAnimationIndex.value >= animationsCopy.length) {
    currentAnimationIndex.value = Math.max(0, animationsCopy.length - 1);
  }
  
  // 发出更新事件
  emit('update:animations', newAnimations);
};

// 更新动画配置
const updateAnimation = (isNew = false) => {
  const newAnimations = { ...props.animations };
  
  // 确保有名称
  if (!currentConfig.name) {
    currentConfig.name = `${currentAnimationType.value}_${Date.now()}`;
  }
  
  // 创建动画配置的深拷贝
  const animationConfig = JSON.parse(JSON.stringify(currentConfig));
  
  if (currentAnimationType.value === "stateChange" || currentAnimationType.value === "interaction") {
    if (!newAnimations[currentAnimationType.value]) {
      newAnimations[currentAnimationType.value] = {};
    }
    newAnimations[currentAnimationType.value][currentConfig.stateName] = animationConfig;
  } else {
    // 确保当前类型的动画是数组
    if (!newAnimations[currentAnimationType.value] || 
        !Array.isArray(newAnimations[currentAnimationType.value])) {
      // 如果不是数组，创建一个新数组
      const oldAnimation = newAnimations[currentAnimationType.value];
      newAnimations[currentAnimationType.value] = oldAnimation ? [oldAnimation] : [];
    }
    
    const animations = newAnimations[currentAnimationType.value];
    
    if (isNew) {
      // 添加新动画
      animations.push(animationConfig);
    } else {
      // 更新现有动画
      animations[currentAnimationIndex.value] = animationConfig;
    }
  }
  // 发出更新事件
  emit('update:animations', newAnimations);
};

// 预览动画
const previewAnimation = () => {
  if (!currentAnimation.value) return;
  
  // 先更新配置
  updateAnimation();
  
  // 重置预览状态后再设置为true，确保触发变化
  showPreview.value = false;
  setTimeout(() => {
    showPreview.value = true;
  }, 50);
  // 发出预览事件
  emit('preview', {
    config: currentConfig,
    type: currentAnimationType.value
  });
};

// 添加预览弹窗控制变量
const showPreview = ref(false);
const showEditDialog = ref(false);

// 添加预览元素引用
const previewElementRef = ref(null);

// 添加可视化编辑器控制变量
const useVisualEditor = ref(true);

// 监听可视化编辑器状态变化
watch(useVisualEditor, (newValue) => {
  // 如果开启可视化编辑，从折叠面板中移除timeline
  if (newValue) {
    activeCollapseNames.value = activeCollapseNames.value.filter(name => name !== 'timeline');
  } else if (!activeCollapseNames.value.includes('timeline') && currentConfig.engine === 'gsap') {
    // 如果关闭可视化编辑且当前引擎是gsap，添加timeline到折叠面板
    activeCollapseNames.value.push('timeline');
  }
});

// 添加折叠面板状态控制
const activeCollapseNames = ref(['trigger', 'timeline', 'effects']);

// 打开编辑对话框
const openEditDialog = () => {
  showEditDialog.value = true;
};

// 保存并关闭对话框
const saveAndCloseDialog = () => {
  updateAnimation();
  showEditDialog.value = false;
};
</script>

<template>
  <div class="animation-editor">
    <!-- 动画类型选择器 - 顶部选项卡 -->
    <div class="animation-tabs">
      <div 
        v-for="type in animationTypes" 
        :key="type.value"
        :class="['animation-tab-item', { active: currentAnimationType === type.value }]"
        @click="currentAnimationType = type.value"
      >
        {{ type.label }}
      </div>
    </div>
    
    <!-- 动画配置区域 -->
    <div class="animation-content">
      <template v-if="currentAnimationType === 'stateChange' || currentAnimationType === 'interaction'">
        <!-- 状态变化和交互动画需要先选择或创建具体的动画名称 -->
        <div class="animation-name-selector">
          <div class="form-item">
            <div class="form-label">{{ t('animation.stateName') }}</div>
            <customInput v-model="currentConfig.stateName" />
          </div>
        </div>
      </template>
      
      <!-- 动画列表和操作 -->
      <AnimationList
        v-if="currentAnimationType !== 'stateChange' && currentAnimationType !== 'interaction'"
        :animations="currentTypeAnimations"
        :current-index="currentAnimationIndex"
        @select="currentAnimationIndex = $event"
        @add="addNewAnimation"
        @delete="deleteCurrentAnimation"
        @edit="openEditDialog"
      />
    </div>

    <!-- 动画预览区域 -->
    <div class="animation-preview">
      <div class="preview-header">
        <span>{{ t("animation.preview") }}</span>
        <div class="preview-actions" v-if="currentAnimation">
          <customButton theme="primary" size="small" @click="previewAnimation" :loading="showPreview">
            {{ t('animation.play') }}
          </customButton>
          <customButton size="small" @click="openEditDialog">
            {{ t('animation.edit') }}
          </customButton>
        </div>
      </div>
      <div class="preview-content">
        <AnimationPreview 
          ref="previewElementRef"
          :component-id="props.componentId"
          :animation-config="currentConfig"
          :animation-type="currentAnimationType"
          :playing="showPreview"
          @animation-end="showPreview = false"
          inline-mode
        />
      </div>
    </div>

    <!-- 动画编辑对话框 -->
    <ElDialog
      v-model="showEditDialog"
      :title="t('animation.editAnimation')"
      width="1100px"
      top="50px"
      :close-on-click-modal="false"
      :append-to-body="true"
    >
      <div class="animation-form-container">
        <!-- 基本信息区域 -->
        <div class="form-row">
          <!-- 动画名称 -->
          <div class="form-item">
            <div class="form-label">{{ t('animation.animationName') }}</div>
            <customInput v-model="currentConfig.name" />
          </div>
          
          <!-- 引擎选择 -->
          <div class="form-item">
            <div class="form-label">{{ t('animation.engine') }}</div>
            <customSelect v-model="currentConfig.engine" class="full-width" :options="engineOptions" />
          </div>
        </div>
        
        <!-- 使用统一的折叠面板 -->
        <customCollapse v-model="activeCollapseNames" class="animation-collapse">
          <!-- 触发器编辑器组件 -->
          <customCollapseItem :title="t('animation.trigger.title')" name="trigger">
            <TriggerEditor 
              v-model="currentConfig.trigger"
              :animation-type="currentAnimationType"
            />
          </customCollapseItem>

          <!-- 时间线编辑器组件 - 在可视化编辑模式下隐藏 -->
          <customCollapseItem 
            v-if="currentConfig.engine === 'gsap' && !useVisualEditor" 
            :title="t('animation.timeline.title')" 
            name="timeline"
          >
            <TimelineEditor 
              v-model="currentConfig.timeline"
            />
          </customCollapseItem>
          
          <!-- 效果编辑器组件 -->
          <customCollapseItem :title="t('animation.effect.title')" name="effects">
            <!-- 添加编辑模式切换 -->
            <div class="editor-mode-switch">
              <span>{{ t('animation.visualEditor', '可视化编辑') }}</span>
              <customSwitch v-model="useVisualEditor" />
              <customTooltip :content="t('animation.visualEditorHint', '使用可视化方式编辑动画效果')">
                <svg-icon icon="question-filled" />
              </customTooltip>
            </div>
            
            <!-- 根据模式选择不同的编辑器 -->
            <VisualEffectEditor 
              v-if="useVisualEditor"
              v-model="currentConfig.effects"
            />
            <EffectEditor 
              v-else
              v-model="currentConfig.effects"
            />
          </customCollapseItem>
        </customCollapse>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <customButton @click="showEditDialog = false">{{ t('animation.cancel') }}</customButton>
          <customButton theme="primary" @click="saveAndCloseDialog">
            {{ t('animation.save') }}
          </customButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped lang="scss">
.animation-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  
  .animation-tabs {
    display: flex;
    align-items: center;
    justify-content: space-around;
    border-bottom: 1px solid var(--ml-border-color);
    margin-bottom: 16px;
    
    .animation-tab-item {
      padding: 8px 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
      border-bottom: 2px solid transparent;
      
      &:hover {
        color: var(--ml-primary-color);
      }
      
      &.active {
        color: var(--ml-primary-color);
        border-bottom-color: var(--ml-primary-color);
        font-weight: 500;
      }
    }
  }
  
  .animation-content {
    flex: 1;
    overflow-y: auto;
    padding: 0 8px;
    
    .animation-name-selector {
      margin-bottom: 16px;
    }
    
    .animation-form {
      margin-top: 16px;
      
      .full-width {
        width: 100%;
      }
      
      .form-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 24px;
        gap: 12px;
      }
    }
  }
  
  .animation-preview {
    margin-top: 16px;
    border: 1px solid var(--ml-border-color-light);
    border-radius: var(--ml-radius-base);
    
    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background-color: var(--ml-fill-color-light);
      border-bottom: 1px solid var(--ml-border-color-light);
      
      span {
        font-size: 14px;
        font-weight: 500;
      }
      
      .preview-actions {
        display: flex;
        gap: 8px;
      }
    }
    
    .preview-button {
      padding: 4px 12px;
      background-color: var(--ml-primary-color);
      color: white;
      border: none;
      border-radius: var(--ml-radius-small);
      cursor: pointer;
      font-size: 12px;
      transition: background-color 0.2s;
      
      &:hover {
        background-color: var(--ml-primary-color-dark);
      }
    }
    
    .preview-content {
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--ml-fill-color-blank);
      position: relative;
      overflow: hidden;
      
      .preview-element {
        width: 100px;
        height: 100px;
        background-color: var(--ml-primary-color-light);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--ml-primary-color);
        font-weight: bold;
        border-radius: var(--ml-radius-base);
      }
    }
  }
}

.animation-collapse {
  margin-bottom: 20px;
  
  :deep(.el-collapse-item__header) {
    font-weight: 500;
    color: var(--ml-text-color-primary);
  }
  
  :deep(.el-collapse-item__content) {
    padding: 16px 8px;
  }
}

/* 添加编辑模式切换样式 */
.editor-mode-switch {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background-color: var(--ml-fill-color-light);
  border-radius: var(--ml-radius-base);
  
  span {
    font-size: 14px;
    color: var(--ml-text-color-secondary);
  }
  
  i {
    color: var(--ml-text-color-secondary);
    cursor: pointer;
  }
}
</style>

<style lang="scss">
/* 新增表单布局样式 */
.animation-form-container {
  margin-bottom: 20px;
  
  .form-row {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 20px;
  }
  
  .form-item {
    flex: 1;
    min-width: 200px;
    max-width: calc(50% - 8px);
    display: flex;
    align-items: center;
  }
  
  .form-label {
    font-size: 14px;
    color: var(--ml-text-color);
    width: 120px;
  }
  
  .full-width {
    width: 100%;
  }
}
</style>