import { getCurrentOn, runOn } from '@molian/utils/customFunction'
import { globalComps } from '@molian/utils/compsConfig'
const { Message } = globalComps.value

/**
 * 判断当前组件是否是用于循环渲染的
 * 
 * 此函数通过检查组件的指令和变量，以及通过扩展API来确定组件是否用于循环渲染
 * 它首先检查组件是否有条件渲染指令（if），然后进一步检查是否为循环渲染指令（for）
 * 
 * @param {Object} params 包含组件信息和插槽数据的对象
 * @param {Object} params.comp 组件对象，包含指令和变量
 * @param {Object} params.$slot 插槽数据
 * @param {Function} params.expandAPI 扩展API，用于处理循环渲染
 * @returns {boolean} 如果组件是用于循环渲染的，则返回true；否则返回false
 */
export const isFor = ({ comp, $slot, expandAPI }: any) => {
    let isFor: any = true

    // 检查组件是否有条件渲染指令
    if (isIf({ comp, $slot })) {
        const { directives, vars } = comp

        // 如果没有循环渲染指令，则不是用于循环渲染的组件
        if (!directives.for) {
            isFor = false
        } else {
            // 处理循环渲染指令和变量，以确定循环条件
            isFor = data2Vars(directives.for, vars, { slotData: $slot, expandAPI })

            // 如果结果是一个函数，则调用它以获取最终的循环条件值
            if (typeof isFor === 'function') {
                isFor = isFor({ $slot })
            }
        }
    } else {
        // 如果没有条件渲染指令，则不是用于循环渲染的组件
        isFor = false
    }

    // 返回最终的循环条件判断结果
    return !!isFor
}

/**
 * 判断组件是否满足条件渲染
 * @param {Object} comp - 组件对象，包含指令和变量信息
 * @param {Object} $slot - 插槽对象，用于传递给指令处理函数
 * @param {Object} expandAPI - 扩展API对象，用于指令处理函数的扩展功能
 * @returns {boolean} - 返回组件是否满足条件渲染的结果
 */
export const isIf = ({ comp, $slot, expandAPI }: any) => {
    // 获取组件的指令和变量信息
    const { directives, vars } = comp
    // 初始化isIf为true，假设组件默认渲染
    let isIf: any = true
    // 检查组件是否有if指令
    if (!!directives.if) {
        // 使用if指令的数据和组件变量，结合插槽数据和扩展API，计算是否满足条件渲染
        isIf = data2Vars(directives.if, vars, { slotData: $slot, expandAPI })
        // 如果计算结果是一个函数，则调用该函数并传入插槽数据，进一步确定渲染条件
        if (typeof isIf === 'function') {
            isIf = isIf({ $slot })
        }
    }
    // 返回最终的渲染条件判断结果，确保结果为布尔类型
    return !!isIf
}

/**
 * 判断组件是否应该显示
 * @param {Object} param0 - 包含组件信息、插槽数据和扩展API的对象
 * @param {Object} param0.comp - 组件的详细配置信息
 * @param {Object} param0.$slot - 插槽数据
 * @param {Function} param0.expandAPI - 扩展API函数
 * @returns {boolean} 组件是否应该显示的布尔值
 */
export const isShow = ({ comp, $slot, expandAPI }: any) => {
    // 获取组件的指令和变量
    const { directives, vars } = comp
    // 提取show指令
    const { show } = directives || null
    // 初始化isShow为true，假设组件应该显示
    let isShow: any = true
    // 如果存在show指令，则进一步处理
    if (!!show) {
        // 将show指令中的数据转换为变量
        isShow = data2Vars(show, vars, { slotData: $slot, expandAPI })
        // 如果转换后的isShow是一个函数，则调用它并传入插槽数据
        if (typeof isShow === 'function') {
            isShow = isShow({ $slot })
        }
    }
    // 返回组件是否应该显示的布尔值
    return !!isShow
}

/**
 * 设置组件的文本内容
 * 该函数根据组件的指令和变量，以及扩展的API，来计算并设置组件的文本内容
 * 
 * @param {Object} param - 包含组件、插槽和扩展API的对象
 * @param {Object} param.comp - 组件对象，包含指令和变量
 * @param {Object} param.$slot - 插槽对象，用于传递数据到组件
 * @param {Function} param.expandAPI - 扩展的API函数，用于增强组件功能
 */
