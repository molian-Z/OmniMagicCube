import { initCss } from './css-generator';
import { useCloned } from '@vueuse/core';
import { uniqueId } from 'es-toolkit/compat';
/**
 * 创建组件的函数
 * 
 * 此函数用于根据提供的配置信息生成一个新的组件对象它克隆插槽内容，初始化组件属性，
 * 并生成一个带有随机键和唯一标识符的组件对象
 * 
 * @param comp 组件配置对象，包含组件的属性、插槽、类别和名称
 * @param appendComp 可选参数，包含额外的组件信息，如事件、指令等
 * @returns 返回一个带有随机键和唯一标识符的新组件对象
 */
export const createComponent = function (comp: ComponentConfig, appendComp?: any) {
    const randomStr = generateRandomString(5, 'comp_');
    const { cloned } = useCloned(comp.slots);
    
    // 初始化属性
    const initAttrs: Record<string, ComponentAttribute> = {};
    const initObj: InitialObject = {
        on: {},
        nativeOn: {},
        directives: {},
        animations: {
            enter: [],
            leave: [],
            stateChange: {},
            interaction: {},
        },
    };

    // 处理组件属性
    Object.entries(comp.props).forEach(([key, prop]) => {
        initAttrs[key] = initializeAttribute(prop);
        initCompData(initAttrs, { appendComp, key, pKey: 'attrs' });
    });

    // 处理其他属性
    Object.entries(initObj).forEach(([pKey, _]) => {
        if (appendComp?.[pKey as keyof typeof appendComp]) {
            const appendCompKey = appendComp[pKey as keyof typeof appendComp];
            if (appendCompKey && typeof appendCompKey === 'object') {
                Object.keys(appendCompKey).forEach(key => {
                    initCompData(initObj[pKey as keyof InitialObject], { appendComp, key, pKey });
                });
            }
        }
    });

    // 清理 slots 中的 appendComps
    Object.values(cloned.value).forEach(value => {
        delete value.appendComps;
    });

    // 返回组件配置
    const newComp = {
        name: comp.name,
        category: comp.category,
        attrs: initAttrs,
        slots: cloned.value,
        css: initCss(),
        ...initObj,
        key: randomStr,
        id: randomStr
    };
    
    // 确保组件结构完整
    ensureBasicStructure(newComp);
    
    return newComp;
};

/**
 * 执行值函数
 * 该函数用于处理传入的值函数或字符串表达式，并根据选定的组件数据执行相应的逻辑
 * 
 * @param valueFn - 值函数或字符串表达式 需要执行的函数或表达式字符串
 * @param selectedComp - 选定的组件对象 其属性和方法将被用于执行valueFn
 * @returns 由valueFn执行得到的结果 或者在执行过程中遇到错误时返回null
 */
const executeValueFunction = (valueFn: ValueFunction | string, selectedComp: any): any => {
    try {
        // 检查valueFn是否为函数类型
        if (typeof valueFn === 'function') {
            // 如果是函数，直接调用并传入选定的组件对象的副本
            return valueFn({ ...selectedComp });
        }
        
        // 检查valueFn是否为字符串类型
        if (typeof valueFn === 'string') {
            // 如果是字符串，创建一个新的函数并执行该字符串表达式
            const fn = new Function('data', `return ${valueFn}(data);`);
            // 调用新创建的函数，并传入选定的组件对象的副本
            return fn({ ...selectedComp });
        }
        
        // 如果valueFn既不是函数也不是字符串，则抛出错误
        throw new Error('Invalid valueFn type');
    } catch (error) {
        // 捕获执行过程中的任何错误，并在控制台中输出错误信息
        console.error('Error executing valueFn:', error);
        // 错误处理后，返回null
        return null;
    }
};

/**
 * 初始化组件数据
 * 此函数用于将额外的组件数据合并到初始对象中，如果指定了特定的属性和键，并且这些属性和键存在
 * 
 * @param initObj - 初始化对象，将与组件数据合并
 * @param appendComp - 包含额外组件数据的对象
 * @param key - 组件数据的键
 * @param pKey - 父级键，用于在appendComp中查找组件数据
 */
const initCompData = (initObj: InitObj, { appendComp, key, pKey }: { appendComp: AppendComp; key: string; pKey: string }): void => {
    const compData = appendComp?.[pKey]?.[key];
    if (!compData) return;

    // 合并对象
    initObj[key] = {
        ...initObj[key],
        ...compData,
    };

    // 处理 valueFn
    if (compData.valueFn) {
        initObj[key].value = executeValueFunction(compData.valueFn, selectedComp.value);
        delete initObj[key].valueFn;
    }
};

/**
 * 根据默认值确定属性类型
 * 
 * 此函数旨在通过检查给定的默认值来确定其类型它特别处理了对象和数组的情况，
 * 因为在JavaScript中，数组是一种特殊的对象，但在这两种情况之间进行区分是有用的
 * 
 * @param defaultValue 任意类型的默认值，用于类型检查
 * @returns 返回属性的类型名称如果默认值是一个对象，则进一步检查以确定它是否为数组
 */
const getPropertyType = (defaultValue: any): string => {
    // 检查默认值是否为对象类型，因为对象和数组在JavaScript中都属于对象类别
    if (typeof defaultValue === 'object') {
        // 判断是否为数组，因为数组在JavaScript中是一种特殊的对象
        return Array.isArray(defaultValue) ? 'array' : typeof defaultValue;
    }
    // 如果不是对象，则直接返回默认值的类型
    return typeof defaultValue;
};

