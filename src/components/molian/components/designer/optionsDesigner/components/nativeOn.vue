<script setup lang="ts">
import { computed, defineOptions, inject, ref } from 'vue';
import anyData2Form from '@molianComps/any-data2form/index.vue'
import { selectedComp } from '../../designerData'
import { defaultNativeEventMap } from '@molian/utils/defaultData'
defineOptions({
    name: 'basicComp'
})
const customComps: any = inject('customComps')
const t: any = inject('mlLangs')
const { customButton, customInput } = customComps
const appendOnInput = ref('')
const currentOn: any = computed(() => {
    if (!selectedComp.value) return {}
    return selectedComp.value && selectedComp.value.nativeOn
})

const currentNativeOn = computed(() => {
    if (!selectedComp.value) return {}
    const newNativeOn = Array.from(new Set(Object.keys(defaultNativeEventMap).concat(currentOn.value ? Object.keys(currentOn.value) : [])))
    return selectedComp.value && newNativeOn.map(item => {
        return {
            key: item,
            type: 'function',
            codeVar: defaultNativeEventMap[item]
        }
    })
})

const appendOn = function () {
    if (!appendOnInput.value || currentOn.value[appendOnInput.value]) {
        return false
    }
    currentOn.value[appendOnInput.value] = { code: "", codeVar: [] }
    appendOnInput.value = ''
}

defineExpose({
    on:currentNativeOn
})

</script>
<template>
    <div class="basic-list" v-if="selectedComp">
        <template v-for="(item) in currentNativeOn" :key="item.key">
            <anyData2Form :selectedComp="selectedComp" v-model="currentOn[item.key]" :propData="item"
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