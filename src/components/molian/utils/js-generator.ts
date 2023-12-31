export interface IComp {
  name?: string;
  category?: string;
  attrs?: IAttrs;
  on?: Record<string, unknown>;
  nativeOn?: Record<string, unknown>;
  directives?: Record<string, unknown>;
  slots?: ISlots;
  css?: ICss;
  key?: string;
  id?: string;
}
export interface ICss {
  borderRadius?: (string)[];
  margin?: (string)[];
  padding?: (string)[];
  constX?: string;
  constY?: string;
  color?: IColor;
  background?: IColor;
  border?: Array<unknown>;
  mixBlendMode?: IColor;
  blur?: IBlur;
  boxShadow?: Array<unknown>;
}
export interface IBlur {
  isShow?: boolean;
  modelValue?: string;
  field?: string;
}
export interface IColor {
  isShow?: boolean;
  modelValue?: string;
}
export interface ISlots {
  [key:string]: IDefault;
}
export interface IDefault {
  allowComps?: (string)[];
  children?: Array<IComp>;
}
export interface IAttrs {
  [key:string]: any;
}
// 创建JS函数
export const createJS = function (compObj: IComp, globalAttrs: { lifecycle: any; variable: any }, type = "options") {
  // console.log(globalAttrs.variable)
  const {
    lifecycle,
    variable
  } = globalAttrs
  const jsCodeObj:any = {}
  deepObjCreateJs(jsCodeObj, compObj, globalAttrs)
  if (type === 'composition') {
    // CompositionAPI代码
    const importModule:{
      vue: string[]
    } = {
      'vue': []
    }

    // 变量生成
    const variableStr = Object.keys(variable).map(key => {
      const value = variable[key]
      if (value.type === 'computed') {
        if(importModule.vue.indexOf("computed") === -1){
          importModule.vue.push("computed")
        }
        return `  const ${key} = computed(()=> {${value.value && value.value.code || "return null" }})\n`
      } else if (value.type === 'function') {
        return `  const ${key} = ${parseJSCode(value.value)}\n`
      } else {
        if(importModule.vue.indexOf("ref") === -1){
          importModule.vue.push("ref")
        }
        return `  const ${key} = ref(${value.value || 'null' })\n`
      }
    }).join('\n')

    // 生命周期生成
    const lifecycleStr = Object.keys(lifecycle).filter(key =>{
      return !!lifecycle[key]
    }).map(key => {
      const rename = `on` + key.charAt(0).toUpperCase() + key.slice(1);
      importModule.vue.push(rename)
      if(lifecycle[key].value && lifecycle[key].value.code){
        return `
  ${rename}${parseJSCode(lifecycle[key].value, "lifecycle")}
`}else{
  return ``
}
      }).join('\n')

    // 函数代码生成
    let jsCode = Object.keys(jsCodeObj).map(key => {
      return `  const ${key} = ${jsCodeObj[key]}`
    }).join('\n')

    return `<script setup>
import { ${importModule.vue.join(', ')} } from 'vue'

${variableStr}
${lifecycleStr}
${jsCode}
</script>`

  } else if (type === 'options') {
    // OptionsAPI代码
    // 生命周期写入
    const lifecycleStr = Object.keys(lifecycle).filter(key =>{
      return !!lifecycle[key]
    }).map(key => {
      if(lifecycle[key].value && lifecycle[key].value.code){
        return `${key}${parseJSCode(lifecycle[key].value, "lifecycle")}`
      }else{
        return ``
      }
    }).join(',\n')
    // 变量写入
    const variableObj = {
      data: "",
      computed: "",
      methods: "",
    }
    Object.keys(variable).forEach(key => {
      const value = variable[key]
      if (value.type === 'computed') {
        variableObj.computed += `${key}() {${value.value && value.value.code || "return null" }}\n`
      } else if (value.type === 'function') {
        if(value.value && value.value.code){
          variableObj.methods += `  ['${key}']: ${parseJSCode(value.value)},\n`
        }
      } else {
        variableObj.data += `"${key}": ${value.value || 'null' },\n`
      }
    })
    // jsCode 写入
    let jsCode = Object.keys(jsCodeObj).map(key => {
      return `  ['${key}']: ${jsCodeObj[key]}`
    }).join(',\n')
    return `<script>
  export default {
    data(){
      return {
        ${variableObj.data}
      }
    },
    computed:{
      ${variableObj.computed}
    },
    methods:{\n${variableObj.methods}${jsCode}\n},
    ${lifecycleStr}
  }
</script>`
  }
}


function deepObjCreateJs(jsCodeObj: { [x: string]: string }, obj: { [x: string]: any }, globalAttrs: any) {
  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      const element = obj[key];
      parseJS(jsCodeObj, obj)
      const slots = element.slots
      if (slots) {
        for (const sKey in slots) {
          if (Object.hasOwnProperty.call(slots, sKey)) {
            const childComp = slots[sKey].children;
            deepObjCreateJs(jsCodeObj, childComp, globalAttrs)
          }
        }
      }
    }
  }
}

function parseJS(jsCodeObj: { [x: string]: string }, obj: { [x: string]: any }) {
  obj.forEach((item: { on: any; nativeOn: { [x: string]: any }; key: any }) => {
    if (item.on) {
      // 如果存在事件对象
      for (const key in item.on) {
        if (Object.hasOwnProperty.call(item.on, key)) {
          // 遍历事件对象的事件
          const element = item.nativeOn[key];
          const {
            type,
            functionMode,
            code,
            codeVar
          } = element
          if (type !== 'variable') {
            if(element.value && element.value.code){
              jsCodeObj[`${item.key}_${key}`] = parseJSCode(element.value)
            }
          }
        }
      }
    }

    if (item.nativeOn) {
      // 如果存在事件对象
      for (const key in item.nativeOn) {
        if (Object.hasOwnProperty.call(item.nativeOn, key)) {
          // 遍历事件对象的事件
          const element = item.nativeOn[key];
          if (element.type !== 'variable') {
            if(element.value && element.value.code){
              jsCodeObj[`${item.key}_${key}`] = parseJSCode(element.value)
            }
          }
        }
      }
    }
  })
}

const parseJSCode = ({
  functionMode,
  codeVar,
  code
}:{
  functionMode: string,
  codeVar: string[],
  code: string
}, type = "arrowFunction") => {
  return `${functionMode === 'asyncFunction' ? 'async ' : ''}${type === 'function' ? 'function' : ''}(${codeVar && codeVar.join(', ') || ''})${type === 'arrowFunction' ? '=>' : ''}{\n${code}\n}`
}