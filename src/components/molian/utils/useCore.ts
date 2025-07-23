import { getCurrentOn, runOn } from '@molian/utils/customFunction'
import { globalComps } from '@molian/utils/compsConfig'
const { Message } = globalComps.value

// 定义接口提高类型安全性
interface ComponentWithDirectives {
    directives: {
        if: { type: string; value: any; } | undefined;
        for?: {
            type: string;
            value: any;
        };
    };
    vars: Record<string, any>;
}

interface IsForParams {
    comp: ComponentWithDirectives;
    $slot: any;
    expandAPI?: any;
}

interface IsIfParams {
    comp: {
        directives: {
            if?: {
                type: string;
                value: any;
            };
        };
        vars: Record<string, any>;
    };
    $slot: any;
    expandAPI?: any;
}

interface IsShowParams {
    comp: {
        directives: {
            show?: {
                type: string;
                value: any;
            };
        };
        vars: Record<string, any>;
    };
    $slot: any;
    expandAPI?: any;
}

interface SetTextParams {
    comp: {
        directives: {
            text?: {
                type: string;
                value: any;
            };
        };
        vars: Record<string, any>;
    };
    $slot: any;
    expandAPI?: any;
}

interface SlotDirective {
    for: {
        dataKey?: string;
        idKey?: string;
    };
}

interface ComponentWithSlot {
    directives: SlotDirective;
    key: string;
}

interface SlotData {
    [key: string]: any;
}

interface ForEachResult {
    type: 'array' | 'object' | 'number' | 'error';
    data: any[];
    message?: string;
}

interface TreeNode extends CubeData.ModelValue {
    slots?: {
        [key: string]: {
            children: TreeNode[];
        };
    };
}

interface Slot {
    children: any[];
}

interface SlotMap {
    [key: string]: Slot;
}

interface Directive {
    type: 'variable' | 'string' | 'function';
    value: any;
}

interface DirectiveOptions {
    slotData?: any;
    expandAPI?: any;
}

interface ComponentProps {
    type?: string | string[] | Function;
    hidden?: boolean | ((attrs: any) => boolean);
    required?: boolean;
    default?: any;
}

interface Component {
    name: string;
    attrs: Record<string, ElementAttribute>;
    props: Record<string, ComponentProps>;
    render?: boolean;
    setup?: boolean;
    comp?: {
        props: Record<string, ComponentProps>;
    };
}

interface ElementAttribute {
    type: 'variable' | 'function' | string;
    value: any;
    code?: string;
}


/**
 * 检查组件是否适用于循环渲染
 * 
 * 此函数主要通过检查组件的指令来确定它是否适用于循环渲染（例如 v-for 在 Vue 中）
 * 它首先确保组件存在，并且有 directives 属性，然后检查是否有 for 指令
 * 如果存在 for 指令，它会尝试将指令的数据转换为变量，并在此基础上决定组件是否可见
 * 
 * @param {IsForParams} params 包含组件、插槽和扩展 API 的对象
 * @returns {boolean} 组件是否适用于循环渲染
 */
export const isFor = ({ comp, $slot, expandAPI }: IsForParams): boolean => {
    // 提前进行空值检查
    if (!comp?.directives) {
        return false;
    }

    // 如果组件不满足条件渲染，直接返回 false
    // 检查条件渲染指令
    if (!isIf({ 
        comp: {
            directives: {
                if: comp.directives?.if
            },
            vars: comp.vars
        }, 
        $slot 
    })) {
        return false;
    }

    const { directives, vars } = comp;

    // 如果没有 for 指令，直接返回 false
    if (!directives.for) {
        return false;
    }

    // 处理循环渲染指令
    const forResult = data2Vars(directives.for as Directive, vars, {
        slotData: $slot, 
        expandAPI 
    });

    // 如果结果是函数，执行它
    if (typeof forResult === 'function') {
        return Boolean(forResult({ $slot }));
    }

    return Boolean(forResult);
}

/**
 * 判断组件是否满足条件渲染
 * @param {Object} comp - 组件对象，包含指令和变量信息
 * @param {Object} $slot - 插槽对象，用于传递给指令处理函数
 * @param {Object} expandAPI - 扩展API对象，用于指令处理函数的扩展功能
 * @returns {boolean} - 返回组件是否满足条件渲染的结果
 */
export const isIf = ({ comp, $slot, expandAPI }: IsIfParams): boolean => {
    // 提前进行空值检查
    if (!comp?.directives?.if) {
        return true;
    }

    const { directives, vars } = comp;
    
    // 直接处理条件渲染逻辑
    const ifResult = data2Vars(directives.if as Directive, vars, {
        slotData: $slot, 
        expandAPI 
    });

    // 如果结果是函数，执行它并返回布尔值
    if (typeof ifResult === 'function') {
        return Boolean(ifResult({ $slot }));
    }

    return Boolean(ifResult);
};

