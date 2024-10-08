import { nextTick } from 'vue';
// export const customFor = {
//   mounted(el: { appendChild: (arg0: any) => void; }, binding: { value: any; arg: any; }, vnode: { context: { $createElement: (arg0: any) => any; }; }) {
//     // 获取要遍历的数据
//     const data = binding.value;

//     // 遍历数据并渲染到模板中
//     data.forEach((item: any, index: any) => {
//       const clonedNode = vnode.context.$createElement(binding.arg);
//       clonedNode.textContent = item;
//       el.appendChild(clonedNode);
//     });
//   },
// }

// export const customIf = {
//   mounted(el: { addEventListener: (arg0: string, arg1: any) => void; }) {
//     if (el) {
//       el.addEventListener('scroll', this.onScroll)
//     }
//   },
// }

// export const customShow = {
//   mounted(el: { addEventListener: (arg0: string, arg1: any) => void; }) {
//     if (el) {
//       el.addEventListener('scroll', this.onScroll)
//     }
//   },
// }

export const customText = (el:any, binding: any) => {
    nextTick(() => {
        const { directives, vars }: any = binding.value.comp
        const { text } = directives
        if (text.type === 'variable') {
            watch(() => vars[text.value[0]], (newVal) => {
                let newText: any = vars;
                text.value.forEach((item: string) => {
                    newText = newText[item]
                })
                let currentText = newText;
                if (typeof currentText === 'function') {
                    currentText = newText({
                        el,
                        comp:binding.value.comp,
                        $slot: binding.value.$slot
                    });
                }
                if (typeof newText === 'object') {
                    currentText = JSON.stringify(currentText);
                }
                for (let index = 0; index < el.childNodes.length; index++) {
                    const item = el.childNodes[index];
                    if (item.id === 'custom-text') {
                        item.remove()
                    }
                }
                const textTag = document.createElement('text')
                textTag.setAttribute('id', 'custom-text')
                let tag = document.createTextNode(currentText)
                textTag.appendChild(tag)
                el.appendChild(textTag)

            }, {
                immediate: true,
                deep: true
            })
        } else if (text.type === 'string') {
            el.childNodes.forEach((item: { id: string; remove: () => void; }) => {
                if (item.id === 'custom-text') {
                    item.remove()
                }
            })
            let tag = document.createTextNode(text.value)
            const textTag = document.createElement('text')
            textTag.setAttribute('id', 'custom-text')
            textTag.appendChild(tag)
            el.appendChild(textTag)
            //el.innerText = text.value;
        }
    })
}

export const customOnce = {
    mounted: (el: any, binding: any) => {
        el._once = true;
        if (binding.value.comp) {
            el.textContent = binding.value.comp;
        } else {
            el.textContent = el.innerHTML;
        }
    },
    updated: (el: any, binding: any) => {
        if (!el._once && binding.value && binding.value.comp) {
            el.textContent = binding.value.comp;
        }
    }
}
export default {
    mounted(el: any, binding: any) {
        if (el) {
            if (!!binding.value.comp.directives.text) {
                customText(el, binding)
            }
            if (!!binding.value.comp.directives.once) {
                customOnce.mounted(el, binding)
            }
        }
    },
    updated(el: any, binding: any) {
        if (!!binding.value.comp.directives.text) {
            customText(el, binding)
        }
        if (!!binding.value.comp.directives.once) {
            customOnce.updated(el, binding)
        }
    },
}