/**
 * 时间切片工具函数
 * 用于将大任务分割成小任务，避免阻塞主线程
 */

export interface TimeSlicingOptions {
  batchSize?: number; // 每批处理的数量
  timeSlice?: number; // 时间片大小（毫秒）
  onProgress?: (progress: number) => void; // 进度回调
  onComplete?: () => void; // 完成回调
}

/**
 * 使用 requestIdleCallback 的时间切片处理
 */
export function processWithTimeSlicing<T>(
  items: T[],
  processor: (item: T, index: number) => void,
  options: TimeSlicingOptions = {}
): Promise<void> {
  const {
    batchSize = 10,
    timeSlice = 5,
    onProgress,
    onComplete
  } = options;

  return new Promise((resolve) => {
    let currentIndex = 0;
    const totalItems = items.length;

    function processChunk(deadline?: IdleDeadline) {
      const startTime = performance.now();
      
      while (
        currentIndex < totalItems &&
        (deadline ? deadline.timeRemaining() > 1 : (performance.now() - startTime) < timeSlice)
      ) {
        const endIndex = Math.min(currentIndex + batchSize, totalItems);
        
        for (let i = currentIndex; i < endIndex; i++) {
          processor(items[i], i);
        }
        
        currentIndex = endIndex;
        
        // 触发进度回调
        if (onProgress) {
          onProgress(currentIndex / totalItems);
        }
      }

      if (currentIndex < totalItems) {
        // 还有任务未完成，安排下一个时间片
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(processChunk);
        } else {
          // 降级到 setTimeout
          setTimeout(() => processChunk(), 0);
        }
      } else {
        // 所有任务完成
        if (onComplete) {
          onComplete();
        }
        resolve();
      }
    }

    // 开始处理
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(processChunk);
    } else {
      setTimeout(() => processChunk(), 0);
    }
  });
}

/**
 * 使用 MessageChannel 的时间切片处理（类似 React Scheduler）
 */
export function createScheduler() {
  const channel = new MessageChannel();
  const port1 = channel.port1;
  const port2 = channel.port2;
  
  let taskQueue: (() => void)[] = [];
  let isRunning = false;
  
  port2.onmessage = function() {
    if (!isRunning && taskQueue.length > 0) {
      isRunning = true;
      const startTime = performance.now();
      
      while (taskQueue.length > 0 && (performance.now() - startTime) < 5) {
        const task = taskQueue.shift();
        if (task) task();
      }
      
      isRunning = false;
      
      if (taskQueue.length > 0) {
        port1.postMessage(null);
      }
    }
  };
  
  return function scheduleTask(task: () => void) {
    taskQueue.push(task);
    if (!isRunning) {
      port1.postMessage(null);
    }
  };
}

/**
 * 批量处理组件数据的时间切片函数
 */
export function processComponentsWithTimeSlicing<T>(
  components: T[],
  processor: (component: T) => T,
  options: TimeSlicingOptions = {}
): Promise<T[]> {
  const result: T[] = [];
  
  return new Promise((resolve) => {
    processWithTimeSlicing(
      components,
      (component, index) => {
        result[index] = processor(component);
      },
      {
        ...options,
        onComplete: () => {
          options.onComplete?.();
          resolve(result);
        }
      }
    );
  });
}

/**
 * 响应式数据的时间切片更新
 */
export function createReactiveTimeSlicing<T>(initialValue: T[]) {
  const data = ref<T[]>(initialValue);
  const isProcessing = ref(false);
  const progress = ref(0);
  
  async function updateWithTimeSlicing(
    newData: T[],
    processor?: (item: T) => T,
    options?: TimeSlicingOptions
  ) {
    if (isProcessing.value) return;
    
    isProcessing.value = true;
    progress.value = 0;
    
    try {
      if (processor) {
        const processedData = await processComponentsWithTimeSlicing(
          newData,
          processor,
          {
            ...options,
            onProgress: (p) => {
              progress.value = p;
              options?.onProgress?.(p);
            }
          }
        );
        data.value = processedData;
      } else {
        data.value = newData;
      }
    } finally {
      isProcessing.value = false;
      progress.value = 1;
    }
  }
  
  return {
    data: readonly(data),
    isProcessing: readonly(isProcessing),
    progress: readonly(progress),
    updateWithTimeSlicing
  };
}