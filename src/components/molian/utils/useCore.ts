import { computed } from 'vue'
import { getCurrentOn, getVariableData } from '@molian/utils/customFunction'

// 循环判断
export const isFor = (comp: { directivesVariable: any; }) => {
  if (isIf(comp)) {
    const { directivesVariable } = comp
    if (!directivesVariable.for) {
      return false
    }
    return !!directivesVariable.for
  }
  return false
}

// 渲染判断
export const isIf = (comp: { directivesVariable: any; }) => {
  const { directivesVariable } = comp
  if (!directivesVariable.if && directivesVariable.if !== false || directivesVariable.if === true) {
    return true
  }
  return !!directivesVariable.if
}

// 显示判断
export const isShow = (comp: { directivesVariable: any; }) => {
  const { show } = comp.directivesVariable || null
  if (!show && show !== false || show === true) {
    return true
  }
  return !!show
}

export const getValue = (modelValue: any, variable: globalThis.Ref<{ [key: string]: any; }>) => {
  return computed(() => {
    return modelValue.map((item: { directives: { [x: string]: { [x: string]: any; type: any; value: any } }; on: { [x: string]: any }; nativeOn: { [x: string]: any } }) => {
      let directivesVariable: {
        [key: string]: any;
      } = {}
      Object.keys(item.directives).forEach(key => {
        if (!item.directives[key]) return false;
        directivesVariable[key] = getVariableData(item.directives[key], variable)
      })
      return {
        directivesVariable,
        cacheOn: getCurrentOn({ on: item.on, nativeOn: item.nativeOn }, variable),
        ...item
      }
    })
  })
}

// 获取循环列表数据
export const getForEachList = function (comp: { directives: { [x: string]: { [x: string]: any; type: any; value: any; }; for?: any; }; directivesVariable: { for: any; }; }, variable: globalThis.ComputedRef<any>) {
  if (comp.directives && comp.directives.for && comp.directives.for.type === 'variable') {
    let forEachData = getVariableData(comp.directives.for, variable)
    if (typeof forEachData === 'function') {
      forEachData = forEachData(comp)
    }
    if (typeof forEachData === 'object') {
      if (Array.isArray(forEachData)) {
        return {
          type: "array",
          data: forEachData
        }
      } else {
        return {
          type: 'object',
          data: Object.keys(forEachData).map(item => {
            return {
              key: item,
              value: forEachData[item]
            }
          })
        }
      }
    } else if (typeof forEachData === 'number') {
      const arr = []
      for (let i = 0; i < forEachData; i++) {
        arr.push(i)
      }
      return {
        type: 'number',
        data: arr
      }
    }else if(typeof forEachData === 'string'){
      return {
        type:"error",
        data:[]
      }
    }else{
      return {
        type:'error',
        data:[]
      }
    }
  } else if(comp.directives.for){
    const type = typeof comp.directives.for.value
    if (type === 'string') {
      return []
    } else {
      return comp.directives.for.value
    }
  }

}