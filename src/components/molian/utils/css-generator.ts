import { useCloned } from '@vueuse/core'
import {
    toKebabCase
} from './util'
import { compsEls } from '@molianComps/Designer/designerData'
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
    'marginTop': 'px',
    'marginLeft': 'px',
    'marginRight': 'px',
    'marginBottom': 'px',
    'paddingTop': 'px',
    'paddingLeft': 'px',
    'paddingRight': 'px',
    'paddingBottom': 'px',
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
        value: function (val: any[], obj: { units: any; }) {
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
            if(val) {
                const index = val.findIndex((item: string) => {
                    return item !== '0' || !item
                })
                return index > -1 ? val && val.map((item: string) => {
                    return createSuffix(item, obj.units && obj.units.margin && obj.units.margin[index])
                }).join(' ') : ''
            }
        }
    },
    padding: {
        isGlobal: true,
        prop: 'padding',
        value: function (val: any[], obj:{ units: any; }) {
            if(val) {
                const index = val.findIndex((item: string) => {
                    return item !== '0' || !item
                })
                return index > -1 ? val && val.map((item: string) => {
                    return createSuffix(item, obj.units && obj.units.padding && obj.units.padding[index])
                }).join(' ') : ''
            }
        }
    },
    // 暂不转换xy,实际使用应根据组件因素考虑是否替换为margin-left、margin-top
    constX: {
        rawValue: function (val: string, obj: { moveX: string; width: string; units: any; }, key: any) {
            if (!obj.moveX || obj.moveX == '0' && !compsEls[key]) return ''
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
                let spx: number = 0
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
        rawValue: function (val: string, obj: { moveY: string; height: string; units: any; }, key: any) {
            if (!obj.moveY || obj.moveY == '0' && !compsEls[key]) return ''
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

export const initCss: any = function () {
    return {
        'borderRadius': ['0', '0', '0', '0'],
        // 'margin': ['0', '0', '0', '0'],
        // 'padding': ['0', '0', '0', '0'],
        'marginTop': '',
        'marginLeft': '',
        'marginRight': '',
        'marginBottom': '',
        'paddingTop': '',
        'paddingLeft': '',
        'paddingRight': '',
        'paddingBottom': '',
        'constX': 'left',
        'constY': 'top',
        'moveX': '',
        'moveY': '',
        'width': '',
        'height': '',
        'position': 'relative',
        'color': {
            'isShow': true,
            'modelValue': ''
        },
        'background': {
            'isShow': true,
            'modelValue': ''
        },
        'border': [],
        'mixBlendMode': {
            'isShow': true,
            'modelValue': 'normal'
        },
        'blur': {
            'isShow': true,
            'modelValue': '',
            'field': ''
        },
        'units': {},
        'boxShadow': [],
        'customCss': {}
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
                    if (typeof Number(val) && !Number.isNaN(Number(val)) && val != 0 || styleObj.units && !!styleObj.units[key] || !!suffix[key]) {
                        if (!styleObj.units) {
                            styleObj.units = {
                                [key]: 'px'
                            }
                        }
                        if (styleObj.units[key]) {
                            customCss[key] = createSuffix(val, styleObj.units[key])
                        } else {
                            customCss[key] = suffix[key] ? createSuffix(val, suffix[key]) : val
                        }
                    } else {
                        customCss[key] = val
                    }
                }
            }
        }
    }
    // 返回自定义CSS对象
    return customCss
}

// 缓存 kebab-case 转换结果
const kebabCache = new Map<string, string>();

// 获取缓存的 kebab-case 值
const getKebabCase = (str: string): string => {
    if (kebabCache.has(str)) {
        return kebabCache.get(str)!;
    }
    const result = toKebabCase(str);
    kebabCache.set(str, result);
    return result;
};

/**
 * 创建 CSS 样式字符串
 * 该函数遍历一个组件对象，收集并生成相应的 CSS 规则
 * 
 * @param compObj 组件对象，包含组件的结构和样式信息
 * @returns 返回生成的 CSS 样式字符串
 */
export const createCss = function (compObj: any) {
    // 初始化一个数组，用于收集 CSS 规则
    const css: any[] = [];
    // 调用深度遍历函数，将 CSS 规则添加到数组中
    deepObjCreateCss(compObj, css);

    // 使用数组收集 CSS 规则，避免字符串拼接
    const cssRules = css.map(item => {
        // 如果项没有值，则返回空字符串
        if (!item.value) return '';

        // 初始化一个数组，用于收集 CSS 属性
        const cssProperties: string[] = [];
        // 解构项的值、名称和键
        const { value, name, key } = item;

        // 处理自定义 CSS
        if (value.customCss) {
            // 遍历自定义 CSS 属性，并添加到 CSS 属性数组中
            Object.entries(value.customCss).forEach(([customKey, customVal]) => {
                cssProperties.push(`${customKey}:${customVal}`);
            });
        }

        // 处理其他 CSS 属性
        // 过滤掉自定义 CSS 属性，遍历并添加到 CSS 属性数组中
        Object.entries(value)
            .filter(([k]) => k !== 'customCss')
            .forEach(([k, v]) => {
                cssProperties.push(`${getKebabCase(k)}:${v}`);
            });

        // 如果没有 CSS 属性，返回空字符串
        if (cssProperties.length === 0) return '';

        // 构建 CSS 规则
        return `.${getKebabCase(name)}__${key}{
            ${cssProperties.join(';')};
        }`;
    });

    // 过滤掉空规则并合并
    // 返回最终的 CSS 样式字符串
    return cssRules.filter(Boolean).join('\n');
}

