<script setup lang="ts">
import { ref, computed, inject, watch, onMounted } from 'vue'
import { selectedComp } from '@molianComps/Designer/designerData'
import svgIcon from '@molianComps/SvgIcon/index.vue'
import SuffixUnit from '@molianComps/SuffixUnit/index.vue'
const customComps: any = inject('customComps')
const t: any = inject('mlLangs')
const { customInput, customTooltip } = customComps

const css = computed(() => {
    if(selectedComp.value){
        if(selectedComp.value.css && !selectedComp.value.css.units){
            selectedComp.value.css.units = {}
        }
        return selectedComp.value && selectedComp.value.css
    }
    return {
        borderRadius: ['0', '0', '0', '0'],
        units:{}
    }
})

const activeLink = ref(false)
const activeRadius = ref(false)

watch(selectedComp, (val) => {
    if (val && val.css && val.css.borderRadius) {
        let value: string | number = ''
        let btn = false
        if (Array.isArray(val.css.borderRadius)) {
            val.css.borderRadius?.forEach((item: string | number, index: number) => {
                if (index === 0) {
                    value = item
                }
                if (item !== value) {
                    btn = true
                }
            })
        }
        activeRadius.value = btn
    }
})

onMounted(() => {
    if (selectedComp.value && selectedComp.value.css && selectedComp.value.css.borderRadius) {
        let value: string | number = ''
        let btn = false
        if (Array.isArray(selectedComp.value.css.borderRadius)) {
            selectedComp.value.css.borderRadius.forEach((item: string | number, index: number) => {
                if (index === 0) {
                    value = item
                }
                if (item !== value) {
                    btn = true
                }
            })
        }
        activeRadius.value = btn
    }
})

const switchRadius = function () {
    if (Array.isArray(css.value.borderRadius)) {
        let val: any = css.value.borderRadius[0]
        css.value.borderRadius = [val, val, val, val]
        activeRadius.value = !activeRadius.value
    }
}

