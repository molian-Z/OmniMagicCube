# 无界魔方设计器组件规范文档优化

# 请根据以下要求修改或创建符合无界魔方设计器规范的组件：

## 组件信息
组件ID: {{componentId}}
组件名称: {{componentName}}
当前组件数据: {{componentData}}
组件库: {{componentLib}} [请优先使用当前组件库完善下面的需求]

## 用户需求
{{userPrompt}}

请根据用户需求，修改组件，并自行分析及完善细节上的内容。在修改过程中，要着重提高slots插槽配置的运用优先级，充分利用slots中的children来完善需求。

**重要提示：所有组件数据的修改和创建都必须严格遵守预定义的 `CubeData.ModelValue` 接口规范。该规范定义了组件的数据结构和类型，请参考下文"组件属性说明"部分以及提供的示例进行理解。**

## 用户意图分析
请先分析用户需求背后的真实意图：
1. 用户想要解决什么问题？
2. 用户可能的使用场景是什么？
3. 这个修改对用户体验有什么影响？

## 方案深度思考
根据用户需求深度思考，在用户的需求中还包含哪些细节性的组件，你应该帮他们考虑到他们没有提到但可能存在的情况并完善他们。要以提高slots插槽配置的优先级为核心，优先从slots插槽配置的角度去考虑可能存在的情况并完善需求（参考 `CubeData.ModelValue.slots` 结构）。

## 多角度分析
请从以下角度分析修改方案：
1. 普通用户视角：这个修改是否易于理解和使用？
2. 设计师视角：这个修改是否符合设计规范和美观要求？
3. 开发者视角：这个修改是否易于维护和扩展？在考虑维护和扩展时，要关注slots插槽配置的可维护性和扩展性。
4. 产品经理视角：这个修改是否符合产品定位和用户需求？

## 请返回修改部分的JSON数据
请根据用户需求，修改组件，并仅返回修改部分的JSON数据。不需要返回未修改的部分。

**返回的JSON数据必须严格符合预定义的 `CubeData.ModelValue` 接口的类型定义。请确保输出的JSON结构与"组件属性说明"和示例中展示的 `CubeData.ModelValue` 结构一致。**

写入时请注意文本内容应直接采用指令中的text指令写入。
但必须保留组件的基本标识信息（如id、name等）。
请注意使用的组件库要严格按照组件库中的组件进行完善。在涉及到组件嵌套等情况时，优先考虑通过slots插槽配置来实现。

返回格式示例：
```json:{{componentId}}
{
  "id": "comp_123456",  // 必须保留组件ID
  "name": "ElButton",   // 必须保留组件名称
  "attrs": {
    "type": {
      "type": "string",
      "value": "primary"
    }
  },
  "directives": {
    "text": {
      "type": "string",
      "value": "新的文本内容"
    }
  },
  "css": {
    "background": {
      "isShow": true,
      "modelValue": "#ff0000"
    }
  },
  "slots": {
    "default": {
      "allowComps": [],
      "children": [
        // 插槽中的子组件数组 *** 此处为递归内容 ***
      ]
    }
  }
}
```

## 修改规则
- 只返回需要修改的属性路径和新值
- 保持原有的属性结构，但只包含修改的部分
- 如果需要删除某个属性，请将其值设为null
- 如果需要添加新属性，请提供完整的属性定义
- 不要返回未修改的属性
**- 所有新增或修改的属性，其结构和类型必须符合预定义的 `CubeData.ModelValue` 接口规范。**

## 组件属性说明[CubeData.ModelValue]

### CubeData.ModelValue 接口定义

