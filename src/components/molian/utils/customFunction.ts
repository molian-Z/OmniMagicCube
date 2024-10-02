import { withModifiers, mergeProps } from 'vue'
import * as Vue from 'vue'
import { defaultLifecycleMap } from '@molian/utils/defaultData'
const asyncFunction = Object.getPrototypeOf(async function () { }).constructor
const syncFunction = Object.getPrototypeOf(function () { }).constructor

/**
 * 根据类型创建函数
 * 
 * 本函数旨在根据传入的类型参数，动态创建不同类型的函数能力对象
 * 它支持创建同步函数和异步函数，以满足不同场景下的需求
 * 
 * @param type 函数类型，决定了要创建的函数是同步还是异步
 * @param codeVar 传递给函数的变量或参数，用于函数的内部逻辑
 * @param code 实际要执行的代码逻辑
 * @returns 返回创建的函数能力对象，可以是同步函数或异步函数实例
 */
export const createFunc = (type: string, codeVar: any, code: any) => {
    if (type === 'function') {
        // 当类型为同步函数时，通过new syncFunction创建并返回一个同步函数实例
        return new syncFunction(...codeVar, code)
    } else if (type === 'asyncFunction') {
        // 当类型为异步函数时，通过new asyncFunction创建并返回一个异步函数实例
        return new asyncFunction(...codeVar, code)
    }
}

/**
 * 执行生命周期函数
 * @param lifecycle 生命周期配置对象
 * @param variable 传入的变量对象
 * @param expandAPI 扩展的API对象
 */
export const runLifecycle = function (lifecycle: any, variable: any, expandAPI: any) {
    // 遍历生命周期对象中的所有生命周期方法
    for (const key in lifecycle.value) {
        if (Object.prototype.hasOwnProperty.call(lifecycle.value, key)) {
            // 解构获取当前生命周期方法的类型和代码配置
            const { type, value } = lifecycle.value[key];
            if (value) {
                const { code, codeVar } = value;
                // 判断当前生命周期方法是否不在默认的生命周期映射中
                if (!defaultLifecycleMap.value[key].function) {
                    // 创建执行函数
                    const runFn: any = createFunc(type, codeVar, code)
                    // 绑定上下文并执行生命周期方法
                    runFn.bind({ app: Vue, vars: variable, ...expandAPI }).call([])
                } else {
                    // 如果默认生命周期映射中存在当前生命周期方法，则创建并执行新的函数
                    defaultLifecycleMap.value[key].function(function () {
                        const _args: any[] = []
                        for (let index = 0; index < arguments.length; index++) {
                            const newVar = arguments[index];
                            _args.push(newVar)
                        }
                        const runFn: any = createFunc(type, codeVar, code)
                        // 绑定上下文并传入参数执行生命周期方法
                        runFn.bind({ app: Vue, vars: variable, ...expandAPI }).call(..._args)
                    })
                }
            }
        }
    }
}

/**
 * 根据提供的数据和扩展API生成函数，并绑定Vue实例和变量
 * 
 * @param data 包含代码字符串和变量信息的对象
 * @param variable 将要使用的变量对象
 * @param expandAPI 要扩展的API对象
 * @returns 返回一个绑定Vue实例和变量的函数
 */
export const runOn = function (data: { value: any }, variable: any, expandAPI: any) {
    // 从data对象中解构出代码字符串、代码变量和函数模式
    const { code, codeVar, functionMode } = data.value

    // 定义一个空字符串用于存储前置代码
    let prefixCode = ``

    // 如果存在代码变量且长度大于0，则遍历并构建前置代码
    if (codeVar && codeVar.length > 0) {
        codeVar.forEach((item: any, index: any) => {
            prefixCode += `const ${item} = arguments[${index}];\n`
        })
    }

    // 创建并返回一个新的函数，该函数模式执行，并绑定Vue实例和变量
    return createFunc(functionMode, [], prefixCode + code).bind({ app: Vue, vars: variable, ...expandAPI })
}

/**
 * 根据给定的键和数据对象，处理特定的修饰符
 * 
 * @param key - 输入的键值
 * @param data - 包含修饰符的数据对象
 * @returns 返回一个新的键值和修饰符数组
 * 
 * 说明：
 * 本函数旨在处理事件修饰符，例如在找到'once'、'capture'、'passive'修饰符时，
 * 会将它们的首字母大写并拼接到键值后。同时，还会筛选出其他自定义修饰符返回。
 */
export const runModifier = function (key: string, data: { [x: string]: { value: { modifiers: any[] } } }) {
    // 初始化新键值
    let newKey = key

    // 如果当前键值在数据对象中不存在，或者没有对应的修饰符，则返回空的修饰符数组
    if (!data[key].value) {
        return {
            newKey,
            modifiers: []
        }
    }

    // 如果存在修饰符，则筛选出'once'、'capture'、'passive'修饰符
    if (data[key].value.modifiers) {
        const toKey = data[key].value.modifiers.filter((item: string) => {
            return ['once', 'capture', 'passive'].indexOf(item) > -1
        })
        // 将筛选出的修饰符首字母大写并拼接到键值后，形成新的键值
        if (toKey.length > 0) {
            newKey = `${key}${toKey.map((item: string) => item.charAt(0).toUpperCase() + item.slice(1)).join('')}`
        }
    }

    // 筛选出除'once'、'capture'、'passive'之外的其他修饰符
    if (!!data[key].value.modifiers) {
        const otherModifiers = data[key].value.modifiers.filter((item: string) => {
            return ['once', 'capture', 'passive'].indexOf(item) === -1
        })
        return {
            newKey,
            modifiers: otherModifiers
        }
    } else {
        // 如果没有修饰符，则返回空的修饰符数组
        return {
            newKey,
            modifiers: []
        }
    }
}

