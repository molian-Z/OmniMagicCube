<script setup>
import { ref, computed, inject, watch, onMounted } from 'vue'
import { selectedComp } from '@molianComps/designer/designerData'
import svgIcon from '@molianComps/svg-icon/index.vue'
const customComps = inject('customComps')
const t = inject('mlLangs')
const { customInput } = customComps

const css = computed(() => {
    return selectedComp.value && selectedComp.value.css || {
        borderRadius: ['0', '0', '0', '0']
    }
})

const activeLink = ref(false)
const activeRadius = ref(false)

watch(selectedComp, (val) => {
    if (val && val.css.borderRadius) {
        let value = ''
        let btn = false
        val.css.borderRadius.forEach((item, index) => {
            if(index === 0){
                value = item
            }
            if(item!== value){
                btn = true
            }
        })
        activeRadius.value = btn
    }
})

onMounted(() => {
    if (selectedComp.value && selectedComp.value.css.borderRadius) {
        let value = ''
        let btn = false
        selectedComp.value.css.borderRadius.forEach((item, index) => {
            if(index === 0){
                value = item
            }
            if(item!== value){
                btn = true
            }
        })
        activeRadius.value = btn
    }
})

const switchRadius = function () {
    let val = css.value.borderRadius[0]
    css.value.borderRadius = [val, val, val, val]
    activeRadius.value = !activeRadius.value
}

const updateModelValue = function (prop, val) {
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
    }else if(css.value && /^(?:0|-|-?[1-9]\d*)$/.test(val)){
        css.value[prop] = val
    } else if (css.value && !isNaN(Number(val.value))) {
        if (activeRadius.value) {
            css.value.borderRadius[val.index] = Number(val.value).toString()
        }
    }
}
</script>
<template>
    <div class="transform-container__body">
        <div class="transform-container__body-title">{{ t('css.transform') }}</div>
        <div class="transform-container__body-list">
            <div class="transform-container__body-list_item">
                <customInput size="small" :modelValue="css.moveX" @update:modelValue="updateModelValue('moveX', $event)"
                    :disabled="!selectedComp" placeholder="">
                    <template #prefixIcon>
                        <svg-icon icon="posX"></svg-icon>
                    </template>
                    <template #suffix>
                        <span class="suffix-tag">px</span>
                    </template>
                </customInput>
            </div>
            <div class="transform-container__body-list_item">
                <customInput size="small" :modelValue="css.moveY" @update:modelValue="updateModelValue('moveY', $event)"
                    :disabled="!selectedComp" placeholder="">
                    <template #prefixIcon>
                        <svg-icon icon="posY"></svg-icon>
                    </template>
                    <template #suffix>
                        <span class="suffix-tag">px</span>
                    </template>
                </customInput>
            </div>
            <div class="transform-container__body-list_item">
                <customInput size="small" :modelValue="css.width" @update:modelValue="updateModelValue('width', $event)"
                    :disabled="!selectedComp" placeholder="">
                    <template #prefixIcon>
                        <svg-icon icon="width"></svg-icon>
                    </template>
                    <template #suffix>
                        <span class="suffix-tag">px</span>
                    </template>
                </customInput>
            </div>
            <div class="transform-container__body-list_item">
                <customInput size="small" :modelValue="css.height" @update:modelValue="updateModelValue('height', $event)"
                    :disabled="!selectedComp" placeholder="">
                    <template #prefixIcon>
                        <svg-icon icon="height"></svg-icon>
                    </template>
                    <template #suffix>
                        <span class="suffix-tag">px</span>
                    </template>
                </customInput>
            </div>
            <div :class="['link-icon', activeLink && 'is-active']" @click="activeLink = !activeLink">
                <svg-icon icon="link" />
            </div>
            <div class="transform-container__body-list_item">
                <customInput size="small" :modelValue="css.rotate" @update:modelValue="updateModelValue('rotate', $event)"
                    :disabled="!selectedComp" placeholder="">
                    <template #prefixIcon>
                        <svg-icon icon="ic_angel"></svg-icon>
                    </template>
                    <template #suffix>
                        <span class="suffix-tag">°</span>
                    </template>
                </customInput>
            </div>
            <div class="transform-container__body-list_item">
                <customInput size="small" :modelValue="activeRadius && '-' || css.borderRadius[0]"
                    @update:modelValue="updateModelValue('borderRadius', $event)" :disabled="!selectedComp || activeRadius"
                    placeholder="">
                    <template #prefixIcon>
                        <svg-icon icon="ic_corner"></svg-icon>
                    </template>
                    <template #suffix>
                        <span class="suffix-tag">px</span>
                    </template>
                </customInput>
            </div>
            <div :class="['link-icon', activeRadius && 'is-active']" @click="switchRadius">
                <svg-icon icon="ic_radius" />
            </div>
            <template v-if="activeRadius">
                <div class="transform-container__body-list_item">
                    <customInput size="small" :modelValue="css.borderRadius[0] || '0'"
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
                <div class="transform-container__body-list_item">
                    <customInput size="small" :modelValue="css.borderRadius[1] || '0'"
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
                <div class="transform-container__body-list_item">
                    <customInput size="small" :modelValue="css.borderRadius[3] || '0'"
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
                <div class="transform-container__body-list_item">
                    <customInput size="small" :modelValue="css.borderRadius[2] || '0'"
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
            </template>
        </div>
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