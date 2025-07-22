<script setup lang="ts">
import type { AICompletionItem } from '../types'

defineProps<{
  suggestions: AICompletionItem[]
}>()

const emit = defineEmits<{
  'apply-suggestion': [suggestion: AICompletionItem]
}>()

const applySuggestion = (suggestion: AICompletionItem) => {
  emit('apply-suggestion', suggestion)
}
</script>

<template>
  <div v-if="suggestions.length > 0" class="ai-suggestions">
    <h4>🤖 AI建议</h4>
    <div 
      v-for="(suggestion, index) in suggestions" 
      :key="index"
      class="suggestion-item"
      @click="applySuggestion(suggestion)"
    >
      <div class="suggestion-label">{{ suggestion.label }}</div>
      <div class="suggestion-detail">{{ suggestion.detail }}</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ai-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #252526;
  border: 1px solid #3C3C3C;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  
  h4 {
    margin: 0;
    padding: 8px 12px;
    background: #2D2D30;
    color: #CCCCCC;
    font-size: 12px;
    border-bottom: 1px solid #3C3C3C;
  }
  
  .suggestion-item {
    padding: 8px 12px;
    cursor: pointer;
    border-bottom: 1px solid #3C3C3C;
    
    &:hover {
      background: #2A2D2E;
    }
    
    .suggestion-label {
      color: #CCCCCC;
      font-size: 13px;
      font-weight: 500;
    }
    
    .suggestion-detail {
      color: #858585;
      font-size: 11px;
      margin-top: 2px;
    }
  }
}
</style> 