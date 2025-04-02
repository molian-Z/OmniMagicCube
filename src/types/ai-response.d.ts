/**
 * AI 响应数据的类型定义
 */
export namespace AIResponse {
  /**
   * 修改类型
   */
  export type ModificationType = 'single' | 'multiple';

  /**
   * 变更类型
   */
  export type ChangeType = 'added' | 'modified' | 'removed' | 'reordered';

  /**
   * 变更记录
   */
  export interface Change {
    /** 变更类型 */
    type: ChangeType;
    /** 属性路径 */
    path: string;
    /** 原始值（对于 modified 和 reordered 类型） */
    from?: any;
    /** 新值（对于 modified 和 reordered 类型） */
    to?: any;
    /** 添加的值（对于 added 类型） */
    value?: any;
    /** 被移除的原始值信息（对于 removed 类型） */
    originalValue?: any;
  }

  /**
   * 组件信息
   */
  export interface ComponentInfo {
    /** 组件 ID */
    id: string;
    /** 组件名称 */
    name: string;
    /** 组件类型（可选） */
    type?: string;
  }

  /**
   * AI 响应数据
   */
  export interface Response {
    /** 请求是否成功 */
    success: boolean;
    /** 请求 ID，通常是时间戳 */
    requestId: number;
    /** 组件信息 */
    component: ComponentInfo;
    /** 修改类型 */
    modificationType: ModificationType;
    /** 被修改的属性路径列表 */
    modifiedPaths: string[];
    /** 变更记录 */
    changes: Change[];
    /** 操作说明 */
    message: string;
    /** 详细说明 */
    details: string[];
    /** 时间戳 */
    timestamp: number;
    /** 错误信息（如果有） */
    error?: string;
  }
}