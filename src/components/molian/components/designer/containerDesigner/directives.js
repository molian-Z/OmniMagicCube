import {
  h,
  computed,
  withModifiers,
  inject,
  markRaw,
  ref
} from 'vue'
import {
  selectedComp,
  compsRef
} from '../designerData'
import {
  isDraggable,
  dragIndex,
  dropIndex,
  dropKey,
  useDraggable,
  dropType
} from '../draggable'
import {
  parseStyle
} from '@molian/utils/css-generator'
export const directives = {
  props: ['comp', 'index', 'modelValue'],
  setup(props, {
    slots
  }) {
    const comps = inject('mlComps')
    const message = inject('ml-message')
    const compData = computed({
      get() {
        return props.modelValue
      },
      set(val) {
        emit('update:modelValue', val)
      }
    })
    const {
      onDragenter,
      onDrop,
      onDragend,
      showToolbar
    } = useDraggable(comps, compData, message)

    // const onMouseEnter = function (evt, comp, index) {
    //   showToolbar(evt, comp, index, props.modelValue.value)
    // }

    const onClick = function (evt, comp, index) {
      try {
        if (evt.e) {
          evt.e.stopPropagation()
        } else {
          evt.stopPropagation()
        }
      } catch (e) {
        console.log(e)
      }
      selectedComp.value = props.comp
      showToolbar(evt, comp, index, props.modelValue)
    }

    const isIf = computed(() => {
      if (props.comp.directives && props.comp.directives.if) {
        const btn = typeof props.comp.directives.if === 'function' ? props.comp.directives.if() : props.comp.directives.if
        if (btn === false) {
          return false
        }
      } else {
        return true
      }
    })
    const isFor = computed(() => {
      if (!isIf.value) return false
      if (!props.comp.directives) {
        return false
      }
      if (props.comp.directives.for) {
        return true
      }
    })

    const computedClass = computed(() => {
      return {
        'designer-comp': true,
        'hiddenComps': dragIndex.value === props.index,
        'is-margin': dropIndex.value === props.index && isDraggable.value,
        'selectedComp': selectedComp && selectedComp.value && selectedComp.value.key === props.comp.key
      }
    })

    // 动态指令支持

    // 自定义指令支持
    const currentTag = markRaw(comps.value[props.comp.name].comp)
    const renderDom = ({
      row,
      index,
      keyProp
    }) => {
      const attrObj = {
        id: props.comp.id,
        ['data-key']: props.comp.key,
        style: parseStyle(props.comp.css),
        ...props.comp.attrs,
        // onMouseenter: withModifiers(($event) => onMouseEnter($event, props.comp, props.index), ['self', 'native']), // 暂且取消经过选择
        onClick: withModifiers(($event) => onClick($event, props.comp, props.index), ['native']),
        onDragend: onDragend,
        onDragover: withModifiers(() => onDragenter(props.index, props.comp), ['self', 'prevent']),
        onDrop: withModifiers(($event) => onDrop($event), ['self', 'stop']),
        class: computedClass.value
      }
      if (index >= 0) {
        attrObj.key = row[keyProp] || index || null
      }
      const nowSlots = {}
      for (const key in slots) {
        if (Object.hasOwnProperty.call(slots, key)) {
          const value = slots[key];
          nowSlots[key] = value({
            row,
            index
          })
        }
      }
      return h(currentTag, attrObj, nowSlots)
    }
    return () => [
      isFor.value && props.comp.directives.for.data.map((item, index) => {
        return renderDom({
          row: item,
          index,
          keyProp: props.comp.directives.for.key
        })
      }) || renderDom({})
    ]
  }
}