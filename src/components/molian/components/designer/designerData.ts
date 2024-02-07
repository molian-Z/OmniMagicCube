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
    useActiveElement
} from '@vueuse/core'
import { logicAnd } from '@vueuse/math'
import { hoverNodes, hoverIndex, resetDraggable } from './draggable'
import { deviceList } from '@molian/utils/defaultData'

// 菜单交互
export const hiddenAllPanel = ref(false)
export const compPanel = ref<string>('')
export const globalMenu = ref<string>('')
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
    globalAttrs: <{
        lifecycle: {
            [key: string]: any;
        };
        variable: {
            [key: string]: any;
        };
    }>{
            lifecycle: {},
            variable: {}
        }
})
// 数据
export const modelValue = ref<any>(store.value.modelValue && store.value.modelValue.length > 0 ? store.value.modelValue[0].snapshot : [])
export const globalAttrs = reactive<any>(store.value.globalAttrs)
// 历史记录
export const {
    history,
    undo,
    redo
} = useDebouncedRefHistory(modelValue, {
    deep: true,
    debounce: 500,
    capacity: 20
})

export const screenRatioInfo: any = useStorage('screenRatio', { ...deviceList.value[0], rotate: false })
watch(history, (val: any) => {
    store.value = {
        modelValue: val,
        globalAttrs
    }
})
export const compsRef = reactive<any>({})
export const selectedComp = ref<any>(null)


// 编辑输入框内容时不触发魔术键
const activeElement = useActiveElement()
const notUsingInput = computed(() =>
    activeElement.value?.tagName !== 'INPUT'
    && activeElement.value?.tagName !== 'TEXTAREA',)
// 魔术键（快捷键）
const keys = useMagicKeys({
    passive: false,
    onEventFired(e) {
        if(notUsingInput.value){
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
// whenever(logicAnd(keys.ctrl_c, notUsingInput), () => console.log());
// 粘贴
// whenever(logicAnd(keys.ctrl_v, notUsingInput), () => console.log());
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