/**
 * 判断组件是否应该显示
 * @param {Object} param0 - 包含组件信息、插槽数据和扩展API的对象
 * @param {Object} param0.comp - 组件的详细配置信息
 * @param {Object} param0.$slot - 插槽数据
 * @param {Function} param0.expandAPI - 扩展API函数
 * @returns {boolean} 组件是否应该显示的布尔值
 */
export const isShow = ({ comp, $slot, expandAPI }: IsShowParams): boolean => {
    // 提前进行空值检查
    if (!comp?.directives?.show) {
        return true;
    }

    const { directives, vars } = comp;
    
    // 直接处理显示逻辑
    const showResult = data2Vars(directives.show as Directive, vars, {
        slotData: $slot, 
        expandAPI 
    });

    // 如果结果是函数，执行它并返回布尔值
    if (typeof showResult === 'function') {
        return Boolean(showResult({ $slot }));
    }

    return Boolean(showResult);
};

/**
 * 设置组件的文本内容
 * 该函数根据组件的指令和变量，以及扩展的API，来计算并设置组件的文本内容
 * 
 * @param {Object} param - 包含组件、插槽和扩展API的对象
 * @param {Object} param.comp - 组件对象，包含指令和变量
 * @param {Object} param.$slot - 插槽对象，用于传递数据到组件
 * @param {Function} param.expandAPI - 扩展的API函数，用于增强组件功能
 */