```typescript
interface ModelValue {
  // 基本信息
  name: string;                // 组件名称或HTML标签，如"ElButton"、"div"
  category?: string;           // 组件分类，如"basic"、"form"、"layout"
  id: string;                  // 组件唯一标识符
  key?: string;                // 组件唯一键值
  subTitle?: string;           // 组件简短描述
  tag?: string;                // 组件标签

  // 属性配置
  attrs?: {
    [key: string]: {
      type?: "string" | "number" | "boolean" | "object" | "array" | "function" | "variable" | "computed";
      value?: any;             // 根据type类型提供相应格式的值
      [key: string]: any;      // 其他属性
    };
  };

  // 事件监听器
  on?: {
    [eventName: string]: {
      type?: "function";
      value?: {
        code?: string;
        codeVar?: string[] | Array<{ name: string; value: any }>;
        modifiers?: string[];
        functionMode: "function" | "asyncFunction";
        isArrow?: boolean;
      };
    };
  };

  // 原生事件监听器
  nativeOn?: {
    [eventName: string]: {
      type?: "function";
      value?: {
        code?: string;
        codeVar?: string[] | Array<{ name: string; value: any }>;
        modifiers?: string[];
        functionMode: "function" | "asyncFunction";
        isArrow?: boolean;
      };
    };
  };

  // 指令配置
  directives?: {
    text?: {
      type?: "string" | "function" | "variable";
      value?: any;             // 根据type类型提供相应格式的值
    };
    show?: {
      type?: "function" | "variable";
      value?: any;             // 函数定义或变量数组
    };
    if?: {
      type?: "function" | "variable";
      value?: any;             // 函数定义或变量数组
    };
    for?: {
      type?: "variable";
      value?: string[];        // 变量数组
      idKey?: string;          // 列表项ID键名
      dataKey?: string;        // 列表项数据键名
      indexKey?: string;       // 列表项索引键名
    };
  };

  // 插槽配置
  slots?: {
    [slotName: string]: {
      allowComps?: any[];      // 允许的组件类型，通常为空数组[]
      children: ModelValue[];  // 插槽中的子组件数组，递归结构
    };
  };

  // CSS样式配置
  css?: {
    marginTop?: number;
    marginRight?: number;
    marginBottom?: number;
    marginLeft?: number;
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    
    // 对齐方式
    constX?: "left" | "center" | "right" | "left2right";
    constY?: "top" | "center" | "bottom" | "top2bottom";
    
    // 颜色与背景
    color?: {
      isShow: boolean;
      modelValue: string;      // 颜色值，如"#RRGGBB"、"rgba(...)"
    };
    background?: {
      isShow: boolean;
      modelValue: string;      // 背景值，如"#RRGGBB"、"url(...)"、"linear-gradient(...)"
    };
    
    // 边框与圆角
    border?: {
        color: string;
        width: number;
        style: "solid" | "dashed" | "dotted" | "double" | "groove" | "ridge" | "inset" | "outset";
        type: "all" | "top" | "bottom" | "left" | "right";
        isShow: boolean;
    }[];
    borderRadius?: number | number[];
    opacity?: number;
    // 特效
    mixBlendMode?: {
      isShow?: boolean;
      modelValue?: string;     // 混合模式值
    };
    blur?: {
      isShow?: boolean;
      modelValue?: string;     // 模糊值
      field?: "" | "backdropFilter" | "filter";
    };
    boxShadow?: Array<{
      h?: string | number;     // 水平偏移
      v?: string | number;     // 垂直偏移
      blur?: string | number;  // 模糊半径
      spread?: string | number; // 扩散半径
      color?: string;          // 阴影颜色
      type?: "outset" | "inset"; // 阴影类型
      isShow?: boolean;        // 是否显示
    }>;
    units: {
        width: 'px' | '%' | 'rem' | 'em' | 'vw' | 'vh' | 'vmin' | 'vmax' | 'auto';
        height: 'px' | '%' | 'rem' | 'em' | 'vw' | 'vh' | 'vmin' | 'vmax' | 'auto';
        fontSize: 'px';
        lineHeight: 'px';
        letterSpacing: 'px';
        paragraphSpacing: '%';
        marginTop: 'px';
        marginLeft: 'px';
        marginRight: 'px';
        marginBottom: 'px';
        paddingTop: 'px';
        paddingLeft: 'px';
        paddingRight: 'px';
        paddingBottom: 'px';
    };
    // 其他的CSS属性应该写入到customCss中
    customCss?: string;
  };

  // 动画配置
  animations?: {
    // 入场动画
    enter?: AnimationConfig[];
    // 退场动画
    leave?: AnimationConfig[];
    // 状态变化动画
    stateChange?: {
      active?: AnimationConfig[];        // 激活状态
      inactive?: AnimationConfig[];      // 非激活状态
      selected?: AnimationConfig[];      // 选中状态
      unselected?: AnimationConfig[];    // 未选中状态
      expanded?: AnimationConfig[];      // 展开状态
      collapsed?: AnimationConfig[];     // 折叠状态
      loading?: AnimationConfig[];       // 加载状态
      loaded?: AnimationConfig[];        // 加载完成状态
      error?: AnimationConfig[];         // 错误状态
      success?: AnimationConfig[];       // 成功状态
      disabled?: AnimationConfig[];      // 禁用状态
      enabled?: AnimationConfig[];       // 启用状态
      focused?: AnimationConfig[];       // 聚焦状态
      blurred?: AnimationConfig[];       // 失焦状态
      [stateName: string]: AnimationConfig[];  // 自定义状态
    };
    // 交互动画
    interaction?: {
      hover?: AnimationConfig[];         // 悬停动画
      click?: AnimationConfig[];         // 点击动画
      doubleClick?: AnimationConfig[];   // 双击动画
      mouseDown?: AnimationConfig[];     // 鼠标按下动画
      mouseUp?: AnimationConfig[];       // 鼠标释放动画
      mouseEnter?: AnimationConfig[];    // 鼠标进入动画
      mouseLeave?: AnimationConfig[];    // 鼠标离开动画
      focus?: AnimationConfig[];         // 聚焦动画
      blur?: AnimationConfig[];          // 失焦动画
      drag?: AnimationConfig[];          // 拖拽动画
      dragStart?: AnimationConfig[];     // 拖拽开始动画
      dragEnd?: AnimationConfig[];       // 拖拽结束动画
      scroll?: AnimationConfig[];        // 滚动动画
      swipe?: AnimationConfig[];         // 滑动动画
      pinch?: AnimationConfig[];         // 缩放动画
      [eventName: string]: AnimationConfig[];  // 自定义交互
    };
  };
}
```

