// 改用render语法
import {
  defineComponent,
  h,
  computed,
  inject
} from 'vue'

function createRender(data, comps) {
  const { slots, attrs, tag } = data
  let currentSlots = ``
  if(Array.isArray(slots)){
    currentSlots = slots.map(item => {
      return createRender(item, comps)
    })
  }else if(typeof slots === "object"){
    currentSlots = createRender(slots, comps)
  }else if(typeof slots === 'function'){
    currentSlots = slots()
  }else{
    currentSlots = () => slots
  }
  return h(comps[tag].comp, attrs, currentSlots)
}
export const createControl = function (prefix, compName, newAttrs) {
  return defineComponent({
    setup(props, {
      attrs,
      emit,
      slots,
      expose
    }) {
      const comps = inject('mlComps')
      const getSlots = () => {
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
      }
      const currentSlots = getSlots() || {}
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
            } else if (typeof newAttrs[key] === 'function') {
              let newAttr = newAttrs[key](element)
              Object.keys(newAttr).forEach(key => {
                const currentAttr = newAttr[key]
                if (!currentAttr._isSlot) {
                  objAttrs = {
                    ...objAttrs,
                    [key]:currentAttr
                  }
                } else {
                  currentSlots[key] = createRender(currentAttr, comps.value)
                }
              })
            } else {
              objAttrs[key] = element
            }
          }
        }
        objAttrs.ref = 'ref'
        return objAttrs
      })
      let controlTag = comps.value[prefix + compName].comp
      return () => h(controlTag, getAttrs.value, currentSlots)
    }
  })
}