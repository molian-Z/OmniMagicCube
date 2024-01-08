import {
  useElementBounding,
  useThrottleFn  
} from '@vueuse/core'
import {
  ref
} from 'vue'
import {
  hiddenAllPanel,
  createComp
} from './designerData'
// 拖拽数据
export const dragComp:any = ref(null)
export const dragNodes:any = ref(null)
export const dropNodes:any = ref(null)
export const dragIndex = ref<number|null>(null)
export const dropIndex = ref<number|null>(null)
export const dropNode = ref<any>(null)
export const dropKey = ref<string|null>(null)
export const dropType = ref<string|null>(null)
export const isDraggable = ref<boolean>(false)
export const startDraggable = function () {
  hiddenAllPanel.value = true
  isDraggable.value = true
  dragIndex.value = hoverIndex.value
  dragComp.value = hoverComp.value
  dragNodes.value = hoverNodes.value
}

export const resetDraggable = function () {
  hiddenAllPanel.value = false
  isDraggable.value = false
  dragComp.value = null
  dragNodes.value = null
  dropNodes.value = null
  dragIndex.value = null
  dropIndex.value = null
  dropNode.value = null
  dropKey.value = null
  dropType.value = null
  resetHover()
}

export const hoverComp = ref<any>(null)
export const hoverRef = ref<any>(null)
export const hoverNodes = ref<any>(null)
export const hoverIndex = ref<number|null>(null)
export const hoverBounding = useElementBounding(hoverRef)
export const resetHover = function () {
  hoverComp.value = null
  hoverRef.value = null
  hoverNodes.value = null
  hoverIndex.value = null
}


// methods
export const useDraggable = (comps :any, compData :any, message: any) => {
  const onDragenter = useThrottleFn((index, comp, type = null) => {
    if (index > -1) {
      dropIndex.value = index
    } else {
      dropIndex.value = null
    }
    dropType.value = type
    dropNode.value = comp
    dropKey.value = comp.key
    dropNodes.value = compData
  }, 100)

  const onDrop = function (evt: any, index: any) {
    const name = evt.dataTransfer.getData('compName')
    if (name) {
      const obj = createComp(comps.value[name])
      compData.value.splice(index && index || dropIndex.value, 0, obj)
    } else {
      let moveComp = dragNodes.value.splice(dragIndex.value, 1)[0]
      compData.value.splice(index && index || dropIndex.value, 0, moveComp)
    }
    resetDraggable()
  }

  const onDropSlot = function (evt: any, slotVal: { allowComps: string | any[]; children: any[] }) {
    const name = evt.dataTransfer.getData('compName')
    if (name && slotVal.allowComps && (slotVal.allowComps.length === 0 || slotVal.allowComps.indexOf(name) > -1) || name && !slotVal.allowComps) {
      const obj = createComp(comps.value[name])
      slotVal.children.push(obj)
    } else {
      message.error('拖拽组件不在允许的组件列表中')
      // let moveComp = dragNodes.value.splice(dragIndex.value, 1)[0]
      // slotVal.children.push(moveComp)
    }
  }

  const onDragend = function (evt: any) {
    resetDraggable();
  }

  const showToolbar = function (evt: any, comp: any, index: number|null, compData: any) {
    if (!isDraggable.value) {
      hoverComp.value = comp
      hoverRef.value = evt.target || evt.evt && evt.evt.target || evt.e.target
      hoverNodes.value = compData
      hoverIndex.value = index
    }
  }

  return {
    onDragenter,
    onDrop,
    onDropSlot,
    onDragend,
    showToolbar
  }
}