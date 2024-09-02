import { useCloned } from '@vueuse/core'
import {
    toKebabCase
} from './util'
import { compsRef } from '@molianComps/Designer/designerData'
import { el } from 'element-plus/es/locale';
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
    [key: string]: 'px' | '%' | 'rpx' | 'em' | 'vh' | 'vw' | 'calc';
} = {
    'width': 'px',
    'height': 'px',
    'fontSize': 'px',
    'lineHeight': 'px',
    'letterSpacing': 'px',
    'paragraphSpacing': '%',
}
const styleMap: IStyleMap = {
    moveX: {
        value: () => ''
    },
    moveY: {
        value: () => ''
    },
    units: {
        value: () => ''
    },
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
        value: function (val: any[], obj:{ units: any; }) {
            const index = val.findIndex((item: string) => {
                return item !== '0' || !item
            })
            return index > -1 ? val && val.map((item: string, index) => {
                return createSuffix(item, obj.units && obj.units.borderRadius && obj.units.borderRadius[index])
            }).join(' ') : ''
        }
    },
    margin: {
        isGlobal: true,
        prop: 'margin',
        value: function (val: any[], obj:{ units: any; }) {
            const index = val.findIndex((item: string) => {
                return item !== '0' || !item
            })
            return index > -1 ? val && val.map((item: string) => {
                return createSuffix(item, obj.units && obj.units.margin && obj.units.margin[index])
            }).join(' ') : ''
        }
    },
    padding: {
        isGlobal: true,
        prop: 'padding',
        value: function (val: any[], obj:{ units: any; }) {
            const index = val.findIndex((item: string) => {
                return item !== '0' || !item
            })
            return index > -1 ? val && val.map((item: string) => {
                return createSuffix(item, obj.units && obj.units.margin && obj.units.margin[index])
            }).join(' ') : ''
        }
    },
    // 暂不转换xy,实际使用应根据组件因素考虑是否替换为margin-left、margin-top
    constX: {
        rawValue: function (val: string, obj: { moveX: string; width: string;units: any; }, key: any) {
            if (!obj.moveX || obj.moveX == '0' && !compsRef[key]) return ''
            const X = createSuffix(obj.moveX, obj.units && obj.units.moveX)
            if (val === 'left') {
                return {
                    left: X
                }
            } else if (val === 'right') {
                return {
                    right: X
                }
            } else if (val === 'left2right') {
                let spx = 0
                if (!!Number(obj.width)) {
                    spx = Number(obj.moveX) + Number(obj.width)
                    return {
                        left: X,
                        right: createSuffix(spx, 'px')
                    }
                } else {
                    return {
                        left: X
                    }
                }
            }
        }
    },
    constY: {
        rawValue: function (val: string, obj: { moveY: string;height: string;units:any; }, key: any) {
            if (!obj.moveY || obj.moveY == '0' && !compsRef[key]) return ''
            const Y = createSuffix(obj.moveY, obj.units && obj.units.moveY)
            if (val === 'top') {
                return {
                    top: Y
                }
            } else if (val === 'bottom') {
                return {
                    bottom: Y
                }
            } else if (val === 'top2bottom') {
                let spx = 0
                if (!!Number(obj.height)) {
                    spx = Number(obj.moveY) + Number(obj.height)
                    return {
                        top: Y,
                        bottom: createSuffix(spx, 'px')
                    }
                } else {
                    return {
                        top: Y
                    }
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

export const initCss :any = function(){
    return {
        "borderRadius": ["0", "0", "0", "0"],
        "margin": ["0", "0", "0", "0"],
        "padding": ["0", "0", "0", "0"],
        "constX": "left",
        "constY": "top",
        "moveX":"",
        "moveY":"",
        "width":"",
        "height":"",
        "position": "relative",
        "color": {
            "isShow": true,
            "modelValue": ""
        },
        "background": {
            "isShow": true,
            "modelValue": ""
        },
        "border": [],
        "mixBlendMode": {
            "isShow": true,
            "modelValue": "normal"
        },
        "blur": {
            "isShow": true,
            "modelValue": "",
            "field": ""
        },
        "units": {},
        "boxShadow": [],
        "customCss": {}
    }
}


/**
 * 解析样式对象，生成自定义的CSS属性
 * @param styleObj 样式对象，包含了各种样式属性和值
 * @param compKey 组件键，用于标识组件
 * @returns 返回一个包含了自定义CSS属性的对象
 */
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
                        if(!styleObj.units){
                            styleObj.units = {
                                [key] : 'px'
                            } 
                        }
                        if(styleObj.units[key]){
                            customCss[key] = createSuffix(val, styleObj.units[key])
                        }else{
                            customCss[key] = suffix[key] ? createSuffix(val, suffix[key]) : val
                        }
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
                if(key === 'customCss'){
                    for (const customKey in element) {
                        if (Object.prototype.hasOwnProperty.call(element, customKey)) {
                            const customVal = element[customKey];
                            cssStr += `\n${toKebabCase(customKey)}:${customVal};`
                        }
                    }
                } else {
                    cssStr += `\n${toKebabCase(key)}:${element};` // 拼接CSS样式字符串
                }
            }
        }
        return !cssStr ? '' : `.${toKebabCase(item.name)}__${item.key}{  ${cssStr}\n}` // 返回CSS规则字符串
    }).join('\n')
    return allCssStr
}

