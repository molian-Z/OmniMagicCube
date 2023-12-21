// 改用render语法
import { defineComponent, h } from 'vue'

export const createControl = function (prefix, compName, attrs) {

  return defineComponent({
    render() {
      const controlTag = this._.appContext.components[prefix + compName]
      return h(controlTag, this.getAttrs, this.getSlots)
    },
    computed: {
      getSlots() {
        let objSlots = {}
        for (const key in this.$slots) {
          if (Object.hasOwnProperty.call(this.$slots, key)) {
            const element = this.$slots[key];
            if (attrs[key]) {
              objSlots[attrs[key]] = element
            } else {
              objSlots[key] = element
            }
          }
        }
        return objSlots
      },
      getAttrs() {
        let objAttrs = {}
        for (const key in this.$attrs) {
          if (Object.hasOwnProperty.call(this.$attrs, key)) {
            const element = this.$attrs[key];
            if (typeof attrs[key] === 'string') {
              objAttrs[attrs[key]] = element
            } else if (typeof attrs[key] === 'object') {
              objAttrs = {
                ...objAttrs,
                ...attrs[key]
              }
            } else {
              objAttrs[key] = element
            }
          }
        }
        objAttrs.ref = 'ref'
        return objAttrs
      }
    }
  })
}