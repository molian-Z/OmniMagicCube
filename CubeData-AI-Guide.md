# 无界魔方设计器 CubeData 数据结构指南

## 概述

无界魔方设计器是一个可视化页面构建工具，使用 `CubeData.ModelValue` 作为核心数据结构来描述页面组件。本文档详细说明了这个数据结构，帮助AI理解并正确使用这些数据来开发页面。

## 核心数据结构

### CubeData.ModelValue 接口

这是描述页面组件的核心接口，包含了组件的所有配置信息。

```typescript
interface ModelValue {
  // 基本信息
  name: string;           // 组件名称
  category: string;       // 组件分类
  key: string;           // 组件唯一键
  id: string;            // 组件ID
  tag: string;           // HTML标签
  subTitle: string;      // 子标题
  
  // 组件配置
  attrs?: ComponentAttributes;     // 组件属性
  on?: FunctionDefinition;         // 事件监听器
  nativeOn?: FunctionDefinition;   // 原生事件监听器
  directives?: ComponentDirectives; // Vue指令
  slots?: ComponentSlots;          // 插槽配置
  css?: CSSConfiguration;          // 样式配置
  animations?: AnimationConfiguration; // 动画配置
}
```

## 详细配置说明

### 1. 组件属性 (attrs)

组件属性用于配置组件的各种参数，支持多种数据类型：

```typescript
attrs: {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function' | 'variable' | 'computed';
    value: any; // 根据type确定具体类型
  }
}
```

**使用示例：**
```javascript
// 文本组件
attrs: {
  text: {
    type: 'string',
    value: 'Hello World'
  },
  fontSize: {
    type: 'number', 
    value: 16
  },
  visible: {
    type: 'boolean',
    value: true
  }
}
```

### 2. 事件配置 (on/nativeOn)

事件配置使用 `FunctionDefinition` 类型，支持函数代码和变量绑定：

```typescript
type FunctionDefinition = {
  [eventName: string]: {
    type: 'function';
    value: {
      code: string;                    // 函数代码
      codeVar?: string[] | {name: string, value: any}[]; // 代码变量
      modifiers?: string[];            // 修饰符
      functionMode: 'function' | 'asyncFunction'; // 函数模式
      isArrow?: boolean;               // 是否箭头函数
    }
  }
}
```

**使用示例：**
```javascript
on: {
  click: {
    type: 'function',
    value: {
      code: 'console.log("按钮被点击");',
      functionMode: 'function'
    }
  }
}
```

### 3. 指令配置 (directives)

支持Vue常用指令的配置：

```typescript
directives: {
  text?: {                    // v-text指令
    type: 'string' | 'function' | 'variable';
    value: string | FunctionDefinition | string[];
  };
  show?: {                    // v-show指令
    type: 'function' | 'variable';
    value: FunctionDefinition | string[];
  };
  if?: {                      // v-if指令
    type: 'function' | 'variable';
    value: FunctionDefinition | string[];
  };
  for?: {                     // v-for指令
    type: 'variable';
    value: string[];
    idKey?: string;
    dataKey?: string;
  };
}
```

**使用示例：**
```javascript
directives: {
  show: {
    type: 'variable',
    value: ['isVisible']
  },
  for: {
    type: 'variable',
    value: ['items'],
    idKey: 'id',
    dataKey: 'item'
  }
}
```

### 4. 插槽配置 (slots)

插槽用于定义组件的子内容区域：

```typescript
slots: {
  [slotName: string]: {
    allowComps?: any[];              // 允许的组件类型
    children: CubeData.ModelValue[]; // 子组件数组
  }
}
```

**使用示例：**
```javascript
slots: {
  default: {
    allowComps: ['text', 'button', 'image'],
    children: [
      {
        name: 'text',
        category: 'basic',
        // ... 其他配置
      }
    ]
  }
}
```

### 5. CSS样式配置 (css)

CSS配置包含了丰富的样式属性：

