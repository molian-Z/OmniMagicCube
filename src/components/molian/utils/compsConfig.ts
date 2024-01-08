// import {
//     install as compMapInstall
// } from './compMap'
import {
    ref,
    markRaw,
    shallowRef,
    computed,
    ShallowRef,
    App
} from 'vue'
import {
    useCloned
} from '@vueuse/core'
import {
    defaultCategory,
    defaultSlotsMap,
    defaultAttrsMap,
    uiMapping
} from './defaultData'
import {
    createControl
} from './importUIControl'

import {
    getCloudData
} from './getCloudData'

import { i18nt as t } from './lang'
interface registerComps {
    globalComps: any;
    allowDiffCateReg: boolean;
    hiddenComps: never[];
    allowRegPropsAndEmit: boolean;
    categoryList: any[]; // 添加了categoryList属性
    customComps?: any[];
    cateRules?: any;
  }
// 注册配置
const config = {
    allowDiffCateReg: false, // 允许不同分类重复注册同一组件(不推荐允许,显示过多组件并没有好处,只会增加用户使用难度)
    hiddenComps: [], //隐藏组件 // 支持字符串、正则表达式以及数组[字符串、正则表达式]
    allowRegPropsAndEmit: false, // 允许同一属性同时注册props以及emit(默认不允许)
    customComps: [] // 允许自定义使用组件。开启该模式组件将有自己选择上传而非全局上传
}
export const categoryList = ref<any[]>([])

export const currentRegComps = shallowRef<{
    [key: string]: any
}>({})

export const slotsMap = ref(defaultSlotsMap)

// 全局组件类似于全局指令message之类
export const globalComps: { [key: string]: any } = ref({})

export const customComps: { [key: string]: any } = markRaw({})

const registerCategory = function (data: any[]) {
    if (data && data.length > 0) {
        categoryList.value = data
    } else {
        categoryList.value = defaultCategory
    }
}

/**
 * 格式化组件并返回JSON
 * @param {* 键} key
 * @param {*组件} component 
 */
const parseComp = function (key: string, element: { emits: any[]; props: any; slotsOption: { [x: string]: any } }, allowRegPropsAndEmit: any) {
    const currentEmits = [],
        currentUpdateModel = [],
        currentProps: { [key: string]: any } = {},
        autoSlots: { [key: string]: any } = {}
    if (element.emits) {
        if (Array.isArray(element.emits)) {
            currentEmits.push(...element.emits)
            const updateEmit = element.emits.filter((item: string) => {
                return (/^update:/.test(item))
            })
            currentUpdateModel.push(...updateEmit)
        } else {
            for (const key in element.emits as any) {
                if (Object.hasOwnProperty.call(element.emits, key)) {
                    currentEmits.push(key)
                    // 查找双向绑定属性
                    if (/^update:/.test(key)) {
                        currentUpdateModel.push(key)
                    }
                }
            }
        }
    }
    if (element.props) {
        function toParseProps(element: { props: any[] }, key: string) {
            if (Array.isArray(element.props)) {
                element.props.forEach((item: any) => {
                    currentProps[item] = parseProps(item, null)
                })
            } else {
                currentProps[key] = parseProps(element.props[key], null)
            }
        }
        for (const key in element.props) {
            if (Object.hasOwnProperty.call(element.props, key)) {
                // 查找监听属性
                if ((/^on[A-Z]/).test(key)) {
                    const str = key.charAt(2).toLowerCase() + key.slice(3)
                    currentEmits.push(str)
                    // 查找双向绑定属性
                    if (/^onUpdate:/.test(key)) {
                        currentUpdateModel.push(str)
                    }
                    // 允许在props和emit同时注册时使用
                    if (allowRegPropsAndEmit) {
                        toParseProps(element, key)
                    }
                } else {
                    toParseProps(element, key)
                    // if (Array.isArray(element.props)) {
                    //     element.props.forEach(item => {
                    //         currentProps[item] = parseProps(item, key)
                    //     })
                    // } else {
                    //     currentProps[key] = parseProps(element.props[key], key)
                    // }
                }
            }
        }
    }
    const findCate = categoryList.value.find(item => {
        return item.rule && item.rule.test(key)
    })

    const slots:{
        [key: string]: any
    } = slotsMap.value[key]
    // defineSlots暂不支持JS
    // if(element.slots){
    //     console.log(element.slots(),element)
    // }
    // slotsOption 暂且使用该方案
    if (element.slotsOption) {
        for (const eskey in element.slotsOption) {
            if (Object.hasOwnProperty.call(element.slotsOption, eskey)) {
                const slot = element.slotsOption[key];
                if (!slots[eskey]) {
                    slots[eskey] = slot
                }
            }
        }
    }
    for (const skey in slots) {
        if (Object.hasOwnProperty.call(slots, skey)) {
            const {
                cloned
            } = useCloned(slots[skey])
            if (cloned.value === 'auto' || typeof cloned.value === 'object' && !!cloned.value.auto) {
                cloned.value = {
                    allowComps: typeof cloned.value === 'object' && cloned.value.allowComps || [],
                    children: []
                }
                autoSlots[skey] = cloned.value
            }
        }
    }
    if (!!defaultAttrsMap[key]) {
        const attrs = defaultAttrsMap[key]
        for (const attrKey in attrs) {
            if (Object.hasOwnProperty.call(attrs, attrKey)) {
                currentProps[attrKey] = {
                    ...currentProps[attrKey],
                    ...attrs[attrKey]
                }
            }
        }
    }
    return {
        name: key,
        emits: currentEmits,
        updateModel: currentUpdateModel,
        props: currentProps, // 所有属性(是否应写入对应组件)
        comp: element,
        slots: autoSlots,
        category: findCate ? findCate.name : '' // 此处应根据cateRules判断显示节点
    }
}