### 详细说明

#### 基本信息
- **name**: 组件的名称或者HTML标签，如"ElButton"、"ElInput"、"div"、"span"等
- **category**: 组件的分类，如"basic"、"form"、"layout"等
- **id**: 组件的唯一标识符
- **key**: 组件的唯一键值
- **subTitle**: 组件的简短描述
- **tag**: 组件标签

#### 属性配置(attrs)
组件的属性配置，每个属性包含以下信息：
- **type**: 属性的数据类型，可以是"string"、"number"、"boolean"、"object"、"array"、"function"、"variable"或"computed"
- **value**: 根据类型提供相应格式的值
  - 如果类型为variable，请提供字符串数组
  - 如果类型为function，请提供包含code、codeVar、modifiers和functionMode的对象

示例：
```json
"attrs": {
  "type": {
    "type": "string",
    "value": "primary"
  },
  "disabled": {
    "type": "boolean",
    "value": false
  },
  "onClick": {
    "type": "function",
    "value": {
      "code": "console.log('Button clicked')",
      "codeVar": [],
      "functionMode": "function",
      "modifiers": []
    }
  },
  "dynamicProp": {
    "type": "variable",
    "value": ["propName"]
  }
}
```

#### 事件监听器(on)
组件内部封装的事件监听器配置，每个事件包含以下信息：
- **type**: 通常为"function"
- **value**: 包含以下属性的对象
  - **code**: 事件处理代码
  - **codeVar**: 事件使用的变量，可以是字符串数组或对象数组
  - **functionMode**: "function"或"asyncFunction"
  - **modifiers**: 事件修饰符数组，如["stop", "prevent"]
  - **isArrow**: 可选，标记是否为箭头函数

