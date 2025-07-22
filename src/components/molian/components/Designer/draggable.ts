import {
    useElementBounding,
    useThrottleFn
} from '@vueuse/core'
import {
    ref
} from 'vue'
import {
    hiddenAllPanel,
} from './designerData'
import { createComponent } from '@molian/utils/componentCore'

interface AllowComp {
    name: string;
    [key: string]: any;
}

interface DragEvent extends Event {
    dataTransfer: DataTransfer;
}

interface SlotValue {
    allowComps?: Array<AllowComp | string>;
    appendComps?: Array<{name: string}>;
    children: Array<any>;
}

interface DragComponent {
    id: string | number;
    name: string;
}


// 拖拽数据
export const dragComp: any = ref(null)
export const dragNodes: any = ref(null)
export const dropNodes: any = ref(null)
export const dragIndex = ref<number>(-1)
export const dropIndex = ref<number>(-1)
export const dropNode = ref<any>(null)
export const dropKey = ref<string | null>(null)
export const dropType = ref<string | null>(null)
export const isDraggable = ref<boolean>(false)
export const isCreated = ref<boolean>(false)
export const startDraggable = function (evt: any, item: { name: any }) {
    hiddenAllPanel.value = true
    isDraggable.value = true
    dragIndex.value = hoverIndex.value
    dragComp.value = hoverComp.value
    dragNodes.value = hoverNodes.value
    isCreated.value = false
}

export const draggableCreateComponent = function(evt: DragEvent, item:any) {
    if (!evt.dataTransfer) return
    evt.dataTransfer.setData('compName', item.name)
    isDraggable.value = true
    isCreated.value = true
    dragIndex.value = -1
    dragComp.value = item.name
    dragNodes.value = null
}

export const resetDraggable = function () {
    hiddenAllPanel.value = false
    isDraggable.value = false
    dragComp.value = null
    dragNodes.value = null
    dropNodes.value = null
    dragIndex.value = -1
    dropIndex.value = -1
    dropNode.value = null
    dropKey.value = null
    dropType.value = null
    resetHover()
}

export const hoverComp = ref<any>(null)
export const hoverRef = ref<any>(null)
export const hoverNodes = ref<any>(null)
export const hoverIndex = ref<number>(-1)
export const hoverBounding = useElementBounding(hoverRef)
/**
 * 重置悬停状态
 * 此函数用于重置应用中所有与悬停相关的状态它清空了悬停组件、悬停引用、悬停节点和悬停索引的值
 * 这有助于在用户交互或页面生命周期中确保状态的正确性
 */
export const resetHover = function () {
    hoverComp.value = null
    hoverRef.value = null
    hoverNodes.value = null
    hoverIndex.value = -1
}

/**
 * 处理拖拽进入事件的函数
 * 该函数被节流以防止在拖拽过程中过于频繁地触发
 * 
 * @param index 拖拽目标的索引，用于确定拖拽位置如果索引小于0，则表示没有具体的索引位置
 * @param comp 拖拽的组件对象，包含组件的键值
 * @param type 拖拽类型，可以是null或undefined，用于区分不同类型的拖拽操作
 * @param compData 组件数据，可以是任意类型，用于传递额外的拖拽数据
 */
export const onDragenter = useThrottleFn((index: number, comp: any | undefined, type: string | null | undefined = null, compData: any | undefined) => {
    // 根据index值更新拖拽索引如果index大于-1，则设置为index，否则设置为null
    if (index > -1) {
        dropIndex.value = index
    } else {
        dropIndex.value = -1
    }
    // 更新拖拽类型
    dropType.value = type
    // 更新拖拽的组件对象
    dropNode.value = comp
    // 更新拖拽的组件键值
    dropKey.value = comp.key
    // 更新拖拽的组件数据
    dropNodes.value = compData
}, 200)

// methods
/**
 * 提供组件拖拽功能的钩子函数
 * 
 * 此函数定义了组件在拖拽过程中的各种行为，包括拖拽开始、拖拽进入、拖拽结束等事件的处理逻辑
 * 它允许组件在特定的插槽中拖拽和放置，同时提供错误反馈和工具栏显示功能
 * 
 * @param comps 组件集合，用于创建新组件
 * @param compData 组件数据，用于更新组件列表
 * @param message 消息对象，用于显示错误信息
 * @returns 返回一个包含拖拽相关事件处理函数的对象
 */
