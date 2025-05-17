import {
    reactive,
    ref,
    watch,
} from 'vue'
import {
    useDebouncedRefHistory,
    useStorage,
    useMagicKeys,
    whenever,
    useActiveElement,
} from '@vueuse/core'
import { logicAnd } from '@vueuse/math'
import { hoverNodes, hoverIndex, resetDraggable } from './draggable'
import { deviceList } from '@molian/utils/device'
import { getVariableData } from '@molian/utils/customFunction'
import { defaultNativeEventMap, defaultLifecycleMap } from '@molian/utils/defaultData'
import { currentRegComps } from '@molian/utils/compsConfig'
import { 
    ensureAnimationsStructure, 
    syncComponentInTree, 
    validateComponentTree,
    generateRandomString,
} from '@/components/molian/utils/componentCore'
// 菜单交互
export const hiddenAllPanel = ref(false)
export const compPanel = ref<string>('basic')
export const globalMenu = ref<string>('style')
export const cssPanel = ref<string>('')
export const optionsPanel = ref<string>('')
export const actionPanel = ref<string>('')
export const globalPanel = ref<string>('')
export const treeDirRef = ref()
export const aiImRef = ref()
export const fullLoading = ref<boolean>(false)
export const zoomModeName = ref<string>('')
export const zoomModeModelValue = ref<any>([])
// 页面数据
// 缓存数据
const store = useStorage('omc_history', {
    modelValue: <any>[],
    globalAttrs: <CubeData.GlobalAttrs | any>{
        import: {},
        export: {},
        lifecycle: {},
        variable: {},
        actions: [],
        extend: {}
    }
})
// 数据
export const modelValue = ref<CubeData.ModelValue[]>(store.value.modelValue ? store.value.modelValue : [])
export const globalAttrs = reactive<CubeData.GlobalAttrs | any>(store.value.globalAttrs)
export const variableData = computed(() => {
    return getVariableData(globalAttrs.variable)
})

// 清空画布
export const clearCanvas = () => {
    modelValue.value = []
    globalAttrs.import = {}
    globalAttrs.export = {}
    globalAttrs.lifecycle = {}
    globalAttrs.variable = {}
    globalAttrs.actions = []
}
// 历史记录
const historyOptions: HistoryOptions = {
    deep: true,      // 深度监听变化
    debounce: 500,   // 防抖时间（毫秒）
    capacity: 5,     // 历史记录最大容量
    clone: true      // 克隆数据而不是引用
};

export const {
    history,
    undo,
    redo,
    clear,
    canRedo,
    canUndo,
} = useDebouncedRefHistory(modelValue, historyOptions);

export const screenRatioInfo = useStorage<ScreenRatio>('omc_screenRatio', {
    ...deviceList.value[0],
    rotate: false
});

watch(history, (val) => {
    store.value = {
        modelValue: val[0]?.snapshot ?? [],
        globalAttrs
    };
});
export const compsEls = reactive<any>({})
export const compsRefs = reactive<any>({})
export const selectedComp = ref<CubeData.ModelValue | null | any>(null)
export const selectedDom = ref<HTMLElement | null>()
/**
 * 设置选中的组件，并初始化其CSS属性
 * @param comp 选中的组件对象，该对象应包含一个css属性，用于存储CSS样式
 * @param evt 事件对象
 * 
 * 此函数的目的是确保选中的组件有一个完整的css对象和animations对象，
 * 并且确保modelValue中对应的组件也有相同的结构
 */
export const setSelectedComp = (comp: any, evt: any) => {
    if (!comp) {
        selectedComp.value = null;
        selectedDom.value = null;
        return;
    }
    
    // 初始化animations结构
    ensureAnimationsStructure(comp);
    
    // 设置选中组件和DOM元素
    selectedComp.value = comp;
    selectedDom.value = evt ? evt.target : null;
    
    // 确保modelValue中对应组件的animations结构也是完整的
    if (modelValue.value && comp.id) {
        syncComponentInTree(modelValue.value, comp.id);
    }
}

/**
 * 在modelValue中查找并同步组件的animations结构
 * @param items 组件数组
 * @param compId 要查找的组件ID
 * @returns 是否找到并更新了组件
 */
