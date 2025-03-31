import { withModifiers, mergeProps } from 'vue'
import * as Vue from 'vue'
import { defaultLifecycleMap } from '@molian/utils/defaultData'

type FunctionType = 'asyncFunction' | 'function';
type FunctionConstructor = typeof asyncFunction | typeof syncFunction;
interface LifecycleValue {
    type: FunctionType;
    value: {
        code: string;
        codeVar: string[];
    };
}

interface LifecycleConfig {
    [key: string]: LifecycleValue;
}
interface RunOnData {
    value: {
        code: string;
        codeVar?: string[];
        functionMode: FunctionType;
    };
}
interface ModifierData {
    value?: {
        modifiers: string[];
    };
}

interface ModifierResult {
    newKey: string;
    modifiers: string[];
}
interface EventConfig {
    type?: 'variable';
    value?: {
        length: number;
        code?: string;
        [key: string]: any;
    };
}

interface EventData {
    on: Record<string, EventConfig>;
    nativeOn: Record<string, EventConfig>;
}
interface VariableValue {
    functionMode?: FunctionType;
    codeVar?: string[];
    code?: string;
    [key: string]: any;
}

interface VariableData {
    type: 'function' | 'computed' | string;
    value: VariableValue;
}
interface ComputedConfig {
    functionMode: FunctionType;
    codeVar: string[];
    code: string;
}
interface SetFuncData extends RunOnData {
    type?: 'variable';
}

export const asyncFunction = Object.getPrototypeOf(async function () { }).constructor
export const syncFunction = Object.getPrototypeOf(function () { }).constructor

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
export const createFunc = (functionMode: FunctionType, codeVar: string[], code: string, type: 'designer' | null): Function => {
    const constructorMap: Record<FunctionType, FunctionConstructor> = {
        'asyncFunction': asyncFunction,
        'function': syncFunction
    };

    const cacheCode = `
        try {
            ${code}
        } catch (error) {
            ${type === 'designer' ? 'throw error;' : "console.error('[Function Execution Error]:', error);"}
        }
    `;

    const Constructor = constructorMap[functionMode];
    return new Constructor(...codeVar, cacheCode || '');
};

/**
 * 执行生命周期函数
 * @param lifecycle 生命周期配置对象
 * @param variable 传入的变量对象
 * @param expandAPI 扩展的API对象
 */
export const runLifecycle = function (
    lifecycle: Ref<LifecycleConfig> | LifecycleConfig,
    variable: Record<string, any>,
    expandAPI: Record<string, any>
): void {
    const realLifecycle = isRef(lifecycle) ? lifecycle.value : lifecycle;

    const executeLifecycleMethod = (
        functionMode: FunctionType,
        code: string,
        codeVar: string[],
        context: Record<string, any>,
        args: any[] = []
    ) => {
        const type: string | null = context.__type;
        const runFn = createFunc(functionMode, codeVar, code, type);
        runFn.bind(context).call(null, ...args);
    };

    Object.entries(realLifecycle).forEach(([key, entry]) => {
        const { type, value } = entry as LifecycleValue;
        if (!value) return;

        const { code, codeVar } = value;
        const context = { app: Vue, vars: variable, ...expandAPI };

        if (!defaultLifecycleMap.value[key].function) {
            executeLifecycleMethod(type, code, codeVar, context);
        } else {
            defaultLifecycleMap.value[key].function(function (...args: any[]) {
                executeLifecycleMethod(type, code, codeVar, context, args);
            });
        }
    });
};

/**
 * 根据提供的数据和扩展API生成函数，并绑定Vue实例和变量
 * 
 * @param data 包含代码字符串和变量信息的对象
 * @param variable 将要使用的变量对象
 * @param expandAPI 要扩展的API对象
 * @returns 返回一个绑定Vue实例和变量的函数
 */
export const runOn = function (
    data: RunOnData,
    variable: Record<string, any>,
    expandAPI: Record<string, any>
): Function {
    const { code, codeVar = [], functionMode } = data.value;
    const prefixCode = codeVar
        .map((item, index) => `const ${item} = arguments[${index}];`)
        .join('\n');
    const context = { app: Vue, vars: variable, ...expandAPI };
    const type: 'designer' | null = expandAPI.__type
    return createFunc(
        functionMode,
        [],
        prefixCode ? `${prefixCode}\n${code}` : code,
        type
    ).bind(context);
};

