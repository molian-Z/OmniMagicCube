import {
    reactive,
    ref,
    watch
} from 'vue'
import {
    useCloned,
    useDebouncedRefHistory,
    useStorage,
    useMagicKeys,
    whenever,
    useActiveElement,
    useClipboard
} from '@vueuse/core'
import { logicAnd } from '@vueuse/math'
import { hoverNodes, hoverIndex, resetDraggable } from './draggable'
import { deviceList } from '@molian/utils/device'
import { getVariableData } from '@molian/utils/customFunction'
// 菜单交互
export const hiddenAllPanel = ref(false)
export const compPanel = ref<string>('')
export const globalMenu = ref<string>('style')
export const cssPanel = ref<string>('')
export const optionsPanel = ref<string>('')
export const actionPanel = ref<string>('')
export const globalPanel = ref<string>('')
export const treeDirRef = ref()
export const aiImRef = ref()
export const fullLoading = ref<boolean>(false)
// 页面数据
// 缓存数据
const store = useStorage('history', {
    modelValue: <any[]>[],
    globalAttrs: <CubeData.GlobalAttrs>{
        import: {},
        export: {},
        lifecycle: {},
        variable: {}
    }
})
// 数据
export const modelValue = ref<CubeData.ModelValue[]>(store.value.modelValue && store.value.modelValue.length > 0 ? store.value.modelValue[0].snapshot : [])
export const globalAttrs = reactive<CubeData.GlobalAttrs>(store.value.globalAttrs)
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
    capacity: 20
})

export const screenRatioInfo: any = useStorage('screenRatio', { ...deviceList.value[0], rotate: false })
watch(history as any, (val: CubeData.ModelValue[]) => {
    store.value = {
        modelValue: val,
        globalAttrs
    }
})
export const compsRef = reactive<any>({})
export const compsEl = reactive<any>({})
export const selectedComp = ref<CubeData.ModelValue | null>(null)


// 编辑输入框内容时不触发魔术键
const activeElement = useActiveElement()
const notUsingInput = computed(() =>
    activeElement.value?.tagName !== 'INPUT'
    && activeElement.value?.tagName !== 'TEXTAREA',)

export const useKeys = (message:any, t:any) => {
    // 魔术键（快捷键）
    const keys = useMagicKeys({
        passive: false,
        onEventFired(e) {
            if (notUsingInput.value) {
                if (e.ctrlKey && ['a', 's', 'd', 'f', 'z', 'y', 'b', 'h'].indexOf(e.key) > -1 && e.type === 'keydown') {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        }
    })
    // 撤销
    whenever(logicAnd(keys.ctrl_z, notUsingInput), () => undo());
    // 重做
    whenever(logicAnd(keys.ctrl_y, notUsingInput), () => redo());
    // 切换面板
    whenever(logicAnd(keys.ctrl_a, notUsingInput), () => globalMenu.value = 'style');
    whenever(logicAnd(keys.ctrl_s, notUsingInput), () => globalMenu.value = 'option');
    whenever(logicAnd(keys.ctrl_d, notUsingInput), () => globalMenu.value = 'action');
    whenever(logicAnd(keys.ctrl_f, notUsingInput), () => globalMenu.value = 'global');
    // 复制
    const { text, copy, copied, isSupported } = useClipboard({ source: selectedComp })
    whenever(logicAnd(keys.ctrl_c, notUsingInput), () => {
        if (!!selectedComp.value) {
            if (!!isSupported.value && copied.value === false) {
                copy(selectedComp.value)
                message.success(t('container.copySuccess'))
            }
        }
    });
    // 粘贴
    whenever(logicAnd(keys.ctrl_v, notUsingInput), () => {
        if (!!isSupported.value) {
            const {
                cloned
            } = useCloned(text.value)
            if(!!selectedComp.value && selectedComp.value.slots && selectedComp.value.slots.default && selectedComp.value.slots.default.children){
                selectedComp.value.slots.default.children.push(pasteData(cloned.value))
            }else{
                modelValue.value.push(pasteData(cloned.value))
            }
            message.success(t('container.pasteSuccess'))
        }
    });
    // 显示树面板
    whenever(logicAnd(keys.ctrl_b, notUsingInput), () => {
        treeDirRef.value.switchExpand(!treeDirRef.value.expand)
    });
    // 显示AI交互面板
    whenever(logicAnd(keys.ctrl_h, notUsingInput), () => {
        aiImRef.value.switchExpand(!aiImRef.value.expand)
    });

    whenever(logicAnd(keys.delete, notUsingInput), () => {
        if (hoverNodes.value && hoverNodes.value) {
            hoverNodes.value.splice(hoverIndex.value, 1)
        }
        resetDraggable()
    })
}


// 创建组件
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
}) {
    const randomStr = generateRandomString(16)
    const {
        cloned
    } = useCloned(comp.slots)
    let initAttrs = <{
        [key: string]: any;
    }>{}
    for (const key in comp.props) {
        if (Object.hasOwnProperty.call(comp.props, key)) {
            const element = comp.props[key]
            let currentType = typeof element.default === 'object' && Array.isArray(element.default) ? 'array' : typeof element.default
            if (element.default) {
                initAttrs[key] = {
                    type: currentType,
                    value: element.default
                }
            } else {
                initAttrs[key] = {
                    type: Array.isArray(element.type) ? element.type[0] : element.type,
                    value: null
                }
            }
        }
    }
    return {
        name: comp.name,
        category: comp.category,
        attrs: initAttrs,
        on: {},
        nativeOn: {},
        directives: {},
        slots: cloned.value,
        css: {
            borderRadius: ['0', '0', '0', '0'],
            margin: ['0', '0', '0', '0'],
            padding: ['0', '0', '0', '0'],
            constX: 'left',
            constY: 'top',
            position:'relative',
            color: {
                isShow: true,
                modelValue: ''
            },
            background: {
                isShow: true,
                modelValue: ''
            },
            border: [],
            mixBlendMode: {
                isShow: true,
                modelValue: 'normal'
            },
            blur: {
                isShow: true,
                modelValue: '',
                field: ''
            },
            units:{},
            boxShadow: []
        },
        key: randomStr,
        id: randomStr
    }
}

export const initCompsData = function (data: any) {
    modelValue.value = data
}


export const generateRandomString = function (length: number) {
    let str = Math.random().toString(36).substring(2, length + 2);
    return str;
}


const pasteData:any = function(data:any){
    const randomStr = generateRandomString(16)
    data.key = randomStr
    data.id = randomStr
    if(!!data.slots){
        for (const key in data.slots) {
            if (Object.prototype.hasOwnProperty.call(data.slots, key)) {
                const element = data.slots[key];
                if(element.children.length > 0){
                    element.children = element.children.map((item:any)=>{
                        return pasteData(item)
                    })
                }
            }
        }
    }
    return data
}