const syncComponentInModelValue = (items: any[], compId: string): boolean => {
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.id === compId) {
            ensureAnimationsStructure(item);
            return true;
        }
        
        // 递归检查子组件
        if (item.slots) {
            for (const slotKey in item.slots) {
                if (item.slots[slotKey].children && item.slots[slotKey].children.length) {
                    if (syncComponentInModelValue(item.slots[slotKey].children, compId)) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

// 编辑输入框内容时不触发魔术键
const activeElement = useActiveElement()
const notUsingInput = computed(() =>
    activeElement.value?.tagName !== 'INPUT'
    && activeElement.value?.tagName !== 'TEXTAREA',)

/**
 * 定义一个用于处理快捷键的函数
 * @param message 用于显示消息的对象
 * @param t 用于翻译文本的函数
 */
export const useKeys = (message: MessageService, t: (key: string) => string): void => {
    // 定义快捷键配置
    const shortcutKeys: KeyConfig[] = [
        { key: 'ctrl_z', handler: () => undo(), description: '撤销' },
        { key: 'ctrl_y', handler: () => redo(), description: '重做' },
        { key: 'ctrl_a', handler: () => globalMenu.value = 'style', description: '样式面板' },
        { key: 'ctrl_s', handler: () => globalMenu.value = 'option', description: '选项面板' },
        { key: 'ctrl_d', handler: () => globalMenu.value = 'action', description: '动作面板' },
        { key: 'ctrl_f', handler: () => globalMenu.value = 'global', description: '全局面板' },
        { 
            key: 'ctrl_c', 
            handler: () => {
                if (selectedComp.value) {
                    sessionStorage.setItem('omc_copyedCache', JSON.stringify(selectedComp.value));
                    message.success(t('container.copySuccess'));
                }
            },
            description: '复制'
        },
        {
            key: 'ctrl_v',
            handler: () => {
                const copedCache = sessionStorage.getItem('omc_copyedCache');
                if (!copedCache) return;
                
                const compData = JSON.parse(copedCache);
                const target = selectedComp.value?.slots?.default?.children
                    ? selectedComp.value.slots.default.children
                    : modelValue.value;
                
                target.push(pasteData(compData));
                message.success(t('container.pasteSuccess'));
            },
            description: '粘贴'
        },
        {
            key: 'ctrl_b',
            handler: () => treeDirRef.value.switchExpand(!treeDirRef.value.expand),
            description: '切换树面板'
        },
        {
            key: 'ctrl_h',
            handler: () => aiImRef.value.switchExpand(!aiImRef.value.expand),
            description: '切换AI面板'
        },
        {
            key: 'delete',
            handler: () => {
                if (hoverNodes.value && typeof hoverIndex.value === 'number' && hoverIndex.value >= 0) {
                    hoverNodes.value.splice(hoverIndex.value, 1);
                    resetDraggable();
                }
            },
            description: '删除'
        }
    ];

    const keys = useMagicKeys({
        passive: false,
        onEventFired(e: KeyboardEvent) {
            if (notUsingInput.value && e.type === 'keydown' && e.ctrlKey) {
                const validKeys = ['a', 's', 'd', 'f', 'z', 'y', 'b', 'h'];
                if (validKeys.includes(e.key)) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        }
    });

    // 注册所有快捷键
    shortcutKeys.forEach(({ key, handler }) => {
        whenever(logicAnd(keys[key], notUsingInput), handler);
    });
};

// 初始化组件数据的函数
export const initCompsData = function (data: any) {
    // 验证并补全组件数据
    modelValue.value = validateComponentTree(data);
}


/** 
 * 获取当前组件可以使用的原生事件
 */
export const selectedNativeOn: any = computed(() => {
    if (!selectedComp.value) return {}
    return selectedComp.value && selectedComp.value.nativeOn
})

/** 
 * 格式化所有可以使用的原生事件
 */
export const currentNativeOn = computed<NativeEvent[]>(() => {
    if (!selectedComp.value) return [];
    const defaultEvents = new Set(Object.keys(defaultNativeEventMap.value));
    const customEvents = selectedNativeOn.value ? Object.keys(selectedNativeOn.value) : [];
    return [...new Set([...defaultEvents, ...customEvents])]
        .map(key => ({
            key,
            type: 'function' as const,
            codeVar: defaultNativeEventMap.value[key]
        }));
});

/** 
 * 添加原生事件
 */
export const appendNativeOn = function (keyName: string) {
    if (!keyName || selectedNativeOn.value[keyName]) {
        return false
    }
    selectedNativeOn.value[keyName] = { code: "", codeVar: [] }
}

/** 
 * 获取当前组件可以使用的自定义事件
 */
export const selectedOn: any = computed(() => {
    if (!selectedComp.value) return {}
    return selectedComp.value && selectedComp.value.on
})
/** 
* 获取所有自定义事件
*/
export const currentEmits = computed<EmitEvent[]>(() => {
    if (!selectedComp.value) return [];
    
    const componentEmits = currentRegComps.value[selectedComp.value.name]?.emits;
    if (!componentEmits?.length) return [];
    
    return componentEmits
        .filter((item: string) => !item.startsWith('update:'))
        .map((item: string) => ({
            key: item,
            type: 'function' as const
        }));
});

/** 
 * 获取生命周期事件
 */
export const currentLifecycle = computed(() => {
    const lifecycleOn = Array.from(new Set(Object.keys(defaultLifecycleMap.value).concat(globalAttrs.lifecycle ? Object.keys(globalAttrs.lifecycle) : [])))
    return lifecycleOn.map(item => {
        return {
            key: item,
            type: 'function',
            codeVar: defaultLifecycleMap.value[item].codeVar
        }
    })
})


/**
 * 粘贴数据函数，用于处理组件数据的粘贴操作
 * 它通过生成一个新的随机字符串来创建一个新的组件数据对象，以避免数据冲突
 * 同时，它还会递归地处理组件的插槽（slots），以确保所有子组件也遵循相同的逻辑
 * 
 * @param data 要粘贴的组件数据，包括组件的属性、插槽等信息
 * @returns 返回一个新的组件数据对象，具有唯一的key和id，以避免直接修改输入数据
 */
const pasteData = (data: ComponentData): ComponentData => {
    // 生成一个随机字符串，用于创建唯一的组件key和id
    const randomStr = generateRandomString(5, 'comp_');
    
    // 创建新对象而不是直接修改输入对象
    const newData = {
        ...data,
        key: randomStr,
        id: randomStr
    };

    // 处理插槽
    if (newData.slots) {
        newData.slots = Object.entries(newData.slots).reduce<ComponentData['slots']>((acc = {}, [key, slot]) => {
            // 如果插槽中有子组件，则递归调用pasteData函数处理子组件
            if (slot.children?.length) {
                acc[key] = {
                    ...slot,
                    children: slot.children.map(pasteData)
                };
            } else {
                acc[key] = slot;
            }
            return acc;
        }, {});
    }

    return newData;
};

/**
 * 设置缩放模式
 * 此函数用于更新缩放模式的名称和模型值
 * 它接受一个可选的缩放模式组件作为参数，如果未提供，则将相关值设置为空
 * 
 * @param comp - 可能为null的缩放模式组件，用于设置缩放模式的名称和模型值
 *               如果为null，则将缩放模式的名称设置为空字符串，模型值设置为空数组
 */
export const setZoomMode = (comp: ZoomModeComponent | null): void => {
    // 更新缩放模式的名称，如果comp为null，则设置为空字符串
    zoomModeName.value = comp?.name ?? '';
    // 更新缩放模式的模型值，如果comp为null，则设置为空数组
    zoomModeModelValue.value = comp ?? [];
};

interface HistoryOptions {
    deep: boolean;
    debounce: number;
    capacity: number;
    clone: boolean;
}

interface ScreenRatio {
    rotate: boolean;
    [key: string]: any;
}

interface KeyConfig {
    key: string;
    handler: () => void;
    description: string;
}

interface MessageService {
    success: (message: string) => void;
    error: (message: string) => void;
}


interface NativeEvent {
    key: string;
    type: 'function';
    codeVar: any;
}
interface EmitEvent {
    key: string;
    type: 'function';
}

interface ComponentData {
    key: string;
    id: string;
    slots?: {
        [key: string]: {
            children: ComponentData[];
        };
    };
}

interface ZoomModeComponent {
    name: string;
    [key: string]: any;
}