#### 5.1 布局属性
```typescript
css: {
  // 尺寸
  width?: string | number;
  height?: string | number;
  
  // 外边距
  marginTop?: string | number;
  marginLeft?: string | number;
  marginRight?: string | number;
  marginBottom?: string | number;
  
  // 内边距
  paddingTop?: string | number;
  paddingLeft?: string | number;
  paddingRight?: string | number;
  paddingBottom?: string | number;
  
  // 定位
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  constX?: 'left' | 'center' | 'right' | 'left2right';
  constY?: 'top' | 'center' | 'bottom' | 'top2bottom';
  moveX?: string | number;
  moveY?: string | number;
}
```

#### 5.2 视觉效果
```typescript
css: {
  // 基础视觉
  opacity?: number;
  rotate?: string | number;
  borderRadius?: string[] | string | number | number[];
  
  // 颜色和背景
  color?: {
    isShow: boolean;
    modelValue: string;
  };
  background?: {
    isShow: boolean;
    modelValue: string;
  };
  
  // 边框
  border?: {
    color?: string;
    width?: number;
    style?: 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';
    type?: 'all' | 'top' | 'bottom' | 'left' | 'right';
    isShow?: boolean;
  }[];
  
  // 阴影
  boxShadow?: {
    h?: string | number;      // 水平偏移
    v?: string | number;      // 垂直偏移
    blur?: string | number;   // 模糊距离
    spread?: string | number; // 扩展距离
    color?: string;           // 阴影颜色
    type?: 'outset' | 'inset'; // 阴影类型
    isShow?: boolean;
  }[];
  
  // 特效
  mixBlendMode?: {
    isShow?: boolean;
    modelValue?: 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light' | 'difference' | 'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity';
  };
  blur?: {
    isShow?: boolean;
    modelValue?: string;
    field?: '' | 'backdropFilter' | 'filter';
  };
}
```

#### 5.3 单位配置
```typescript
css: {
  units?: {
    width: 'px' | '%' | 'rem' | 'em' | 'vw' | 'vh' | 'vmin' | 'vmax' | 'auto';
    height: 'px' | '%' | 'rem' | 'em' | 'vw' | 'vh' | 'vmin' | 'vmax' | 'auto';
    [key: string]: string; // 其他CSS属性单位
  };
  customCss?: string; // 自定义CSS代码
}
```

### 6. 动画配置 (animations)

动画系统支持四种类型的动画：

#### 6.1 入场/退场动画
```typescript
animations: {
  enter?: AnimationConfig[];  // 入场动画
  leave?: AnimationConfig[];  // 退场动画
}
```

#### 6.2 状态变化动画
```typescript
animations: {
  stateChange?: {
    // 预定义状态
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
  }
}
```

#### 6.3 交互动画
```typescript
animations: {
  interaction?: {
    // 鼠标事件
    hover: AnimationConfig[];
    click: AnimationConfig[];
    doubleClick: AnimationConfig[];
    mouseDown: AnimationConfig[];
    mouseUp: AnimationConfig[];
    mouseEnter: AnimationConfig[];
    mouseLeave: AnimationConfig[];
    
    // 焦点事件
    focus: AnimationConfig[];
    blur: AnimationConfig[];
    
    // 拖拽事件
    drag: AnimationConfig[];
    dragStart: AnimationConfig[];
    dragEnd: AnimationConfig[];
    
    // 其他交互
    scroll: AnimationConfig[];
    swipe: AnimationConfig[];
    pinch: AnimationConfig[];
    
    // 自定义交互
    [eventName: string]: AnimationConfig[];
  }
}
```

#### 6.4 动画配置详解

