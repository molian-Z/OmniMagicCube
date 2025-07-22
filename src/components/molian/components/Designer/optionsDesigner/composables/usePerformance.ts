import { ref, shallowRef, markRaw, defineAsyncComponent } from 'vue';
import type { Component } from 'vue';

/**
 * 性能优化 composable
 */
export function usePerformance() {
  // 组件缓存
  const componentCache = new Map<string, Component>();
  
  // 加载状态
  const loadingComponents = ref<Set<string>>(new Set());

  /**
   * 懒加载组件
   */
  const lazyLoadComponent = (importFn: () => Promise<any>, name: string) => {
    if (componentCache.has(name)) {
      return componentCache.get(name)!;
    }

    const asyncComponent = defineAsyncComponent({
      loader: async () => {
        loadingComponents.value.add(name);
        try {
          const component = await importFn();
          const rawComponent = markRaw(component.default || component);
          componentCache.set(name, rawComponent);
          return rawComponent;
        } finally {
          loadingComponents.value.delete(name);
        }
      },
      loadingComponent: () => {
        return {
          template: '<div class="loading-placeholder">加载中...</div>'
        };
      },
      errorComponent: () => {
        return {
          template: '<div class="error-placeholder">组件加载失败</div>'
        };
      },
      delay: 200,
      timeout: 10000
    });

    return asyncComponent;
  };

  /**
   * 预加载组件
   */
  const preloadComponent = async (importFn: () => Promise<any>, name: string) => {
    if (componentCache.has(name)) {
      return componentCache.get(name)!;
    }

    try {
      const component = await importFn();
      const rawComponent = markRaw(component.default || component);
      componentCache.set(name, rawComponent);
      return rawComponent;
    } catch (error) {
      console.error(`预加载组件 ${name} 失败:`, error);
      return null;
    }
  };

  /**
   * 清除组件缓存
   */
  const clearCache = (name?: string) => {
    if (name) {
      componentCache.delete(name);
    } else {
      componentCache.clear();
    }
  };

  /**
   * 获取缓存状态
   */
  const getCacheInfo = () => {
    return {
      size: componentCache.size,
      keys: Array.from(componentCache.keys()),
      loadingCount: loadingComponents.value.size,
      loadingComponents: Array.from(loadingComponents.value)
    };
  };

  /**
   * 防抖函数
   */
  const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(null, args), wait);
    };
  };

  /**
   * 节流函数
   */
  const throttle = <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(null, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  };

  return {
    lazyLoadComponent,
    preloadComponent,
    clearCache,
    getCacheInfo,
    loadingComponents,
    debounce,
    throttle,
  };
}