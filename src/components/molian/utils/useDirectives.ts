export const customFor = {
  mounted(el: { appendChild: (arg0: any) => void; }, binding: { value: any; arg: any; }, vnode: { context: { $createElement: (arg0: any) => any; }; }) {
    // 获取要遍历的数据
    const data = binding.value;

    // 遍历数据并渲染到模板中
    data.forEach((item: any, index: any) => {
      const clonedNode = vnode.context.$createElement(binding.arg);
      clonedNode.textContent = item;
      el.appendChild(clonedNode);
    });
  },
}

export const customIf = {
  mounted(el: { addEventListener: (arg0: string, arg1: any) => void; }) {
    if (el) {
      el.addEventListener('scroll', this.onScroll)
    }
  },
}

export const customShow = {
  mounted(el: { addEventListener: (arg0: string, arg1: any) => void; }) {
    if (el) {
      el.addEventListener('scroll', this.onScroll)
    }
  },
}

export default {
  mounted(el: { addEventListener: (arg0: string, arg1: any) => void; }) {
    // console.log(el)
    if (el) {
      //el.addEventListener('scroll', this.onScroll)
    }
  },
}