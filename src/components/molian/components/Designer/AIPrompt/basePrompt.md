# 请根据以下要求生成一个符合Molian页面设计器规范的组件JSON数据：

## 您的需求
[在这里描述您想要创建或修改的组件，包括功能、外观、交互等具体需求]

## 基本信息
- 组件名称(name): [指定组件名称]
- 组件类别(category): [指定组件类别]
- 组件标签(tag): [指定组件标签]
- 组件ID(id): [可自动生成]
- 组件键(key): [可自动生成]
- 子标题(subTitle): [可选，提供组件的简短描述]

## 属性配置(attrs)
请为组件配置以下属性：
[列出需要的属性，每个属性包含以下信息]
- 属性名: 
  - 类型(type): [string/number/boolean/object/array/function/variable/computed]
  - 值(value): [根据类型提供相应格式的值]
    - 如果类型为variable，请提供字符串数组
    - 如果类型为function，请提供以下格式的对象:
      ```
      {
        "code": "具体的函数代码",
        "codeVar": ["函数使用的变量"],
        "modifiers": [],
        "functionMode": "function或asyncFunction"
      }
      ```

## 事件监听器(on)
请配置以下事件监听器：
[列出需要的事件，每个事件包含以下信息]
- 事件名: 
  - type: "function"
  - value: {
    "code": "事件处理代码",
    "codeVar": ["事件使用的变量"],
    "functionMode": "function或asyncFunction",
    "modifiers": ["事件修饰符，如stop, prevent等"]
  }

## 原生事件监听器(nativeOn)
[如需配置原生事件，格式同上]

## 指令配置(directives)
请配置以下指令：

### 文本指令(text)
- type: [string/function/variable]
- value: [根据类型提供相应格式的值]

### 显示指令(show)
- type: [function/variable]
- value: [函数定义或变量数组]

### 条件渲染指令(if)
- type: [function/variable]
- value: [函数定义或变量数组]

### 列表渲染指令(for)
- type: "variable"
- value: [变量数组]
- idKey: [列表项ID键名]
- dataKey: [列表项数据键名]

## 插槽配置(slots)
请为组件配置以下插槽：
[列出需要的插槽，每个插槽包含以下信息]
- 插槽名: 
  - allowComps: [允许的组件类型数组]
  - children: [子组件数组，每个子组件都是一个完整的CubeData.ModelValue对象]

## CSS样式配置(css)
请配置以下CSS样式：

### 边距与填充
- marginTop/marginRight/marginBottom/marginLeft: [数值或字符串]
- paddingTop/paddingRight/paddingBottom/paddingLeft: [数值或字符串]

### 对齐方式
- constX: [left/center/right/left2right]
- constY: [top/center/bottom/top2bottom]

### 颜色与背景
- color: { isShow: true/false, modelValue: "颜色值" }
- background: { isShow: true/false, modelValue: "背景值" }

### 边框与圆角
- border: [边框值]
- borderRadius: [圆角值，可以是数组或单一值]

### 特效
- mixBlendMode: { isShow: true/false, modelValue: "混合模式值" }
- blur: { isShow: true/false, modelValue: "模糊值", field: "filter/backdropFilter" }
- boxShadow: [阴影配置数组]

### 其他CSS属性
[列出其他需要的CSS属性]

请确保生成的JSON结构完全符合CubeData.ModelValue接口规范，并提供一个完整、有效的组件配置。