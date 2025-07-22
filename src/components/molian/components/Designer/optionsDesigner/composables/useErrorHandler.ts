import { ref } from 'vue';

/**
 * 错误处理 composable
 */
export function useErrorHandler() {
  const error = ref<string | null>(null);
  const isLoading = ref(false);

  /**
   * 包装异步操作，提供统一的错误处理
   */
  const withErrorHandling = async <T>(
    operation: () => Promise<T> | T,
    errorMessage?: string
  ): Promise<T | null> => {
    try {
      isLoading.value = true;
      error.value = null;
      const result = await operation();
      return result;
    } catch (err) {
      const message = errorMessage || '操作失败';
      error.value = `${message}: ${err instanceof Error ? err.message : String(err)}`;
      console.error(message, err);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 清除错误状态
   */
  const clearError = () => {
    error.value = null;
  };

  /**
   * 设置错误信息
   */
  const setError = (message: string) => {
    error.value = message;
  };

  /**
   * 验证数据的通用方法
   */
  const validateData = (data: any, rules: Record<string, (value: any) => boolean | string>) => {
    for (const [field, validator] of Object.entries(rules)) {
      const result = validator(data[field]);
      if (typeof result === 'string') {
        setError(`${field}: ${result}`);
        return false;
      }
      if (!result) {
        setError(`${field} 验证失败`);
        return false;
      }
    }
    return true;
  };

  return {
    error,
    isLoading,
    withErrorHandling,
    clearError,
    setError,
    validateData,
  };
}