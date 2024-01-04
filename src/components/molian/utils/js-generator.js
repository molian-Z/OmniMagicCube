// 创建JS函数
export const createJS = function (compObj, globalAttrs, type = "options") {
  // console.log(globalAttrs.variable)
  const {
    lifecycle,
    variable
  } = globalAttrs
  const jsCodeObj = {}
  deepObjCreateJs(jsCodeObj, compObj, globalAttrs)
  if (type === 'composition') {
    // CompositionAPI代码
    const importModule = {
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
      return `
  ${rename}${parseJSCode(lifecycle[key], "lifecycle")}
`
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
      return `${key}${parseJSCode(lifecycle[key], "lifecycle")}`
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
        variableObj.methods += `  ['${key}']: ${parseJSCode(value.value)},\n`
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


function deepObjCreateJs(jsCodeObj, obj, globalAttrs) {
  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      const element = obj[key];
      parseJS(jsCodeObj, obj, globalAttrs)
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

function parseJS(jsCodeObj, obj) {
  obj.forEach(item => {
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
            jsCodeObj[`${item.key}_${key}`] = parseJSCode(element)
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
            jsCodeObj[`${item.key}_${key}`] = parseJSCode(element)
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
}, type = "arrowFunction") => {
  return `${functionMode === 'asyncFunction' ? 'async ' : ''}${type === 'function' ? 'function' : ''}(${codeVar.join(', ')})${type === 'arrowFunction' ? '=>' : ''}{\n${code}\n}`
}