```typescript
interface AnimationConfig {
  // 动画引擎
  engine: 'gsap';
  name?: string;
  
  // 触发配置
  trigger: {
    type: 'onMount' | 'onUnmount' | 'onClick' | 'onHover' | 'onScroll' | 'onVisible' | 'custom';
    custom?: string;    // 自定义触发器
    delay?: number;     // 延迟时间(ms)
    condition?: {       // 触发条件
      value?: boolean | number | string | Array<boolean | number | string>;
      operator?: '==' | '===' | '!=' | '!==' | '>' | '>=' | '<' | '<=' | 'includes' | 'startsWith' | 'endsWith';
      expression?: string; // 自定义表达式
    };
  };
  
  // 动画目标
  target?: {
    selector?: string;      // CSS选择器
    children?: boolean;     // 是否应用于子元素
    childSelector?: string; // 子元素选择器
    stagger?: number | {    // 交错动画
      amount?: number;
      from?: 'start' | 'center' | 'end' | number;
      grid?: [number, number];
    };
  };
  
  // 动画效果
  effects: AnimationEffect[];
  
  // 时间轴配置(GSAP)
  timeline?: {
    defaults?: {
      duration?: number;
      ease?: string;
      stagger?: number;
    };
    repeat?: number;
    yoyo?: boolean;
    delay?: number;
    timeScale?: number;
    autoPlay?: boolean;
    paused?: boolean;
    // ... 更多配置
  };
  
  // 回调函数
  callbacks?: {
    onStart?: string;
    onUpdate?: string;
    onComplete?: string;
  };
}
```

#### 6.5 动画效果配置

```typescript
interface AnimationEffect {
  type: 'fade' | 'slide' | 'scale' | 'rotate' | 'custom';
  direction?: 'up' | 'down' | 'left' | 'right'; // slide动画方向
  duration: number;    // 持续时间(秒)
  delay?: number;      // 延迟时间(秒)
  ease?: string;       // 缓动函数
  
  // 自定义属性动画
  properties?: {
    [key: string]: any;
  };
  
  // 动画起始值
  from?: {
    [key: string]: any;
  };
  
  // 动画结束值
  to?: {
    [key: string]: any;
  };
}
```

## 全局配置 (GlobalAttrs) - 数据驱动的核心

`GlobalAttrs` 是无界魔方设计器的数据管理中心，与 `ModelValue` 相辅相成，共同构成了完整的页面数据生态系统。其中 `variable` 系统是整个项目的数据核心，负责状态管理、数据绑定和事件驱动。

```typescript
interface GlobalAttrs {
  import: { [key: string]: any };     // 导入配置
  export: { [key: string]: any };     // 导出配置
  lifecycle: FunctionDefinition;      // 生命周期钩子
  variable: VariableSystem;           // 全局变量系统 - 核心数据层
  actions: ActionConfig[];            // 全局动作配置
}
```

### Variable 系统 - 数据双向绑定的核心

`variable` 不仅仅是简单的全局变量存储，它是整个应用的**响应式数据中心**，承担着以下关键职责：

#### 1. 数据结构定义

```typescript
// ValueTypes 的完整定义
type ValueTypes = {
    string: string;                    // 字符串类型
    number: number;                    // 数字类型
    boolean: boolean;                  // 布尔类型
    object: Record<string, any>;       // 对象类型
    array: any[];                      // 数组类型
    function: FunctionDefinition;      // 函数类型
    computed: any;                     // 计算属性类型
};

// Variable系统的接口定义
interface VariableSystem {
  [variableName: string]: {
    label?: string;                    // 变量显示名称
    type?: keyof ValueTypes;          // 变量类型: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function' | 'computed'
    value?: ValueTypes[keyof ValueTypes]; // 变量值
  }
}
```

**注意**: Variable系统的核心是简洁而强大的三字段结构：
- `label`: 用于界面显示的变量名称
- `type`: 变量的数据类型，对应ValueTypes中的类型
- `value`: 变量的实际值，类型与type字段对应

**重要**: 在计算属性、函数、事件中，必须使用 `this.` 前缀来访问其他Variable中的变量或者直接访问codeVar中的变量。



#### 2. 数据双向绑定机制

##### 2.1 组件属性绑定
```javascript
// 在组件attrs中使用variable
attrs: {
  text: {
    type: 'variable',
    value: ['userMessage']  // 绑定到全局变量userMessage
  },
  visible: {
    type: 'variable', 
    value: ['isVisible']
  }
}

// 对应的全局变量定义
variable: {
  userMessage: {
    label: '用户消息',
    type: 'string',
    value: 'Hello World'
  },
  isVisible: {
    label: '是否可见',
    type: 'boolean',
    value: true
  }
}
```

