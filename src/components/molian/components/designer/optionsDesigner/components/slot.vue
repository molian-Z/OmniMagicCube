<script setup>
import { ref, computed, defineOptions, inject } from 'vue';
import { useCloned } from '@vueuse/core'
import { selectedComp } from '../../designerData'
import { slotsMap } from '@molian/utils/compsConfig'
import svgIcon from '@molianComps/svg-icon/index.vue'
defineOptions({
    name: 'slotComp'
})

const customComps = inject('customComps')
const t = inject('mlLangs')
const { customButton, customInput } = customComps

const tempSlot = ref('')

const slots = computed(() => {
    if (selectedComp.value) {
        return slotsMap.value[selectedComp.value.name]
    }
})
const appendSlot = function (key, val) {
    if (selectedComp.value.slots && selectedComp.value.slots[key]) {
        delete selectedComp.value.slots[key]
        return false
    }
    const { cloned } = useCloned(val)
    if (cloned.value === true || cloned.value === 'auto') {
        cloned.value = {
            children: []
        }
    } else {
        cloned.value.children = []
    }
    if (selectedComp.value.slots) {
        selectedComp.value.slots[key] = cloned.value
    } else {
        selectedComp.value.slots = {
            [key]: cloned.value
        }
    }
}
</script>
<template>
    <div class="slots-list">
        <template v-for="(val, key) in slots">
            <div class="slot-item">
                <div class="slot-item__title">
                    <svg-icon class="slot-item__icon" icon="appendSlot" />
                    <span class="slot-item__text">{{ t('slot.'+key) }}</span>
                </div>
                <customButton theme="primary" :text="true" @click="appendSlot(key, val)">
                    {{ selectedComp && selectedComp.slots && selectedComp.slots[key] && true ? t('options.remove') :
                        t('options.append') }}
                </customButton>
            </div>
        </template>
        <div class="slot-item">
            <div class="slot-item__title">
                <svg-icon class="slot-item__icon" icon="appendSlot" />
                <customInput class="slot-item__input" v-model="tempSlot" size="small" />
            </div>
            <customButton theme="primary" :text="true" @click="appendSlot(tempSlot, true)">
                {{ selectedComp && selectedComp.slots && selectedComp.slots[tempSlot] && true ? t('options.remove') :
                    t('options.append') }}
            </customButton>
        </div>
    </div>
</template>
<style scoped lang="scss">
.slot-list{
    display: flex;
    width: 100%;
    height: 510px;
}
.slot-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: var(--ml-bg-color);
    padding: var(--ml-pd-lg) var(--ml-pd-base);
    border-radius: var(--ml-radius-base);
    margin-bottom: var(--ml-mg-base);
    width: 100%;

    .slot-item__title {
        display: flex;
        justify-content: flex-start;
        align-items: center;

        .slot-item__icon {
            min-width: 20px;
            height: 20px;
        }

        .slot-item__text{
            font-size: 14px;
            font-weight: bold;
        }

        .slot-item__input{
            width: 110px;
        }
    }
}
</style>