// 缓存初始 CSS 对象
const INITIAL_CSS = initCss()
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
export const conciseCss = function (modelValue: any) {
    // 避免重复克隆，只在必要时克隆
    if (!modelValue) return modelValue
    
    const { cloned } = useCloned(modelValue)
    
    // 使用 Map 缓存已处理过的 CSS 对象
    const cssCache = new Map()
    
    // 优化递归处理函数
    const processCssItems = (items: any[]): any[] => {
        return items.map(item => {
            // 处理 CSS
            if (item.css) {
                // 使用缓存检查是否已处理过相同的 CSS
                const cacheKey = JSON.stringify(item.css)
                if (cssCache.has(cacheKey)) {
                    item.css = cssCache.get(cacheKey)
                } else {
                    const diffArr = shallowDiff(item.css, INITIAL_CSS)
                    diffArr.forEach(key => {
                        delete item.css[key]
                    })
                    cssCache.set(cacheKey, { ...item.css })
                }
            }
            
            // 处理插槽
            if (item.slots) {
                // 使用 Object.entries 优化遍历
                Object.entries(item.slots).forEach(([key, slot]: [string, any]) => {
                    if (Array.isArray(slot.children)) {
                        slot.children = processCssItems(slot.children)
                    }
                })
            }
            
            return item
        })
    }
    
    // 使用优化后的处理函数
    cloned.value = processCssItems(cloned.value)
    return cloned.value
}

/**
 * 恢复 CSS 样式函数
 * 该函数用于根据提供的模型值恢复 CSS 样式，主要处理模型值中的 CSS 属性和插槽（slots）
 * @param modelValue 模型值，通常是一个对象，包含 CSS 样式和其他信息
 * @returns 返回处理后的模型值
 */
export const restoreCss = function (modelValue: any) {
    // 如果模型值为空，直接返回
    if (!modelValue) return modelValue

    // 使用 useCloned 函数创建模型值的克隆版本
    const { cloned } = useCloned(modelValue)

    // 优化递归处理函数
    const processItems = (items: any[]): any[] => {
        // 遍历每个项目，并对每个项目进行处理
        return items.map(item => {
            // 处理 CSS
            if (item.css) {
                // 将项目中的 CSS 样式与初始 CSS 样式合并
                item.css = { ...INITIAL_CSS, ...item.css }
            }

            // 处理插槽
            if (item.slots) {
                // 遍历每个插槽，并对插槽中的子元素进行递归处理
                Object.entries(item.slots).forEach(([, slot]: [string, any]) => {
                    if (Array.isArray(slot.children)) {
                        slot.children = processItems(slot.children)
                    }
                })
            }

            // 返回处理后的项目
            return item
        })
    }

    // 对克隆的值进行处理
    cloned.value = processItems(cloned.value)
    // 返回处理后的克隆值
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
function createSuffix(value: string | any, unit: string) {
    if (!unit) return value + 'px'
    if (unit === 'calc') {
        return `${unit}(${addSpacesToOperators(value)})`
    } else {
        return value + unit
    }
}

/**
 * 给算术运算符周围添加空格
 * 
 * 该函数接收一个字符串参数，移除字符串中的所有空格，并在算术运算符（加、减、乘、除）周围添加空格
 * 这样做是为了提高代码的可读性，使得在解析字符串时能够更容易区分不同的运算符和操作数
 * 
 * @param str 待处理的字符串，可能包含算术表达式
 * @returns 返回处理后的字符串，其中算术运算符周围被空格包围 */
function addSpacesToOperators(str: string) {
    // 移除字符串中的所有空格
    str = str.replace(/ /g, '');
    // 在算术运算符周围添加空格
    str = str.replace(/([+\-*/])/g, ' $1 ');
    return str;
}

/**
 * 计算两个对象的浅层相同属性
 * 此函数用于找出两个对象之间在第一层深度上具有相同值的属性
 * @param obj1 第一个对象
 * @param obj2 第二个对象
 * @returns 一个数组，包含两个对象在浅层相同属性的名称
 */
function shallowDiff(obj1: any, obj2: any) {
    if (!obj1 || !obj2) return []
    
    // 使用 Set 存储相同的键，提高查找效率
    const sameKeys = new Set<string>()
    
    // 使用 Object.entries 替代 for...in
    Object.entries(obj1).forEach(([key, value1]) => {
        if (!obj2.hasOwnProperty(key)) return
        
        const value2 = obj2[key]
        
        if (value1 === value2) {
            sameKeys.add(key)
            return
        }
        
        if (typeof value1 === 'object' && typeof value2 === 'object') {
            if (!value1 || !value2) return
            
            const innerSameKeys = shallowDiff(value1, value2)
            if (Object.keys(value1).length === Object.keys(value2).length && 
                innerSameKeys.length === Object.keys(value1).length) {
                sameKeys.add(key)
            }
        }
    })
    return Array.from(sameKeys)
}