export const setText = ({ comp, $slot, expandAPI }: any) => {
    // 获取组件的指令和变量
    const { directives, vars } = comp
    // 从指令中提取文本指令
    const { text } = directives || null
    // 初始化新的文本内容变量
    let newText: any = ''
    // 如果文本指令存在
    if (!!text) {
        // 根据文本指令和组件变量，以及插槽和扩展API，计算新的文本内容
        newText = data2Vars(text, vars, { slotData: $slot, expandAPI })
        // 如果计算后的文本内容是一个函数
        if (typeof newText === 'function') {
            // 调用该函数，并传入插槽数据，获取最终的文本内容
            newText = newText({ $slot })
        }
    }
}

/**
 * 根据模型值和其他参数获取更新后的值
 * 
 * 此函数主要用于在给定的模型值上应用一系列转换，这些转换包括合并指令、事件处理程序和变量
 * 它还依赖于外部的expandAPI来执行某些扩展功能
 * 
 * @param modelValue 模型的原始值，通常是一个对象数组
 * @param variable 当前组件的变量，用于注入到每个模型值中
 * @param expandAPI 扩展API对象，提供额外的功能和方法
 * @param slotData 插槽数据，用于处理插槽相关的逻辑
 * @param originVariable 原始变量，用于某些特定的场景下保持不变的变量
 * @param type 可选参数，指定当前环境类型，例如'designer'，这可能会影响某些逻辑的执行
 * @returns 返回一个数组，包含每个模型值的转换后版本
 */
export const getValue = (modelValue: any, variable: any, expandAPI: any, slotData: any, originVariable: any, type?: 'designer') => {
    return modelValue.map((item: { directives: { [x: string]: { [x: string]: any; type: any; value: any } }; on: { [x: string]: any }; nativeOn: { [x: string]: any } }) => {
        // 合并当前项的指令、事件处理程序和变量，并获取更新后的事件处理程序
        // 这里的变量注入允许在每个模型项中访问当前组件的变量
        return {
            ...item,
            vars: variable,
            cacheOn: getCurrentOn({ on: item.on, nativeOn: item.nativeOn }, variable, originVariable, slotData, expandAPI),
        }
    })
}

/**
 * 创建一个槽对象，用于在组件中渲染列表项
 * 
 * @param item 列表中的当前项
 * @param index 当前项的索引
 * @param comp 组件实例
 * @param slotData 额外的槽数据，如果存在将与新创建的槽对象合并
 * @returns 返回一个包含槽数据的对象
 */
export const createSlot = (item: any, index: any, comp: any, slotData: any) => {
    // 从组件的指令中提取for循环的配置，包括数据项的键和ID的键
    const { dataKey, idKey } = comp.directives.for;
    
    // 创建一个对象，包含当前项的数据和ID，使用指令中提供的键名或默认值
    let obj = {
        [dataKey || 'item']: item,
        [idKey || 'key']: index,
    };
    
    // 如果没有额外的槽数据，返回一个包含当前项数据和ID的对象
    if (!slotData) {
        return {
            [`${comp.key}_for`]: obj,
        };
    }
    
    // 如果有额外的槽数据，将其与当前项的数据和ID合并后返回
    return { ...slotData, [`${comp.key}_for`]: obj };
};

/**
 * 获取for指令处理后的列表数据
 * 
 * 此函数旨在解析和处理组件上for指令的逻辑，以生成相应的列表数据
 * 它支持处理多种数据类型，如对象、数组、函数和数字，并根据这些数据类型返回结构化的列表信息
 * 
 * @param comp 组件对象，包含指令信息
 * @param variable 指令使用的变量信息
 * @returns 返回一个对象，包含列表的类型和数据，或者在错误情况下返回错误信息
 */
