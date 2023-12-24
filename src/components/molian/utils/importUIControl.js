// 改用render语法
import {
  defineComponent,
  h,
  computed,
  inject
} from 'vue'

export const createControl = function (prefix, compName, newAttrs) {
  return defineComponent({
    setup(props, {attrs, emit, slots, expose}) {
      const getSlots = computed(() => {
        let objSlots = {}
        for (const key in slots) {
          if (Object.hasOwnProperty.call(slots, key)) {
            const element = slots[key];
            if (newAttrs[key]) {
              objSlots[newAttrs[key]] = element
            } else {
              objSlots[key] = element
            }
          }
        }
        return objSlots
      })
      const getAttrs = computed(() => {
        let objAttrs = {}
        for (const key in attrs) {
          if (Object.hasOwnProperty.call(attrs, key)) {
            const element = attrs[key];
            if (typeof newAttrs[key] === 'string') {
              objAttrs[newAttrs[key]] = element
            } else if (typeof newAttrs[key] === 'object') {
              objAttrs = {
                ...objAttrs,
                ...newAttrs[key]
              }
            } else {
              objAttrs[key] = element
            }
          }
        }
        objAttrs.ref = 'ref'
        return objAttrs
      })
      const comps = inject('mlComps')
      let controlTag = comps.value[prefix + compName].comp
      return ()=>h(controlTag, getAttrs.value, getSlots.value)
    }
  })
}