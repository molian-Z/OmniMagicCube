/**
 * 组件相关的类型定义
 */

// 组件属性值类型
export interface ComponentAttrValue {
  type: 'string' | 'variable' | 'function' | 'boolean' | 'number';
  value: any;
}

// 组件属性配置
export interface ComponentPropConfig {
  type?: string;
  default?: any;
  required?: boolean;
  hidden?: boolean | ((attrs: Record<string, any>) => boolean);
  removeAttr?: boolean;
  order?: number;
  bindSubTitle?: boolean;
  label?: string;
  description?: string;
}

// 组件Emit配置
export interface ComponentEmitConfig {
  prop: string;
  emit: string;
}

// 组件指令配置
export interface ComponentDirective {
  type: 'string' | 'variable' | 'function';
  value: any;
}

// 组件数据结构
export interface ComponentData {
  id: string;
  key: string;
  name: string;
  subTitle?: string;
  attrs: Record<string, ComponentAttrValue>;
  directives?: Record<string, ComponentDirective>;
  on?: Record<string, ComponentAttrValue>;
  slots?: Record<string, any>;
  css?: Record<string, any>;
  animations?: any[];
}

// 组件定义
export interface ComponentDefinition {
  name: string;
  title: string;
  prefix?: string;
  category: string;
  orderIndex: number;
  props: Record<string, ComponentPropConfig>;
  emits?: string[];
  slots?: Record<string, any>;
}

// 工具栏项配置
export interface ToolbarItem {
  label: string;
  value: string;
  icon: string;
  show: boolean;
  type?: string;
  component: any;
  methods?: ('function' | 'variable' | 'string')[];
}

// 页面数据配置
export interface PageDataItem {
  component: any;
  value: string;
  text: string;
  group: string[];
  show?: boolean | (() => boolean);
}

// 菜单项配置
export interface MenuItem {
  icon: string;
  text: string;
  name: string;
}

// 变量配置
export interface VariableConfig {
  label: string;
  value: string;
  children?: VariableConfig[];
}

// 全局属性
export interface GlobalAttrs {
  variable: Record<string, {
    type: string;
    value: any;
    label?: string;
  }>;
}