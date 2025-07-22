/**
 * 缓存管理器
 * 负责AI请求结果的缓存管理
 */
export class CacheManager {
  private cache = new Map<string, any>()
  private readonly CACHE_EXPIRY = 5 * 60 * 1000 // 缓存过期时间（5分钟）

  /**
   * 获取缓存键
   */
  getCacheKey(action: string, payload: any): string {
    return `${action}_${JSON.stringify(payload)}`
  }

  /**
   * 检查缓存是否有效
   */
  isCacheValid(key: string): boolean {
    const cached = this.cache.get(key)
    if (!cached) return false
    
    const now = Date.now()
    return now - cached.timestamp < this.CACHE_EXPIRY
  }

  /**
   * 从缓存获取数据
   */
  getFromCache(key: string): any {
    const cached = this.cache.get(key)
    return cached?.data
  }

  /**
   * 设置缓存
   */
  setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  /**
   * 清除所有缓存
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * 清除特定操作的缓存
   */
  clearActionCache(action: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${action}_`)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * 生成字符串哈希值
   */
  hashCode(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    return hash.toString()
  }
}