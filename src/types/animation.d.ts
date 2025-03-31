// 动画配置类型定义
export interface AnimationConfig {
  // 动画库选择
  engine: 'gsap' | 'css';
  name?: string;
  // 动画触发方式
  trigger: {
    type: 'onMount' | 'onUnmount' | 'onClick' | 'onHover' | 'onScroll' | 'onVisible' | 'custom';
    // 自定义触发器配置
    custom?: string;
    // 延迟触发时间(ms)
    delay?: number;
    // 触发条件 (用于状态变化动画)
    condition?: {
      // 触发值，支持多种类型
      value?: boolean | number | string | Array<boolean | number | string>;
      // 比较操作符
      operator?: '==' | '===' | '!=' | '!==' | '>' | '>=' | '<' | '<=' | 'includes' | 'startsWith' | 'endsWith';
      // 自定义条件表达式
      expression?: string;
    };
  };
  
  // 动画目标
  target?: {
    // 选择器或引用
    selector?: string;
    // 是否应用于子元素
    children?: boolean;
    // 子元素选择器
    childSelector?: string;
    // 是否交错动画
    stagger?: number | {
      amount?: number;
      from?: 'start' | 'center' | 'end' | number;
      grid?: [number, number];
    };
  };
  
  // 动画效果
  effects: AnimationEffect[];
  
  // 时间轴配置(GSAP特有)
  timeline?: {
    // 时间轴默认设置
    defaults?: {
      duration?: number;
      ease?: string;
      stagger?: number;
    };
    // 是否重复
    repeat?: number;
    // 是否往返
    yoyo?: boolean;
    // 时间轴延迟
    delay?: number;
    // 时间轴播放速度
    timeScale?: number;
    // 是否自动播放
    autoPlay?: boolean;
    // 是否暂停
    paused?: boolean;
    // 时间轴位置
    position?: number;
    // 时间轴标签
    labels?: Record<string, number>;
    // 时间轴循环部分
    loopSection?: {
      start: number | string;
      end: number | string;
      repeat?: number;
      yoyo?: boolean;
    };
    // 时间轴播放方向
    reversed?: boolean;
    // 时间轴播放模式
    smoothChildTiming?: boolean;
    // 时间轴播放完成后是否自动销毁
    autoRemoveChildren?: boolean;
  };
  
  // 回调函数
  callbacks?: {
    onStart?: string;
    onUpdate?: string;
    onComplete?: string;
  };
}

// 动画效果类型定义
export interface AnimationEffect {
  // 动画类型
  type: 'fade' | 'slide' | 'scale' | 'rotate' | 'custom';
  // 动画方向 (用于slide等)
  direction?: 'up' | 'down' | 'left' | 'right';
  // 动画持续时间(秒)
  duration: number;
  // 动画延迟(秒)
  delay?: number;
  // 缓动函数
  ease?: string;
  // 自定义属性动画
  properties?: {
    [key: string]: any;
  };
  // 动画开始值
  from?: {
    [key: string]: any;
  };
  // 动画结束值
  to?: {
    [key: string]: any;
  };
}

// 组件动画配置
export interface ComponentAnimations {
  // 入场动画
  enter?: AnimationConfig[];
  // 退场动画
  leave?: AnimationConfig[];
  // 状态变化动画
  stateChange?: {
    // 常见状态键名示例
    active: AnimationConfig[];
    inactive: AnimationConfig[];
    selected: AnimationConfig[];
    unselected: AnimationConfig[];
    expanded: AnimationConfig[];
    collapsed: AnimationConfig[];
    loading: AnimationConfig[];
    loaded: AnimationConfig[];
    error: AnimationConfig[];
    success: AnimationConfig[];
    disabled: AnimationConfig[];
    enabled: AnimationConfig[];
    focused: AnimationConfig[];
    blurred: AnimationConfig[];
    // 自定义状态
    [stateName: string]: AnimationConfig[];
  };
  // 交互动画
  interaction?: {
    // 常见交互事件键名示例
    hover: AnimationConfig[];
    click: AnimationConfig[];
    doubleClick: AnimationConfig[];
    mouseDown: AnimationConfig[];
    mouseUp: AnimationConfig[];
    mouseEnter: AnimationConfig[];
    mouseLeave: AnimationConfig[];
    focus: AnimationConfig[];
    blur: AnimationConfig[];
    drag: AnimationConfig[];
    dragStart: AnimationConfig[];
    dragEnd: AnimationConfig[];
    scroll: AnimationConfig[];
    swipe: AnimationConfig[];
    pinch: AnimationConfig[];
    // 自定义交互
    [eventName: string]: AnimationConfig[];
  };
}