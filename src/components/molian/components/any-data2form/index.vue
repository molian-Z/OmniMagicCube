<script setup lang="ts">
import { ref, computed, defineOptions, inject, defineProps, withDefaults } from 'vue';
import { deepObjToArray } from '@molian/utils/util'
import svgIcon from '@molianComps/svg-icon/index.vue'
import IconPicker from '@molianComps/icon-picker/index.vue'
import colorPicker from '@molianComps/color-picker/index.vue'
import codeInput from '@molianComps/code-input/index.vue'
import { globalAttrs } from '../designer/designerData'
const t: any = inject('mlLangs')
const message: any = inject('ml-message')
const customComps: any = inject('customComps')
const { customInputNumber, customInput, customSwitch, customSelect, customCascader } = customComps
const props = withDefaults(defineProps<{
    modelValue: any;
    keyName: string | number | any;
    attrs: {
        [key: string]: any
    } | any;
    propData: {
        [key: string]: any
    } | any;
    selectedComp: {
        [key: string]: any
    } | any;
    isModifiers: boolean
}>(), {
    modelValue: '',
    attrs: {},
    propData: {},
    selectedComp: {},
    isModifiers: true
}
)
defineOptions({
    slotsOption: {
        default: true
    }
})
const emit = defineEmits(['update:modelValue'])
const value = computed({
    get() {
        return props.modelValue && props.modelValue.value || null
    },
    set(val) {
        emit('update:modelValue', {
            type: type.value,
            value: val
        })
    }
})

const variableValue = computed({
    get() {
        return !!value.value && value.value || []
    },
    set(val) {
        emit('update:modelValue', {
            type: type.value,
            value: val
        })
    }
})

const getOptionItemI18n = (optionItems: any[]) => {
    return optionItems.map(item => {
        let langStr = t(`attrs.${props.selectedComp.name}.${props.keyName}_optionItems.${item}`)
        if(!langStr || langStr === item){
            langStr = t(`attrs.${props.keyName}_optionItems.${item}`)
        }
        return {
            label: langStr === item ? t('attrs.' + item) : langStr,
            value: item
        }
    })
}
const types = computed(() => {
    let currentType = []
    if (Array.isArray(props.propData.type)) {
        currentType = props.propData.type.concat(['variable'])
    } else {
        currentType = [props.propData.type, 'variable']
    }
    return currentType
})
const currentTypeIndex = ref(props.modelValue && types.value.indexOf(props.modelValue.type) > -1 ? types.value.indexOf(props.modelValue.type) : 0)
const type = computed(() => {
    return types.value[currentTypeIndex.value]
})

const variableList = computed(() => {
    return globalAttrs.variable && Object.keys(globalAttrs.variable).map(key => {
        if (globalAttrs.variable) {
            const variableValue = globalAttrs.variable[key]
            if (variableValue.type === 'object') {
                const currentObjValue: {
                    label: string;
                    value: string;
                    children?: any;
                } = {
                    label: globalAttrs.variable[key].label || key,
                    value: key
                }
                let children = []
                try {
                    children = deepObjToArray(variableValue.value)
                } catch (error) {
                    message.error(currentObjValue.label + t('options.isNotJSONFormatData'))
                }
                if (children.length > 0) {
                    currentObjValue.children = children
                }
                return currentObjValue
            } else {
                return {
                    label: globalAttrs.variable[key].label || key,
                    value: key
                }
            }
        }
    })
})

const getI18n = (key: string | number, name: string) => {
    const langStr = t('attrs.' + name + '.' + key)
    return langStr === key ? t('attrs.' + key) : langStr
}

const tabType = () => {
    value.value = null
    currentTypeIndex.value = types.value.length - 1 === currentTypeIndex.value ? 0 : currentTypeIndex.value + 1
}

// 指令支持

</script>

<template>
    <div class="data2form-item">
        <div class="data2form-item__label">{{ getI18n(keyName, selectedComp && selectedComp.name || '') }}</div>
        <div class="data2form-item__input">
            <transition name="fade">
                <customCascader size="small" :options="variableList" :checkStrictly="true" :clearable="true"
                    v-model="variableValue" valueType="full" v-if="type === 'variable'" />
                <customSwitch size="small" v-model="value" v-else-if="type === 'boolean'" />
                <customSelect :options="getOptionItemI18n(propData.optionItems)" size="small" v-model="value" :clearable="true"
                    v-else-if="propData.optionItems" />
                <customInputNumber size="small" v-model="value" v-else-if="type === 'number'">
                </customInputNumber>
                <icon-picker v-model="value" :size="28" v-else-if="type === 'icon'"></icon-picker>
                <colorPicker size="small" use-type="pure"  v-model="value" v-else-if="type === 'color'" />
                <codeInput :isModifiers="isModifiers" :defaultData="propData" :mode="type" :keyName="keyName"
                    v-model="value" v-else-if="['promise', 'function', 'object', 'array'].indexOf(type) > -1" />
                <customInput size="small" v-model="value" v-else></customInput>
            </transition>
        </div>
        <div :class="['data2form-item__icon']" @click="tabType">
            <svg-icon icon="switch" class="data2form-item__svg-icon" />
        </div>
    </div>
</template>

<style scoped lang="scss">
.data2form-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: var(--ml-bg-color);
    padding: var(--ml-pd-base);
    border-radius: var(--ml-radius-base);

    .data2form-item__label {
        width: 100px;
        font-size: 14px;
        font-weight: bold;
        padding-right: var(--ml-pd-base);
        overflow: hidden;
    }

    .data2form-item__input {
        width: 120px;
        position: relative;
    }

    .data2form-item__input>* {
        width: 100%;
    }

    .data2form-item__icon {
        width: 24px;
        padding: 3px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: var(--ml-radius-base);
        user-select: none;

        &:not(&.disabled) {
            background-color: var(--ml-bg-page-color);
            transition: var(--ml-transition-base);
            cursor: pointer;

            &:hover {
                background-color: var(--ml-fill-color-3);
            }
        }

        .data2form-item__svg-icon {
            margin: 0;
            width: 12px;
        }

        &.disabled {
            .data2form-item__svg-icon {
                color: var(--ml-fill-color-2);
            }
        }
    }
}
</style>