##### 2.2 指令绑定
```javascript
// v-show指令绑定变量
directives: {
  show: {
    type: 'variable',
    value: ['showContent']  // 绑定到showContent变量
  },
  if: {
    type: 'variable',
    value: ['hasPermission']
  }
}
```

##### 2.3 计算属性
```javascript
variable: {
  firstName: {
    label: '姓',
    type: 'string',
    value: '张'
  },
  lastName: {
    label: '名',
    type: 'string', 
    value: '三'
  },
  fullName: {
    label: '全名',
    type: 'computed',
    value: {
      type: 'function',
      value: {
        code: 'return this.firstName + this.lastName;',
        codeVar: [],
        functionMode: 'function'
      }
    }
  }
}
```

**重要说明**: 
- 计算属性的type为'computed'
- value必须是一个函数定义，遵循FunctionDefinition结构
- 在计算函数中使用 `this.` 前缀访问其他变量
- codeVar数组不可再计算属性中使用，因为computed属性在调用时不是一个函数

#### 3. 事件处理与状态管理

##### 3.1 事件响应中的变量操作
```javascript
// 按钮点击事件修改变量
on: {
  click: {
    type: 'function',
    value: {
      code: `
        // 修改计数器
        if(evt) {
            this.counter = this.counter + 1;
        }
        
        // 切换显示状态
        this.isVisible = !this.isVisible;
        
        // 更新用户信息
        this.userInfo.lastClickTime = new Date().toISOString();
      `,
      codeVar: [evt], // 声明使用的变量
      functionMode: 'function'
    }
  }
}
```

**重要**: 在事件处理函数中，必须使用 `this.` 前缀来访问和修改变量。

##### 3.2 变量状态管理
```javascript
variable: {
  userStatus: {
    label: '用户状态',
    type: 'string',
    value: 'offline'
  },
  showWelcomeMessage: {
    label: '显示欢迎消息',
    type: 'boolean',
    value: false
  },
  shoppingCart: {
    label: '购物车',
    type: 'array',
    value: []
  },
  totalPrice: {
    label: '总价',
    type: 'number',
    value: 0
  }
}

// 通过事件处理函数实现变量监听和联动
on: {
  userStatusChange: {
    type: 'function',
    value: {
      code: `
        // 当用户状态改变时，自动更新欢迎消息
        if (userStatus === 'online') {
          this.showWelcomeMessage = true;
        } else {
          this.showWelcomeMessage = false;
        }
      `,
      codeVar: ['userStatus'],
      functionMode: 'function'
    }
  },
  cartUpdate: {
    type: 'function', 
    value: {
      code: `
        // 购物车更新时重新计算总价
        this.totalPrice = shoppingCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      `,
      codeVar: ['shoppingCart'],
      functionMode: 'function'
    }
  }
}
```

**注意**: 变量间的监听和联动关系通过事件处理函数和内部响应式机制实现，不需要在变量定义中配置监听器。

#### 4. 动画状态驱动

变量系统与动画系统深度集成，实现状态驱动的动画效果：

```javascript
// 基于变量状态的动画触发
animations: {
  stateChange: {
    loading: [{
      engine: 'gsap',
      trigger: {
        type: 'custom',
        condition: {
          value: true,
          operator: '===',
          expression: 'isLoading === true'  // 监听isLoading变量
        }
      },
      effects: [{
        type: 'custom',
        duration: 1,
        properties: {
          rotation: 360,
          repeat: -1
        }
      }]
    }]
  }
}

// 对应的变量定义
variable: {
  isLoading: {
    label: '加载状态',
    type: 'boolean',
    value: false
  }
}

// 通过事件处理函数控制动画状态
on: {
  startLoading: {
    type: 'function',
    value: {
      code: 'this.isLoading = true;',
      codeVar: [],
      functionMode: 'function'
    }
  },
  stopLoading: {
    type: 'function', 
    value: {
      code: 'isLoading = false;',
      codeVar: ['isLoading'],
      functionMode: 'function'
    }
  }
}
```

