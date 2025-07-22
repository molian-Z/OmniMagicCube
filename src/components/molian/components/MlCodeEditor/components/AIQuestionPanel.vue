<script setup lang="ts">
import { ref } from 'vue'
import type { AICodeAssistant } from '../ai'

interface Props {
  visible: boolean
  isProcessing: boolean
  aiAssistant?: AICodeAssistant
  codeContext?: any
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'update:isProcessing': [value: boolean] // 新增：用于更新加载状态
  'error': [error: Error]
  'apply-code': [code: string]
}>()

const question = ref('')
const aiAnswer = ref<{
  answer: string
  code?: string
  explanation?: string
} | null>(null)

/**
 * 向AI提问
 */
const askAI = async () => {
  if (!question.value.trim() || !props.aiAssistant) return
  
  emit('update:isProcessing', true) // 开始处理时设置加载状态
  
  try {
    aiAnswer.value = await props.aiAssistant.askQuestion(question.value, props.codeContext)
  } catch (error) {
    console.error('AI问答失败:', error)
    emit('error', error as Error)
  } finally {
    emit('update:isProcessing', false) // 无论成功或失败都重置加载状态
  }
}

/**
 * 应用AI建议的代码
 */
const applyAICode = (code: string) => {
  if (!code) return
  emit('apply-code', code)
  emit('update:visible', false)
}

/**
 * 复制代码到剪贴板
 */
const copyCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code)
    // 可以添加复制成功的提示
  } catch (error) {
    console.error('复制代码失败:', error)
  }
}

/**
 * 关闭面板
 */
const closePanel = () => {
  emit('update:visible', false)
  question.value = ''
  aiAnswer.value = null
}
</script>

<template>
  <!-- 背景遮罩 -->
  <Transition name="backdrop">
    <div v-if="visible" class="ai-panel-backdrop" @click="closePanel"></div>
  </Transition>
  
  <!-- 主面板 -->
  <Transition name="panel">
    <div v-if="visible" class="ai-question-panel" @click.stop>
      <!-- 头部 -->
      <div class="panel-header">
        <div class="header-content">
          <div class="header-icon">🤖</div>
          <h3>AI 智能助手</h3>
        </div>
        <button class="close-btn" @click="closePanel" title="关闭">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 7.293l2.146-2.147a.5.5 0 01.708.708L8.707 8l2.147 2.146a.5.5 0 01-.708.708L8 8.707l-2.146 2.147a.5.5 0 01-.708-.708L7.293 8 5.146 5.854a.5.5 0 01.708-.708L8 7.293z"/>
          </svg>
        </button>
      </div>
      
      <!-- 问题输入区 -->
      <div class="question-section">
        <div class="input-wrapper">
          <textarea
            v-model="question"
            placeholder="请描述您遇到的问题或需要的帮助..."
            :disabled="isProcessing"
            @keydown.enter.ctrl="askAI"
            @keydown.esc="closePanel"
            class="question-input"
          ></textarea>
          <div class="input-actions">
            <span class="input-hint">Ctrl + Enter 发送</span>
            <button
              class="ask-btn"
              @click="askAI"
              :disabled="isProcessing || !question.trim()"
              :class="{ 'is-processing': isProcessing }"
              :aria-label="isProcessing ? 'AI正在思考中，请稍候' : '发送问题给AI'"
            >
              <Transition name="spinner" mode="out-in">
                <div v-if="isProcessing" class="loading-spinner" key="spinner">
                  <div class="spinner-ring"></div>
                </div>
                <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="currentColor" key="send">
                  <path d="M15.854.146a.5.5 0 01.11.54l-5.819 14.547a.75.75 0 01-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 01.124-1.33L15.314.037a.5.5 0 01.54.11z"/>
                </svg>
              </Transition>
              <span>{{ isProcessing ? '思考中...' : '发送' }}</span>
              <!-- 可选：添加进度指示 -->
              <div v-if="isProcessing" class="progress-indicator">
                <div class="progress-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
      
      <!-- 回答内容区 -->
      <Transition name="answer">
        <div v-if="aiAnswer" class="answer-section">
          <div class="answer-content">
            <!-- AI回答 -->
            <div class="answer-text">
              <div class="answer-header">
                <div class="ai-avatar">🤖</div>
                <span class="ai-label">AI 回答</span>
              </div>
              <div class="answer-body" v-html="aiAnswer.answer"></div>
            </div>
            
            <!-- 代码块 -->
            <Transition name="code-block">
              <div v-if="aiAnswer.code" class="code-section">
                <div class="code-header">
                  <div class="code-title">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M4.854 4.146a.5.5 0 010 .708L1.707 8l3.147 3.146a.5.5 0 01-.708.708l-3.5-3.5a.5.5 0 010-.708l3.5-3.5a.5.5 0 01.708 0zm6.292 0a.5.5 0 000 .708L14.293 8l-3.147 3.146a.5.5 0 00.708.708l3.5-3.5a.5.5 0 000-.708l-3.5-3.5a.5.5 0 00-.708 0z"/>
                    </svg>
                    <span>代码内容</span>
                  </div>
                  <button class="copy-btn" @click="copyCode(aiAnswer.code!)" title="复制代码">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M4 1.5H3a2 2 0 00-2 2V14a2 2 0 002 2h10a2 2 0 002-2V3.5a2 2 0 00-2-2h-1v1h1a1 1 0 011 1V14a1 1 0 01-1 1H3a1 1 0 01-1-1V3.5a1 1 0 011-1h1v-1z"/>
                      <path d="M9.5 1a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-1a.5.5 0 01.5-.5h3zm-3-1A1.5 1.5 0 005 1.5v1A1.5 1.5 0 006.5 4h3A1.5 1.5 0 0011 2.5v-1A1.5 1.5 0 009.5 0h-3z"/>
                    </svg>
                  </button>
                </div>
                <div class="code-content">
                  <pre><code>{{ aiAnswer.code }}</code></pre>
                </div>
                <button class="apply-btn" @click="applyAICode(aiAnswer.code!)">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M13.854 3.646a.5.5 0 010 .708l-7 7a.5.5 0 01-.708 0l-3.5-3.5a.5.5 0 11.708-.708L6.5 10.293l6.646-6.647a.5.5 0 01.708 0z"/>
                  </svg>
                  <span>应用到编辑器</span>
                </button>
              </div>
            </Transition>
            
            <!-- 详细解释 -->
            <Transition name="explanation">
              <div v-if="aiAnswer.explanation" class="explanation-section">
                <div class="explanation-header">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 15A7 7 0 118 1a7 7 0 010 14zm0 1A8 8 0 108 0a8 8 0 000 16z"/>
                    <path d="M5.255 5.786a.237.237 0 00.241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 00.25.246h.811a.25.25 0 00.25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
                  </svg>
                  <span>详细解释</span>
                </div>
                <div class="explanation-content" v-html="aiAnswer.explanation"></div>
              </div>
            </Transition>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
