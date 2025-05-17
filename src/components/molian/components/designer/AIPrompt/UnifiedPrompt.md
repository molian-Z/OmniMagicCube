# 请根据以下要求修改或创建符合无界魔方设计器规范的组件：

## 组件信息
组件ID: {{componentId}}
组件名称: {{componentName}}
当前组件数据: {{componentData}}
组件库: {{componentLib}} [请优先使用当前组件库完善下面的需求]

## 用户需求
{{userPrompt}}
请根据用户需求，修改组件，并自行分析及完善细节上的内容。在修改过程中，要着重提高slots插槽配置的运用优先级，充分利用slots中的children来完善需求。

## 用户意图分析
请先分析用户需求背后的真实意图：
1. 用户想要解决什么问题？
2. 用户可能的使用场景是什么？
3. 这个修改对用户体验有什么影响？

## 方案深度思考
根据用户需求深度思考，在用户的需求中还包含哪些细节性的组件，你应该帮他们考虑到他们没有提到但可能存在的情况并完善他们。要以提高slots插槽配置的优先级为核心，优先从slots插槽配置的角度去考虑可能存在的情况并完善需求。
如果用户没有提到的情况，请帮他们考虑到这些情况并完善他们的需求。

## 多角度分析
请从以下角度分析修改方案：
1. 普通用户视角：这个修改是否易于理解和使用？
2. 设计师视角：这个修改是否符合设计规范和美观要求？
3. 开发者视角：这个修改是否易于维护和扩展？在考虑维护和扩展时，要关注slots插槽配置的可维护性和扩展性。
4. 产品经理视角：这个修改是否符合产品定位和用户需求？

## 请返回修改部分的JSON数据
请根据用户需求，修改组件，并仅返回修改部分的JSON数据。不需要返回未修改的部分。
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

## 组件属性说明
### 基本信息
- 组件名称(name): 组件的名称，如"ElButton"、"ElInput"、"div"、"span"等
- 组件类别(category): 组件的分类，如"basic"、"form"、"layout"等
- 组件ID(id): 组件的唯一标识符
- 组件键(key): 组件的唯一键值
- 子标题(subTitle): 组件的简短描述

### 属性配置(attrs)
组件的属性配置，每个属性包含以下信息：
- 类型(type): 属性的数据类型，可以是"string"、"number"、"boolean"、"object"、"array"、"function"、"variable"或"computed"
- 值(value): 根据类型提供相应格式的值
  - 如果类型为variable，请提供字符串数组
  - 如果类型为function，请提供包含code、codeVar、modifiers和functionMode的对象

### 事件监听器(on)
组件内部封装的事件监听器配置，每个事件包含以下信息：
- 事件名: 
  - type: "function"
  - value: {
    "code": "事件处理代码",
    "codeVar": ["事件使用的变量"],
    "functionMode": "function或asyncFunction",
    "modifiers": ["事件修饰符，如stop, prevent等"]
  }

### 原生事件监听器(nativeOn)
组件的原生事件监听器配置，每个事件包含以下信息：
- 事件名: 
  - type: "function"
  - value: {
    "code": "事件处理代码",
    "codeVar": ["事件使用的变量"],
    "functionMode": "function或asyncFunction",
    "modifiers": ["事件修饰符，如stop, prevent等"]
  }

### 指令配置(directives)
组件的指令配置，包括：
#### 文本指令(text)
给dom元素设置文本时优先使用该指令同v-text
- type: [string/function/variable]
- value: [根据类型提供相应格式的值]

#### 显示指令(show)
同v-show
- type: [function/variable]
- value: [函数定义或变量数组]

#### 条件渲染指令(if)
同v-if
- type: [function/variable]
- value: [函数定义或变量数组]

#### 列表渲染指令(for)
同v-for
- type: "variable"
- value: [变量数组]
- idKey: [列表项ID键名]
- dataKey: [列表项数据键名]

### 插槽配置(slots)
组件的插槽配置，每个插槽包含以下信息：
- 允许的组件类型(allowComps): 固定传入[]
- 子组件(children): 插槽中的子组件数组 *** 此处是递归内容，如果是复杂组件应该递归使用该配置 *** 在修改组件时，要优先考虑通过调整slots插槽配置来满足需求。

### CSS样式配置(css)
请配置以下CSS样式：

#### 边距与填充
- marginTop/marginRight/marginBottom/marginLeft: [数值或字符串]
- paddingTop/paddingRight/paddingBottom/paddingLeft: [数值或字符串]

#### 对齐方式
- constX: [left/center/right/left2right]
- constY: [top/center/bottom/top2bottom]

#### 颜色与背景
- color: { isShow: true/false, modelValue: "颜色值" }
- background: { isShow: true/false, modelValue: "背景值" }

#### 边框与圆角
- border: [边框值]
- borderRadius: [圆角值，可以是数组或单一值]

#### 特效
- mixBlendMode: { isShow: true/false, modelValue: "混合模式值" }
- blur: { isShow: true/false, modelValue: "模糊值", field: "filter/backdropFilter" }
- boxShadow: [阴影配置数组]

#### 其他CSS属性
[列出其他需要的CSS属性]
## 修改解释
请详细解释你的修改：
1. 修改了哪些内容？为什么要这样修改？在解释时，要重点说明对slots插槽配置的修改及原因。
2. 这些修改如何解决用户的问题？
3. 这些修改可能带来的其他影响？
4. 用户可能需要注意的事项？
## 修改内容总结
除了返回JSON数据外，请使用markdown表格格式说明修改内容：
| 修改项 | 修改前 | 修改后 | 修改原因 |
| ----- | ----- | ----- | ------- |
| 属性1 | 原值 | 新值 | 解释原因 |
| 属性2 | 原值 | 新值 | 解释原因 |