#### 5. 表单数据管理

```javascript
// 表单组件的数据绑定
const formComponent = {
  name: 'form',
  slots: {
    default: {
      children: [
        {
          name: 'input',
          attrs: {
            value: {
              type: 'variable',
              value: ['formData.username']  // 绑定到嵌套变量
            },
            placeholder: {
              type: 'string',
              value: '请输入用户名'
            }
          },
          on: {
            input: {
              type: 'function',
              value: {
                code: 'this.formData.username = $event.target.value;',
                codeVar: ['formData'],
                functionMode: 'function'
              }
            }
          }
        }
      ]
    }
  }
};

// 对应的表单数据变量
variable: {
  formData: {
    label: '表单数据',
    type: 'object',
    value: {
      username: '',
      email: '',
      password: ''
    }
  }
}

// 表单验证和数据保存通过事件处理函数实现
// 例如在表单提交事件中:
// on: {
//   submit: {
//     type: 'function',
//     value: {
//       code: `
//         // 验证表单数据
//         if (!this.formData.username || this.formData.username.length < 3) {
//           alert('用户名至少3个字符');
//           return;
//         }
//         // 保存到本地存储
//         localStorage.setItem('formData', JSON.stringify(this.formData));
//       `,
//       codeVar: ['formData']
//     }
//   }
// }
```

#### 6. 列表渲染与数据管理

```javascript
// 动态列表组件
const listComponent = {
  name: 'list',
  directives: {
    for: {
      type: 'variable',
      value: ['todoList'],
      idKey: 'id',
      dataKey: 'item'
    }
  },
  slots: {
    default: {
      children: [
        {
          name: 'listItem',
          attrs: {
            text: {
              type: 'variable',
              value: ['item.title']  // 使用循环项数据
            },
            completed: {
              type: 'variable',
              value: ['item.completed']
            }
          },
          on: {
            click: {
              type: 'function',
              value: {
                code: `
                  // 切换完成状态
                  const index = todoList.findIndex(todo => todo.id === item.id);
                  if (index !== -1) {
                    todoList[index].completed = !todoList[index].completed;
                  }
                `,
                codeVar: ['todoList', 'item'],
                functionMode: 'function'
              }
            }
          }
        }
      ]
    }
  }
};

// 对应的列表数据
variable: {
  todoList: {
    label: '待办列表',
    type: 'array',
    value: [
      { id: 1, title: '学习Vue', completed: false },
      { id: 2, title: '写代码', completed: true }
    ]
  },
  completedCount: {
    label: '已完成数量',
    type: 'number',
    value: 0
  },
  totalCount: {
    label: '总数量',
    type: 'number', 
    value: 0
  }
}

// 统计信息更新通过事件处理函数实现
// 例如在列表项点击事件中同时更新统计:
// code: `
//   const index = this.todoList.findIndex(todo => todo.id === item.id);
//   if (index !== -1) {
//     this.todoList[index].completed = !this.todoList[index].completed;
//     // 同时更新统计信息
//     this.completedCount = this.todoList.filter(item => item.completed).length;
//     this.totalCount = this.todoList.length;
//   }
// `
```

#### 7. 全局状态管理模式

```javascript
// 应用级状态管理
variable: {
  // 用户状态
  currentUser: {
    label: '当前用户',
    type: 'object',
    value: null
  },
  isLoggedIn: {
    label: '是否已登录',
    type: 'boolean',
    value: false
  },
  userPermissions: {
    label: '用户权限',
    type: 'array',
    value: []
  },
  
  // 应用配置
  appConfig: {
    label: '应用配置',
    type: 'object',
    value: {
      theme: 'light',
      language: 'zh-CN',
      apiBaseUrl: '/api'
    }
  },
  
  // 页面状态
  pageLoading: {
    label: '页面加载状态',
    type: 'boolean',
    value: false
  },
  
  // 错误处理
  globalError: {
    label: '全局错误',
    type: 'object',
    value: null
  },
  showErrorMessage: {
    label: '显示错误消息',
    type: 'boolean',
    value: false
  },
  errorMessage: {
    label: '错误消息',
    type: 'string',
    value: ''
  }
}

