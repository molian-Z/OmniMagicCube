import {
  toKebabCase
} from './util'
import { useElementBounding } from '@vueuse/core'
import { compsRef } from '@molianDesigner/designerData'
export interface IStyleMap {
  opacity?: IOpacity;
  rotate?: IOpacity;
  borderRadius?: IBorderRadius;
  margin?: IBorderRadius;
  padding?: IBorderRadius;
  constX?: IConstX;
  constY?: IConstX;
  color?: IOpacity;
  background?: IOpacity;
  mixBlendMode?: IOpacity;
  blur?: IBlur;
  border?: IBlur;
  boxShadow?: IBorderRadius;
  [key: string]: any;
  [index: number]: any;
}
export interface IBlur {
  prop?: unknown;
  value?: unknown;
}
export interface IConstX {
  rawValue?: unknown;
}
export interface IBorderRadius {
  isGlobal?: boolean;
  prop?: string;
  value?: unknown;
}
export interface IOpacity {
  prop?: string;
  value?: unknown;
}
const suffix: {
  [key: string]: 'px' | '%';
} = {
  'width': 'px',
  'height': 'px',
  'fontSize': 'px',
  'lineHeight': 'px',
  'letterSpacing': 'px',
  'paragraphSpacing': '%',
}
const styleMap: IStyleMap = {
  opacity: {
    prop: 'opacity',
    value: function (val: string) {
      return val == '100' || !val ? '' : val + '%'
    }

  },
  rotate: {
    prop: 'transform',
    value: function (val: string) {
      return val && val !== '0' ? `rotate(${val}deg)` : ''
    }
  },
  borderRadius: {
    isGlobal: true,
    prop: 'border-radius',
    value: function (val: any[]) {
      const index = val.findIndex((item: string) => {
        return item !== '0' || !item
      })
      return index > -1 ? val && val.map((item: string) => {
        return item + 'px'
      }).join(' ') : ''
    }
  },
  margin: {
    isGlobal: true,
    prop: 'margin',
    value: function (val: any[]) {
      const index = val.findIndex((item: string) => {
        return item !== '0' || !item
      })
      return index > -1 ? val && val.map((item: string) => {
        return item + 'px'
      }).join(' ') : ''
    }
  },
  padding: {
    isGlobal: true,
    prop: 'padding',
    value: function (val: any[]) {
      const index = val.findIndex((item: string) => {
        return item !== '0' || !item
      })
      return index > -1 ? val && val.map((item: string) => {
        return item + 'px'
      }).join(' ') : ''
    }
  },
  // 暂不转换xy,实际使用应根据组件因素考虑是否替换为margin-left、margin-top
  constX: {
    rawValue: function (val: string, obj: { moveX: string; }, key: any) {
      if (!obj.moveX || obj.moveX == '0') return ''
      const elementBounding: {
        left: any;
        right: any;
      } = useElementBounding(compsRef[key])
      const { left, right } = elementBounding
      if (val === 'left') {
        return {
          left: obj.moveX + 'px'
        }
      } else if (val === 'right') {
        return {
          right: right - (left - Number(obj.moveX)) + 'px'
        }
      } else if (val === 'left2right') {
        return {
          left: obj.moveX + 'px',
          right: right - (left - Number(obj.moveX)) + 'px'
        }
      }
    }
  },
  constY: {
    rawValue: function (val: string, obj: { moveY: string; }, key: any) {
      if (!obj.moveY || obj.moveY == '0') return ''
      const elementBounding:{
        top: any;
        bottom: any;
      } = useElementBounding(compsRef[key])
      const { bottom, top } = elementBounding
      if (val === 'top') {
        return {
          top: obj.moveY + 'px'
        }
      } else if (val === 'bottom') {
        return {
          bottom: bottom - (top - Number(obj.moveY)) + 'px'
        }
      } else if (val === 'top2bottom') {
        return {
          top: obj.moveY + 'px',
          bottom: bottom - (top - Number(obj.moveY)) + 'px'
        }
      }
    }
  },
  color: {
    prop: 'color',
    value: function (obj: { isShow: any; modelValue: any; }) {
      return obj.isShow ? obj.modelValue : ''
    }
  },
  background: {
    prop: 'background',
    value: function (obj: { isShow: any; modelValue: any; }) {
      return obj.isShow ? obj.modelValue : ''
    }
  },
  mixBlendMode: {
    prop: 'mix-blend-mode',
    value: function (obj: { isShow: any; modelValue: string; }) {
      return obj.isShow && obj.modelValue !== 'normal' ? obj.modelValue : ''
    }
  },
  blur: {
    prop: function (obj: { field: any; }) {
      return obj.field
    },
    value: function (obj: { isShow: any; modelValue: string; }) {
      return obj.isShow && obj.modelValue && obj.modelValue !== '0' ? `blur(${obj.modelValue}px)` : ''
    }
  },
  border: {
    prop: function (obj: { type: string; }) {
      return obj.type === 'all' ? 'border' : `border-${obj.type}`
    },
    value: function (obj: { isShow: any; width: any; style: any; color: any; }) {
      return obj.isShow && obj.width ? `${obj.width}px ${obj.style} ${obj.color}` : ''
    }
  },
  boxShadow: {
    isGlobal: true,
    prop: 'box-shadow',
    value: function (shadowArr: any[]) {
      const newShadow = shadowArr.filter((item: { isShow: any; }) => {
        return !!item.isShow
      }).map((item: { h: any; v: any; blur: any; spread: any; color: any; type: string; }) => {
        return `${item.h || 0}px ${item.v || 0}px ${item.blur || 0}px ${item.spread || 0}px ${item.color}${item.type === 'inset' && ' inset' || ''}`
      })
      return newShadow.join(',')
    }
  }
}


