<script setup>
import { ref, computed, inject, onMounted } from 'vue'
import { selectedComp } from '@molianComps/designer/designerData'
import svgIcon from '@molianComps/svg-icon/index.vue'
const customComps = inject('customComps')
const t = inject('mlLangs')
const { customSelect } = customComps

const css = computed(() => {
    return selectedComp.value && selectedComp.value.css || {}
})

const leftOptions = ref([{
    label: t('css.left.left'),
    value: 'left'
}, {
    label: t('css.left.center'),
    value: 'center',
    disabled: true
}, {
    label: t('css.left.right'),
    value: 'right'
}, {
    label: t('css.left.left2right'),
    value: 'left2right'
}])
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

const svgClick = function (val) {
    const { constY, constX } = css.value
    if (['top', 'bottom', 'top2bottom'].indexOf(val) > -1) {
        if (constY === 'top' && val === 'bottom' || constY === 'bottom' && val === 'top'){
            css.value.constY = 'top2bottom'
        }else if(constY === 'top2bottom'){
            if(val === 'top'){
                css.value.constY = 'bottom'
            }else if(val === 'bottom' || val === 'top2bottom'){
                css.value.constY = 'top'
            }
        }else if(constY !== val){
            css.value.constY = val
        }
    } else if (['left', 'right', 'left2right'].indexOf(val) > -1) {
        if (constX === 'left' && val === 'right' || constX === 'right' && val === 'left'){
            css.value.constX = 'left2right'
        }else if(constX === 'left2right'){
            if(val === 'left'){
                css.value.constX = 'right'
            }else if(val === 'right' || val === 'left2right'){
                css.value.constX = 'left'
            }
        }else if(constX !== val){
            css.value.constX = val
        }
    }
}
</script>

<template>
    <div class="transform-container__body">
        <div class="transform-container__body-title">{{t('css.const')}}</div>
        <div class="transform-container__body-constraints">
            <div class="transform-constraints_panel">
                <svg width="64" height="64">
                    <!-- 四周线条 -->
                    <line :class="['hoverSvg', css.constX && css.constX.includes('left') && 'is-active']" x1="5" y1="32"
                        x2="15" y2="32" stroke-width="3" @click="svgClick('left')" />
                    <line :class="['hoverSvg', css.constY && css.constY.includes('top') && 'is-active']" x1="32" y1="5"
                        x2="32" y2="15" stroke-width="3" @click="svgClick('top')" />
                    <line :class="['hoverSvg', css.constX && css.constX.includes('right') && 'is-active']" x1="49" y1="32"
                        x2="59" y2="32" stroke-width="3" @click="svgClick('right')" />
                    <line :class="['hoverSvg', css.constY && css.constY.includes('bottom') && 'is-active']" x1="32" y1="59"
                        x2="32" y2="49" stroke-width="3" @click="svgClick('bottom')" />
                    <!-- 十字线条 -->
                    <line :class="['hoverSvg', css.constX && css.constX === 'left2right' && 'is-active']" x1="23" y1="32"
                        x2="42" y2="32" stroke-width="2" @click="svgClick('left2right')" />
                    <line :class="['hoverSvg', css.constY && css.constY === 'top2bottom' && 'is-active']" x1="32" y1="23"
                        x2="32" y2="42" stroke-width="2" @click="svgClick('top2bottom')" />
                    <!-- 方形 -->
                    <rect x="20" y="20" width="25" height="25" fill="none" stroke="#E0E0E0" stroke-dasharray="4" rx="3"
                        ry="3" stroke-width="1"></rect>
                </svg>
            </div>
            <div class="transform-constraints_pos">
                <customSelect size="small" class="transform-constraints_pos-input" :disabled="!selectedComp"
                    :options="leftOptions" v-model="css.constX">
                    <template #prefixIcon>
                        <svg-icon icon="ic_const_left" />
                    </template>
                </customSelect>
                <customSelect size="small" class="transform-constraints_pos-input" :disabled="!selectedComp"
                    :options="topOptions" v-model="css.constY">
                    <template #prefixIcon>
                        <svg-icon icon="ic_const_top" />
                    </template>
                </customSelect>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.transform-container__body-constraints {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--ml-pd-lg);
    margin-top: 0;

    .transform-constraints_panel {
        background-color: var(--ml-bg-page-color);
        width: 64px;
        height: 64px;
        border-radius: var(--ml-radius-small);

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

    .transform-constraints_pos {
        width: calc(100% - 64px);
        padding-left: var(--ml-pd-12);
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;

        .transform-constraints_pos-input{
            width: 100%;
        }

        .transform-constraints_pos-input+.transform-constraints_pos-input {
            margin-top: var(--ml-mg-12);
        }
    }
}
</style>