const SPECIAL_MODIFIERS = ['once', 'capture', 'passive'] as const;
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
export const runModifier = function (
    key: string,
    data: Record<string, ModifierData>
): ModifierResult {
    if (!data[key]?.value?.modifiers) {
        return { newKey: key, modifiers: [] };
    }

    const { modifiers } = data[key].value;
    const specialModifiers = modifiers.filter((item): item is typeof SPECIAL_MODIFIERS[number] =>
        SPECIAL_MODIFIERS.includes(item as typeof SPECIAL_MODIFIERS[number])
    );
    const otherModifiers = modifiers.filter(item => !SPECIAL_MODIFIERS.includes(item as typeof SPECIAL_MODIFIERS[number]));

    const newKey = specialModifiers.length > 0
        ? `${key}${specialModifiers.map(item =>
            item.charAt(0).toUpperCase() + item.slice(1)
        ).join('')}`
        : key;

    return { newKey, modifiers: otherModifiers };
};

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
export const getCurrentOn = (
    data: EventData,
    variable: Record<string, any>,
    originVariable: Record<string, any>,
    slotData: any,
    expandAPI: Record<string, any>
): Record<string, any> => {
    const processEventHandlers = (
        events: Record<string, EventConfig>
    ): Record<string, any> => {
        return Object.entries(events).reduce((acc: any, [key, event]) => {
            if (!event) return acc;

            const { newKey, modifiers }: { newKey: string; modifiers: any } = runModifier(key, events as Record<string, ModifierData>);
            const handler = event.type === 'variable' && event.value?.length
                ? originVariable[event.value[0]]
                : event.value?.code
                    ? event
                    : null;

            if (handler) {
                // 创建事件处理函数，确保其符合 Event 处理器的类型签名
                const eventHandler = (event: Event, ...args: unknown[]) => {
                    const fn = setFunc(handler, variable, slotData, expandAPI);
                    return fn(event, ...args);
                };

                acc[newKey] = withModifiers(eventHandler, modifiers);
            }

            return acc;
        }, {});
    };

    const { on = {}, nativeOn = {} } = data;
    return mergeProps(
        processEventHandlers(on),
        processEventHandlers(nativeOn)
    );
};

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
export const getVariableData = (
    variable: Record<string, VariableData>,
    expandAPI: Record<string, any> = {},
    isRoot?: boolean
): Record<string, any> => {
    const vars = reactive<Record<string, any>>({});
    const context = { app: Vue, vars, ...expandAPI };
    const type: string | null = expandAPI.__type;
    const processFunction = (value: VariableValue): Function => {
        if (value?.functionMode && ['asyncFunction', 'function'].includes(value.functionMode)) {
            return createFunc(value.functionMode, value.codeVar || [], value.code || '', type);
        }
        return createFunc('function', [], '', type);
    };

    Object.entries(variable).forEach(([key, { type, value }]) => {
        switch (type) {
            case 'function':
                vars[key] = processFunction(value).bind(context);
                break;
            case 'computed':
                if (value?.functionMode && ['asyncFunction', 'function'].includes(value.functionMode)) {
                    // 确保 value 符合 ComputedConfig 接口要求
                    const computedConfig: ComputedConfig = {
                        functionMode: value.functionMode,
                        codeVar: value.codeVar || [],
                        code: value.code || ''
                    };
                    vars[key] = setComputed(computedConfig, vars, expandAPI);
                }
                break;
            default:
                vars[key] = value;
        }
    });

    return vars;
};

/**
 * 创建一个计算属性
 * 
 * 此函数的目的是通过给定的配置和变量来构造一个计算属性它使用Vue的computed函数来创建一个响应式的计算属性
 * 
 * @param computedObj 计算属性的配置对象，包含函数模式、代码变量和代码
 * @param vars 一个包含变量的对象，这些变量将用于计算属性中
 * @param expandAPI 一个可选的扩展API对象，允许在计算属性中访问额外的属性或方法
 * @returns 返回一个计算属性引用，该引用是响应式的，会根据其依赖项自动更新
 */
export const setComputed = (
    computedObj: ComputedConfig,
    vars: Record<string, any>,
    expandAPI: Record<string, any> = {}
): ComputedRef<any> => {
    // 创建一个上下文对象，包含Vue应用实例、变量和扩展API
    const context = { app: Vue, vars: reactive(vars), ...expandAPI };
    const type: string | null = expandAPI.__type;
    // 创建计算属性的函数，根据给定的配置和代码
    const computedFn = createFunc(computedObj.functionMode, computedObj.codeVar, computedObj.code, type);
    // 使用Vue的computed函数创建并返回计算属性，绑定上下文以使其在执行时可用
    return computed(computedFn.bind(context));
};

/**
 * 动态设置函数的执行环境和行为
 * 
 * 此函数用于根据提供的数据和变量生成一个新的函数它允许在调用新生成的函数时，
 * 动态地访问和操作这些数据和变量如果提供了slotData参数，则将其作为函数执行上下文的一部分
 * 
 * @param data 动态数据，用于配置函数执行的特定行为和环境
 * @param variable 一个记录类型的变量，用于存储函数执行可能需要的任何上下文信息
 * @param slotData 可选参数，表示特定的插槽数据，用于在函数执行时提供额外的上下文信息
 * @param expandAPI 一个记录类型的API对象，用于扩展函数执行时的可用方法或属性
 * @returns 返回一个函数，该函数当被调用时，会根据提供的数据和变量执行相应的逻辑如果提供了slotData，
 * 返回的函数会将slotData作为执行上下文的一部分
 */
function setFunc(
    data: SetFuncData,
    variable: Record<string, any>,
    slotData: Record<string, any> | null,
    expandAPI: Record<string, any>
): Function {
    // 创建一个闭包函数，用于在指定的上下文中运行逻辑
    const runOnWithContext = () => runOn(data, variable, expandAPI);

    // 根据是否提供了slotData，决定返回哪种类型的函数
    return slotData
        ? (...args: any[]) => runOnWithContext()(...args, { $slot: slotData })
        : runOnWithContext;
}