// 用户状态变化和错误处理通过事件处理函数实现
// 例如登录成功后:
// code: `
//   this.currentUser = loginResponse.user;
//   this.isLoggedIn = true;
//   this.userPermissions = loginResponse.user.permissions || [];
//   // 持久化存储
//   localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
// `
```

### Variable 系统的最佳实践

#### 1. 命名规范
- 使用驼峰命名法：`userName`, `isLoading`
- 布尔值使用 `is/has/can` 前缀：`isVisible`, `hasPermission`
- 数组使用复数形式：`users`, `todoItems`
- 对象使用描述性名称：`userProfile`, `appSettings`

#### 2. 类型安全
- 明确指定变量类型（type字段）
- 为复杂对象提供完整的初始值结构
- 使用computed类型处理派生数据

#### 3. 数据管理
- 保持变量定义简洁，只使用label、type、value三个字段
- 通过事件处理函数修改变量状态
- 利用内部响应式机制实现数据联动

#### 4. 标签使用
- 为每个变量提供清晰的label，便于界面显示和调试
- label应该简洁明了，准确描述变量用途

#### 5. 变量访问规范
- 在所有函数中必须使用 `this.` 前缀来访问和修改变量
- 计算属性的value必须是FunctionDefinition结构
- 在codeVar数组中声明当前事件被触发的变量例如点击事件触发的event对象
- 在计算属性中使用 `this.` 前缀访问variable中的变量

### Variable 与 ModelValue 的协作模式

```javascript
// 完整的组件-变量协作示例
const smartComponent = {
  name: 'userCard',
  category: 'display',
  
  // 组件属性绑定全局变量
  attrs: {
    userName: {
      type: 'variable',
      value: ['currentUser.name']
    },
    avatar: {
      type: 'variable', 
      value: ['currentUser.avatar']
    },
    isOnline: {
      type: 'variable',
      value: ['userStatus.isOnline']
    }
  },
  
  // 事件处理修改全局状态
  on: {
    click: {
      type: 'function',
      value: {
        code: `
          // 点击用户卡片时显示详情
          this.selectedUserId = this.currentUser.id;
          this.showUserDetail = true;
        `,
        codeVar: [],
        functionMode: 'function'
      }
    }
  },
  
  // 基于变量状态的样式
  css: {
    opacity: {
      type: 'variable',
      value: ['userStatus.isOnline ? 1 : 0.6']
    },
    borderColor: {
      type: 'variable', 
      value: ['userStatus.isOnline ? "#4CAF50" : "#9E9E9E"']
    }
  },
  
  // 状态驱动的动画
  animations: {
    stateChange: {
      online: [{
        engine: 'gsap',
        trigger: {
          type: 'custom',
          condition: {
            expression: 'userStatus.isOnline === true'
          }
        },
        effects: [{
          type: 'custom',
          duration: 0.3,
          to: { scale: 1.05, borderColor: '#4CAF50' }
        }]
      }]
    }
  }
};```

通过这种简洁而强大的三字段结构，`variable` 系统成为了连接数据、视图、交互和动画的核心纽带。所有高级功能（响应式、计算属性、监听器、持久化等）都通过内部机制和事件处理函数实现，保持了数据定义的简洁性和系统的强大功能。

**重要提醒**: 在实际使用中，variable定义严格遵循三字段结构：
- `label`: 可选，用于界面显示
- `type`: 可选，指定数据类型
- `value`: 可选，变量的实际值
确保在使用时遵循这一规范，以获得最佳的系统性能和可维护性。

## 实际使用示例

### 创建一个按钮组件

```javascript
const buttonComponent = {
  name: 'button',
  category: 'form',
  key: 'btn_001',
  id: 'btn_001',
  tag: 'button',
  subTitle: '主要按钮',
  
  attrs: {
    text: {
      type: 'string',
      value: '点击我'
    },
    disabled: {
      type: 'boolean',
      value: false
    }
  },
  
  on: {
    click: {
      type: 'function',
      value: {
        code: 'alert("按钮被点击了！");',
        functionMode: 'function'
      }
    }
  },
  
  css: {
    width: 120,
    height: 40,
    borderRadius: ['4', '4', '4', '4'],
    background: {
      isShow: true,
      modelValue: '#007bff'
    },
    color: {
      isShow: true,
      modelValue: '#ffffff'
    },
    units: {
      width: 'px',
      height: 'px'
    }
  },
  
  animations: {
    interaction: {
      hover: [{
        engine: 'gsap',
        trigger: {
          type: 'onHover'
        },
        effects: [{
          type: 'scale',
          duration: 0.2,
          to: { scale: 1.05 }
        }]
      }],
      click: [{
        engine: 'gsap',
        trigger: {
          type: 'onClick'
        },
        effects: [{
          type: 'scale',
          duration: 0.1,
          to: { scale: 0.95 }
        }]
      }]
    }
  }
};
```

### 创建一个容器组件

```javascript
const containerComponent = {
  name: 'container',
  category: 'layout',
  key: 'container_001',
  id: 'container_001',
  tag: 'div',
  subTitle: '弹性容器',
  
  attrs: {
    flexDirection: {
      type: 'string',
      value: 'column'
    }
  },
  
  css: {
    width: '100%',
    minHeight: 200,
    padding: [16, 16, 16, 16],
    background: {
      isShow: true,
      modelValue: '#f8f9fa'
    },
    border: [{
      color: '#dee2e6',
      width: 1,
      style: 'solid',
      type: 'all',
      isShow: true
    }],
    borderRadius: ['8', '8', '8', '8'],
    units: {
      width: '%',
      minHeight: 'px'
    }
  },
  
  slots: {
    default: {
      allowComps: ['text', 'button', 'image', 'input'],
      children: []
    }
  },
  
  animations: {
    enter: [{
      engine: 'gsap',
      trigger: {
        type: 'onMount'
      },
      effects: [{
        type: 'fade',
        duration: 0.5,
        from: { opacity: 0, y: 20 },
        to: { opacity: 1, y: 0 }
      }]
    }]
  }
};
```

## AI开发指导原则

### 1. 数据结构完整性
- 确保每个组件都有必需的基本属性：`name`, `category`, `key`, `id`
- 根据组件类型合理配置 `attrs`、`on`、`nativeOn`、`css`、`animations` 等属性
- 使用 `slots` 来构建组件层次结构

### 2. 类型安全
- 严格按照接口定义设置属性类型和值
- 注意 `FunctionDefinition` 的正确格式
- 确保CSS单位配置的一致性

### 3. 动画配置最佳实践
- 根据交互需求选择合适的动画类型
- 合理设置动画时长和缓动函数
- 使用状态变化动画来增强用户体验

### 4. 性能考虑
- 避免过度复杂的动画配置
- 合理使用CSS和GSAP引擎
- 注意组件嵌套层次，避免过深的结构

### 5. 可维护性
- 使用有意义的组件名称和ID
- 添加适当的注释和描述
- 保持配置的一致性和规范性

## 总结

无界魔方设计器的 `CubeData.ModelValue` 提供了一个完整而灵活的组件描述系统。通过理解这个数据结构，AI可以：

1. **创建各种类型的组件**：从简单的文本、按钮到复杂的容器和表单
2. **配置丰富的样式**：包括布局、颜色、动画等视觉效果
3. **实现交互功能**：通过事件监听和动画响应用户操作
4. **构建页面结构**：使用插槽系统组织组件层次
5. **管理全局状态**：通过全局配置管理变量和动作

掌握这个数据结构是高效使用无界魔方设计器进行页面开发的关键。