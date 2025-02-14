import {
    reactive,
    ref,
    watch,
} from 'vue'
import {uniqueId} from 'es-toolkit/compat'
import {
    useCloned,
    useDebouncedRefHistory,
    useStorage,
    useMagicKeys,
    whenever,
    useActiveElement,
    // useClipboard
} from '@vueuse/core'
import { logicAnd } from '@vueuse/math'
import { hoverNodes, hoverIndex, resetDraggable } from './draggable'
import { deviceList } from '@molian/utils/device'
import { getVariableData } from '@molian/utils/customFunction'
import { defaultNativeEventMap, defaultLifecycleMap } from '@molian/utils/defaultData'
import { currentRegComps } from '@molian/utils/compsConfig'
import { initCss } from '@molian/utils/css-generator'
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
export const {
    history,
    undo,
    redo,
    clear,
    canRedo,
    canUndo,
} = useDebouncedRefHistory(modelValue, {
    deep: true,
    debounce: 500,
    capacity: 5,
    clone: true
})

export const screenRatioInfo: any = useStorage('omc_screenRatio', { ...deviceList.value[0], rotate: false })
watch(history as any, (val: any[]) => {
    store.value = {
        modelValue: val[0].snapshot,
        globalAttrs
    }
})
export const compsEls = reactive<any>({})
export const compsRefs = reactive<any>({})
export const selectedComp = ref<CubeData.ModelValue | null | any>(null)
export const selectedDom = ref<HTMLElement | null>()
/**
 * 设置选中的组件，并初始化其CSS属性
 * @param comp 选中的组件对象，该对象应包含一个css属性，用于存储CSS样式
 * 
 * 此函数的目的是确保选中的组件有一个完整的css对象，
 * 即使该组件的css对象中缺少某些初始化Css中包含的键
 */
