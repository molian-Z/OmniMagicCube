import { ref, watch, onBeforeUnmount, type Ref } from 'vue'

/**
 * 安全的防抖Hook，确保在组件切换时不会错误地更新其他组件
 * @param source 要监听的响应式数据源
 * @param callback 防抖回调函数
 * @param delay 防抖延迟时间（毫秒）
 * @param getTargetId 获取目标ID的函数，用于确保只更新原始目标
 * @returns 停止监听的函数
 */
export function useSafeDebounce<T>(
  source: Ref<T>,
  callback: (value: T, targetId: string) => void,
  delay: number = 300,
  getTargetId: () => string | undefined
) {
  let timer: NodeJS.Timeout | null = null
  
  const stopWatcher = watch(source, (newValue) => {
    // 立即记录当前目标ID
    const targetId = getTargetId()
    
    // 如果没有目标ID，直接返回
    if (!targetId) {
      return
    }
    
    // 清除之前的定时器
    if (timer) {
      clearTimeout(timer)
    }
    
    // 设置新的定时器
    timer = setTimeout(() => {
      // 检查目标ID是否仍然匹配
      const currentTargetId = getTargetId()
      if (currentTargetId === targetId) {
        callback(newValue, targetId)
      }
      timer = null
    }, delay)
  })
  
  // 清理函数
  const cleanup = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    stopWatcher()
  }
  
  // 组件卸载时自动清理
  onBeforeUnmount(cleanup)
  
  return cleanup
}

/**
 * 专门用于组件属性更新的安全防抖Hook
 * @param source 要监听的响应式数据源
 * @param attributeName 要更新的属性名
 * @param updateFunction 更新函数
 * @param selectedComp 当前选中的组件
 * @param delay 防抖延迟时间（毫秒）
 */
export function useSafeComponentUpdate<T>(
  source: Ref<T>,
  attributeName: string,
  updateFunction: (attrName: string, value: T) => void,
  selectedComp: Ref<any>,
  delay: number = 300
) {
  return useSafeDebounce(
    source,
    (value) => {
      updateFunction(attributeName, value)
    },
    delay,
    () => selectedComp.value?.id
  )
}