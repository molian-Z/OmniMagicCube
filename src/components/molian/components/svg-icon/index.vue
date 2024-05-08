<script setup lang="ts">
import { defineProps } from 'vue'
import { Icon } from '@iconify/vue'
defineOptions({
    name: 'SvgIcon',
})

const props = defineProps({
    icon: {
        type: String,
        default: '',
        required: true,
        expandType: 'Icon'
    },
    flip: {
        type: String,
        default: '',
        optionItems: ['', 'horizontal', 'vertical', 'both']
    },
    rotate: {
        type: Number,
        default: 0
    },
    color: {
        type: String,
        default: null,
        expandType: 'Color'
    },
    size: {
        type: [String, Number],
        default: null
    }
})

const outputType = computed(() => {
    if (/^https?:\/\//.test(props.icon)) {
        return 'img'
    }
    else if (/i-[^:]+:[^:]+/.test(props.icon)) {
        return 'unocss'
    }
    else if (props.icon && props.icon.includes(':')) {
        return 'iconify'
    }
    else {
        return 'svg'
    }
})

const style = computed(() => {
    const transform = []
    if (props.flip) {
        switch (props.flip) {
            case 'horizontal':
                transform.push('rotateY(180deg)')
                break
            case 'vertical':
                transform.push('rotateX(180deg)')
                break
            case 'both':
                transform.push('rotateX(180deg)')
                transform.push('rotateY(180deg)')
                break
        }
    }
    if (props.rotate) {
        transform.push(`rotate(${props.rotate % 360}deg)`)
    }
    return {
        ...(props.color && { color: props.color }),
        ...(props.size && { fontSize: typeof props.size === 'number' ? `${props.size}px` : props.size }),
        ...(transform.length && { transform: transform.join(' ') }),
    }
})
</script>

<template>
    <div class="svg-icon-wrapper" style="">
        <Icon class="svg-icon" v-if="outputType === 'iconify'" :icon="icon" :style="style" />
        <svg v-else class="svg-icon" aria-hidden="true" :style="style">
            <use :xlink:href="`#icon-${icon}`" rel="external nofollow"></use>
        </svg>
    </div>
</template>
<style scoped>
.svg-icon-wrapper {
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.svg-icon {
    width: 1.1em;
    height: 1.1em;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
    outline: none;
    display: inline-block;
    user-select: none;
}
</style>