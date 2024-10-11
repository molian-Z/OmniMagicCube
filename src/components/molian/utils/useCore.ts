import { getCurrentOn, runOn } from '@molian/utils/customFunction'
import { globalComps } from '@molian/utils/compsConfig'
const { Message } = globalComps.value
// 循环判断
export const isFor = ({ comp, $slot }: any) => {
    let isFor: any = true
    if (isIf({ comp, $slot })) {
        const { directives, vars } = comp
        if (!directives.for) {
            isFor = false
        } else {
            isFor = data2Vars(directives.for, vars)
            if (typeof isFor === 'function') {
                isFor = isFor({ $slot })
            }
        }
    } else {
        isFor = false
    }
    return !!isFor
}

// 渲染判断
export const isIf = ({ comp, $slot }: any) => {
    const { directives, vars } = comp
    let isIf: any = true
    if (!!directives.if) {
        isIf = data2Vars(directives.if, vars)
        if (typeof isIf === 'function') {
            isIf = isIf({ $slot })
        }
    }
    return !!isIf
}

// 显示判断
export const isShow = ({ comp, $slot }: any) => {
    const { directives, vars } = comp
    const { show } = directives || null
    let isShow: any = true
    if (!!show) {
        isShow = data2Vars(show, vars)
        if (typeof isShow === 'function') {
            isShow = isShow({ $slot })
        }
    }
    return !!isShow
}

export const getValue = (modelValue: any, variable: any, expandAPI: any, slotData: any, originVariable: any, type?: 'designer') => {
    return modelValue.map((item: { directives: { [x: string]: { [x: string]: any; type: any; value: any } }; on: { [x: string]: any }; nativeOn: { [x: string]: any } }) => {
        return {
            ...item,
            vars: variable,
            cacheOn: getCurrentOn({ on: item.on, nativeOn: item.nativeOn }, variable, originVariable, slotData, expandAPI),
        }
    })
}

// 获取循环列表数据
export const getForEachList = function (comp: any, variable: any) {
    if (comp.directives && comp.directives.for && comp.directives.for.type === 'variable') {
        let forEachData = data2Vars(comp.directives.for, variable.value)
        if (typeof forEachData === 'function') {
            forEachData = forEachData(comp)
        }
        if (typeof forEachData === 'object') {
            if (Array.isArray(forEachData)) {
                return {
                    type: "array",
                    data: forEachData
                }
            } else {
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
            const arr = []
            for (let i = 0; i < forEachData; i++) {
                arr.push(i)
            }
            return {
                type: 'number',
                data: arr
            }
        } else if (typeof forEachData === 'string') {
            return {
                type: "error",
                data: []
            }
        } else {
            return {
                type: 'error',
                data: []
            }
        }
    } else if (comp.directives.for) {
        const type = typeof comp.directives.for.value
        if (type === 'string') {
            return []
        } else {
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

export const isNotSlot = (slots: { [x: string]: any; }) => {
    if (Object.keys(slots).length === 0) {
        return false
    }
    let notSlot = true
    for (const key in slots) {
        if (Object.prototype.hasOwnProperty.call(slots, key)) {
            const element = slots[key];
            if (element.children.length > 0) {
                notSlot = false
            }
        }
    }
    return notSlot
}

/**
 * 对数据进行变量化处理
 * @params compRef 组件id
 * @params level 上下文层级
 */
export const data2Vars = (directive: any, vars: any) => {
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
    }
    return newVal
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
export const parseProps = (comp: any, comps: any, variable: any, expandAPI: any, slotData?: any) => {
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
            // 如果属性类型是变量，则从变量对象中解析其值
            if (element && element.type === "variable") {
                let newVal = variable;
                // 如果属性值是一个数组，逐级访问变量对象来获取最终值
                if (element.value) {
                    element.value.forEach((item: string) => {
                        newVal = newVal[item];
                    });
                }
                if (typeof newVal === 'function') {
                    if (Array.isArray(compProp.type) && compProp.type.indexOf('function') > -1 || compProp.type !== 'function') {
                        newVal = newVal.call(null, { $slot: slotData })
                    } else {
                        if (!!slotData) {
                            let func = function () {
                                return newVal(...arguments, { $slot: slotData })
                            }
                            propsData[key] = func
                            continue;
                        }
                    }
                }
                // 将解析后的属性值存储到结果对象中
                propsData[key] = newVal;
            } else if (element && element.value !== undefined) {
                // 如果属性值是函数，且代码不为空，则调用扩展API来执行该函数
                if (element.type === 'function') {
                    if (element.value && element.value.code !== "") {
                        if (!!slotData) {
                            let func = function () {
                                return runOn(element, variable, expandAPI)(...arguments, { $slot: slotData })
                            }
                            propsData[key] = func
                        } else {
                            propsData[key] = runOn(element, variable, expandAPI)
                        }
                    }
                } else {
                    // console.log(element, key)
                    // 如果属性值为 null，则删除该属性
                    if (element.value !== null && element.value !== undefined) {
                        // 否则直接将属性值存储到结果对象中
                            const nativeProp = !!comps[comp.name].render || !!comps[comp.name].setup ? comps[comp.name].props[key] : comps[comp.name].comp.props[key]
                            if (typeof nativeProp === 'object' && !Array.isArray(nativeProp)) {
                                if (element.value !== nativeProp.default) {
                                    propsData[key] = element.value;
                                }
                            } else if (typeof nativeProp === 'function' && element.value !== null) {
                                propsData[key] = element.value;
                            } else {
                                propsData[key] = element.value;
                            }
                    }
                }
            }
        }
    }
    // 返回包含所有解析后属性的对象
    return propsData;
}