示例：
```json
"on": {
  "click": {
    "type": "function",
    "value": {
      "code": "handleClick()",
      "codeVar": ["handleClick"],
      "functionMode": "function",
      "modifiers": ["stop"],
      "isArrow": true
    }
  }
}
```

#### 原生事件监听器(nativeOn)
组件的原生事件监听器配置，结构与"on"相同。

#### 指令配置(directives)
组件的指令配置，包括：

##### 文本指令(text)
给dom元素设置文本时优先使用该指令，同v-text
- **type**: "string"、"function"或"variable"
- **value**: 根据类型提供相应格式的值

示例：
```json
"directives": {
  "text": {
    "type": "string",
    "value": "按钮文本"
  }
}
```

##### 显示指令(show)
同v-show
- **type**: "function"或"variable"
- **value**: 函数定义或变量数组

示例：
```json
"directives": {
  "show": {
    "type": "variable",
    "value": ["isVisible"]
  }
}
```

##### 条件渲染指令(if)
同v-if
- **type**: "function"或"variable"
- **value**: 函数定义或变量数组

示例：
```json
"directives": {
  "if": {
    "type": "variable",
    "value": ["shouldRender"]
  }
}
```

##### 列表渲染指令(for)
同v-for
- **type**: "variable"
- **value**: 变量数组
- **idKey**: 列表项ID键名
- **dataKey**: 列表项数据键名
- **indexKey**: 列表项索引键名

示例：
```json
"directives": {
  "for": {
    "type": "variable",
    "value": ["items"],
    "idKey": "id",
    "dataKey": "item",
    "indexKey": "index"
  }
}
```

#### 插槽配置(slots)
组件的插槽配置，每个插槽包含以下信息：
- **allowComps**: 允许的组件类型，通常为空数组[]
- **children**: 插槽中的子组件数组，递归结构，每个子组件都是一个完整的ModelValue对象

示例：
```json
"slots": {
  "default": {
    "allowComps": [],
    "children": [
      {
        "id": "comp_inner_1",
        "name": "span",
        "directives": {
          "text": {
            "type": "string",
            "value": "按钮内容"
          }
        }
      }
    ]
  },
  "icon": {
    "allowComps": [],
    "children": [
      {
        "id": "comp_inner_2",
        "name": "ElIcon",
        "slots": {
          "default": {
            "allowComps": [],
            "children": [
              {
                "id": "comp_inner_3",
                "name": "ElIconSearch"
              }
            ]
          }
        }
      }
    ]
  }
}
```

#### CSS样式配置(css)
组件的CSS样式配置，包括：

##### 边距与填充
- **marginTop/marginRight/marginBottom/marginLeft**: 数字
- **paddingTop/paddingRight/paddingBottom/paddingLeft**: 数字

示例：
```json
"css": {
  "marginTop": 10,
  "marginBottom": 20,
  "paddingLeft": 15,
  "paddingRight": 15
}
```

##### 对齐方式
- **constX**: "left"、"center"、"right"或"left2right"
- **constY**: "top"、"center"、"bottom"或"top2bottom"

示例：
```json
"css": {
  "constX": "center",
  "constY": "middle"
}
```

##### 颜色与背景
- **color**: 包含isShow和modelValue的对象
- **background**: 包含isShow和modelValue的对象

示例：
```json
"css": {
  "color": {
    "isShow": true,
    "modelValue": "#ffffff"
  },
  "background": {
    "isShow": true,
    "modelValue": "linear-gradient(45deg, #ff0000, #0000ff)"
  }
}
```

##### 边框与圆角
- **border**: 字符串、数字或它们的数组
- **borderRadius**: 字符串、数字或它们的数组

示例：
```json
"css": {
  "border": "1px solid #cccccc",
  "borderRadius": ["5", "10", "15", "20"]
}
```

