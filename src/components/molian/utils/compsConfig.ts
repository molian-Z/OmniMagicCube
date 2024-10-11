// import {
//     compMapInstall
// } from './compMap'
import {
    ref,
    markRaw,
    shallowRef,
    ShallowRef,
    App
} from 'vue'
import {
    useCloned
} from '@vueuse/core'
import {camelCase} from 'change-case'
import {
    defaultCategory,
    defaultSlotsMap,
    defaultAttrsMap,
    defaultNativeEventMap,
    defaultLifecycleMap,
    cloudUrl
} from './defaultData'
import { useUI, UIData, usePrefix } from './UIMap'
import {
    createControl
} from './importUIControl'

import {
    getCloudData
} from './getCloudData'
// 注册配置
const config = {
    categoryList: [],
    hiddenComps: [], //隐藏组件 // 支持字符串、正则表达式以及数组[字符串、正则表达式]
    customComps: {}, // 允许自定义使用组件。开启该模式组件将由自己选择上传而非全局上传
    allowDiffCateReg: false, // 允许不同分类重复注册同一组件(不推荐允许,显示过多组件并没有好处,只会增加用户使用难度)
    allowRegPropsAndEmit: false, // 允许同一属性同时注册props以及emit(默认不允许)
    clearDefaultCategory: false, // 清空所有默认分类
    globalComps: {} //全局组件
}
export const categoryList = ref<any[]>([])

export const currentRegComps = shallowRef<{
    [key: string]: any
}>({})

export const slotsMap = ref<IConfig.IDefaultSlotsMap>({})

// 全局组件类似于全局指令message之类
export const globalComps: { [key: string]: any } = ref({})

export const customComps: { [key: string]: any } = markRaw({})

/**
 * 解析插槽并筛选出自动插槽
 * 
 * 该函数遍历给定的插槽对象，识别并分离出那些被标记为自动的插槽
 * 自动插槽是指那些其内容为字符串'auto'或者包含属性'auto'的对象的插槽
 * 
 * @param slots - 一个包含键值对的对象，其中键为插槽名称，值为插槽内容
 * @returns 返回一个对象，其中包含了所有识别出的自动插槽
 */
export const parseSlot = function (slots: { [x: string]: any }) {
    // 用于存储自动插槽的临时对象
    const autoSlots: { [key: string]: any } = {}
    for (const skey in slots) {
        // 确保skey是对象自身的属性
        if (Object.hasOwnProperty.call(slots, skey)) {
            // 使用useCloned处理插槽内容，获取其副本
            const {
                cloned
            } = useCloned(slots[skey])
            // 检查插槽内容是否标记为自动或包含自动属性
            if (cloned.value === 'auto' || typeof cloned.value === 'object' && !!cloned.value.auto) {
                // 标记为自动的插槽内容被赋予新的结构
                cloned.value = {
                    allowComps: typeof cloned.value === 'object' && cloned.value.allowComps || [],
                    appendComps: typeof cloned.value === 'object' && cloned.value.appendComps || [],
                    children: []
                }
                // 将处理后的自动插槽添加到自动插槽对象中
                autoSlots[skey] = cloned.value
            }
        }
    }
    // 返回所有自动插槽
    return autoSlots
}

/**
 * 解析组件配置
 * 此函数用于处理组件的属性、事件和槽等相关信息
 * @param key 组件的唯一标识符
 * @param element 组件的配置对象
 * @param allowRegPropsAndEmit 是否允许在props和emit中同时注册
 * @param comps 组件集合（未使用，但保持参数一致性）
 * @returns 返回处理后的组件配置对象
 */