export const getForEachList = function (comp: any, variable: any) {
    // 检查组件是否包含for指令，并且该指令的类型是'variable'
    if (comp.directives && comp.directives.for && comp.directives.for.type === 'variable') {
        // 将指令的for属性和变量值转换为可迭代的数据
        let forEachData = data2Vars(comp.directives.for, variable.value)
        
        // 如果转换后的数据是一个函数，则调用该函数并传入组件作为参数
        if (typeof forEachData === 'function') {
            forEachData = forEachData(comp)
        }
        
        // 如果转换后的数据是一个对象，则根据其类型（数组或对象）返回相应的结构
        if (typeof forEachData === 'object') {
            // 如果数据是数组，则直接返回数组类型和数据
            if (Array.isArray(forEachData)) {
                return {
                    type: "array",
                    data: forEachData
                }
            } else {
                // 如果数据是对象，则返回对象类型和转换后的键值对数组
                return {
                    type: 'object',
                    data: Object.keys(forEachData).map(item => {
                        return {
                            key: item,
                            value: forEachData[item]
                        }
                    })
                }
            }
        } else if (typeof forEachData === 'number') {
            // 如果数据是数字，则生成一个包含从0到该数字的数组
            const arr = []
            for (let i = 0; i < forEachData; i++) {
                arr.push(i)
            }
            return {
                type: 'number',
                data: arr
            }
        } else if (typeof forEachData === 'string') {
            // 如果数据是字符串，则返回错误信息，因为字符串不是允许的数据类型
            return {
                type: "error",
                message: "Not allowed string",
                data: []
            }
        } else {
            // 如果数据类型未知，则返回通用错误信息
            return {
                type: 'error',
                message: 'unknown error',
                data: []
            }
        }
    } else if (comp.directives.for) {
        // 如果for指令存在但不是'variable'类型，则根据其值的类型返回相应的结果
        const type = typeof comp.directives.for.value
        if (type === 'string') {
            // 如果值是字符串，则返回空数组
            return []
        } else {
            // 否则直接返回该值
            return comp.directives.for.value
        }
    }
}

/**
 * 获取页面模型上下文数据
 * @params compRef 组件id
 * @params level 上下文层级
 */
export const getNthParent = (tree: CubeData.ModelValue[], id: any, level: number) => {
    // 定义一个数组来保存从根到当前节点的路径
    let path: CubeData.ModelValue[] = [];

    // 递归函数来搜索具有特定ID的节点，并记录路径
    function search(node: CubeData.ModelValue): any {
        if (node.id === id) {
            // 找到节点，返回路径
            return path;
        }
        if (node.slots) {
            let exist = false
            path.push(node); // 将当前节点添加到路径中
            for (const key in node.slots) {
                if (Object.prototype.hasOwnProperty.call(node.slots, key)) {
                    const element = node.slots[key];
                    const result = getChildren(element.children)
                    if (result) {
                        exist = true
                        return result
                    }
                }
            }
            path.pop(); // 如果子节点没有找到目标，移除当前节点，回溯
        }
        return null;
    }

    function getChildren(slot: CubeData.ModelValue[]) {
        for (const child of slot) {
            const result = search(child);
            if (result) {
                return result
            };
        }
    }

    // 遍历树，开始搜索
    for (const root of tree) {
        const resultPath = search(root);
        if (resultPath) {
            // 如果找到路径，获取第n级父节点
            const nthParentIndex = resultPath.length - level;
            return nthParentIndex >= 0 ? resultPath[nthParentIndex] : resultPath[0];
        }
    }
    return null; // 如果没有找到节点，返回null
}

/**
 * 判断给定的插槽对象是否不包含任何子元素
 * 
 * 此函数用于检查一个插槽对象（slots）是否所有的插槽都为空，即没有任何子元素
 * 它通过遍历每个插槽并检查其 children 属性来确定是否有子元素存在
 * 如果任一插槽包含子元素，则函数返回 false，否则返回 true
 * 
 * @param slots 一个包含插槽的对象，每个插槽可能包含 children 属性
 * @returns 如果所有插槽均为空则返回 true，否则返回 false
 */
export const isNotSlot = (slots: { [x: string]: any; }) => {
    // 检查 slots 对象是否为空，如果为空则直接返回 false
    if (Object.keys(slots).length === 0) {
        return false
    }
    let notSlot = true
    // 遍历 slots 对象的每个属性
    for (const key in slots) {
        // 确保属性属于 slots 对象本身，而不是原型链上的属性
        if (Object.prototype.hasOwnProperty.call(slots, key)) {
            const element = slots[key];
            // 如果当前插槽的 children 属性长度大于 0，表明有子元素存在，将 notSlot 设置为 false
            if (element.children.length > 0) {
                notSlot = false
            }
        }
    }
    // 返回 notSlot 变量的值，表明是否有子元素存在
    return notSlot
}

/**
 * 对数据进行变量化处理
 * @params compRef 组件id
 * @params level 上下文层级
 */
export const data2Vars = (directive: any, vars: any, options?: any) => {
    const { type, value } = directive
    let newVal: any = []
    if (type === 'variable') {
        value.forEach((item: string | number, index: number) => {
            if (index === 0) {
                newVal = vars[item]
            } else {
                newVal = newVal[item]
            }
        })
    } else if (type === 'string') {
        newVal = value
    } else if (type === 'function') {
        newVal = runOn(directive, vars, options.expandAPI)({ $slot: options.slotData })
    }
    return newVal
    // if(isRef(newVal)) {
    //     return newVal
    // } else {
    //     return typeof newVal === 'object' ? JSON.stringify(newVal) : newVal
    // }
}

