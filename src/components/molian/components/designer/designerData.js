import { reactive, ref } from 'vue'
import { useCloned } from '@vueuse/core'

// 菜单交互
export const hiddenAllPanel = ref(false)
export const panelType = ref('')
export const compPanel = ref('')
export const globalMenu = ref('')
export const cssPanel = ref('')
export const optionsPanel = ref('')
export const actionPanel = ref('')
export const globalPanel = ref('')

// 页面数据
export const modelValue = reactive([])
export const compsRef = reactive({})
export const selectedComp = ref(null)

// 创建组件
export const createComp = function (comp) {
    const randomStr = generateRandomString(16)
    const { cloned } = useCloned(comp.slots)
    let initAttrs = {}
    for (const key in comp.props) {
        if (Object.hasOwnProperty.call(comp.props, key)) {
            const element = comp.props[key]
            initAttrs[key] = element.default
        }
    }
    return {
        name:comp.name,
        category:comp.category,
        attrs:initAttrs,
        on:{},
        nativeOn:{},
        slots:cloned.value,
        css: {
            borderRadius:['0','0','0','0'],
            margin:['0','0','0','0'],
            padding:['0','0','0','0'],
            constX:'left',
            constY:'top',
            color:{
                isShow:true,
                modelValue:''
            },
            background:{
                isShow:true,
                modelValue:''
            },
            border:[],
            mixBlendMode:{
                isShow:true,
                modelValue:'normal'
            },
            blur:{
                isShow:true,
                modelValue:'',
                field:''
            },
            boxShadow:[]
        },
        key: randomStr,
        id: randomStr
    }
}

export const initCompsData = function(data){
    modelValue.length = 0
    modelValue.push(...data)
}


export const generateRandomString = function (length) {
    let str = Math.random().toString(36).substring(2, length + 2);
    return str;
  }