const parseComp = function (key: string, element: any, allowRegPropsAndEmit: any, comps: any) {
    // 存储当前组件的事件列表
    const currentEmits = [];
    // 存储当前组件的双向绑定事件列表
    const currentUpdateModel = [];
    // 存储当前组件的属性对象
    const currentProps: { [key: string]: any } = {};
    // 组件渲染顺序索引，默认值为99
    let orderIndex = 99;
    // 存储自动槽的配置对象
    let autoSlots: { [key: string]: any } = {};

    // 处理组件的emits配置
    if (element.emits) {
        // 如果emits是数组类型
        if (Array.isArray(element.emits)) {
            currentEmits.push(...element.emits);
            // 过滤并添加双向绑定事件
            const updateEmit = element.emits.filter((item: string) => {
                return (/^update:/.test(item));
            });
            currentUpdateModel.push(...updateEmit);
        } else {
            // 如果emits是对象类型，遍历处理
            for (const key in element.emits as any) {
                if (Object.hasOwnProperty.call(element.emits, key)) {
                    currentEmits.push(key);
                    // 查找双向绑定属性
                    if (/^update:/.test(key)) {
                        currentUpdateModel.push(key);
                    }
                }
            }
        }
    }

    // 处理组件的props配置
    if (element.props) {
        // 内部函数，用于解析props
        function toParseProps(element: { props: any[], name: string }, key: string) {
            if (Array.isArray(element.props)) {
                element.props.forEach((item: any) => {
                    currentProps[item] = parseProps(item, null, element.name);
                });
            } else {
                currentProps[key] = parseProps(element.props[key], null, element.name);
            }
        }
        // 遍历处理props
        for (const key in element.props) {
            if (Object.hasOwnProperty.call(element.props, key)) {
                // 处理以'on大写'开头的监听属性
                if ((/^on[A-Z]/).test(key)) {
                    const str = key.charAt(2).toLowerCase() + key.slice(3);
                    currentEmits.push(str);
                    // 查找双向绑定属性
                    if (/^onUpdate:/.test(key)) {
                        currentUpdateModel.push(str);
                    }
                    // 允许在props和emit同时注册时使用
                    if (allowRegPropsAndEmit) {
                        toParseProps(element, key);
                    }
                } else {
                    toParseProps(element, key);
                }
            }
        }
    }

    // 查找组件所属的分类
    const findCate = categoryList.value.find(item => {
        if (item.rule) {
            return item.rule && item.rule.test(key);
        } else if (item.component) {
            let btn = false;
            item.component.forEach((mItem: string | RegExp, index: number) => {
                if (mItem instanceof RegExp) {
                    if (mItem.test(key)) {
                        btn = true;
                        orderIndex = index;
                    }
                } else if (mItem === key) {
                    btn = true;
                    orderIndex = index;
                }
            });
            return btn;
        }
    });

    // 处理slotsOption配置
    if (!!element.slotsOption) {
        slotsMap.value[key] = element.slotsOption;
    }
    // 处理slots配置
    const slots: { [key: string]: any } = slotsMap.value[key];
    autoSlots = parseSlot(slots);
    // 处理默认属性
    if (!!defaultAttrsMap.value[key]) {
        const attrs = defaultAttrsMap.value[key];
        for (const attrKey in attrs) {
            if (Object.hasOwnProperty.call(attrs, attrKey)) {
                currentProps[attrKey] = {
                    ...currentProps[attrKey],
                    ...attrs[attrKey]
                };
            }
        }
    }

    // 处理UI数据中的移除属性
    const useCurrentUI = UIData.find((item) => useUI.value === item.name);
    if (!!useCurrentUI && !!useCurrentUI.removeAttrs) {
        useCurrentUI.removeAttrs.forEach(item => {
            if (currentProps[item]) {
                delete currentProps[item];
            }
        });
    }

    //统一处理双向绑定事件与名称存在不一致的问题,改为驼峰写法
   for (let index = 0; index < currentUpdateModel.length; index++) {
        const parts:any = currentUpdateModel[index].split(':')
        if(!currentProps[parts[1]]){
            const transformedPart = camelCase(parts[1]);
            if(!!currentProps[transformedPart]) {
                currentProps[parts[1]] = currentProps[transformedPart]
                delete currentProps[transformedPart]
            }
        }
    }
    // 返回处理后的组件配置对象
    return {
        name: key,
        emits: currentEmits,
        updateModel: currentUpdateModel,
        props: currentProps,
        comp: element,
        slots: autoSlots,
        inheritAttrs: element.inheritAttrs,
        category: findCate ? findCate.name : '',
        orderIndex
    };
}

