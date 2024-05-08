<script lang="ts" setup>
import { ref, inject } from 'vue'
import svgIcon from '@molianComps/svg-icon/index.vue'
const t: any = inject('mlLangs')
const foldAI = ref(true)
const iconValue = ref('')
</script>

<template>
  <div class="designer-container__body-title">
    <span>{{ t('container.AIInteraction') }}</span>
    <svg-icon icon="y-fold" :class="['content-fold', foldAI && 'is-fold-icon']" @click="foldAI = !foldAI"></svg-icon>
  </div>
  <div :class="['ai-content', foldAI && 'is-fold']">
    <icon-picker v-model="iconValue" :size="48" />
  </div>
</template>

<style lang="scss" scoped>
.content-fold {
  cursor: pointer;
  transition: var(--ml-transition-base);

  &.is-fold-icon {
    transform: scaleY(-1);
  }
}

.ai-content {
  height: 185px;
  transition: var(--ml-transition-base);

  &.is-fold {
    height: 0;
  }
}
</style>