/**
 * 解析组件的属性
 * 
 * 此函数用于从组件实例和组件定义中解析出组件的属性数据它遍历组件的属性，
 * 检查是否应该包含该属性基于属性的类型和配置，将其添加到返回的属性对象中
 * 
 * @param comp 当前组件的实例，包含组件的属性和其他信息
 * @param comps 所有组件的定义，映射组件名为组件定义对象
 * @param variable 变量对象，用于解析属性值中引用的变量
 * @param expandAPI 扩展API函数，用于在解析属性时调用扩展功能
 * @returns 返回一个对象，包含从组件实例和定义中解析出的属性键值对
 */
export const parseProps = (comp: any, comps: any, variable: any, expandAPI: any, slotData?: any, type?: 'designer' | 'render') => {
    // 初始化一个空对象，用于存储解析后的属性数据
    const propsData: {
        [key: string]: any;
    } = {};
    // 遍历组件实例的属性
    for (const key in comp.attrs) {
        // 确保遍历的属性是组件实例自己的，而不是原型链上的
        if (Object.hasOwnProperty.call(comp.attrs, key)) {
            const element = comp.attrs[key];
            if (!comps[comp.name]) {
                try {
                    Message.error(`${comp.name} 组件不存在`)
                } catch (error) {
                    console.log(`${comp.name} 组件不存在`)
                }
                continue;
            }
            const compProp = comps[comp.name].props[key];
            // 检查组件属性是否应该被解析和包含在结果中
            if (compProp && compProp.hidden && compProp.hidden(comp.attrs)) {
                continue
            }
            let newVal: any = null;
            // 如果属性类型是变量，则从变量对象中解析其值
            if (element && element.type === "variable") {
                // 如果属性值是一个数组，逐级访问变量对象来获取最终值
                if (element.value && element.value.length > 0) {
                    newVal = variable;
                    element.value.forEach((item: string) => {
                        newVal = newVal[item];
                    });
                }
                if (typeof newVal === 'function') {
                    if(compProp.type === 'function' || typeof compProp === 'function' || (Array.isArray(compProp.type) && compProp.type.includes('function'))) {
                        if (!!slotData) {
                            let func = function () {
                                return newVal(...arguments, { $slot: slotData })
                            }
                            newVal = func
                            continue;
                        }
                    } else {
                        newVal = newVal.call(null, { $slot: slotData })
                    }
                }
            } else if (element && element.type === 'function') {
                if (element.value && element.value.code !== "") {
                    if (!!slotData) {
                        let func = function () {
                            return runOn(element, variable, expandAPI)(...arguments, { $slot: slotData })
                        }
                        newVal = func
                    } else {
                        newVal = runOn(element, variable, expandAPI)
                    }
                    if(compProp && compProp.type === 'function' || typeof compProp === 'function' || (Array.isArray(compProp.type) && compProp.type.includes('function'))) {} else {
                        newVal = newVal() || null
                    }
                }
            } else if (element) {
                // 如果属性值是函数，且代码不为空，则调用扩展API来执行该函数
                // 如果属性值为 null，则删除该属性
                if (element.value !== null && element.value !== undefined) {
                    // 否则直接将属性值存储到结果对象中
                    const nativeProp = !!comps[comp.name].render || !!comps[comp.name].setup ? comps[comp.name].props[key] : comps[comp.name].comp.props[key]
                    if (typeof nativeProp === 'object' && !Array.isArray(nativeProp)) {
                        if (element.value !== nativeProp.default && type === 'designer') {
                            newVal = element.value;
                        } else if(type === 'render') {
                            newVal = element.value;
                        }
                    } else if (typeof nativeProp === 'function' && element.value !== null) {
                        newVal = element.value;
                    } else {
                        newVal = element.value;
                    }
                }
            }
            if (compProp && compProp.required && newVal === null) {
                switch (compProp.type) {
                    case 'array':
                        newVal = [];
                        break;
                    case 'object':
                        newVal = {};
                        break;
                    case 'boolean':
                        newVal = false;
                        break;
                    case 'number':
                        newVal = 0;
                        break;
                    default:
                        newVal = '';
                        break;
                }
            }

            if(isRef(newVal)) {
                newVal = newVal.value
            }
            // 将解析后的属性值存储到结果对象中
            if(newVal === null) {
                delete propsData[key];
            } else {
                propsData[key] = newVal;
            }
        }
    }
    // 返回包含所有解析后属性的对象
    return propsData;
}