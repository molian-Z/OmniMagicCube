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
export const dragComp: any = ref(null)
export const dragNodes: any = ref(null)
export const dropNodes: any = ref(null)
export const dragIndex = ref<number | null>(null)
export const dropIndex = ref<number | null>(null)
export const dropNode = ref<any>(null)
export const dropKey = ref<string | null>(null)
export const dropType = ref<string | null>(null)
export const isDraggable = ref<boolean>(false)
export const startDraggable = function (evt: any, item: { name: any }) {
  evt.dataTransfer.setData('compName', item.name)
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
export const hoverIndex = ref<number | null>(null)
export const hoverBounding = useElementBounding(hoverRef)
export const resetHover = function () {
  hoverComp.value = null
  hoverRef.value = null
  hoverNodes.value = null
  hoverIndex.value = null
}

export const onDragenter =  useThrottleFn((index: number, comp: { key: string | null }, type: string | null | undefined = null, compData: any | undefined) => {
    if (index > -1) {
      dropIndex.value = index
    } else {
      dropIndex.value = null
    }
    dropType.value = type
    dropNode.value = comp
    dropKey.value = comp.key
    dropNodes.value = compData
  }, 200)

// methods
export const useDraggable = (comps?: any, compData?: any, message?: any) => {
  const onDragStart = function (evt: any, item: { name: any }) {
    evt.dataTransfer.setData('compName', item.name)
    isDraggable.value = true
  }
  // const onDragenter = throttleDragEnter(compData)
  const onDrop = function (evt: any, index: any, slotVal: any) {
    const name = evt.dataTransfer.getData('compName')
    const isCreate = evt.dataTransfer.getData('isCreate')
    if (slotVal && slotVal.allowComps && (slotVal.allowComps.length === 0 || slotVal.allowComps.indexOf(name) > -1) || slotVal && !slotVal.allowComps || !slotVal) {
      if (!!isCreate) {
        const obj = createComp(comps.value[name])
        compData.value.splice(index >= 0 && index || dropIndex.value, 0, obj)
      } else {
        let moveComp = dragNodes.value.splice(dragIndex.value, 1)[0]
        if(moveComp){
          compData.value.splice(index >= 0 && index || dropIndex.value, 0, moveComp)
        }
      }
      resetDraggable()
    } else {
      message.error('拖拽组件不在允许的组件列表中')
    }
  }

  const onDropSlot = function (evt: any, slotVal: { allowComps: string | any[]; children: any[] }) {
    const name = evt.dataTransfer.getData('compName')
    const isCreate = evt.dataTransfer.getData('isCreate')
    if (slotVal.allowComps && (slotVal.allowComps.length === 0 || slotVal.allowComps.indexOf(name) > -1) || !slotVal.allowComps) {
      if (!!isCreate) {
        const obj = createComp(comps.value[name])
        slotVal.children.push(obj)
      } else {
        let moveComp = dragNodes.value.splice(dragIndex.value, 1)[0]
        if(moveComp){
          slotVal.children.push(moveComp)
        }
      }
    } else {
      message.error('拖拽组件不在允许的组件列表中')
    }
  }

  const onDragend = function (evt: any) {
    resetDraggable();
  }

  const showToolbar = function (evt: any, comp: any, index: number, compData: any) {
    if (!isDraggable.value) {
      hoverComp.value = compData[index]
      hoverRef.value = evt.target || evt.evt && evt.evt.target || evt.e.target
      hoverNodes.value = compData
      hoverIndex.value = index
    }
  }

  return {
    onDragStart,
    // onDragenter,
    onDrop,
    onDropSlot,
    onDragend,
    showToolbar
  }
}