export const setText = ({ comp, $slot, expandAPI }: SetTextParams): string => {
    // 提前进行空值检查
    if (!comp?.directives?.text) {
        return '';
    }

    const { directives, vars } = comp;
    
    // 处理文本内容
    const textResult = data2Vars(directives.text as Directive, vars, {
        slotData: $slot, 
        expandAPI 
    });

    // 如果结果是函数，执行它并返回字符串
    if (typeof textResult === 'function') {
        return String(textResult({ $slot }));
    }

    return String(textResult || '');
};

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
export const createSlot = (
    item: any,
    index: number,
    comp: ComponentWithSlot,
    slotData?: SlotData
): SlotData => {
    const { dataKey = 'item', idKey = 'key' } = comp.directives.for;
    const slotKey = `${comp.key}_for`;
    
    const slotObject = {
        [slotKey]: {
            [dataKey]: item,
            [idKey]: index
        }
    };

    return slotData ? { ...slotData, ...slotObject } : slotObject;
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
export const getForEachList = function (comp: any, variable: any, expandAPI:any): ForEachResult | any {
    // 提前进行空值检查
    if (!comp?.directives?.for) {
        return {
            type: 'error',
            data: [],
            message: 'No for directive'
        };
    }

    // 处理非 variable 类型的指令
    if (comp.directives.for.type !== 'variable') {
        return typeof comp.directives.for.value === 'string' 
            ? [] 
            : comp.directives.for.value;
    }

    // 获取可迭代数据
    let forEachData = data2Vars(comp.directives.for, variable.value, {
        slotData: null, 
        expandAPI,
    });
    
    // 处理函数类型数据
    if (typeof forEachData === 'function') {
        forEachData = forEachData(comp);
    }

    // 根据数据类型返回相应结果
    switch (typeof forEachData) {
        case 'object':
            if (Array.isArray(forEachData)) {
                return {
                    type: 'array',
                    data: forEachData
                };
            }
            return {
                type: 'object',
                data: Object.entries(forEachData || {}).map(([key, value]) => ({
                    key,
                    value
                }))
            };
        
        case 'number':
            return {
                type: 'number',
                data: Array.from({ length: forEachData }, (_, i) => i)
            };
            
        case 'string':
            return {
                type: 'error',
                data: [],
                message: 'Not allowed string'
            };
            
        default:
            return {
                type: 'error',
                data: [],
                message: 'unknown error'
            };
    }
};

/**
 * 获取页面模型上下文数据
 * @params compRef 组件id
 * @params level 上下文层级
 */
export const getNthParent = (tree: TreeNode[], id: string, level: number): TreeNode | null => {
    const findNodePath = (nodes: TreeNode[]): TreeNode[] | null => {
        for (const node of nodes) {
            if (node.id === id) {
                return [node];
            }

            if (node.slots) {
                for (const slot of Object.values(node.slots)) {
                    const childPath = findNodePath(slot.children);
                    if (childPath) {
                        return [node, ...childPath];
                    }
                }
            }
        }
        return null;
    };

    const path = findNodePath(tree);
    if (!path) {
        return null;
    }

    const parentIndex = Math.max(0, path.length - 1 - level);
    return path[parentIndex];
};

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
export const isNotSlot = (slots: SlotMap): boolean => {
    if (!slots || Object.keys(slots).length === 0) {
        return false;
    }
    return Object.values(slots).every(slot => !slot.children?.length);
};

/**
 * 对数据进行变量化处理
 * @params compRef 组件id
 * @params level 上下文层级
 */
export const data2Vars = (directive: Directive, vars: Record<string, any>, options: DirectiveOptions = {}): any => {
    const { type, value } = directive;
    switch (type) {
        case 'variable':
            if (!Array.isArray(value) || !value.length) {
                return undefined;
            }
            return value.reduce((result, key, index) => {
                if (index === 0) {
                    return vars[key];
                }
                return result?.[key];
            }, undefined);

        case 'string':
            return value;

        case 'function':
            return runOn(directive, vars, options.expandAPI || {})({ 
                $slot: options.slotData 
            });

        default:
            return undefined;
    }
};

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
export const parseProps = (
    comp: Component,
    comps: Record<string, Component>,
    variable: Record<string, any>,
    expandAPI: any,
    slotData?: any,
    type?: 'designer' | 'render'
): Record<string, any> => {
    const propsData: Record<string, any> = {};
    if (!comp?.attrs || !comps[comp.name]) {
        console.log('不存在组件或者属性', comp.name, comp.attrs)

        // 待优化
        const commonTags = [
            'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio',
            'b', 'base', 'bdi', 'bdo', 'blockquote', 'body', 'br', 'button',
            'canvas', 'caption', 'cite', 'code', 'col', 'colgroup',
            'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt',
            'em', 'embed',
            'fieldset', 'figcaption', 'figure', 'footer', 'form',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html',
            'i', 'iframe', 'img', 'input', 'ins',
            'kbd',
            'label', 'legend', 'li', 'link',
            'main', 'map', 'mark', 'menu', 'meta', 'meter',
            'nav', 'noscript',
            'object', 'ol', 'optgroup', 'option', 'output',
            'p', 'param', 'picture', 'pre', 'progress',
            'q',
            'rp', 'rt', 'ruby',
            's', 'samp', 'script', 'section', 'select', 'slot', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'svg',
            'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track',
            'u', 'ul',
            'var', 'video',
            'wbr'
          ];
        const isHTMLTag = commonTags.find(item => comp?.name === item)
        if(!isHTMLTag) {
            try {
                Message.error(`${comp?.name || 'Unknown'} 组件不存在`);
            } catch (error) {
                console.log(`${comp?.name || 'Unknown'} 组件不存在`);
            }
        }
        return propsData;
    }

    const processVariableType = (element: ElementAttribute, compProp: ComponentProps): any => {
        if (!element.value?.length) return null;
        
        const value = element.value.reduce((val: any, item: string) => {
            return val && val[item] ? val[item] : undefined;
        }, variable);

        if (typeof value !== 'function') return value;

        const isFunction = compProp.type === 'function' || 
            typeof compProp === 'function' || 
            (Array.isArray(compProp.type) && compProp.type.includes('function'));

        if (isFunction && slotData) {
            return (...args: any[]) => value(...args, { $slot: slotData });
        }
        
        return value.call(null, { $slot: slotData });
    };

    const processFunctionType = (element: ElementAttribute, compProp: ComponentProps): any => {
        if (!element.value?.code) return null;

        const func = slotData
            ? (...args: any[]) => runOn(element, variable, expandAPI)(...args, { $slot: slotData })
            : runOn(element, variable, expandAPI);

        const isFunction = compProp?.type === 'function' || 
            typeof compProp === 'function' || 
            (Array.isArray(compProp?.type) && compProp.type.includes('function'));

        return isFunction ? func : (func() || null);
    };

    const processDefaultType = (element: ElementAttribute, compProp: ComponentProps, key: string): any => {
        if (element.value === null || element.value === undefined) return null;

        const nativeProp = comps[comp.name].render || comps[comp.name].setup
            ? comps[comp.name].props[key]
            : comps[comp.name].comp?.props[key];

        if (typeof nativeProp === 'object' && !Array.isArray(nativeProp)) {
            return (element.value !== nativeProp.default && type === 'designer') || type === 'render'
                ? element.value
                : null;
        }

        return typeof nativeProp === 'function' && element.value !== null
            ? element.value
            : element.value;
    };

    const getDefaultValue = (type?: string): any => {
        switch (type) {
            case 'array': return [];
            case 'object': return {};
            case 'boolean': return false;
            case 'number': return 0;
            default: return '';
        }
    };

    Object.entries(comp.attrs).forEach(([key, element]) => {
        if (!element) return;
        const compProp = comps[comp.name].props[key];
        
        if (compProp?.hidden && (
            (typeof compProp.hidden === 'function' && compProp.hidden(comp.attrs)) || 
            (typeof compProp.hidden === 'boolean' && compProp.hidden)
        )) {
            return;
        }

        let newVal: any = null;
        switch (element.type) {
            case 'variable':
                newVal = processVariableType(element, compProp);
                break;
            case 'function':
                newVal = processFunctionType(element, compProp);
                break;
            default:
                newVal = processDefaultType(element, compProp, key);
        }

        if (compProp?.required && newVal === null) {
            newVal = getDefaultValue(compProp.type as string);
        }

        if (isRef(newVal)) {
            newVal = newVal.value;
        }
        if (newVal !== null) {
            propsData[key] = newVal;
        }
    });

    return propsData;
};