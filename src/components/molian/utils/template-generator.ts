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
  
  let templateStr = ``
  templateStr += `\n<${obj.tag}`
  if (obj.id) {
    // 如果存在id属性
    templateStr += ` ref="${obj.id}"`
  }
  if (obj.key) {
    // 如果存在key属性
    templateStr += ` class="comp_${obj.key}"`
  }
  
  // 收集可能的v-model绑定
  const vModelBindings = new Map();
  
  // 先检查属性中的绑定
  if (obj.attrs) {
    for (const key in obj.attrs) {
      if (Object.hasOwnProperty.call(obj.attrs, key)) {
        vModelBindings.set(key, {
          prop: obj.attrs[key],
          event: null
        });
      }
    }
  }
  
  // 再检查事件中的update:xxx模式
  if (obj.on) {
    for (const key in obj.on) {
      if (Object.hasOwnProperty.call(obj.on, key) && key.startsWith('update:')) {
        const propName = key.substring(7); // 去掉'update:'前缀
        if (vModelBindings.has(propName)) {
          // 找到匹配的属性，记录事件
          const binding = vModelBindings.get(propName);
          binding.event = obj.on[key];
          vModelBindings.set(propName, binding);
        }
      }
    }
  }
  
  // 处理属性，排除已合并为v-model的属性
  if (obj.attrs) {
    for (const key in obj.attrs) {
      if (Object.hasOwnProperty.call(obj.attrs, key)) {
        const binding = vModelBindings.get(key);
        // 如果这个属性有匹配的update:xxx事件，跳过，稍后作为v-model处理
        if (binding && binding.event) continue;
        
        // 正常处理属性
        const elementType = obj.attrs[key].type;
        let element = obj.attrs[key].value;
        if (elementType === 'variable') {
            if(!!element && Array.isArray(element)) {
                element = element.join('.')
            }
        }
        if(typeof element === 'object' && ['array', 'object'].indexOf(elementType) > -1){
          element = JSON.stringify(element).replace(/"/g, "'")
        }
        if(element === "{}" || element === "[]" || element === 'null'){
          element = undefined
        }
        if(element != undefined){
            // 对于布尔类型且值为true的属性，使用简写形式
            if(elementType === 'boolean' && element === true) {
              templateStr += ` ${key}`
            } else if(elementType === 'function') {
                templateStr += ` :${key}="${obj.id}_${key}"`
            } else {
              const propKey = elementType !== 'string' && `:${key}` || `${key}`
              templateStr += ` ${propKey}="${element}"`
            }
          }
      }
    }
  }
  
  // 处理v-model绑定
  for (const [propName, binding] of vModelBindings.entries()) {
    if (binding.prop && binding.event) {
      const prop = binding.prop;
      let value = prop.value;
      
      if (prop.type === 'variable') {
        if(!!value && Array.isArray(value)) {
          value = value.join('.')
        }
      }
      
      // 生成v-model:xxx绑定
      const modelName = propName === 'modelValue' ? '' : `:${propName}`;
      templateStr += ` v-model${modelName}="${value}"`
    }
  }

  // 处理事件，排除已合并为v-model的update:xxx事件
  if(obj.on){
    for(const key in obj.on){
      if(Object.hasOwnProperty.call(obj.on,key)){
        // 如果是update:xxx事件且已经处理为v-model，则跳过
        if (key.startsWith('update:')) {
          const propName = key.substring(7);
          const binding = vModelBindings.get(propName);
          if (binding && binding.prop) continue;
        }
        
        // 正常处理事件
        const element = obj.on[key];
        templateStr += ` @${key}`
        if(element.value && element.value.modifiers && element.value.modifiers.length > 0){
          element.value.modifiers.forEach((item: any) =>{
            templateStr += `.${item}`
          })
        }
        if(element.type === 'variable'){
          templateStr += `="${element.value.join('.')}"`
        }else{
          templateStr += `="${obj.key}_${key.replace(/:/g, '__')}"`
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
        if(element.value && element.value.modifiers && element.value.modifiers.length > 0){
          element.value.modifiers.forEach((item: any) =>{
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

  // 处理指令
  if(obj.directives) {
    // 遍历指令对象
    for(const key in obj.directives) {
      if(Object.hasOwnProperty.call(obj.directives, key)) {
        const directive = obj.directives[key];
        if(!directive) continue;
        // 根据指令类型处理
        switch(key) {
          case 'text':
            // 处理文本指令
            if(directive.type === 'string') {
              templateStr += `>${directive.value}`;
              return templateStr;
            } else if(directive.type === 'variable') {
              templateStr += `>{{ ${directive.value.join('.')} }}`;
              return templateStr;
            } else if(directive.type === 'function') {
              templateStr += `>{{ ${obj.key}_text() }}`;
              return templateStr;
            }
            break;
            
          case 'html':
            // 处理HTML指令
            if(directive.type === 'string') {
              templateStr += ` v-html="'${directive.value}'">`;
              return templateStr;
            } else if(directive.type === 'variable') {
              templateStr += ` v-html="${directive.value.join('.')}">`;
              return templateStr;
            } else if(directive.type === 'function') {
              templateStr += ` v-html="${obj.key}_html()">`;
              return templateStr;
            }
            break;
            
          case 'if':
            // 处理条件渲染指令
            if(directive.type === 'variable') {
              templateStr += ` v-if="${directive.value.join('.')}"`;
            } else if(directive.type === 'function') {
              templateStr += ` v-if="${obj.key}_if()"`;
            }
            break;
            
          case 'show':
            // 处理显示指令
            if(directive.type === 'variable') {
              templateStr += ` v-show="${directive.value.join('.')}"`;
            } else if(directive.type === 'function') {
              templateStr += ` v-show="${obj.key}_show()"`;
            }
            break;
            
          case 'for':
            // 处理列表渲染指令
            if(directive.type === 'variable') {
              const idKey = directive.idKey || 'index';
              const dataKey = directive.dataKey || 'item';
              templateStr += ` v-for="${dataKey} in ${directive.value.join('.')}" :key="${idKey}"`;
            }
            break;
            
          default:
            // 处理其他自定义指令
            if(directive.type === 'string') {
              templateStr += ` v-${key}="${directive.value}"`;
            } else if(directive.type === 'variable') {
              templateStr += ` v-${key}="${directive.value.join('.')}"`;
            } else if(directive.type === 'function') {
              templateStr += ` v-${key}="${obj.key}_${key}()"`;
            }
        }
      }
    }
  }
  
  templateStr += `>`
  // 返回解析后的模板字符串
  return templateStr
}