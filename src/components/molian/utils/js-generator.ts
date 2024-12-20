import { useCloned } from '@vueuse/core'
import { currentRegComps } from './compsConfig'
export interface IComp {
    name?: string;
    category?: string;
    attrs?: IAttrs;
    on?: Record<string, unknown>;
    nativeOn?: Record<string, unknown>;
    directives?: Record<string, unknown>;
    slots?: ISlots;
    css?: ICss;
    key?: string;
    id?: string;
}
export interface ICss {
    borderRadius?: (string)[];
    // margin?: (string)[];  // 取消使用
    // padding?: (string)[]; // 取消使用
    marginTop?: string | number;
    marginLeft?: string | number;
    marginRight?: string | number;
    marginBottom?: string | number;
    paddingTop?: string | number;
    paddingLeft?: string | number;
    paddingRight?: string | number;
    paddingBottom?: string | number;
    constX?: string;
    constY?: string;
    color?: IColor;
    background?: IColor;
    border?: Array<unknown>;
    mixBlendMode?: IColor;
    blur?: IBlur;
    boxShadow?: Array<unknown>;
}
export interface IBlur {
    isShow?: boolean;
    modelValue?: string;
    field?: string;
}
export interface IColor {
    isShow?: boolean;
    modelValue?: string;
}
export interface ISlots {
    [key: string]: IDefault;
}
export interface IDefault {
    allowComps?: (string)[];
    children?: Array<IComp>;
}
export interface IAttrs {
    [key: string]: any;
}
// 创建JS函数
export const createJS = function (compObj: IComp, globalAttrs: { lifecycle: any; variable: any }, type = "options") {
    const {
        lifecycle,
        variable
    } = globalAttrs
    const jsCodeObj: any = {}
    deepObjCreateJs(jsCodeObj, compObj, globalAttrs)
    if (type === 'composition') {
        // CompositionAPI代码
        const importModule: {
            vue: string[]
        } = {
            'vue': []
        }

        // 变量生成
        const variableStr = Object.keys(variable).map(key => {
            const type = variable[key].type
            let value = variable[key].value || ''
            if (typeof value === 'object' && type !== 'function') {
                value = JSON.stringify(value).replace(/"/g, "'")
            }
            if (type === 'computed') {
                if (importModule.vue.indexOf("computed") === -1) {
                    importModule.vue.push("computed")
                }
                return `  const ${key} = computed(()=> {${value && value.code || "return null"}})\n`
            } else if (type === 'function') {
                return `  const ${key} = ${parseJSCode(value)};\n`
            } else {
                if (importModule.vue.indexOf("ref") === -1) {
                    importModule.vue.push("ref")
                }
                return `  const ${key} = ref(${type === 'string' ? "'" + value + "'" : value || 'null'});\n`
            }
        }).join('\n')

        // 生命周期生成
        const lifecycleStr = Object.keys(lifecycle).filter(key => {
            return !!lifecycle[key]
        }).map(key => {
            const rename = `on` + key.charAt(0).toUpperCase() + key.slice(1);
            importModule.vue.push(rename)
            const { code, functionMode } = lifecycle[key].value || {}
            if (code) {
                return `
                    ${rename}(${functionMode === 'asyncFunction' ? 'async ' : ''}()=>{${code}};)
            `} else {
                return ``
            }
        }).join('\n')

        // 函数代码生成
        let jsCode = Object.keys(jsCodeObj).map(key => {
            return `  const ${key.replace(/:/g, '__')} = ${jsCodeObj[key]};`
        }).join('\n')
        let code = `<script setup>`
        // import引入
        code += importModule.vue.length > 0 ? '\nimport { ' + importModule.vue.join(', ') + " } from 'vue'" : ''
        // 变量写入
        code += !!variableStr ? '\n' + variableStr : ''
        // 生命周期写入
        code += !!lifecycleStr ? '\n' + lifecycleStr : ''
        // js执行函数写入
        code += !!jsCode ? '\n' + jsCode : ''
        // 结尾写入
        code += '\n </script>'
        return code

    } else if (type === 'options') {
        // OptionsAPI代码
        // 生命周期写入
        const lifecycleStr = Object.keys(lifecycle).filter(key => {
            return !!lifecycle[key]
        }).map(key => {
            if (lifecycle[key].value && lifecycle[key].value.code) {
                return `${lifecycle[key].value.functionMode === 'asyncFunction' ? 'async ' : ''}${key}${parseJSCode(lifecycle[key].value, "lifecycle")}`
            } else {
                return ``
            }
        }).filter(item => !!item).join(',\n')
        // 变量写入
        const variableObj = {
            data: "",
            computed: "",
            methods: "",
        }
        Object.keys(variable).forEach(key => {
            const type = variable[key].type
            let value = variable[key].value || ''
            if (typeof value === 'object') {
                value = JSON.stringify(value).replace(/"/g, "'")
            }
            if (type === 'computed') {
                variableObj.computed += `${key}() {${value && value.code || "return null"}}\n`
            } else if (type === 'function') {
                if (value && value.code) {
                    variableObj.methods += `  ['${key}']: ${parseJSCode(value)},\n`
                }
            } else {
                variableObj.data += `'${key}': ${type === 'string' ? "'" + value + "'" : value || 'null'},\n`
            }
        })
        // jsCode 写入
        let jsCode = Object.keys(jsCodeObj).map(key => {
            return `  ${key.replace(/:/g, '__')}: ${jsCodeObj[key]}`
        }).join(',\n')
        return `<script>
  export default {
    data(){
      return {
        ${variableObj.data}
      }
    },
    computed:{
      ${variableObj.computed}
    },
    methods:{\n${variableObj.methods}${jsCode}\n},
    ${lifecycleStr}
  }
</script>`
    }
}
// 将 modelValue 参数简化，移除不必要的属性和插槽
// 参数 modelValue: 任意类型，通常是一个对象，包含名称、属性和插槽等信息
// 返回值: 简化后的 modelValue 对象
// 定义一个函数，用于简化 JavaScript 对象的表示
export const conciseJs = function (modelValue: any, comps: any) {
    // 使用 useCloned 函数克隆 modelValue，避免修改原始数据
    const { cloned } = useCloned(modelValue)
    // 遍历克隆后的对象，处理每个项
    cloned.value.forEach((item: any) => {
        // 获取当前组件的属性定义
        if (!!currentRegComps.value[item.name]) {
            const attrs = currentRegComps.value[item.name].comp.props
            // 遍历当前项的属性，进行简化
            Object.keys(item.attrs).forEach(key => {
                // 如果属性值为 null，则删除该属性
                if (item.attrs[key].value === null || item.attrs[key].value === undefined) {
                    if (typeof attrs[key] === 'object' && (attrs[key].default === null || attrs[key].default === undefined)) {
                        delete item.attrs[key]
                    } else {
                        delete item.attrs[key]
                    }
                }
                // 如果属性有默认值，且当前属性值与默认值相同，则删除该属性
                if (typeof attrs[key] === 'object' && !!attrs[key].default) {
                    if (item.attrs[key] && comps[item.name].comp.props[key] && comps[item.name].comp.props[key].default === item.attrs[key].value) {
                        delete item.attrs[key]
                    } else if (typeof item.attrs[key] === 'object' && comps[item.name].comp.props[key] && comps[item.name].comp.props[key].default) {
                        if (JSON.stringify(comps[item.name].comp.props[key].default) === JSON.stringify(item.attrs[key].value)) {
                            delete item.attrs[key]
                        }
                    }
                } else {
                    // 布尔数据判断是否为false，如果默认数据为false且值也为false则删除
                    if (currentRegComps.value[item.name].props[key].type === 'boolean') {
                        if (!currentRegComps.value[item.name].props[key].default) {
                            if (item.attrs[key] && item.attrs[key].value === false) {
                                delete item.attrs[key]
                            }
                        }
                    }
                }
            })
            // 如果当前项包含插槽，则递归简化插槽内容
            if (!!item.slots) {
                Object.keys(item.slots).forEach(key => {
                    item.slots[key].children = conciseJs(item.slots[key].children, comps)
                })
            }
        }
    })
    // 返回简化后的对象
    return cloned.value
}


/**
 * 通过深度遍历对象，将组件对象转换为JavaScript代码对象
 * @param jsCodeObj - 用于存储生成的JavaScript代码的对象
 * @param obj - 需要转换为JavaScript代码的组件对象
 * @param globalAttrs - 全局属性对象，可能用于扩展或修改生成的JavaScript代码
 */
function deepObjCreateJs(jsCodeObj: { [x: string]: string }, obj: { [x: string]: any }, globalAttrs: any) {
    // 遍历组件对象的每个属性
    for (const key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) {
            const element = obj[key];
            // 解析当前元素的JavaScript代码并添加到jsCodeObj中
            parseJS(jsCodeObj, obj)
            // 检查当前元素是否有子元素（slots属性）
            const slots = element.slots
            if (slots) {
                // 遍历子元素
                for (const sKey in slots) {
                    if (Object.hasOwnProperty.call(slots, sKey)) {
                        const childComp = slots[sKey].children;
                        // 递归调用deepObjCreateJs，将子元素转换为JavaScript代码
                        deepObjCreateJs(jsCodeObj, childComp, globalAttrs)
                    }
                }
            }
        }
    }
}

/**
 * 解析JavaScript代码
 * @param jsCodeObj 一个对象，用于存储解析后的JavaScript代码
 * @param obj 包含待解析事件的对象
 * 
 * 此函数的目的是遍历给定的对象，寻找并解析其中的事件处理函数，
 * 并将解析后的代码存储到jsCodeObj中
 */
function parseJS(jsCodeObj: { [x: string]: string }, obj: { [x: string]: any }) {
    // 遍历obj中的每个属性，这些属性包含了事件处理信息
    obj.forEach((item: { on: any; nativeOn: { [x: string]: any }; key: any }) => {
        // 检查是否存在on属性，即是否存在普通事件处理对象
        if (item.on) {
            // 遍历事件对象的每个事件
            for (const key in item.on) {
                if (Object.hasOwnProperty.call(item.on, key)) {
                    // 获取当前事件的详细信息
                    const element = item.on[key];
                    // 解构出事件的各个属性，包括类型、作用模式、代码和变量
                    const { type, functionMode, code, codeVar } = element;
                    // 检查事件类型是否不是变量类型
                    if (type !== 'variable') {
                        // 如果事件值存在，并且有代码需要解析
                        if (element.value && element.value.code) {
                            // 解析事件处理代码，并将其存储到jsCodeObj中
                            jsCodeObj[`${item.key}_${key}`] = parseJSCode(element.value)
                        }
                    }
                }
            }
        }

        // 检查是否存在nativeOn属性，即是否存在原生事件处理对象
        if (item.nativeOn) {
            // 遍历原生事件对象的每个事件
            for (const key in item.nativeOn) {
                if (Object.hasOwnProperty.call(item.nativeOn, key)) {
                    // 获取当前原生事件的详细信息
                    const element = item.nativeOn[key];
                    // 检查事件类型是否不是变量类型
                    if (element.type !== 'variable') {
                        // 如果事件值存在，并且有代码需要解析
                        if (element.value && element.value.code) {
                            // 解析原生事件处理代码，并将其存储到jsCodeObj中
                            jsCodeObj[`${item.key}_${key}`] = parseJSCode(element.value)
                        }
                    }
                }
            }
        }
    })
}

/**
 * 将JavaScript代码片段解析为指定类型的函数表达式
 * 
 * @param {Object} params - 包含解析参数的对象
 * @param {string} params.functionMode - 函数模式，如'asyncFunction'
 * @param {string[]} params.codeVar - 函数参数列表
 * @param {string} params.code - 需要解析的代码字符串
 * @param {string} type - 函数类型，可以是'arrowFunction'、'function'或'lifecycle'
 * @returns {string} 解析后的函数表达式字符串
 */
const parseJSCode = ({
    functionMode,
    codeVar,
    code
}: {
    functionMode: string,
    codeVar: string[],
    code: string
}, type = "arrowFunction") => {
    if (type === 'lifecycle') {
        // 当类型为生命周期方法时，返回特定格式的函数表达式
        return `(${codeVar && codeVar.join(', ') || ''}){\n${code}\n}`
    } else {
        // 当类型非生命周期方法时，根据参数生成相应类型的函数表达式
        return `${functionMode === 'asyncFunction' ? 'async ' : ''}${type === 'function' ? 'function' : ''}(${codeVar && codeVar.join(', ') || ''})${type === 'arrowFunction' ? '=>' : ''}{\n${code}\n}`
    }
}