export const parseStyle = function (styleObj: { [x: string]: any; }, compKey: any) {
  // 定义一个用于存储自定义CSS的对象
  const customCss: { [x: string]: any; } = {}

  // 遍历styleObj对象的属性
  for (const key in styleObj) {
    if (Object.hasOwnProperty.call(styleObj, key)) {
      // 获取属性值
      const val = styleObj[key];

      // 如果属性值为空，则跳过当前循环
      if (!val) continue

      // 如果styleMap对象中存在当前属性
      if (styleMap[key]) {
        // 如果属性值是数组
        if (Array.isArray(val) && !styleMap[key].isGlobal) {
          // 对数组中的每个元素进行遍历
          val.forEach(vItem => {
            // 获取元素的属性，将结果存储在customCss对象中
            getAttrs(vItem, customCss, key, styleObj, compKey)
          })
        } else {
          // 获取属性的值，将结果存储在customCss对象中
          getAttrs(val, customCss, key, styleObj, compKey)
        }
      } else {
        // 将属性及其对应的值存储在customCss对象中，如果存在后缀，则加上后缀
        if (!customCss[key]) {
          // 为0时默认不显示
          if (val !== '0') {
            customCss[key] = suffix[key] ? val + suffix[key] : val
          }
        }
      }
    }
  }
  // 返回自定义CSS对象
  return customCss
}

// 创建CSS函数
export const createCss = function (compObj: any) {
  const css: any[] = [] // 存储CSS规则
  deepObjCreateCss(compObj, css) // 递归生成CSS规则
  let allCssStr = ``
  allCssStr += css.map(item => {
    let cssStr = `` // 存储CSS样式
    for (const key in item.value) {
      if (Object.hasOwnProperty.call(item.value, key)) { // 筛选出item.value对象自身的属性
        const element = item.value[key]; // 获取属性值
        cssStr += `\n${toKebabCase(key)}:${element};` // 拼接CSS样式字符串
      }
    }
    return !cssStr ? '' : `.${toKebabCase(item.name)}__${item.key}{  ${cssStr}\n}` // 返回CSS规则字符串
  }).join('\n')
  return allCssStr
}


function getAttrs(attr: any, customCss: { [x: string]: any; }, key: string, styleObj: { [x: string]: any; }, compKey: any) {
  // 获取属性值和属性对应的样式属性和样式值
  const {
    prop,
    value,
    rawValue
  } = styleMap[key]
  // 使用属性值和属性对应的样式属性，调用样式值函数计算新的属性值
  const newVal = !!rawValue ? rawValue(attr, styleObj, compKey) : value(attr, styleObj, compKey)
  // 如果新的属性值存在
  if (newVal) {
    if (!!rawValue) {
      for (const rawKey in newVal) {
        if (Object.hasOwnProperty.call(newVal, rawKey)) {
          customCss[rawKey] = newVal[rawKey]
        }
      }
    } else {
      // 如果样式属性是函数
      if (typeof prop === 'function') {
        // 以计算出的属性值为属性名，将新的属性值存入自定义CSS对象
        customCss[prop(attr, styleObj)] = newVal
      } else {
        // 否则，将属性名和新的属性值存入自定义CSS对象
        customCss[prop] = newVal
      }
    }
  }
}

/**
 * 递归创建CSS对象
 * @param {Object} obj - 包含CSS属性的对象
 * @param {Array} css - 存储CSS属性的数组
 */
function deepObjCreateCss(obj: { [x: string]: any; }, css: any[]) {
  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      const element = obj[key];
      css.push({
        key: element.key,
        name: element.name,
        value: parseStyle(element.css, element.key)
      })
      const slots = element.slots
      if (slots) {
        for (const sKey in slots) {
          if (Object.hasOwnProperty.call(slots, sKey)) {
            const childComp = slots[sKey].children;
            deepObjCreateCss(childComp, css)
          }
        }
      }
    }
  }
}