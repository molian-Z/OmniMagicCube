/**
 * 全局 z-index 层级管理配置
 * 用于统一管理整个设计器的层级关系
 */

// 基础层级配置
export const Z_INDEX_CONFIG = {
  // 基础层级，用于普通组件
  BASE: 1000,
  // 层级步长，每层递增的值
  STEP: 10,
  // 拖拽提示层级偏移
  DROP_HINT_OFFSET: 5,
  // 固定层级定义
  FIXED: {
    // 工具提示
    TOOLTIP: 9998,
    // 模态框
    MODAL: 9999,
    // 最高层级
    TOP: 10000
  }
} as const;

/**
 * 计算组件的 z-index 值
 * @param treeIndex 组件在树中的层级索引
 * @param offset 额外偏移量（可选）
 * @returns 计算后的 z-index 值
 */
export function calculateZIndex(treeIndex: number, offset: number = 0): number {
  return Z_INDEX_CONFIG.BASE + (treeIndex * Z_INDEX_CONFIG.STEP) + offset;
}

/**
 * 计算拖拽提示的 z-index 值
 * @param treeIndex 组件在树中的层级索引
 * @returns 计算后的 z-index 值
 */
export function calculateDropHintZIndex(treeIndex: number): number {
  return calculateZIndex(treeIndex, Z_INDEX_CONFIG.DROP_HINT_OFFSET);
}