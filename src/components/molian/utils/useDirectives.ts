import { runOn } from '@molian/utils/customFunction'

/**
 * 自定义文本指令
 * 
 * @param {any} el - DOM元素
 * @param {any} binding - 绑定对象，包含指令的属性和变量
 * 
 * 此函数主要用于在指定的DOM元素内插入动态文本内容
 * 它根据指令的类型（变量、字符串或函数）来决定插入的文本内容
 * 该函数还监听变量的变化，并在变量变化时更新文本内容
 */
export const customText = (compObj: any) => {
    // 获取指令和变量信息
    const { directives, vars }: any = compObj.comp
    const { text } = directives
    // 根据指令类型处理文本内容
    if (text.type === 'variable') {
        // 当变量值变化时，更新文本内容
        const cmptdText = computed(() => {
            let newText: any = vars
            text.value.forEach((item: string) => {
                newText = newText[item]
            })
            // 如果文本内容是一个函数，则调用该函数并传入相关参数
            if (typeof newText === 'function') {
                newText = newText({
                    comp: compObj.comp,
                    $slot: compObj.$slot
                });
            }
            // 如果文本内容是一个对象，则将其转换为字符串
            if (typeof newText === 'object') {
                newText = JSON.stringify(newText);
            }
            return newText
        })
        return cmptdText
    } else if (text.type === 'string') {
        return text.value
    } else if (text.type === 'function') {
        // 获取函数执行模式、变量和代码，并执行函数生成文本内容
        return runOn(text, compObj.variable, compObj.expandAPI)({
            comp: compObj.comp,
            $slot: compObj.$slot
        })
    }
    return ''
}

/**
 * 自定义指令customOnce的定义，用于在组件的生命周期中只执行一次操作
 * 这个指令在元素挂载和更新时检查条件，并相应地更新元素的文本内容
 */
export const customOnce = {
    /**
     * 在元素挂载时执行的操作
     * @param el 被绑定的元素
     * @param binding 指令的绑定值，包含comp属性
     */
    mounted: (el: any, compObj: any) => {
        el._once = true;
        if (compObj.comp) {
            el.textContent = compObj.comp;
        } else {
            el.textContent = el.innerHTML;
        }
    },
    /**
     * 在元素更新时执行的操作
     * @param el 被绑定的元素
     * @param binding 指令的绑定值，包含comp属性
     */
    updated: (el: any, compObj: any) => {
        if (!el._once && compObj && compObj.comp) {
            el.textContent = compObj.comp;
        }
    }
}

export default (compObj: any) => {
    let newText: any
    if (compObj.comp.directives && compObj.comp.directives.text) {
        newText = customText(compObj)
    }
    return {
        mounted(el: any) {
            if (!!compObj.comp.directives.text) {
                if (isRef(newText)) {
                    watch(() => newText.value, (newVal: any)=> {
                        if(Object.keys(compObj.comp.slots).length > 0) {
                            setTextDom(el, newVal)
                        } else {
                            el.textContent = newVal
                        }
                    }, {
                        immediate: true
                    })
                } else {
                    if(Object.keys(compObj.comp.slots).length > 0) {
                        setTextDom(el, newText)
                    } else {
                        el.textContent = newText
                    }
                }
            }
            if (!!compObj.comp.directives.once) {
                customOnce.mounted(el, compObj)
            }
        },
        updated(el: any) {
            if (!!compObj.comp.directives.text) {
                if (!isRef(newText)) {
                    if(Object.keys(compObj.comp.slots).length > 0) {
                        setTextDom(el, newText)
                    } else {
                        el.textContent = newText
                    }
                }
            }
        },
    }
}

const setTextDom = (el: any, text: string) => {
    // 移除已存在的自定义文本节点
    el.childNodes.forEach((item: { id: string; remove: () => void; }) => {
        if (item.id === 'custom-text') {
            item.remove()
        }
    })
    // 创建并插入新的文本节点
    let tag = document.createTextNode(text)
    const textTag = document.createElement('text')
    textTag.setAttribute('id', 'custom-text')
    textTag.appendChild(tag)
    el.appendChild(textTag)
} 