export const useDraggable = (comps?: any, compData?: any, message?: any) => {
    // const onDragStart = function (evt: any, item: { name: any }) {
    //     evt.dataTransfer.setData('compName', item.name)
    //     isDraggable.value = true
    // }
    // const onDragenter = throttleDragEnter(compData)
    /**
     * 拖拽结束时的事件处理函数
     * 
     * @param evt 拖拽事件对象
     * @param index 组件在列表中的索引，用于插入组件
     * @param slotVal 插槽的相关信息，包括允许的组件列表和插槽的其他属性
     * 此函数主要用于在拖拽结束后处理组件的放置逻辑，包括创建新组件或移动现有组件，并提供错误反馈
     */
    const onDrop = function (evt: DragEvent | any, index: number, slotVal: SlotValue, comp: DragComponent): boolean {
        // 提前返回的条件判断
        if (comp.id === dragComp.value?.id) {
            return false
        }

        // 检查组件是否允许放置
        const isAllowed = !slotVal?.allowComps || (slotVal.allowComps && allowCompsBtn({ allowComps: slotVal.allowComps }, name))
        if (!isAllowed) {
            message.error('拖拽组件不在允许的组件列表中')
            return false
        }

        const targetIndex = index >= 0 ? index : dropIndex.value

        if (isCreated.value) {
            const name = dragComp.value
            // 创建新组件
            const appendComp = slotVal?.appendComps?.find(item => item.name === name)
            const obj = createComponent(comps.value[name], appendComp)
            compData.value.splice(targetIndex, 0, obj)
        } else {
            // 移动现有组件
            const moveComp = dragNodes.value?.splice(dragIndex.value, 1)[0]
            moveComp && compData.value.splice(targetIndex, 0, moveComp)
        }

        resetDraggable()
        return true
    }

    /**
     * 处理组件拖拽到插槽中的事件
     * @param {any} evt 拖拽事件对象
     * @param {any} slotVal 插槽的相关信息
     * @param {any} comp 当前正在拖拽的组件信息
     * 此函数用于处理组件拖拽到特定插槽时的逻辑，包括是否允许拖拽、创建新组件或移动现有组件
     */
    const onDropSlot = function (evt: DragEvent | any, slotVal: SlotValue, comp: DragComponent): boolean {
        // 提前返回的条件判断
        if (comp.id === dragComp.value?.id) {
            return false
        }

        // 检查组件是否允许放置
        const isAllowed = !slotVal.allowComps || (slotVal.allowComps && allowCompsBtn({ allowComps: slotVal.allowComps }, name))
        if (!isAllowed) {
            message.error('拖拽组件不在允许的组件列表中')
            return false
        }

        if (isCreated.value) {
            const name = dragComp.value
            // 创建新组件
            const appendComp = slotVal.appendComps?.find(item => item.name === name)
            const obj = createComponent(comps.value[name], appendComp)
            console.log(slotVal)
            if(slotVal.children.length === 0) {
                slotVal.children = reactive([])
            }
            slotVal.children.push(obj)
        } else {
            // 移动现有组件
            const moveComp = dragNodes.value?.splice(dragIndex.value, 1)[0]
            if(slotVal.children.length === 0) {
                slotVal.children = reactive([])
            }
            moveComp && slotVal.children.push(moveComp)
        }

        return true
    }

    const onDragend = function (evt: any) {
        resetDraggable();
    }

    /**
     * 显示工具栏的函数
     * 
     * 本函数主要用于在用户鼠标悬停在某个组件上时，显示相关的工具栏
     * 它会检查组件是否可拖动，如果不可拖动，则设置悬停相关的状态
     * 
     * @param evt 鼠标事件对象，用于获取悬停元素
     * @param comp 悬停的组件实例，用于进一步操作或参考
     * @param index 悬停组件在数据数组中的索引，用于定位组件
     * @param compData 组件数据数组，包含所有组件的信息
     */
    const showToolbar = function (evt: any, comp: any, index: number, compData: any) {
        // 检查组件是否可拖动，如果不可拖动，则执行悬停逻辑
        if (!isDraggable.value) {
            // 设置当前悬停的组件实例
            hoverComp.value = compData[index]
            // 获取悬停元素，兼容不同的事件对象结构
            hoverRef.value = evt.target || evt.evt && evt.evt.target || evt.e.target
            // 设置当前悬停的组件数据数组
            hoverNodes.value = compData
            // 设置当前悬停组件的索引
            hoverIndex.value = index
        }
    }

    /**
     * 检查组件是否允许出现在某个插槽中
     * 
     * @param slotVal 插槽的值，包含允许出现在该插槽中的组件列表
     * @param name 要检查的组件名称
     * @returns 返回一个布尔值，表示组件是否允许出现在该插槽中
     */
    const allowCompsBtn = (slotVal: { allowComps: Array<AllowComp | string> }, name: string): boolean => {
        // 如果允许的组件列表为空，直接返回true
        if (!slotVal.allowComps?.length) {
            return true;
        }
        // 使用some方法简化查找逻辑
        return slotVal.allowComps.some(item => 
            typeof item === 'object' ? item.name === name : item === name
        );
    }
    return {
        // onDragStart,
        // onDragenter,
        onDrop,
        onDropSlot,
        onDragend,
        showToolbar
    }
}