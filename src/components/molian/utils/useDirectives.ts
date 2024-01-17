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

export const customText = (el: { addEventListener?: (arg0: string, arg1: any) => void; textContent?: any; }, binding: { value: { directives: { text: any; }; directivesVariable: { text: any; }; }; }) => {
  nextTick(() => {
    const { text } = binding.value.directives
    if (text.type === 'variable') {
      const newText = binding.value.directivesVariable.text;
      let currentText = newText;
      if (typeof currentText === 'function') {
        currentText = newText(el, binding);
      }
      if (typeof newText === 'object') {
        currentText = JSON.stringify(currentText);
      }
      el.textContent = currentText
    } else if (text.type === 'string') {
      el.textContent = text.value;
    }
  })
}

export const customOnce = {
  mounted: (el: { _once: boolean; textContent: any; innerHTML: any; }, binding: { value: any; }) => {
    el._once = true;
    if (binding.value) {
      el.textContent = binding.value;
    } else {
      el.textContent = el.innerHTML;
    }
  },
  updated: (el: { _once: any; textContent: any; }, binding: { value: any; }) => {
    if (!el._once && binding.value) {
      console.log(binding.value)
      el.textContent = binding.value;
    }
  }
}
export default {
  mounted(el: any, binding: any) {
    if (el) {
      if (!!binding.value.directives.text) {
        customText(el, binding)
      }
      if (!!binding.value.directives.once) {
        customOnce.mounted(el, binding)
      }
    }
  },
  updated(el: any, binding: any) {
    if (!!binding.value.directives.text) {
      customText(el, binding)
    }
    if (!!binding.value.directives.once) {
      customOnce.updated(el, binding)
    }
  },
}