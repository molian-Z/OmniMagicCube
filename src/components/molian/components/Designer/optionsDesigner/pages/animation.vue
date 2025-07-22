<script setup lang="ts">
import { defineOptions } from "vue";
import { selectedComp } from "../../designerData";
import AnimationEditor from "@molianComps/AnimationEngine/AnimationEditor.vue";
import { useI18n } from 'vue-i18n';

defineOptions({
  name: "animationComp",
});
const { t } = useI18n();
</script>

<template>
  <div class="animation-designer">
    <AnimationEditor
      v-if="selectedComp"
      :component-id="selectedComp.id"
      v-model:animations="selectedComp.animations"
    />
    <div v-else class="no-component-selected">{{t('animation.pleaseSelectedComponent')}}</div>
  </div>
</template>

<style scoped lang="scss">
.animation-designer {
  height: 100%;

  .no-component-selected {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100px;
    color: var(--ml-text-color-secondary);
    font-size: 14px;
  }
}
</style>
