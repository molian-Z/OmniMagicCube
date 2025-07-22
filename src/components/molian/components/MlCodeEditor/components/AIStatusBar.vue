<script setup lang="ts">
import type { AIFeatures } from '../types'

defineProps<{
  isProcessing: boolean
  aiFeatures: AIFeatures
  enableAI: boolean
}>()

const emit = defineEmits<{
  'toggle-feature': [feature: keyof AIFeatures]
  'ask-question': []
}>()

const toggleFeature = (feature: keyof AIFeatures) => {
  emit('toggle-feature', feature)
}

const getFeatureLabel = (feature: string): string => {
  const labels: Record<string, string> = {
    autoComplete: '自动补全',
    codeAnalysis: '代码分析',
    errorDetection: '错误检测',
    codeOptimization: '代码优化',
    smartRefactoring: '智能重构'
  }
  return labels[feature] || feature
}
</script>

<template>
  <div class="ai-status-bar">
    <div class="status-indicator">
      <span class="dot" :class="{ processing: isProcessing }"></span>
      <span class="status-text">{{ isProcessing ? 'AI处理中...' : 'AI就绪' }}</span>
    </div>
    
    <div class="feature-buttons">
      <button v-if="enableAI"
        v-for="(enabled, feature) in aiFeatures"
        :key="feature"
        :class="{ active: enabled }"
        @click="toggleFeature(feature)"
      >
        {{ getFeatureLabel(feature) }}
      </button>
      
      <button
        class="ask-button"
        @click="$emit('ask-question')"
        :disabled="isProcessing"
      >
        向AI提问
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ai-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  background: #1e1e1e;
  border-bottom: 1px solid #333;
  font-size: 12px;
  
  .status-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #4CAF50;
      
      &.processing {
        background: #FFC107;
        animation: pulse 1s infinite;
      }
    }
    
    .status-text {
      color: #fff;
    }
  }
  
  .feature-buttons {
    display: flex;
    gap: 8px;
    
    button {
      padding: 4px 8px;
      background: #2d2d2d;
      border: 1px solid #444;
      border-radius: 4px;
      color: #fff;
      cursor: pointer;
      font-size: 12px;
      
      &:hover {
        background: #3d3d3d;
      }
      
      &.active {
        background: #0d6efd;
        border-color: #0d6efd;
      }
      
      &.ask-button {
        background: #28a745;
        border-color: #28a745;
        
        &:hover {
          background: #218838;
        }
        
        &:disabled {
          background: #666;
          border-color: #666;
          cursor: not-allowed;
        }
      }
    }
  }
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style> 