/**
 * 解析对象的属性
 * 
 * 此函数旨在根据传入的对象类型，解析并返回一个新的属性对象
 * 新的属性对象可能包含类型信息、默认值、验证器等
 * 
 * @param obj 任意对象，可以是数组、普通对象、函数或基本类型
 * @param key 当前未使用，保留参数，可以是null、字符串或数字
 * @param testKey 可选参数，用于未来扩展或特定逻辑判断
 * @returns 返回解析后的新属性对象
 */
function parseProps(obj: any, key: null | string | number, testKey?: string) {
    let newObj = {}
    // 如果传入的是数组，将数组中每个元素的类型信息解析为新对象的type属性
    if (obj && Array.isArray(obj)) {
        newObj = {
            type: obj.map(item => {
                return getPropType(item)
            })
        }
        // 如果传入的是普通对象，解析其属性并构建新的属性对象
    } else if (obj && typeof obj === 'object') {
        let propObj: any = {
            ...obj,
            required: obj.required,
            validator: obj.validator
        }
        // 如果对象有type属性，进一步解析其类型信息
        if (obj.type) {
            if (Array.isArray(obj.type)) {
                propObj.type = obj.type.map((item: any) => {
                    return getPropType(item, obj.expandType)
                })
            } else {
                propObj.type = getPropType(obj.type, obj.expandType)
            }
        }
        // 设置默认值，此处逻辑已注释掉，可能因为默认逻辑被简化或更改
        // if (propObj.type == 'array' || propObj.type === 'object') {
        //     propObj.default = obj.default && typeof obj.default === 'function' && obj.default() || obj.default
        //     if (!propObj.default && propObj.type == 'array') {
        //         propObj.default = []
        //     } else if (!propObj.default && propObj.type == 'object') {
        //         propObj.default = {}
        //     }
        // }
        if(!obj.default) {
            propObj.default = null
        }
        newObj = propObj
        // 如果传入的是函数，解析其类型并设置默认值为null
    } else if (obj && typeof obj === 'function') {
        newObj = {
            type: getPropType(obj),
            default: null
        }
        // 对于其他情况，包括传入的是基本类型或undefined，设置默认的输入类型属性
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
 * 获取属性的类型
 * 
 * 此函数旨在根据传入的函数或自定义扩展类型来确定属性的类型
 * 它主要用于提供一个统一的类型识别接口，便于后续流程中对不同类型属性的处理和解析
 * 
 * @param fun 具有name属性的任意对象，通常为一个函数用于指示属性的类型
 * @param expandType 可选参数，表示自定义扩展类型，用于覆盖fun参数指示的类型
 * @returns 返回识别出的属性类型字符串
 */
function getPropType(fun: { name: any }, expandType?: any) {
    // 当fun和expandType均未提供时，默认返回'string'
    if (!fun && !expandType) return 'string';
    // 初始化propType，优先使用expandType，否则使用fun的name属性
    let propType = expandType || fun.name;
    // 根据propType的值，转换并返回相应的基本类型字符串
    switch (propType) {
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
        case 'Icon':
            return 'icon';
        case 'Color':
            return 'color';
        default:
            // 对于无法识别的类型，默认返回'input'
            return 'input';
    }
}

/**
 * 注册类别函数
 * 
 * 该函数用于根据提供的数据更新类别列表它首先检查数据是否存在以及数组是否为空
 * 如果数据存在且不为空，则将类别列表更新为新的数据，否则将类别列表更新为默认类别
 * 这样操作的目的是确保类别列表始终包含有效的数据，即使在提供的数据为空或不存在的情况下
 * 
 * @param data 一个包含类别信息的数组如果为空，将使用默认类别更新列表
 */
const registerCategory = function (data?: any[], clearDefaultCategory: boolean = false) {
    const categoryData:IConfig.IDefaultCategory[] = [{
        index: 0,
        icon: 'all',
        name: 'all',
        isAll: true
    }]
    if (!clearDefaultCategory) {
        categoryData.push(...defaultCategory)
    }
    if (data && data.length > 0) {
        categoryData.push(...data)
    }
    categoryList.value = categoryData.sort((a:any, b:any) => {
        return a.index - b.index
    })
}


/**
 * 注册组件函数
 * 
 * 此函数负责根据提供的参数注册组件，包括处理自定义组件、应用上下文组件、隐藏组件列表以及是否允许注册额外的属性和事件
 * 它会遍历组件列表，根据隐藏组件规则过滤掉不需要的组件，并对符合条件的组件进行解析和前缀处理
 * 最终，它将注册的组件提供给应用，并尝试获取云端数据
 * 
 * @param app 应用对象，包含组件上下文和提供方法
 * @param customComps 自定义组件列表，如果为空则使用应用上下文中的组件
 * @param cateRules 类别规则，目前未在函数中使用到
 * @param hiddenComps 需要隐藏的组件列表或规则
 * @param allowRegPropsAndEmit 是否允许注册额外的属性和事件
 */
const registerComps = function (app: { _context: { components: any }; provide: (arg0: string, arg1: ShallowRef<{}>) => void }, {
    customComps,
    cateRules,
    clearDefaultComps,
    hiddenComps,
    allowRegPropsAndEmit,
    registerCloud,
    registerCloudUrl
}: plug.registerComps, i18n:any) {
    const {t} = i18n
    // 初始化一个新的组件对象，用于存储解析后的组件
    const newComps: { [key: string]: any } = {}
    // 根据是否存在自定义组件来确定最终要处理的组件列表
    let comps
    if(!clearDefaultComps){
        comps = Object.assign({}, app._context.components, customComps)
    }else {
        comps = Object.assign({}, customComps)
    }
    // 遍历组件列表，过滤和处理每一个组件
    for (const key in comps) {
        // 根据隐藏组件规则决定是否跳过当前组件
        if (hiddenComps) {
            if (typeof hiddenComps === 'string' && hiddenComps === key) {
                continue;
            } else if (hiddenComps instanceof RegExp && hiddenComps.test(key)) {
                continue;
            } else if (Array.isArray(hiddenComps)) {
                let isHidden = false
                for (let index = 0; index < hiddenComps.length; index++) {
                    const item: any = hiddenComps[index];
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
        // 确保当前遍历的键是组件列表中的
        if (Object.hasOwnProperty.call(comps, key)) {
            const element = comps[key];
            if(element.notAllowReg) {
                continue
            }
            // 解析组件并添加到新的组件对象中
            newComps[key] = parseComp(key, element, allowRegPropsAndEmit, comps)
            // 初始化前缀对象
            let prefixObj: any = null
            // 如果使用前缀，则尝试找到对应的前缀对象
            if (!!usePrefix.value) {
                prefixObj = UIData.find((fitem: { prefix: string }) => {
                    if (usePrefix.value === fitem.prefix) {
                        return key.startsWith(usePrefix.value)
                    }
                })
            }
            // 如果没有匹配的前缀对象，则尝试匹配其他可能的前缀
            if (!prefixObj) {
                prefixObj = UIData.find((fitem: { prefix: string }) => key.startsWith(fitem.prefix))
            }
            // 设置组件的前缀和标题
            newComps[key].prefix = prefixObj && prefixObj.prefix || ''
            if(newComps[key].comp.title){
                newComps[key].title = newComps[key].comp.title
            }else{
                let langKey = 'component.' + newComps[key].name.substring(newComps[key].prefix.length)
                const tTitle = t(langKey)
                if(tTitle === langKey) {
                    newComps[key].title = langKey.split('.')[langKey.split('.').length - 1]
                }else{
                    newComps[key].title = tTitle
                }
            }
        }
    }
    // 将解析后的组件存储为当前注册的组件
    currentRegComps.value = newComps
    // 尝试获取云端数据，捕获错误并确保操作执行完毕
    if(registerCloud !== false){
        if(registerCloudUrl){
            cloudUrl.value = registerCloudUrl
        }
        getCloudData(i18n)
        .then(() =>{
            
        })
        .catch((err: any) => {
            console.log('cloudData is error', err)
        })
        .finally()
    }
    // 将注册的组件提供给应用
    app.provide('mlComps', currentRegComps)
}

/**
 * 全局组件注册函数
 * 
 * 此函数的作用是将一组全局组件注册到一个应用上下文中，使得这些组件可以在应用的任何地方被访问和使用
 * 它遍历一个包含全局组件的对象，并使用应用提供的 `provide` 方法将这些组件注入到应用的上下文中
 * 同时，它还将这些组件添加到一个名为 `globalComps.value` 的对象中，以便在其他地方可能需要引用这些组件
 * 
 * @param app 应用上下文对象，具有 `provide` 方法，用于注入全局组件
 * @param globalObj 包含所有全局组件的对象，键为组件名称，值为组件实例
 */
const registerGlobalComps = function (app: { provide: (arg0: string, arg1: any) => void }, globalObj: { [x: string]: any }) {
    // 遍历 globalObj 中的所有全局组件
    for (const key in globalObj) {
        // 检查 key 是否为 globalObj 自身的属性，避免遍历到原型链上的属性
        if (Object.hasOwnProperty.call(globalObj, key)) {
            // 获取当前遍历到的组件实例
            const element = globalObj[key]
            // 将组件注入到应用上下文中，前缀为 'ml'
            app.provide(`ml${key}`, element)
            // 将组件添加到 globalComps.value 对象中，便于后续引用
            globalComps.value[key] = element
        }
    }
}

/**
 * 注册自定义组件函数
 * 
 * 该函数的作用是将当前 UI 框架的组件进行注册，使得这些组件可以在应用中被识别和使用
 * 它首先根据当前使用的 UI 框架名找到对应的组件映射信息，然后通过遍历这些映射信息，
 * 将每个组件以一个特定的格式注册到应用的全局自定义组件列表中最后，将这些自定义组件
 * 注入到应用的上下文中，使得整个应用都可以访问和使用这些组件
 * 
 * @param app 应用实例，用于注入自定义组件
 */
export const registerCustomComps = function (app: App<any>, UIName?: string) {
    // 找到当前使用的 UI 框架的组件信息
    const currentUIData: any = UIData.find((item: { name: any }) => item.name === (UIName || useUI.value))
    // 从组件信息中解构出组件前缀和组件映射表
    const { prefix, compMapping } = currentUIData

    // 遍历组件映射表，注册每个组件
    for (const key in compMapping) {
        if (Object.hasOwnProperty.call(compMapping, key)) {
            const element = compMapping[key]
            customComps['custom' + key] = createControl(prefix, element.component || key, element, app)
        }
    }
    // 将注册好的自定义组件注入到应用的上下文中
    app.provide('customComps', customComps)
}

/**
 * 在应用中安装组件
 * @param app 应用实例
 * @param options 安装选项，包括全局组件
 */
export const compsInstall = function (app: App<any>, options: plug.registerComps, i18n:any) {
    // 合并当前配置，包括默认配置和用户提供的配置
    const currentConfig: plug.registerComps = {
        ...config,
        ...options
    }
    // 合并自定义配置
    if(options.slotsMap && typeof options.slotsMap === 'object') {
        slotsMap.value = {...defaultSlotsMap.value, ...options.slotsMap}
    }
    if(options.lifecycleMap && typeof options.lifecycleMap === 'object') {
        defaultLifecycleMap.value = {...defaultLifecycleMap.value, ...options.lifecycleMap}
    }
    if(options.nativeEventMap && typeof options.nativeEventMap === 'object') {
        defaultNativeEventMap.value = {...defaultNativeEventMap.value, ...options.nativeEventMap}
    }
    if(options.attrsMap && typeof options.attrsMap === 'object') {
        defaultAttrsMap.value = {...defaultAttrsMap.value, ...options.attrsMap}
    }

    // 远程获取数据
    // 获取slot数据并赋值给slotsMap
    registerCategory(options.categoryList, options.clearDefaultCategory)

    // 注册组件到应用
    registerComps(app, currentConfig, i18n)

    // 注册自定义组件
    registerCustomComps(app)

    // 注册全局组件
    registerGlobalComps(app, options.globalComps)
}