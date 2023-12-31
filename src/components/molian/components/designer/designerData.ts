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
    whenever
} from '@vueuse/core'

// 菜单交互
export const hiddenAllPanel = ref(false)
export const compPanel = ref('')
export const globalMenu = ref('')
export const cssPanel = ref('')
export const optionsPanel = ref('')
export const actionPanel = ref('')
export const globalPanel = ref('')
export const treeDirRef = ref()

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
export const globalAttrs = reactive(store.value.globalAttrs)
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
watch(history, (val: any) => {
    store.value = {
        modelValue: val,
        globalAttrs
    }
})
export const compsRef = reactive<any>({})
export const selectedComp = ref<any>(null)

// 魔术键（快捷键）
const keys = useMagicKeys({
    passive: false,
    onEventFired(e) {
        if (e.ctrlKey && ['a', 's', 'd', 'f', 'z', 'y', 'c', 'v', 'b'].indexOf(e.key) > -1 && e.type === 'keydown') {
            e.preventDefault();
            e.stopPropagation();
        }
    }
})
// 撤销
whenever(keys.ctrl_z, () => undo());
// 重做
whenever(keys.ctrl_y, () => redo());
// 切换面板
whenever(keys.ctrl_a, () => globalMenu.value = 'style');
whenever(keys.ctrl_s, () => globalMenu.value = 'option');
whenever(keys.ctrl_d, () => globalMenu.value = 'action');
whenever(keys.ctrl_f, () => globalMenu.value = 'global');
// 复制
whenever(keys.ctrl_c, () => console.log());
// 粘贴
whenever(keys.ctrl_v, () => console.log());
// 显示树面板
whenever(keys.ctrl_b, () => {
    treeDirRef.value.switchExpand(!treeDirRef.value.expand)
});

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