<template>
    <transition @before-enter="onBeforeEnter" @enter="onEnter" @after-enter="onAfterEnter"
        @enter-cancelled="onEnterCancelled" @before-leave="onBeforeLeave" @leave="onLeave" @after-leave="onAfterLeave"
        @leave-cancelled="onLeaveCancelled">
        <slot></slot>
    </transition>
</template>
  
<script setup lang="ts">
import {
    defineEmits,
    defineProps
} from 'vue'
const props = defineProps({
    duration: {
        type: Number,
        default: 300
    },
    height:{
        type: Number,
        default: 0
    }
})
const $emit = defineEmits(['onBeforeEnter', 'onEnter', 'onAfterEnter', 'onEnterCancelled', 'onBeforeLeave', 'onLeave',
    'onAfterLeave', 'onLeaveCancelled'
])
// 在元素被插入到 DOM 之前被调用
// 用这个来设置元素的 "enter-from" 状态
function onBeforeEnter(el: any) {
    if (!el.dataset)
        el.dataset = {};
    el.dataset.oldPaddingTop = el.style.paddingTop;
    el.dataset.oldPaddingBottom = el.style.paddingBottom;
    el.style.transition = `max-height ${Number(props.duration)}ms ease-out 0s, max-width ${Number(props.duration)+ 200}ms ease-in `;
    // el.style.maxWidth = 0;
    el.style.maxHeight = 0;
    el.style.paddingTop = 0;
    el.style.paddingBottom = 0;
    $emit('onBeforeEnter')
}

// 在元素被插入到 DOM 之后的下一帧被调用
// 用这个来开始进入动画
function onEnter(el: any, done: () => void) {
    el.dataset.oldOverflow = el.style.overflow;
    if (el.scrollHeight !== 0) {
        el.style.maxHeight = props.height ? props.height+'px' : `${el.scrollHeight}px`;
        // el.style.maxWidth = `${el.scrollHeight}px`;
        el.style.paddingTop = el.dataset.oldPaddingTop;
        el.style.paddingBottom = el.dataset.oldPaddingBottom;
    } else {
        // el.style.maxWidth = 0;
        el.style.maxHeight = 0;
        el.style.paddingTop = el.dataset.oldPaddingTop;
        el.style.paddingBottom = el.dataset.oldPaddingBottom;
    }
    el.style.overflow = "hidden";
    $emit('onEnter')
    setTimeout(() => {
        done()
    }, props.duration)
}

// 当进入过渡完成时调用。
function onAfterEnter(el: any) {
    // el.style.maxWidth = "";
    el.style.maxHeight = "";
    el.style.overflow = el.dataset.oldOverflow;
    el.style.transition = ``;
    $emit('onAfterEnter')
}

function onEnterCancelled() {

    $emit('onEnterCancelled')
}

// 在 leave 钩子之前调用
// 大多数时候，你应该只会用到 leave 钩子
function onBeforeLeave(el: any) {
    if (!el.dataset)
        el.dataset = {};
    el.style.transition = `max-height ${Number(props.duration)}ms ease-out 0s, max-width ${Number(props.duration)+ 200}ms ease-in `;
    el.dataset.oldPaddingTop = el.style.paddingTop;
    el.dataset.oldPaddingBottom = el.style.paddingBottom;
    el.dataset.oldOverflow = el.style.overflow;
    // el.style.maxWidth = `${el.scrollWidth}px`;
    el.style.maxHeight = props.height ? props.height+'px' : `${el.scrollHeight}px`;
    el.style.overflow = "hidden";
    $emit('onBeforeLeave')
}

// 在离开过渡开始时调用
// 用这个来开始离开动画
function onLeave(el: any, done: () => void) {
    // 调用回调函数 done 表示过渡结束
    // 如果与 CSS 结合使用，则这个回调是可选参数
    if (el.scrollHeight !== 0) {
        // el.style.maxWidth = 0;
        el.style.maxHeight = 0;
        el.style.paddingTop = 0;
        el.style.paddingBottom = 0;
    }
    $emit('onLeave')
    setTimeout(() => {
        done()
    }, props.duration)
}

// 在离开过渡完成、
// 且元素已从 DOM 中移除时调用
function onAfterLeave(el: any) {
    el.style.maxHeight = "";
    // el.style.maxWidth = "";
    el.style.overflow = el.dataset.oldOverflow;
    el.style.paddingTop = el.dataset.oldPaddingTop;
    el.style.paddingBottom = el.dataset.oldPaddingBottom;
    el.style.transition = ``;
    $emit('onAfterLeave')
}

// 仅在 v-show 过渡中可用
function onLeaveCancelled() {
    $emit('onLeaveCancelled')
}
</script>
  
<style></style>