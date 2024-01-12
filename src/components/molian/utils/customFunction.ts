import { withModifiers } from 'vue'
import { defaultLifecycleMap } from '@molian/utils/defaultData'
import { useCloned } from '@vueuse/core'
const asyncFunction = Object.getPrototypeOf(async function () { }).constructor
const syncFunction = Object.getPrototypeOf(function () { }).constructor

// 执行函数
export const createFunc = (type: string, codeVar: any, code: any) => {
  if (type === 'function') {
    return new syncFunction(...codeVar, code)
  } else if (type === 'asyncFunction') {
    return new asyncFunction(...codeVar, code)
  }
}

// 执行生命周期函数
export const runLifecycle = function (lifecycle: any) {
  for (const key in lifecycle.value) {
    if (Object.prototype.hasOwnProperty.call(lifecycle.value, key)) {
      const { type, value } = lifecycle.value[key];
      const { code, codeVar } = value;
      if (!defaultLifecycleMap[key].function) {
        const runFn: any = createFunc(type, codeVar, code)
        runFn([])
      } else {
        defaultLifecycleMap[key].function(function () {
          const _args: any[] = []
          for (let index = 0; index < arguments.length; index++) {
            const newVar = arguments[index];
            _args.push(newVar)
          }
          const runFn: any = createFunc(type, codeVar, code)
          runFn(..._args)
        })
      }
    }
  }
}

// 执行组件监听函数
export const runOn = function (data: { value: any }) {
  const { code, codeVar, functionMode } = data.value
  let prefixCode = ``
  if (codeVar && codeVar.length > 0) {
    codeVar.forEach((item: any, index: any) => {
      prefixCode += `const ${item} = arguments[${index}];\n`
    })
  }
  return createFunc(functionMode, [], prefixCode + code)
}

export const runModifier = function (key: string, data: { [x: string]: { value: { modifiers: any[] } } }) {
  let newKey = key
  if (data[key].value.modifiers) {
    const toKey = data[key].value.modifiers.filter((item: string) => {
      return ['once', 'capture', 'passive'].indexOf(item) > -1
    })
    if (toKey.length > 0) {
      newKey = `${key}${toKey.map((item: string) => item.charAt(0).toUpperCase() + item.slice(1)).join('')}`
    }
  }
  const otherModifiers = data[key].value.modifiers.filter((item: string) => {
    return ['once', 'capture', 'passive'].indexOf(item) === -1
  })
  return {
    newKey,
    modifiers: otherModifiers
  }
}

export const getCurrentOn = (data: { on: any; nativeOn: any }, variable: globalThis.Ref<{ [key: string]: any }>) => {
  const {on, nativeOn} = data
  const newOn: {
    [key: string]: any;
  } = {}
  // 配置原生监听
  for (const key in nativeOn) {
    if (Object.prototype.hasOwnProperty.call(nativeOn, key)) {
      if (!!nativeOn[key].value.code) {
        const { newKey, modifiers } = runModifier(key, nativeOn)
        if (nativeOn[key].type === 'variable') {
          newOn[newKey] = withModifiers(runOn({ value: getVariableData(nativeOn[key], variable) }), modifiers)
        } else {
          newOn[newKey] = withModifiers(runOn(nativeOn[key]), modifiers)
        }
      }
    }
  }
  // 配置组件监听
  for (const key in on) {
    if (Object.prototype.hasOwnProperty.call(on, key)) {
      if (!!on[key].value.code) {
        if (on[key].type === 'variable') {
          newOn[key] = runOn({ value: getVariableData(on[key], variable) })
        } else {
          newOn[key] = runOn(on[key])
        }
      }
    }
  }
  return newOn
}

export const getVariableData = (data: { [x: string]: any; type: any; value: any }, variable: { [x: string]: any; }) => {
  const { type, value } = data
  const { cloned } = useCloned(variable.value)
  let obj = cloned.value
  if (type === 'variable') {
    value.forEach((item: string | number, index: number) => {
      if (index === 0) {
        obj = obj[item].value
      } else {
        obj = obj[item]
      }
    })
  }
  return obj
}