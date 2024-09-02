// 数据变量
export const variable = ref<{[key:string]:any}>({})

export const originVariable = ref<{[key:string]:any}>({})

// 全局组件Ref
export const renderRef:{
  [key:string]:any
} = reactive({})

export const setRenderRef = (el: any, comp: any) => {
  renderRef[comp.key] = el
}