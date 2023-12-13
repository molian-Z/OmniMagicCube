import { useElementBounding } from '@vueuse/core'
import { ref } from 'vue'
import {hiddenAllPanel, createComp} from './designerData'
// 拖拽数据
export const dragComp = ref(null)
export const dragNodes = ref(null)
export const dropNodes = ref(null)
export const dragIndex = ref(null)
export const dropIndex = ref(null)
export const dropNode = ref(null)
export const dropKey = ref(null)
export const isDraggable = ref(null)
export const startDraggable = function (evt) {
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
  resetHover()
}

export const hoverComp = ref(null)
export const hoverRef = ref(null)
export const hoverNodes = ref(null)
export const hoverIndex = ref(null)
export const hoverBounding = useElementBounding(hoverRef)
export const resetHover = function (e) {
  hoverComp.value = null
  hoverRef.value = null
  hoverNodes.value = null
  hoverIndex.value = null
}


// methods

export const useDraggable = (comps, compData, message)=> {
  const onDragenter = function (index, comp) {
    if(index > -1){
      dropIndex.value = index
    }
    dropNode.value = comp
    dropKey.value = comp.key
    dropNodes.value = compData
  }

  const onDrop = function (evt, index) {
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

  const onDropSlot = function (evt, slotVal) {
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

  const onDragend = function (evt) {
    resetDraggable();
  }

  const showToolbar = function (evt, comp, index, compData) {
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