<style lang="scss">
// CSS 变量定义
:root {
  --ai-panel-bg: var(--ml-bg-color);
  --ai-panel-border: var(--ml-border-color);
  --ai-panel-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  --ai-primary: var(--ml-primary-color);
  --ai-primary-hover: var(--ml-primary-color-hover);
  --ai-primary-disabled: var(--ml-primary-color-disabled);
  --ai-success: var(--ml-success-color);
  --ai-success-hover: var(--ml-success-color-hover);
  --ai-text-primary: var(--ml-text-color-1);
  --ai-text-secondary: var(--ml-text-color-5);
  --ai-text-muted: var(--ml-text-color-7);
  --ai-bg-secondary: var(--ml-bg-page-color);
  --ai-radius: 12px;
  --ai-radius-lg: 16px;
}
</style>
<style lang="scss" scoped>

// 背景遮罩
.ai-panel-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  z-index: 999;
}

// 主面板
.ai-question-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(90vw, 900px);
  max-height: 85vh;
  background: var(--ai-panel-bg);
  border: 1px solid var(--ai-panel-border);
  border-radius: var(--ai-radius-lg);
  box-shadow: var(--ai-panel-shadow);
  backdrop-filter: blur(20px);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  // 头部样式
  .panel-header {
    padding: 20px 24px;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
    border-bottom: 1px solid var(--ai-panel-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .header-content {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .header-icon {
        font-size: 24px;
        filter: drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3));
      }
      
      h3 {
        margin: 0;
        color: var(--ai-text-primary);
        font-size: 18px;
        font-weight: 600;
        letter-spacing: -0.025em;
      }
    }
    
    .close-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: transparent;
      padding: 0;
      border: none;
      border-radius: 8px;
      color: var(--ai-text-muted);
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      >svg{
        width: 32px;
        height: 32px;
      }
      &:hover {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
        transform: scale(1.05);
      }
    }
  }
  
  // 问题输入区
  .question-section {
    padding: 24px;
    border-bottom: 1px solid var(--ai-panel-border);
    
    .input-wrapper {
      position: relative;
      
      .question-input {
        width: 100%;
        min-height: 120px;
        padding: 16px;
        background: var(--ai-bg-secondary);
        border: 2px solid transparent;
        border-radius: var(--ai-radius);
        color: var(--ai-text-primary);
        font-size: 14px;
        line-height: 1.6;
        resize: vertical;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        
        &::placeholder {
          color: var(--ai-text-muted);
        }
        
        &:focus {
          outline: none;
          border-color: var(--ai-primary);
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }
        
        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }
      
      .input-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 12px;
        
        .input-hint {
          font-size: 12px;
          color: var(--ai-text-muted);
        }
        
        .ask-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: var(--ai-primary);
          border: none;
          border-radius: var(--ai-radius);
          color: white;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          
          &:hover:not(:disabled) {
            background: var(--ai-primary-hover);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }
          
          &:disabled {
            background: var(--ml-primary-color-disabled);
            cursor: not-allowed;
            transform: none;
          }
          
          &.is-processing {
            background: var(--ai-primary-hover);
            cursor: wait; // 更明确的等待状态
            
            // 可选：添加脉冲效果
            animation: pulse 2s infinite;
          }
          
          .progress-indicator {
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            
            .progress-dots {
              display: flex;
              gap: 4px;
              
              span {
                width: 4px;
                height: 4px;
                background: var(--ai-primary);
                border-radius: 50%;
                animation: dot-pulse 1.4s infinite ease-in-out;
                
                &:nth-child(1) { animation-delay: -0.32s; }
                &:nth-child(2) { animation-delay: -0.16s; }
                &:nth-child(3) { animation-delay: 0s; }
              }
            }
          }
        }
      }
    }
  }
  
  // 回答区域
  .answer-section {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
    
    .answer-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
      
      .answer-text {
        .answer-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          
          .ai-avatar {
            font-size: 20px;
          }
          
          .ai-label {
            font-size: 12px;
            font-weight: 500;
            color: var(--ai-text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
        }
        
        .answer-body {
          color: var(--ai-text-secondary);
          line-height: 1.7;
          font-size: 14px;
        }
      }
      
      .code-section {
        background: var(--ai-bg-secondary);
        border: 1px solid var(--ai-panel-border);
        border-radius: var(--ai-radius);
        overflow: hidden;
        
        .code-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          
          .code-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            font-weight: 500;
            color: var(--ai-text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .copy-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            background: transparent;
            border: none;
            border-radius: 6px;
            color: var(--ai-text-muted);
            cursor: pointer;
            transition: all 0.2s ease;
            
            &:hover {
              background: rgba(255, 255, 255, 0.1);
              color: var(--ai-text-primary);
            }
          }
        }
        
        .code-content {
          padding: 16px;
          
          pre {
            margin: 0;
            overflow-x: auto;
            
            code {
              color: var(--ai-text-primary);
              font-family: 'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', monospace;
              font-size: 13px;
              line-height: 1.5;
            }
          }
        }
        
        .apply-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 12px;
          background: var(--ai-success);
          border: none;
          color: white;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          
          &:hover {
            background: var(--ai-success-hover);
          }
        }
      }
      
      .explanation-section {
        padding-top: 20px;
        border-top: 1px solid var(--ai-panel-border);
        
        .explanation-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          
          span {
            font-size: 14px;
            font-weight: 500;
            color: var(--ai-text-primary);
          }
        }
        
        .explanation-content {
          color: var(--ai-text-secondary);
          line-height: 1.6;
          font-size: 13px;
        }
      }
    }
  }
}

// 过渡动画
.backdrop-enter-active,
.backdrop-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.panel-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.panel-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.panel-enter-from {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.9) translateY(20px);
}

.panel-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.95) translateY(-10px);
}

.answer-enter-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.answer-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.answer-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.answer-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.code-block-enter-active,
.explanation-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.code-block-enter-from,
.explanation-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.spinner-enter-active,
.spinner-leave-active {
  transition: all 0.2s ease;
}

.spinner-enter-from,
.spinner-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .ai-question-panel {
    width: 95vw;
    max-height: 90vh;
    
    .panel-header {
      padding: 16px 20px;
      
      .header-content h3 {
        font-size: 16px;
      }
    }
    
    .question-section,
    .answer-section {
      padding: 20px;
    }
    
    .question-input {
      min-height: 100px;
    }
    
    .input-actions {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;
      
      .ask-btn {
        width: 100%;
        justify-content: center;
      }
    }
  }
}

// 滚动条样式
.answer-section::-webkit-scrollbar {
  width: 6px;
}

.answer-section::-webkit-scrollbar-track {
  background: transparent;
}

.answer-section::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.answer-section::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

@keyframes dot-pulse {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}