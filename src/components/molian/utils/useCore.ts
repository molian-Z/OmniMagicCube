import { getCurrentOn, getVariableData } from '@molian/utils/customFunction'

// 循环判断
export const isFor = (comp: any) => {
    let isFor = true
    if (isIf(comp)) {
        const { directives, vars } = comp
        if (!directives.for) {
            isFor = false
        }else{
            isFor = data2Vars(directives.for, vars)
        }
    }
    return !!isFor
}

// 渲染判断
export const isIf = (comp: any) => {
    const { directives, vars } = comp
    let isIf = true
    if(!!directives.if){
        isIf = data2Vars(directives.if, vars)
    }
    return !!isIf
}

// 显示判断
export const isShow = (comp: any) => {
    const { directives, vars } = comp
    const { show } = directives || null
    let isShow = true
    if(!!show){
        isShow = data2Vars(show, vars)
    }
    return !!isShow
}

export const getValue = (modelValue: any, variable: any, expandAPI: any, type?: 'designer') => {
    return modelValue.map((item: { directives: { [x: string]: { [x: string]: any; type: any; value: any } }; on: { [x: string]: any }; nativeOn: { [x: string]: any } }) => {
        // Object.keys(item.directives).forEach(key => {
        //     if (!item.directives[key]) return false;
        //     vars[key] = getVariableData(item.directives[key], variable)
        // })
        return {
            vars: variable,
            cacheOn: type === 'designer' ? {} : getCurrentOn({ on: item.on, nativeOn: item.nativeOn }, variable, expandAPI),
            ...item
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