/**
 * 注册组件
 * @param {*} app 
 * @param {*} param1 
 */
const registerComps = function (app: { _context: { components: any }; provide: (arg0: string, arg1: ShallowRef<{}>) => void }, {
    customComps,
    cateRules,
    hiddenComps,
    allowRegPropsAndEmit
}: registerComps) {
    const newComps: { [key: string]: any } = {}
    const comps = customComps && customComps.length > 0 ? customComps : app._context.components
    for (const key in comps) {
        if (hiddenComps) {
            if (typeof hiddenComps === 'string' && hiddenComps === key) {
                continue;
            } else if (hiddenComps instanceof RegExp && hiddenComps.test(key)) {
                continue;
            } else if (Array.isArray(hiddenComps)) {
                let isHidden = false
                for (let index = 0; index < hiddenComps.length; index++) {
                    const item:any = hiddenComps[index];
                    if (typeof item === 'string') {
                        if (item === key) {
                            isHidden = true
                            break;
                        }
                    } else if (item instanceof RegExp) {
                        if (item.test(key)) {
                            isHidden = true
                            break;
                        }
                    }
                }
                if (isHidden) {
                    continue;
                }
            }
        }
        if (Object.hasOwnProperty.call(comps, key)) {
            const element = comps[key];
            newComps[key] = parseComp(key, element, allowRegPropsAndEmit)
            const prefixObj = uiMapping.data.find((fitem: { prefix: string }) => key.startsWith(fitem.prefix))
            newComps[key].prefix = prefixObj && prefixObj.prefix || ''
            newComps[key].title = t('component.' + newComps[key].name.substring(newComps[key].prefix.length))
        }
    }

    defaultCategory.forEach((item: any) => {
        if (item.component) {
            item.component.forEach((mItem: string | number) => {
                newComps[mItem] = {
                    name: mItem,
                    prefix: '',
                    category: item.name,
                    emits: [],
                    props: {},
                    slots: { default: { children: [] } },
                    updateModel: [],
                }
            })
        }
    })
    currentRegComps.value = newComps
    getCloudData(newComps)
        .catch((err: any) => {
            console.log('cloudData is error', err)
        })
        .finally()
    app.provide('mlComps', currentRegComps)
}

const registerGlobalComps = function (app: { provide: (arg0: string, arg1: any) => void }, globalObj: { [x: string]: any }) {
    for (const key in globalObj) {
        if (Object.hasOwnProperty.call(globalObj, key)) {
            const element = globalObj[key]
            app.provide(`ml-${key}`, element)
            globalComps.value[key] = element
        }
    }
}

const registerCustomComps = function (app: App<any>) {
    const {
        current,
        data
    } = uiMapping
    const currentUIData:any = data.find((item: { name: any }) => item.name === current)
    const { prefix, compMapping } = currentUIData
    for (const key in compMapping) {
        if (Object.hasOwnProperty.call(compMapping, key)) {
            const element = compMapping[key];
            customComps['custom' + key] = createControl(prefix, element.component || key, element)
        }
    }
    app.provide('customComps', customComps)
}

export const compsInstall = function (app: App<any>, options: { globalComps: any }) {
    const currentConfig:registerComps = {
        categoryList:[],
        ...config,
        ...options
    }
    // 远程获取数据
    // 获取slot数据并赋值给slotsMap
    registerCategory(currentConfig.categoryList)
    registerComps(app, currentConfig)
    // compMapInstall(app, options)
    registerCustomComps(app)
    registerGlobalComps(app, options.globalComps)
}

function parseProps(obj: { map: (arg0: (item: any) => "string" | "boolean" | "number" | "array" | "object" | "function" | "date" | "regexp" | "symbol" | "map" | "promise" | "input") => any; required: any; validator: any; type: any[]; default: () => any }, key: null | string | number) {
    let newObj = {}
    if (obj && Array.isArray(obj)) {
        newObj = {
            type: obj.map(item => {
                return getPropType(item)
            })
        }
    } else if (obj && typeof obj === 'object') {
        let propObj:any = {
            ...obj,
            required: obj.required,
            validator: obj.validator
        }
        if (obj.type) {
            if (Array.isArray(obj.type)) {
                propObj.type = obj.type.map((item: any) => {
                    return getPropType(item)
                })
            } else {
                propObj.type = getPropType(obj.type)
            }
        }
        if (propObj.type == 'array' || propObj.type === 'object') {
            propObj.default = obj.default && typeof obj.default === 'function' && obj.default() || obj.default
            if (!propObj.default && propObj.type == 'array') {
                propObj.default = []
            } else if (!propObj.default && propObj.type == 'object') {
                propObj.default = {}
            }
        }
        newObj = propObj
    } else if (obj && typeof obj === 'function') {
        newObj = {
            type: getPropType(obj)
        }
    } else if (obj || !obj) {
        newObj = {
            type: 'input',
            require: false,
            default: null
        }
    }
    return newObj
}

/**
 * 获取属性类型
 * @param {any} fun - 传入的参数
 * @returns {string} - 返回属性类型
 */
function getPropType(fun: { name: any }) {
    if (!fun) return 'string';
    switch (fun.name) {
        case 'Boolean':
            return 'boolean';
        case 'String':
            return 'string';
        case 'Number':
            return 'number';
        case 'Array':
            return 'array';
        case 'Object':
            return 'object';
        case 'Function':
            return 'function';
        case 'Date':
            return 'date';
        case 'RegExp':
            return 'regexp';
        case 'Symbol':
            return 'symbol';
        case 'Map':
            return 'map';
        case 'Promise':
            return 'promise';
        default:
            return 'input';
    }
}