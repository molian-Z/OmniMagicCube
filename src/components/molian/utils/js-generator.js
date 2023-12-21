// 创建JS函数
export const createJS = function (compObj, globalAttrs, type = "options") {
  // console.log(globalAttrs.variable)
  const lifecycleCode = globalAttrs.lifecycle
  const jsCodeObj = {}
  deepObjCreateJs(jsCodeObj, compObj, globalAttrs)
  if (type === 'composition') {
    // CompositionAPI代码
    const importModule = {
      'vue': []
    }
    const lifecycleStr = Object.keys(lifecycleCode).map(key => {
      const {
        codeVar,
        code,
        functionMode
      } = lifecycleCode[key]
      const rename = `on` + key.charAt(0).toUpperCase() + key.slice(1);
      importModule.vue.push(rename)
      return `
  ${functionMode === 'asyncFunction' ? 'async ' : ''}${rename}(${codeVar}){
      ${code}
  }`
    }).join('\n')
    let jsCode = Object.keys(jsCodeObj).map(key => {
      return `  const ${key} = ${jsCodeObj[key]}`
    }).join('\n')

    return `<script setup>
import { ${importModule.vue.join(', ')} } from 'vue'
${lifecycleStr}
${jsCode}
</script>`

  } else if (type === 'options') {
    // OptionsAPI代码
    const lifecycleStr = Object.keys(lifecycleCode).map(key => {
      const {
        codeVar,
        code,
        functionMode
      } = lifecycleCode[key]
      return `${functionMode === 'asyncFunction' ? 'async ' : ''}${key}(${codeVar}){${code}}`
    }).join(',\n')
    let jsCode = Object.keys(jsCodeObj).map(key => {
      return `  ['${key}']: ${jsCodeObj[key]}`
    }).join(',\n')
    return `<script>
  export default {
    data(){
      return {}
    },
    computed:{},
    methods:{\n${jsCode}\n},
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

function parseJS(jsCodeObj, obj, globalAttrs) {
  obj.forEach(item =>{
    if(item.on){
      // 如果存在事件对象
      for(const key in item.on){
        if(Object.hasOwnProperty.call(item.on,key)){
          // 遍历事件对象的事件
          const element = item.nativeOn[key];
          const {type, functionMode, code, codeVar} = element
          if(type !== 'variable'){
            jsCodeObj[`${item.key}_${key}`] = `${functionMode === 'asyncFunction' ? 'async ' : ''}(${codeVar.join(', ')})=>{\n${code}\n}`
          }
        }
      }
    }
  
    if(item.nativeOn){
      // 如果存在事件对象
      for(const key in item.nativeOn){
        if(Object.hasOwnProperty.call(item.nativeOn,key)){
          // 遍历事件对象的事件
          const element = item.nativeOn[key];
          const {type, functionMode, code, codeVar} = element
          if(element.type !== 'variable'){
            jsCodeObj[`${item.key}_${key}`] = `${functionMode === 'asyncFunction' ? 'async ' : ''}(${codeVar.join(', ')})=>{\n${code}\n}`
          }
        }
      }
    }
  })
}