/**
 * 将模型值转换为简洁的CSS对象
 * 
 * 此函数通过移除与初始CSS对象相同的属性来简化CSS对象结构，
 * 从而优化存储和传输效率。它递归处理，如果模型值中包含slots，
 * 也会对其子元素应用相同的简化逻辑。
 * 
 * @param modelValue 模型值，可以是任何结构，但通常是一个包含CSS信息的对象
 * @returns 返回简化后的模型值
 */
export const conciseCss = function(modelValue: any){
    // 使用useCloned钩子克隆模型值，避免修改原始数据
    const { cloned } = useCloned(modelValue)
    // 遍历克隆后的模型值数组
    cloned.value.forEach((item: any) => {
        // 找出当前项CSS与初始CSS的差异
        const diffArr = shallowDiff(item.css, initCss())
        // 移除与初始CSS相同的属性
        diffArr.forEach((diffItem:string) => {
            delete item.css[diffItem]
        })
        // 如果当前项包含slots，则对其子元素递归应用简化逻辑
        if(!!item.slots){
            Object.keys(item.slots).forEach(key => {
                item.slots[key].children = conciseCss(item.slots[key].children)
            })
        }
    })
    // 返回简化后的模型值
    return cloned.value
}

export const restoreCss = function(modelValue: any){
    // 使用useCloned钩子克隆模型值，避免修改原始数据
    const { cloned } = useCloned(modelValue)
    // 遍历克隆后的模型值数组
    cloned.value.forEach((item: any) => {
        // 找出当前项CSS与初始CSS的差异
        item.css = Object.assign({}, initCss(), item.css)
        // 如果当前项包含slots，则对其子元素递归应用简化逻辑
        if(!!item.slots){
            Object.keys(item.slots).forEach(key => {
                item.slots[key].children = restoreCss(item.slots[key].children)
            })
        }
    })
    // 返回简化后的模型值
    return cloned.value
}


/**
 * 根据属性值和预定义的样式映射，更新自定义CSS对象
 * 
 * 此函数的作用是根据给定的属性值、预定义的样式映射以及组件的键值，
 * 计算出新的样式属性和值，并更新到自定义CSS对象中
 * 
 * @param attr 属性值对象，包含组件的各种属性值
 * @param customCss 自定义CSS对象，用于存储计算后的样式属性和值
 * @param key 样式映射中的键，用于获取特定的样式属性和值
 * @param styleObj 样式对象，包含组件的样式信息
 * @param compKey 组件的键值，用于样式值函数的计算
 */
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
            // 如果使用原始值函数计算属性值
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


/**
 * 创建一个带有单位的字符串。
 * 
 * 此函数的目的是根据传入的值和单位，生成一个带有单位的字符串。如果单位不存在，则默认添加'px'单位。
 * 主要用于处理与CSS相关的值和单位的组合，例如像素值。
 * 
 * @param value {string | number} - 需要添加单位的值，可以是字符串或数字。
 * @param unit {string} - 单位字符串，例如'px'、'%'等。
 * @returns {string} - 返回带有单位的字符串。
 */
function createSuffix(value:string, unit:string){
    if(!unit) return value+'px'
    if(unit === 'calc'){
        return `${unit}(${addSpacesToOperators(value)})`
    }else{
        return value+unit
    }
}

/**
 * 给算术运算符周围添加空格
 * 
 * 该函数接收一个字符串参数，移除字符串中的所有空格，并在算术运算符（加、减、乘、除）周围添加空格
 * 这样做是为了提高代码的可读性，使得在解析字符串时能够更容易区分不同的运算符和操作数
 * 
 * @param str 待处理的字符串，可能包含算术表达式
 * @returns 返回处理后的字符串，其中算术运算符周围被空格包围
 */
function addSpacesToOperators(str: string) {
    // 移除字符串中的所有空格
    str = str.replace(/ /g, '');
    // 在算术运算符周围添加空格
    str = str.replace(/([+\-*/])/g,' $1 ');
    return str;
}

/**
 * 计算两个对象的浅层相同属性
 * 此函数用于找出两个对象之间在第一层深度上具有相同值的属性
 * @param obj1 第一个对象
 * @param obj2 第二个对象
 * @returns 一个数组，包含两个对象在浅层相同属性的名称
 */
function shallowDiff(obj1:any, obj2:any) {
    // 初始化一个数组来存储相同属性的名称
    const sameKeys = [];

    // 遍历第一个对象的所有属性
    for (const key in obj1) {
        // 确保当前属性同时存在于两个对象中，以避免比较原型链上的属性
        if (obj1.hasOwnProperty(key) && obj2.hasOwnProperty(key)) {
            // 获取两个对象中当前属性的值
            const value1 = obj1[key];
            const value2 = obj2[key];

            // 如果值是原始类型（非对象）且相等，则将属性名称添加到数组中
            if (typeof value1 !== 'object' && value1 === value2) {
                sameKeys.push(key);
            } else if (typeof value1 === 'object' && typeof value2 === 'object') {
                // 如果值是对象，递归比较这些对象的属性
                const innerSameKeys = shallowDiff(value1, value2);
                // 如果两个对象的属性数量相同，并且所有比较的属性值都相同，则将当前属性名称添加到数组中
                if (Object.keys(value1).length === Object.keys(value2).length && innerSameKeys.length === Object.keys(value1).length) {
                    sameKeys.push(key);
                }
            }
        }
    }

    // 返回包含所有相同属性名称的数组
    return sameKeys;
}