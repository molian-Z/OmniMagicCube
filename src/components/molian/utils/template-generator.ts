import {
  toKebabCase
} from './util'
// 创建template函数
let template = ``

export const createTemplate = function (compObj: any) {
  template = ``
  deepObjCreateTemplate(compObj) // 递归生成template
  return template
}

/**
 * 递归创建CSS对象
 * @param {Object} obj - 包含CSS属性的对象
 * @param {Array} css - 存储CSS属性的数组
 */
function deepObjCreateTemplate(obj: { [x: string]: any }) {
  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      const element = obj[key];
      template += parseTemplate({
        tag: toKebabCase(element.name),
        attrs: element.attrs,
        on: element.on,
        nativeOn:element.nativeOn,
        directives:element.directives,
        key: element.key,
        id: element.id,
        categroy: element.categroy
      })
      const slots = element.slots
      if (slots) {
        for (const sKey in slots) {
          if (Object.hasOwnProperty.call(slots, sKey)) {
            const childComp = slots[sKey].children;
            deepObjCreateTemplate(childComp)
          }
        }
      }
      template += `\n</${toKebabCase(element.name)}>`
    }
  }
}

function parseTemplate(obj: { tag: any; attrs: any; on: any; nativeOn: any; directives?: any; key: any; id: any; categroy?: any }) {
  // 解析模板函数，接收一个对象作为参数
  // 对象属性：
  // - tag: 元素标签名（必填）
  // - attrs: 属性对象（可选）
  // - on: 事件对象（可选）

  let templateStr = ``
  templateStr += `\n<${obj.tag}`
  if (obj.id) {
    // 如果存在id属性
    templateStr += ` ref="${obj.id}"`
  }
  if (obj.key) {
    // 如果存在key属性
    templateStr += ` class="${toKebabCase(obj.tag)}__${obj.key}"`
  }
  if (obj.attrs) {
    // 如果存在属性对象
    for (const key in obj.attrs) {
      if (Object.hasOwnProperty.call(obj.attrs, key)) {
        // 遍历属性对象的属性
        const elementType = obj.attrs[key].type;
        let element = obj.attrs[key].value;
        if(typeof element === 'object'){
          element = JSON.stringify(element)
        }
        if(element === "{}" || element === "[]" || element === 'null'){
          element = undefined
        }
        // 可通过比对默认值是否相同取消属性的添加
        if(element != undefined){
          const propKey = elementType !== 'string' && `:${key}` || `${key}`
          templateStr += ` ${propKey}="${element}"`
        }
      }
    }
  }

  if(obj.on){
    // 如果存在事件对象
    for(const key in obj.on){
      if(Object.hasOwnProperty.call(obj.on,key)){
        // 遍历事件对象的事件
        const element = obj.nativeOn[key];
        //modifiers
        templateStr += ` @${key}`
        if(element.modifiers && element.modifiers.length > 0){
          element.modifiers.forEach((item: any) =>{
            templateStr += `.${item}`
          })
        }
        if(element.type === 'variable'){
          templateStr += `="${element.value.join('.')}"`
        }else{
          templateStr += `="${obj.key}_${key}"`
        }
      }
    }
  }

  if(obj.nativeOn){
    // 如果存在事件对象
    for(const key in obj.nativeOn){
      if(Object.hasOwnProperty.call(obj.nativeOn,key)){
        // 遍历事件对象的事件
        const element = obj.nativeOn[key];
        //modifiers
        templateStr += ` @${key}`
        if(element.modifiers && element.modifiers.length > 0){
          element.modifiers.forEach((item: any) =>{
            templateStr += `.${item}`
          })
        }
        if(element.type === 'variable'){
          templateStr += `="${element.value.join('.')}"`
        }else{
          templateStr += `="${obj.key}_${key}"`
        }
      }
    }
  }
  templateStr += `>`
  // 返回解析后的模板字符串
  return templateStr
}