##### 特效
- **mixBlendMode**: 包含isShow和modelValue的对象
- **blur**: 包含isShow、modelValue和field的对象
- **boxShadow**: 阴影配置对象数组

示例：
```json
"css": {
  "mixBlendMode": {
    "isShow": true,
    "modelValue": "overlay"
  },
  "blur": {
    "isShow": true,
    "modelValue": "5",
    "field": "backdropFilter"
  },
  "boxShadow": [
    {
      "h": "2",
      "v": "2",
      "blur": "5",
      "spread": "0",
      "color": "rgba(0,0,0,0.2)",
      "type": "outset",
      "isShow": true
    }
  ]
}
```

##### 其他CSS属性
其他标准CSS属性可以直接添加到css对象中，值应符合标准CSS属性值的格式。

示例：
```json
"css": {
  "fontSize": "16",
  "fontWeight": "bold",
  "textAlign": "center",
  "lineHeight": 1.5,
  "opacity": 0.8
}
```

## 完整示例
以下是一个完整的组件示例，展示了各种属性的正确使用方式：

```json
{
  "id": "comp_button_1",
  "name": "ElButton",
  "category": "form",
  "subTitle": "主要按钮",
  "attrs": {
    "type": {
      "type": "string",
      "value": "primary"
    },
    "size": {
      "type": "string",
      "value": "default"
    },
    "disabled": {
      "type": "boolean",
      "value": false
    }
  },
  "on": {
    "click": {
      "type": "function",
      "value": {
        "code": "handleButtonClick()",
        "codeVar": ["handleButtonClick"],
        "functionMode": "function",
        "modifiers": ["stop"],
        "isArrow": true
      }
    }
  },
  "directives": {
    "show": {
      "type": "variable",
      "value": ["isButtonVisible"]
    }
  },
  "slots": {
    "default": {
      "allowComps": [],
      "children": [
        {
          "id": "comp_text_1",
          "name": "span",
          "directives": {
            "text": {
              "type": "string",
              "value": "提交"
            }
          }
        }
      ]
    },
    "icon": {
      "allowComps": [],
      "children": [
        {
          "id": "comp_icon_1",
          "name": "ElIcon",
          "slots": {
            "default": {
              "allowComps": [],
              "children": [
                {
                  "id": "comp_icon_inner_1",
                  "name": "ElIconCheck"
                }
              ]
            }
          }
        }
      ]
    }
  },
  "css": {
    "marginTop": 10,
    "marginBottom": 10,
    "paddingLeft": 20,
    "paddingRight": 20,
    "constX": "center",
    "color": {
      "isShow": true,
      "modelValue": "#ffffff"
    },
    "background": {
      "isShow": true,
      "modelValue": "#409eff"
    },
    "borderRadius": "4px",
    "boxShadow": [
      {
        "h": "0",
        "v": "2px",
        "blur": "4px",
        "spread": "0",
        "color": "rgba(0,0,0,0.1)",
        "type": "outset",
        "isShow": true
      }
    ],
    "fontSize": "14px",
    "fontWeight": "500",
    "lineHeight": 1.5
  }
}
```

## 修改解释
请详细解释你的修改：
1. 修改了哪些内容？为什么要这样修改？在解释时，要重点说明对slots插槽配置的修改及原因。
2. 这些修改如何解决用户的问题？
3. 这些修改可能带来的其他影响？
4. 用户可能需要注意的事项？
5. 修改如何确保符合预定义的 `CubeData.ModelValue` 接口的结构和类型要求？

## 修改内容总结
除了返回JSON数据外，请使用markdown表格格式说明修改内容：
| 修改项 | 对应ModelValue路径 | 修改前 | 修改后 | 修改原因 |
| ----- | ----------------- | ----- | ----- | ------- |
| 属性1 | 例如: attrs.type   | 原值  | 新值  | 解释原因 |
| 属性2 | 例如: css.color.modelValue | 原值  | 新值  | 解释原因 |