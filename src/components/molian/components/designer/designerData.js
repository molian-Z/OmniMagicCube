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
    modelValue: [],
    globalAttrs: {
        lifecycle: {},
        variable: {}
    }
})
// 数据
export const modelValue = ref(store.value.modelValue && store.value.modelValue.length > 0 ? store.value.modelValue[0].snapshot : [])
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
watch(history, (val) => {
    store.value = {
        modelValue:val,
        globalAttrs:globalAttrs
    }
})
export const compsRef = reactive({})
export const selectedComp = ref(null)

// 魔术键（快捷键）
const keys = useMagicKeys({
    passive: false,
    onEventFired(e) {
        if (e.ctrlKey && ['a','s','d','f','z','y','c','v','b'].indexOf(e.key) > -1 && e.type === 'keydown') {
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
export const createComp = function (comp) {
    const randomStr = generateRandomString(16)
    const {
        cloned
    } = useCloned(comp.slots)
    let initAttrs = {}
    for (const key in comp.props) {
        if (Object.hasOwnProperty.call(comp.props, key)) {
            const element = comp.props[key]
            initAttrs[key] = element.default
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

export const initCompsData = function (data) {
    modelValue.value = data
}


export const generateRandomString = function (length) {
    let str = Math.random().toString(36).substring(2, length + 2);
    return str;
}