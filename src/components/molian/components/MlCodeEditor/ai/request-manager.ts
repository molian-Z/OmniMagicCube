import type { AIConfig } from '../types'
import { ResponseParser } from './response-parser'
import { PromptManager } from './prompt-manager'

/**
 * 请求管理器
 * 负责AI API请求的队列管理和频率控制
 */
export class RequestManager {
  private requestQueue: Map<string, Promise<any>> = new Map()
  private lastRequestTime: number = 0
  private readonly MIN_REQUEST_INTERVAL = 1000 // 最小请求间隔（毫秒）
  private responseParser = new ResponseParser()
  private promptManager = new PromptManager()

  constructor(private config: AIConfig) {}

  /**
   * 检查是否可以发送请求
   */
  private canMakeRequest(): boolean {
    const now = Date.now()
    return now - this.lastRequestTime >= this.MIN_REQUEST_INTERVAL
  }

  /**
   * 等待请求间隔
   */
  private async waitForRequestInterval(): Promise<void> {
    if (!this.canMakeRequest()) {
      const waitTime = this.MIN_REQUEST_INTERVAL - (Date.now() - this.lastRequestTime)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }

  /**
   * 执行AI请求
   */
  async makeRequest(cacheKey: string, payload: any): Promise<any> {
    // 检查是否有相同的请求正在进行
    if (this.requestQueue.has(cacheKey)) {
      return this.requestQueue.get(cacheKey)
    }

    try {
      // 等待请求间隔
      await this.waitForRequestInterval()

      const requestPromise = this.executeAIRequest(payload)
      this.requestQueue.set(cacheKey, requestPromise)

      const result = await requestPromise
      this.lastRequestTime = Date.now()

      return result
    } finally {
      this.requestQueue.delete(cacheKey)
    }
  }

  /**
   * 执行实际的AI请求
   */
  private async executeAIRequest(payload: any): Promise<any> {
    const url = this.config.baseURL || 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
    
    try {
      // 增强上下文感知
      const enhancedPayload = this.enhancePayloadWithReadonlyContext(payload)
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: this.promptManager.getSystemPromptWithReadonlyContext(payload.action, payload.readonlyRegions)
            },
            {
              role: 'user',
              content: JSON.stringify(enhancedPayload)
            }
          ],
          temperature: 0.3,
          max_tokens: 4000,
          stream: false
        })
      })

      if (!response.ok) {
        throw new Error(`AI API调用失败: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('AI响应格式错误')
      }

      return this.responseParser.parseAIResponse(data.choices[0].message.content)
    } catch (error) {
      console.error('AI API调用失败:', error)
      throw error
    }
  }

  /**
   * 增强载荷的只读区域上下文
   */
  private enhancePayloadWithReadonlyContext(payload: any): any {
    if (!payload.readonlyRegions) {
      return payload
    }
  
    const enhanced = { ...payload }
    
    // 添加只读区域信息到上下文
    enhanced.contextInfo = {
      hasReadonlyRegions: true,
      headerLines: payload.readonlyRegions.header?.lines || 0,
      footerLines: payload.readonlyRegions.footer?.lines || 0,
      headerContent: payload.readonlyRegions.header?.content || '',
      footerContent: payload.readonlyRegions.footer?.content || '',
      editableRange: this.calculateEditableRange(payload.code, payload.readonlyRegions)
    }
    
    return enhanced
  }
  
  /**
   * 计算可编辑范围
   */
  private calculateEditableRange(code: string, readonlyRegions: any): { startLine: number, endLine: number } {
    const lines = code.split('\n')
    const totalLines = lines.length
    const headerLines = readonlyRegions.header?.lines || 0
    const footerLines = readonlyRegions.footer?.lines || 0
    
    return {
      startLine: headerLines + 1,
      endLine: totalLines - footerLines
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<AIConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.requestQueue.clear()
  }
}