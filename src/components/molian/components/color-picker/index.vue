<script setup lang="ts">
import { inject, defineProps, defineEmits } from 'vue'
import { ColorPicker } from "vue3-colorpicker";
import "vue3-colorpicker/style.css";
const customComps:any = inject('customComps')
const { customInput, customPopup } = customComps

defineProps({
    modelValue: {
        type: String,
        default: ''
    },
    disabled: {
        type: Boolean,
        default: false
    },
    disableAlpha: {
        type: Boolean,
        default: false
    },
    disableHistory: {
        type: Boolean,
        default: false
    },
    roundHistory: {
        type: Boolean,
        default: false
    },
    useType: {
        type: String,
        default: 'both'
    },
    size:{
        type:String,
        default:''
    },
    placeholder:{
        type:String,
        default:'请选择颜色'
    }
})

const emit = defineEmits(['update:modelValue'])

const updateModel = function (value: string) {
    emit('update:modelValue', value)
}
</script>

<template>
    <customInput :size="size" :disabled="disabled" :placeholder="placeholder" :modelValue="modelValue" @update:modelValue="updateModel">
        <template #prefixIcon>
            <customPopup :destroy-on-close="true" trigger="click" :disabled="disabled" width="auto">
                <div :class="['prefix-color-selected', disabled && 'disabled']" :style="{ background: modelValue }"> </div>
                <template #content>
                    <color-picker isWidget :use-type="useType" :roundHistory="roundHistory" :disableHistory="disableHistory"
                        :disableAlpha="disableAlpha" @update:gradientColor="updateModel"
                        @update:pureColor="updateModel"></color-picker>
                </template>
            </customPopup>
        </template>
    </customInput>
</template>
<style lang="scss" scoped>
.prefix-color-selected {
    width: 16px;
    height: 16px;
    border-radius: var(--ml-radius-small);
    border: 1px solid var(--ml-fill-color-3);
    cursor: pointer;

    &.disabled {
        cursor: auto;
    }
}

</style>

<style>
.vc-colorpicker{
    box-shadow: none !important;
}
</style>