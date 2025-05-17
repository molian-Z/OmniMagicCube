<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { selectedComp } from '@molianComps/Designer/designerData'
import svgIcon from '@molianComps/SvgIcon/index.vue'
import {useI18n} from 'vue-i18n'
const {t} = useI18n()
const customComps:any = inject('customComps')
const { customSelect } = customComps

// 定义类型接口
interface CSSProperties {
  constX?: string;
  constY?: string;
  position?: string;
}

interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

// 优化计算属性
const css = computed<CSSProperties>(() => {
  return selectedComp.value?.css ?? {}
})

// 提取常量配置
const CONST_TYPES = {
  VERTICAL: ['top', 'bottom', 'top2bottom'],
  HORIZONTAL: ['left', 'right', 'left2right']
} as const

// 优化选项配置
const leftOptions = ref<SelectOption[]>([
  { label: t('css.left.left'), value: 'left' },
  { label: t('css.left.center'), value: 'center', disabled: true },
  { label: t('css.left.right'), value: 'right' },
  { label: t('css.left.left2right'), value: 'left2right' }
])
const topOptions = ref([{
    label: t('css.top.top'),
    value: 'top'
}, {
    label: t('css.top.center'),
    value: 'center',
    disabled: true
}, {
    label: t('css.top.bottom'),
    value: 'bottom'
}, {
    label: t('css.top.top2bottom'),
    value: 'top2bottom'
}])

const positionOptions = ref([{
    label: t('css.positions.normal'),
    value: ''
}, {
    label: t('css.positions.relative'),
    value: 'relative'
},{
    label: t('css.positions.absolute'),
    value: 'absolute'
},{
    label: t('css.positions.static'),
    value: 'static'
},{
    label: t('css.positions.fixed'),
    value: 'fixed'
}])

// 优化约束处理函数
const svgClick = function (val: string) {
  const { constY, constX } = css.value
  
  if ((CONST_TYPES.VERTICAL as readonly string[]).includes(val)) {
    handleVerticalConstraint(val, constY)
  } else if ((CONST_TYPES.HORIZONTAL as readonly string[]).includes(val)) {
    handleHorizontalConstraint(val, constX)
  }
}

// 提取约束处理逻辑
const handleVerticalConstraint = (val: string, currentConst?: string) => {
  if (!currentConst || currentConst === val) return
  
  if ((currentConst === 'top' && val === 'bottom') || 
      (currentConst === 'bottom' && val === 'top')) {
    css.value.constY = 'top2bottom'
  } else if (currentConst === 'top2bottom') {
    css.value.constY = val === 'top' ? 'bottom' : 'top'
  } else {
    css.value.constY = val
  }
}

const handleHorizontalConstraint = (val: string, currentConst?: string) => {
  if (!currentConst || currentConst === val) return
  
  if ((currentConst === 'left' && val === 'right') || 
      (currentConst === 'right' && val === 'left')) {
    css.value.constX = 'left2right'
  } else if (currentConst === 'left2right') {
    css.value.constX = val === 'left' ? 'right' : 'left'
  } else {
    css.value.constX = val
  }
}
</script>

<template>
    <div class="css-panel">
        <div class="css-panel__header">
            <span class="css-panel__title">{{ t('css.const') }}</span>
        </div>
        <div class="css-panel__body">
            <div class="transform-container__body-constraints">
                <div class="transform-constraints_panel">
                    <svg width="108" height="108" class="constraints-svg">
                        <!-- 四周线条 -->
                        <line :class="['hoverSvg', css.constX && css.constX.includes('left') && 'is-active']" x1="5" y1="54"
                            x2="25" y2="54" stroke-width="5" @click="svgClick('left')" />
                        <line :class="['hoverSvg', css.constY && css.constY.includes('top') && 'is-active']" x1="54" y1="5"
                            x2="54" y2="25" stroke-width="5" @click="svgClick('top')" />
                        <line :class="['hoverSvg', css.constX && css.constX.includes('right') && 'is-active']" x1="83" y1="54"
                            x2="103" y2="54" stroke-width="5" @click="svgClick('right')" />
                        <line :class="['hoverSvg', css.constY && css.constY.includes('bottom') && 'is-active']" x1="54" y1="103"
                            x2="54" y2="83" stroke-width="5" @click="svgClick('bottom')" />
                        <!-- 十字线条 -->
                        <line :class="['hoverSvg', css.constX && css.constX === 'left2right' && 'is-active']" x1="33" y1="54"
                            x2="75" y2="54" stroke-width="4" @click="svgClick('left2right')" />
                        <line :class="['hoverSvg', css.constY && css.constY === 'top2bottom' && 'is-active']" x1="54" y1="33"
                            x2="54" y2="75" stroke-width="4" @click="svgClick('top2bottom')" />
                        <!-- 方形 -->
                        <rect x="29" y="29" width="50" height="50" fill="none" stroke="#E0E0E0" stroke-dasharray="4" rx="3"
                            ry="3" stroke-width="2"></rect>
                    </svg>
                </div>
                <div class="transform-constraints_pos">
                    <customSelect class="transform-constraints_pos-input" :disabled="!selectedComp"
                        :options="positionOptions" :placeholder="t('css.position')" v-model="css.position">
                    </customSelect>
                    <customSelect class="transform-constraints_pos-input" :disabled="!selectedComp"
                        :options="leftOptions" :placeholder="t('css.constX')" v-model="css.constX">
                        <template #prefixIcon>
                            <svg-icon icon="ic_const_left" />
                        </template>
                    </customSelect>
                    <customSelect class="transform-constraints_pos-input" :disabled="!selectedComp"
                        :options="topOptions" :placeholder="t('css.constY')" v-model="css.constY">
                        <template #prefixIcon>
                            <svg-icon icon="ic_const_top" />
                        </template>
                    </customSelect>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.transform-container {
    &__body {
        &-title {
            font-size: 14px;
            font-weight: 600;
            color: var(--ml-text-color-1);
            margin-bottom: var(--ml-mg-base);
            padding: var(--ml-pd-base) var(--ml-pd-lg);
            user-select: none;
        }
        
        &-constraints {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: var(--ml-pd-small) var(--ml-pd-lg);
            margin-top: 0;
        }
    }
}

.transform-constraints {
    &_panel {
        background-color: var(--ml-bg-page-color);
        width: 108px;
        height: 108px;
        border-radius: var(--ml-radius-small);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        
        .constraints-svg {
            .hoverSvg {
                cursor: pointer;
                transition: var(--ml-transition-base);
                stroke: var(--ml-text-color-1);
                stroke-linejoin: round;
                
                &:hover {
                    stroke: var(--ml-primary-color-light-hover);
                }
                
                &.is-active {
                    stroke: var(--ml-primary-color);
                }
            }
        }
    }
    
    &_pos {
        width: calc(100% - 108px - var(--ml-pd-12));
        padding-left: var(--ml-pd-12);
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--ml-mg-12);
        
        &-input {
            width: 100%;
        }
    }
}
</style>