/**
 * 初始化组件属性
 * 
 * 此函数根据PropConfig配置对象来构造一个ComponentAttribute对象它主要负责设置属性的类型和默认值（如果有）
 * 
 * @param prop PropConfig配置对象，包含了属性的类型和默认值等信息
 * @returns 返回一个ComponentAttribute对象，包括属性的类型和值
 */
const initializeAttribute = (prop: PropConfig): ComponentAttribute => {
    // 如果配置了默认值，则使用默认值的类型作为属性类型，并设置属性值为默认值
    if (prop.default !== undefined) {
        return {
            type: getPropertyType(prop.default),
            value: prop.default
        };
    }
    // 如果没有配置默认值，则根据prop.type来确定属性类型，并将属性值设为null
    // 注意：如果prop.type是一个数组，则取数组的第一个元素作为属性类型
    return {
        type: Array.isArray(prop.type) ? prop.type[0] : prop.type,
        value: null
    };
};

/**
 * 确保组件有完整的animations结构
 * @param comp 需要检查的组件对象
 */
export const ensureAnimationsStructure = (comp: any): void => {
    if (!comp.animations) {
        comp.animations = {
            enter: [],
            leave: [],
            stateChange: {},
            interaction: {},
        };
    } else {
        if (!comp.animations.enter) comp.animations.enter = [];
        if (!comp.animations.leave) comp.animations.leave = [];
        if (!comp.animations.stateChange) comp.animations.stateChange = {};
        if (!comp.animations.interaction) comp.animations.interaction = {};
    }
}

/**
 * 确保组件有基本的属性结构
 * @param comp 需要检查的组件对象
 */
export const ensureBasicStructure = (comp: any): void => {
    // 确保基本属性存在
    if (!comp.attrs) comp.attrs = {};
    if (!comp.on) comp.on = {};
    if (!comp.nativeOn) comp.nativeOn = {};
    if (!comp.directives) comp.directives = {};
    if (!comp.slots) comp.slots = {};
    if (!comp.css) comp.css = initCss();
    if (!comp.category) comp.category = 'all';
    // 确保key和id属性互相补全
    if (comp.key && !comp.id) {
        comp.id = comp.key;
    } else if (comp.id && !comp.key) {
        comp.key = comp.id;
    } else if (!comp.key && !comp.id) {
        // 如果两者都不存在，则生成一个新的随机标识符
        const randomId = generateRandomString(5, 'comp_');
        comp.key = randomId;
        comp.id = randomId;
    }
    // 确保动画结构完整
    ensureAnimationsStructure(comp);
}

/**
 * 递归验证和补全组件树
 * @param items 组件数组
 */
export const validateComponentTree = (items: any[]): any[] => {
    if (!Array.isArray(items)) return [];
    const { cloned } = useCloned(items);
    return cloned.value.map((item: any) => {
        // 确保组件基本结构完整
        ensureBasicStructure(item);
        
        // 递归处理子组件
        if (item.slots) {
            Object.keys(item.slots).forEach(slotKey => {
                if (item.slots[slotKey]?.children && Array.isArray(item.slots[slotKey].children)) {
                    item.slots[slotKey].children = validateComponentTree(item.slots[slotKey].children);
                }
            });
        }
        
        return item;
    });
}

/**
 * 在组件树中查找并同步组件的结构
 * @param items 组件数组
 * @param compId 要查找的组件ID
 * @returns 是否找到并更新了组件
 */
export const syncComponentInTree = (items: any[], compId: string): boolean => {
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.id === compId) {
            ensureBasicStructure(item);
            return true;
        }
        
        // 递归检查子组件
        if (item.slots) {
            for (const slotKey in item.slots) {
                if (item.slots[slotKey].children && item.slots[slotKey].children.length) {
                    if (syncComponentInTree(item.slots[slotKey].children, compId)) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

/**
 * 验证和补全全局属性
 * @param globalAttrs 全局属性对象
 */
export const validateGlobalAttrs = (globalAttrs: any): any => {
    const { cloned } = useCloned(globalAttrs);
    if (!cloned.value) return {
        import: {},
        export: {},
        lifecycle: {},
        variable: {},
        actions: [],
        extend: {}
    };
    
    if (!cloned.value.import) cloned.value.import = {};
    if (!cloned.value.export) cloned.value.export = {};
    if (!cloned.value.lifecycle) cloned.value.lifecycle = {};
    if (!cloned.value.variable) cloned.value.variable = {};
    if (!cloned.value.actions) cloned.value.actions = [];
    if (!cloned.value.extend) cloned.value.extend = {};
    
    return cloned.value;
}



// 生成指定长度的随机字符串
const randomPrefix = Math.random().toString(36).substring(2, 7);
export const generateRandomString = function (length: number, prefix: string) {
    if (!!prefix) {
        return uniqueId(`${prefix}_${randomPrefix}_`);
    } else {
        return Math.random().toString(36).substring(2, length + 2)
    }
}



interface ComponentConfig {
    comp?: any;
    category: string;
    slots: Record<string, any>;
    props: Record<string, PropConfig>;
    name: string;
}

interface InitialObject {
    on: Record<string, any>;
    nativeOn: Record<string, any>;
    directives: Record<string, any>;
    animations: ComponentAnimations;
}

interface PropConfig {
    type: any;
    default?: any;
}

interface CompData {
    valueFn?: ValueFunction | string;
    [key: string]: any;
}


interface ValueFunction {
    (data: any): any;
}

interface ComponentAttribute {
    type: string;
    value: any;
}