const updateModelValue = function (prop: string, val: any) {
    if (css.value && !isNaN(Number(val)) && Number(val) >= 0) {
        let newVal = val === '' ? '' : Number(val).toString()
        if (activeLink.value && ['width', 'height'].indexOf(prop) > -1) {
            css.value.width = newVal
            css.value.height = newVal
        } else if (prop === 'borderRadius') {
            css.value.borderRadius = [newVal, newVal, newVal, newVal]
        } else {
            css.value[prop] = newVal
        }
    } else if (css.value && /^(?:0|-|-?[1-9]\d*)$/.test(val)) {
        css.value[prop] = val
    } else if (css.value && !isNaN(Number(val.value))) {
        if (activeRadius.value) {
            if (Array.isArray(css.value.borderRadius)) {
                css.value.borderRadius[val.index] = Number(val.value).toString()
            }
        }
    }
}
</script>
<template>
    <div class="transform-container__body designer-container__body">
        <div class="transform-container__body-title" style="padding-left: 0;">{{ t('css.transform') }}</div>
        <div class="designer-list-item">
            <div class=" designer-input-base">
                <customInput size="small" :modelValue="css.moveX" @update:modelValue="updateModelValue('moveX', $event)"
                    :disabled="!selectedComp" placeholder="">
                    <template #prefixIcon>
                        <customTooltip :content="t('css.moveX')">
                            <svg-icon icon="posX"></svg-icon>
                        </customTooltip>
                    </template>
                    <template #suffix>
                        <suffix-unit v-model="css.units.moveX" />
                    </template>
                </customInput>
            </div>
            <div class=" designer-input-base">
                <customInput size="small" :modelValue="css.moveY" @update:modelValue="updateModelValue('moveY', $event)"
                    :disabled="!selectedComp" placeholder="">
                    <template #prefixIcon>
                        <customTooltip :content="t('css.moveY')">
                            <svg-icon icon="posY"></svg-icon>
                        </customTooltip>
                    </template>
                    <template #suffix>
                        <suffix-unit v-model="css.units.moveY" />
                    </template>
                </customInput>
            </div>
        </div>
        <div class="designer-list-item">
            <div class=" designer-input-base">
                <customInput size="small" :modelValue="css.width" @update:modelValue="updateModelValue('width', $event)"
                    :disabled="!selectedComp" placeholder="">
                    <template #prefixIcon>
                        <customTooltip :content="t('css.width')">
                            <svg-icon icon="width"></svg-icon>
                        </customTooltip>
                    </template>
                    <template #suffix>
                        <suffix-unit  v-model="css.units.width" />
                    </template>
                </customInput>
            </div>
            <div class=" designer-input-base">
                <customInput size="small" :modelValue="css.height"
                    @update:modelValue="updateModelValue('height', $event)" :disabled="!selectedComp" placeholder="">
                    <template #prefixIcon>
                        <customTooltip :content="t('css.height')">
                            <svg-icon icon="height"></svg-icon>
                        </customTooltip>
                    </template>
                    <template #suffix>
                        <suffix-unit  v-model="css.units.height" />
                    </template>
                </customInput>
            </div>
            <div :class="['link-icon', activeLink && 'is-active']" @click="activeLink = !activeLink">
                <customTooltip :content="t('css.link')">
                <svg-icon icon="link" />
                </customTooltip>
            </div>
        </div>
        <div class="designer-list-item">
            <div class=" designer-input-base">
                <customInput size="small" :modelValue="css.rotate"
                    @update:modelValue="updateModelValue('rotate', $event)" :disabled="!selectedComp" placeholder="">
                    <template #prefixIcon>
                        <customTooltip :content="t('css.rotate')">
                            <svg-icon icon="ic_angel"></svg-icon>
                        </customTooltip>
                    </template>
                    <template #suffix>
                        <span class="suffix-tag">°</span>
                    </template>
                </customInput>
            </div>
            <div class=" designer-input-base">
                <customInput size="small" :modelValue="activeRadius && '-' || Array.isArray(css.borderRadius) && css.borderRadius[0]"
                    @update:modelValue="updateModelValue('borderRadius', $event)"
                    :disabled="!selectedComp || activeRadius" placeholder="">
                    <template #prefixIcon>
                        <customTooltip :content="t('css.borderRadius')">
                            <svg-icon icon="ic_corner"></svg-icon>
                        </customTooltip>
                    </template>
                    <template #suffix>
                        <span class="suffix-tag">px</span>
                    </template>
                </customInput>
            </div>
            <div :class="['link-icon', activeRadius && 'is-active']" @click="switchRadius">
                <customTooltip :content="t('css.setRadius')">
                <svg-icon icon="ic_radius" />
                </customTooltip>
            </div>
        </div>
        <template v-if="activeRadius">
            <div class="designer-list-item">
                <div class=" designer-input-base">
                    <customInput size="small" :modelValue="Array.isArray(css.borderRadius) && css.borderRadius[0] || '0'"
                        @update:modelValue="updateModelValue('borderRadius', { index: 0, value: $event })"
                        :disabled="!selectedComp" placeholder="">
                        <template #prefixIcon>
                            <svg-icon icon="ic_corner"></svg-icon>
                        </template>
                        <template #suffix>
                            <span class="suffix-tag">px</span>
                        </template>
                    </customInput>
                </div>
                <div class=" designer-input-base">
                    <customInput size="small" :modelValue="Array.isArray(css.borderRadius) && css.borderRadius[1] || '0'"
                        @update:modelValue="updateModelValue('borderRadius', { index: 1, value: $event })"
                        :disabled="!selectedComp" placeholder="">
                        <template #prefixIcon>
                            <svg-icon icon="ic_corner" style="transform: rotate(90deg);"></svg-icon>
                        </template>
                        <template #suffix>
                            <span class="suffix-tag">px</span>
                        </template>
                    </customInput>
                </div>
            </div>
            <div class="designer-list-item">
                <div class=" designer-input-base">
                    <customInput size="small" :modelValue="Array.isArray(css.borderRadius) && css.borderRadius[3] || '0'"
                        @update:modelValue="updateModelValue('borderRadius', { index: 3, value: $event })"
                        :disabled="!selectedComp" placeholder="">
                        <template #prefixIcon>
                            <svg-icon icon="ic_corner" style="transform: rotate(270deg);"></svg-icon>
                        </template>
                        <template #suffix>
                            <span class="suffix-tag">px</span>
                        </template>
                    </customInput>
                </div>
                <div class=" designer-input-base">
                    <customInput size="small" :modelValue="Array.isArray(css.borderRadius) && css.borderRadius[2] || '0'"
                        @update:modelValue="updateModelValue('borderRadius', { index: 2, value: $event })"
                        :disabled="!selectedComp" placeholder="">
                        <template #prefixIcon>
                            <svg-icon icon="ic_corner" style="transform: rotate(180deg);"></svg-icon>
                        </template>
                        <template #suffix>
                            <span class="suffix-tag">px</span>
                        </template>
                    </customInput>
                </div>
            </div>
        </template>
    </div>
</template>


<style scoped lang="scss">
.transform-container__body {
    margin-bottom: var(--ml-mg-base);
}

.link-icon {
    cursor: pointer;
    transition: var(--ml-transition-base);
    padding: 5px 0;
    border-radius: var(--ml-radius-small);

    &:hover {
        background-color: var(--ml-bg-page-color);
    }

    &.is-active {
        background-color: var(--ml-fill-color-4);
    }
}
</style>