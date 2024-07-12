<script setup lang="ts">
import { defineOptions, inject, ref } from 'vue';
import anyData2Form from '@molianComps/AnyData2Form/index.vue'
import { selectedComp, selectedNativeOn, getNativeOn, appendNativeOn } from "@molianComps/Designer/designerData";
defineOptions({
    name: 'NativeOn'
})
const customComps: any = inject('customComps')
const t: any = inject('mlLangs')
const { customButton, customInput } = customComps
const appendOnInput = ref('')
const appendOn = () => {
    appendNativeOn(appendOnInput.value)
    appendOnInput.value = ''
}
const currentNativeOn = getNativeOn()
defineExpose({
    on:currentNativeOn
})

</script>
<template>
    <div class="basic-list" v-if="selectedComp">
        <template v-for="item in currentNativeOn" :key="item.key">
            <anyData2Form :selectedComp="selectedComp" v-model="selectedNativeOn[item.key]" :propData="item"
                :keyName="item.key">
            </anyData2Form>
        </template>
        <div class="appendOn">
            <customInput size="small" v-model="appendOnInput">
                <template #suffix>
                    <customButton theme="primary" size="small" @click="appendOn">{{ t('options.appendOn') }}
                    </customButton>
                </template>
            </customInput>
        </div>
    </div>
</template>

<style scoped lang="scss">
.appendOn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: var(--ml-bg-color);
    padding: var(--ml-pd-base);
    border-radius: var(--ml-radius-base);
}
</style>