export const setSelectedComp = (comp: any, evt:any) => {
    // 将选中的组件设置为全局选中的组件
    selectedComp.value = comp
    // 设置打点框
    if(evt) {
        selectedDom.value = evt.target
    } else {
        selectedDom.value = null
    }
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
export const useKeys = (message: any, t: any) => {
    // 初始化魔术键（快捷键）监听
    const keys = useMagicKeys({
        passive: false,
        onEventFired(e) {
            // 当不在输入状态时，处理特定的快捷键事件
            if (notUsingInput.value) {
                // 阻止默认行为，以处理自定义快捷键
                if (e.ctrlKey && ['a', 's', 'd', 'f', 'z', 'y', 'b', 'h'].indexOf(e.key) > -1 && e.type === 'keydown') {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        }
    })
    // 绑定快捷键逻辑：撤销、重做、切换面板等
    whenever(logicAnd(keys.ctrl_z, notUsingInput), () => undo());
    whenever(logicAnd(keys.ctrl_y, notUsingInput), () => redo());
    whenever(logicAnd(keys.ctrl_a, notUsingInput), () => globalMenu.value = 'style');
    whenever(logicAnd(keys.ctrl_s, notUsingInput), () => globalMenu.value = 'option');
    whenever(logicAnd(keys.ctrl_d, notUsingInput), () => globalMenu.value = 'action');
    whenever(logicAnd(keys.ctrl_f, notUsingInput), () => globalMenu.value = 'global');
    // 处理复制操作
    whenever(logicAnd(keys.ctrl_c, notUsingInput), () => {
        if (!!selectedComp.value) {
            sessionStorage.setItem('omc_copyedCache', JSON.stringify(selectedComp.value));
            message.success(t('container.copySuccess'))
        }
    });
    // 处理粘贴操作
    whenever(logicAnd(keys.ctrl_v, notUsingInput), () => {
        const copedCache = sessionStorage.getItem('omc_copyedCache');
        if (!copedCache) return false
        const compData = JSON.parse(copedCache)
        if (!!selectedComp.value && selectedComp.value.slots && selectedComp.value.slots.default && selectedComp.value.slots.default.children) {
            selectedComp.value.slots.default.children.push(pasteData(compData))
        } else {
            modelValue.value.push(pasteData(compData))
        }
        message.success(t('container.pasteSuccess'))
    });
    // 切换树面板的展开状态
    whenever(logicAnd(keys.ctrl_b, notUsingInput), () => {
        treeDirRef.value.switchExpand(!treeDirRef.value.expand)
    });
    // 切换AI交互面板的展开状态
    whenever(logicAnd(keys.ctrl_h, notUsingInput), () => {
        aiImRef.value.switchExpand(!aiImRef.value.expand)
    });
    // 处理删除操作
    whenever(logicAnd(keys.delete, notUsingInput), () => {
        if (hoverNodes.value && hoverNodes.value) {
            hoverNodes.value.splice(hoverIndex.value, 1)
        }
        resetDraggable()
    })
}


/**
 * 初始化组件数据
 * 此函数用于将额外的组件数据合并到初始对象中，如果指定了特定的属性和键，并且这些属性和键存在
 * 
 * @param initObj - 初始化对象，将与组件数据合并
 * @param appendComp - 包含额外组件数据的对象
 * @param key - 组件数据的键
 * @param pKey - 父级键，用于在appendComp中查找组件数据
 */
const initCompData = (initObj: InitObj, { appendComp, key, pKey }: { appendComp: AppendComp; key: string; pKey: string }) => {
    // 检查appendComp及其子结构是否存在
    if (appendComp && appendComp[pKey] && appendComp[pKey][key]) {
        const compData = appendComp[pKey][key];

        // 合并对象
        initObj[key] = {
            ...initObj[key],
            ...compData,
        };

        // 如果存在valueFn函数，尝试执行它以获取值
        if (compData.valueFn) {
            if (typeof compData.valueFn === 'function') {
                try {
                    initObj[key].value = compData.valueFn({ ...selectedComp.value });
                } catch (error) {
                    console.error(`Error executing valueFn for key ${key}:`, error);
                }
            } else if (typeof compData.valueFn === 'string') {
                try {
                    // 使用 new Function 将字符串转换为函数并执行
                    const fn = new Function('data', `return ${compData.valueFn}(data);`);
                    initObj[key].value = fn({ ...selectedComp.value });
                } catch (error) {
                    console.error(`Error converting or executing valueFn string for key ${key}:`, error);
                }
            } else {
                throw new Error(`valueFn for key ${key} is neither a function nor a string`);
            }
            // 执行完valueFn后，从initObj中删除这个属性
            delete initObj[key].valueFn;
        }
    }
};

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
export const createComp = function (comp: {
    comp?: any;
    category: string;
    slots: {
        [key: string]: any;
    };
    props: {
        [key: string]: any;
    };
    name: string;
}, appendComp?: any) {
    // 生成一个随机字符串作为组件的唯一标识
    const randomStr = generateRandomString(5, 'comp_')
    // 克隆插槽内容
    const {
        cloned
    } = useCloned(comp.slots)
    // 初始化组件属性
    let initAttrs = <{
        [key: string]: any;
    }>{}
    const initObj: any = {
        on: {},
        nativeOn: {},
        directives: {},
    }
    // 遍历组件的属性定义，初始化属性信息
    for (const key in comp.props) {
        if (Object.hasOwnProperty.call(comp.props, key)) {
            const element = comp.props[key]
            // 判断属性的默认值类型
            let currentType = typeof element.default === 'object' && Array.isArray(element.default) ? 'array' : typeof element.default
            // 如果属性有默认值，则使用默认值
            if (element.default) {
                initAttrs[key] = {
                    type: currentType,
                    value: element.default
                }
            } else {
                // 如果没有默认值，则使用属性定义中的类型或默认为null
                initAttrs[key] = {
                    type: Array.isArray(element.type) ? element.type[0] : element.type,
                    value: null
                }
            }
            // 初始化组件数据
            initCompData(initAttrs, { appendComp, key, pKey: 'attrs' })
        }
    }

    // 初始化其他对象属性，如事件、指令等
    for (const pKey in initObj) {
        if (Object.hasOwnProperty.call(initObj, pKey) && appendComp) {
            for (const key in appendComp[pKey]) {
                initCompData(initObj[pKey], { appendComp, key, pKey })
            }
        }
    }

    // 移除 appendComps 内容
    Object.values(cloned.value).forEach(value => {
        delete value.appendComps
    })

    // 返回创建的组件对象
    return {
        name: comp.name,
        category: comp.category,
        attrs: initAttrs,
        slots: cloned.value,
        css: initCss(),
        ...initObj,
        key: randomStr,
        id: randomStr
    }
}

// 初始化组件数据的函数
export const initCompsData = function (data: any) {
    modelValue.value = data
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
export const currentNativeOn: any = computed(() => {
    if (!selectedComp.value) return {}
    const newNativeOn = Array.from(new Set(Object.keys(defaultNativeEventMap.value).concat(selectedNativeOn.value ? Object.keys(selectedNativeOn.value) : [])))
    return selectedComp.value && newNativeOn.map(item => {
        return {
            key: item,
            type: 'function',
            codeVar: defaultNativeEventMap.value[item]
        }
    })
})

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
export const currentEmits = computed(() => {
    if (!selectedComp.value) return {}
    return selectedComp.value && currentRegComps.value[selectedComp.value.name].emits.filter((item: any) => {
        return item.indexOf('update:') === -1
    }).map((item: any) => {
        return {
            key: item,
            type: 'function'
        }
    })
})

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

// 处理粘贴数据的函数
const pasteData: any = function (data: any) {
    // 生成一个随机字符串作为组件的键和ID
    const randomStr = generateRandomString(5, 'comp_')
    data.key = randomStr
    data.id = randomStr
    // 如果数据包含插槽，则遍历每个插槽
    if (!!data.slots) {
        for (const key in data.slots) {
            if (Object.prototype.hasOwnProperty.call(data.slots, key)) {
                const element = data.slots[key];
                // 如果插槽包含子元素，则递归调用pasteData处理每个子元素
                if (element.children.length > 0) {
                    element.children = element.children.map((item: any) => {
                        return pasteData(item)
                    })
                }
            }
        }
    }
    return data
}

export const setZoomMode = function (comp: any) {
    if(comp) {
        zoomModeName.value = comp.name
        zoomModeModelValue.value = comp
    }else {
        zoomModeName.value = ''
        zoomModeModelValue.value = []
    }
}