/**
 * 获取当前的事件监听配置
 * 
 * 此函数用于处理并合并组件的事件监听和原生事件监听的配置它通过解析传入的数据对象中的on和nativeOn属性，
 * 结合变量和原始变量来生成新的事件监听配置该函数主要用于在框架或库中动态生成事件监听器，以便于事件的管理和修改
 * 
 * @param data 包含on和nativeOn属性的对象，用于配置事件监听
 * @param variable 当前的变量对象，用于查找事件的变量值
 * @param originVariable 原始变量对象，用于查找事件的初始变量值
 * @param expandAPI 扩展API对象，可选参数，用于扩展事件的功能
 * @returns 返回合并后的事件监听配置对象
 */
export const getCurrentOn = (data: { on: any; nativeOn: any }, variable: any, originVariable: any, slotData:any, expandAPI: any) => {
    const { on, nativeOn } = data
    const newNativeOn: {
        [key: string]: any;
    } = {}
    const newOn: {
        [key: string]: any;
    } = {}
    // 配置原生监听
    for (const key in nativeOn) {
        if (Object.prototype.hasOwnProperty.call(nativeOn, key)) {
            const { newKey, modifiers } = runModifier(key, nativeOn)
            if (nativeOn[key].type === 'variable') {
                if (nativeOn[key].value && nativeOn[key].value.length > 0) {
                    const data = originVariable[nativeOn[key].value[0]]
                    newNativeOn[newKey] = withModifiers(setFunc(data, variable, slotData, expandAPI), modifiers)
                }
            } else if (!!nativeOn[key].value && !!nativeOn[key].value.code) {
                newNativeOn[newKey] = withModifiers(setFunc(nativeOn[key], variable, slotData, expandAPI), modifiers)
            }
        }
    }
    // 配置组件监听
    for (const key in on) {
        if (Object.prototype.hasOwnProperty.call(on, key)) {
            if (on[key].type === 'variable') {
                if(!!on[key].value && on[key].value.length > 0){
                    const data = originVariable[on[key].value[0]]
                    newOn[key] = setFunc(data, variable, slotData, expandAPI)
                }
            } else if (!!on[key].value && !!on[key].value.code) {
                newOn[key] = setFunc(on[key], variable, slotData, expandAPI)
            }
        }
    }
    return mergeProps(newOn, newNativeOn)
}

/**
 * 获取可变数据
 * 该函数根据提供的变量对象，生成一个经过处理的数据对象
 * 主要用于在运行时动态创建具有特定属性的数据对象，如函数或计算属性
 * 
 * @param variable 一个键值对对象，其中值包含type和value属性，用于定义返回对象的结构
 * @param expandAPI 可选参数，用于扩展创建函数或计算属性时的可用API
 * @param isRoot 标记该变量是否为根变量，未在代码中使用，但保留以备将来可能的使用
 * @returns 返回一个包含根据variable参数中定义的属性和行为的数据对象
 */
export const getVariableData = (variable: { [x: string]: any; }, expandAPI?: any, isRoot?: boolean) => {
    // 创建一个空对象，用于存储处理后的变量数据
    const vars: any = {}
    // 遍历variable对象的每个属性
    Object.keys(variable).forEach(key => {
        const { type, value } = variable[key]
        // 根据类型处理变量
        if (type === 'function') {
            // 如果函数模式存在且为异步函数或普通函数
            if (!!value.functionMode && ['asyncFunction', 'function'].indexOf(value.functionMode) > -1) {
                // 创建并绑定函数
                vars[key] = createFunc(value.functionMode, value.codeVar, value.code).bind({ app: Vue, vars: reactive(vars), ...expandAPI })
            }
        } else if (type === 'computed') {
            // 如果是计算属性且函数模式为异步函数或普通函数
            if (!!value.functionMode && ['asyncFunction', 'function'].indexOf(value.functionMode) > -1) {
                // 创建并绑定计算属性
                vars[key] = computed(createFunc(value.functionMode, value.codeVar, value.code).bind({ app: Vue, vars: reactive(vars), ...expandAPI }))
            }
        } else {
            // 对于其他类型，直接赋值
            vars[key] = value
        }
    })
    // 返回处理后的变量数据对象
    return vars
}


function setFunc(data: any, variable: any, slotData:any, expandAPI: any){
    if(!!slotData){
        return function(){
            return runOn(data, variable, expandAPI)(...arguments, {$slot:slotData})
        }
    }else{
        return runOn(data, variable, expandAPI)
    }
}