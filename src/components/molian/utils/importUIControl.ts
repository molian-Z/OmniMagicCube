// 改用render语法
import {
  defineComponent,
  h,
  computed,
  inject,
} from 'vue'

function createRender(slots: any, attrs: any, tag: string, comps: { [x: string]: { comp: string | Component<any> } }) {
  let currentSlots: any = ``
  if (Array.isArray(slots)) {
    currentSlots = slots.map(item => {
      return createRender(item.slots, item.attrs, item.tag, comps)
    })
  } else if (typeof slots === "object") {
    currentSlots = createRender(slots.slots, slots.attrs, slots.tag, comps)
  } else if (typeof slots === 'function') {
    currentSlots = slots()
  } else {
    currentSlots = () => slots
  }
  return h(comps[tag].comp, attrs, currentSlots)
}
export const createControl = function (prefix: any, compName: any, newAttrs: { [x: string]: any }) {
  return defineComponent({
    inheritAttrs:false,
    setup(props, {
      attrs,
      emit,
      slots,
      expose
    }) {
      const comps: any = inject('mlComps')
      const getSlots = () => {
        let objSlots: {
          [x: string]: any
        } = {}
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
      let currentSlots = getSlots() || {}
      const getAttrs = computed(() => {
        let objAttrs: {
          [x: string]: any
        } = {}
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
                if (Array.isArray(currentAttr)) {
                  currentSlots = []
                  currentAttr.forEach((item: { slots: any; attrs: any; tag: string }) => {
                    currentSlots.push(createRender(item.slots, item.attrs, item.tag, comps.value))
                  })
                }else if (currentAttr && !currentAttr._isSlot) {
                  objAttrs = {
                    ...objAttrs,
                    [key]: currentAttr
                  }
                } else if (currentAttr) {
                  currentSlots[key] = createRender(currentAttr.slots, currentAttr.attrs, currentAttr.tag, comps.value)
                } else {
                  // console.log(currentAttr,key)
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
      try {
        let controlTag = comps.value[prefix + compName].comp
        return () => h(controlTag, getAttrs.value, currentSlots)
      } catch (error) {
        console.log(`组件${prefix + compName}不存在:\n` + error)
      }
    }
  })
}