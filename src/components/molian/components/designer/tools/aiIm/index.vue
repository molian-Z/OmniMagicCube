<script setup lang="ts">
import { inject } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { modelValue, aiImRef } from '@molianComps/designer/designerData'
import floatBall from '@molianComps/float-ball/index.vue'
const t: any = inject('mlLangs')

onClickOutside(aiImRef, () => {
  if (aiImRef.value.expand) {
    aiImRef.value.switchExpand(false)
  }
})
</script>

<template>
  <floatBall :title="t('container.aiIm')" ref="aiImRef" offsetX="52px">
    <template v-slot:toggle>
      <span class="newSpan"></span>
      <span class="newSpan"></span>
      <span></span>
      <span></span>
      <span></span>
    </template>
    <div class="ai-container">
      
    </div>
  </floatBall>
</template>

<style lang="scss" scoped>
:deep(.toggle){
  overflow:visible;
}
.toggle {
  span {
    position: absolute;
    height: 2px;
    width: 20px;
    background-color: var(--ml-fill-color-1, #E5E6EB);
    border-radius: 4px;
    cursor: pointer;
    transition: 0.5s;
    transform: translateY(0px) rotate(70deg);
    left: 4px;
  }

  span:nth-child(3) {
    width: 20px;
    left: -3px;
    transition: 0.5s;
    transform: translateY(0px) rotate(-70deg);
  }

  span:nth-child(2) {
    transform: translateY(-9px);
    width: 6px;
    height: 6px;
    border-radius: 50%;
    left: 23px;
  }

  span:nth-child(1) {
    transform: translateY(3px) rotate(90deg);
    width: 14px;
    height: 6px;
    left: 19px;
  }

  span:nth-child(4) {
    transform: translateY(3px);
    width: 8px;
    left: 5px;
  }
}

.expand {
  --box_shadow_color: rgba(60, 62, 75, 0.2);
  --streamer_light_color: linear-gradient(to right, #03a9f4, #f441a5, #ffeb3b, #09a8f4);
  --streamer_inSize: 5px;
  --radius: 10px;
  --color: #fff;
  .toggle {
    span:nth-child(5) {
      transform: translateX(39px) rotate(-45deg);
      opacity:0;
    }

    span:nth-child(1) {
      transform: translateX(-15px);
      transition-delay: 0.125s;
      width: 16px;
      animation: steamer 8s linear infinite;
    }

    span:nth-child(2) {
      transform: translateY(0px);
      transition-delay: 0.125s;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      left: 23px;
      animation: steamer 8s linear infinite;
    }

    span:nth-child(3) {
      width: 20px;
      transform: translateX(-39px) rotate(45deg);
      opacity:0;
    }

    span:nth-child(4) {
      width: 20px;
      transform: translateY(40px) rotate(315deg);
      opacity:0;
    }
    .newSpan {
      box-shadow: 0 2px 2px 1px var(--box_shadow_color);
      -webkit-box-reflect: below 0 linear-gradient(transparent, rgba(0, 0, 0, 0.2));
      background: var(--streamer_light_color);
      background-size: 400%;
      border-radius: var(--radius);
      color: var(--color);
    }

    .newSpan::before {
      content: "";
      position: absolute;
      inset: calc(var(--streamer_inSize) * -1);
      background: var(--streamer_light_color);
      background-size: 400%;
      border-radius: var(--radius);
      filter: blur(10px);
      animation: steamer 8s infinite;
    }
  }
}

@keyframes steamer {
  100% {
    background-position: -400% 0;
  }
}

.ai-container {}
</style>