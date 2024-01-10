import {
  h,
  computed,
  withModifiers,
  inject,
  markRaw,
} from 'vue'
import {
  selectedComp,
} from '../designerData'
import {
  isDraggable,
  dragIndex,
  dropIndex,
  useDraggable,
} from '../draggable'
import {
  parseStyle
} from '@molian/utils/css-generator'
export const directives = {
  props: <any>['comp', 'index', 'modelValue'],
  setup(props: {
    modelValue: any;
    comp: {
      directives: {
        if: {
          type: string; value: boolean | any
        };
        show: {
          type: string; value: boolean | any
        };
        for: {
          value: any; data: any[]; idkey: any
        }
      };
      key: any;
      name: string | number;
      attrs: { [x: string]: any };
      id: any; css: { [x: string]: any }
    }|any; 
    index: number | any
  }, {
    slots, emits
  }: any) {
    const comps: any = inject('mlComps')
    const message: any = inject('ml-message')
    const compData: any = computed({
      get() {
        return props.modelValue
      },
      set(val: any) {
        console.log(val)
        emits('update:modelValue', val)
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

    const onClick = function (evt: any, comp: null, index: null) {
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
      let btn: boolean = true
      if (props.comp.directives) {
        if (props.comp.directives.if) {
          if (props.comp.directives.if.type === 'function') {
            btn = !!props.comp.directives.if.value()
          } else {
            btn = !!props.comp.directives.if.value
          }
        }
      }
      return btn
    })

    const isShow = computed(() => {
      let btn: boolean = true
      if (props.comp.directives) {
        if (props.comp.directives.show) {
          if (props.comp.directives.show.type === 'function') {
            btn = !!props.comp.directives.show.value()
          } else {
            btn = !!props.comp.directives.show.value
          }
        }
      }
      return btn
    })

    const isFor = computed(() => {
      if (!props.comp.directives) {
        return false
      }
      if (!isIf.value) return false
      if (props.comp.directives && props.comp.directives.for && props.comp.directives.for.value) {
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
    const renderDom: any = (domForAttr: { row?: any; index?: any; keyProp?: any }) => {
      const { row, index, keyProp } = domForAttr
      // props
      const propsData: any = {}
      for (const key in props.comp.attrs) {
        if (Object.hasOwnProperty.call(props.comp.attrs, key)) {
          const element = props.comp.attrs[key];
          propsData[key] = element.value
        }
      }
      const attrObj = {
        id: props.comp.id,
        ['data-key']: props.comp.key,
        style: { ...parseStyle(props.comp.css, props.comp.key), ...!isShow.value && { display: 'none' } },
        ...propsData,
        // onMouseenter: withModifiers(($event) => onMouseEnter($event, props.comp, props.index), ['self', 'native']), // 暂且取消经过选择
        onClick: withModifiers(($event: any) => onClick($event, props.comp, props.index), ['native']),
        onDragend: onDragend,
        onDragover: withModifiers(() => onDragenter(props.index, props.comp), ['self', 'prevent']),
        onDrop: withModifiers(($event: any) => onDrop($event, null), ['self', 'stop']),
        class: computedClass.value
      }
      if (index >= 0) {
        attrObj.key = row[keyProp] || index || null
      }
      const nowSlots:{
        [key:string]:any;
      } = {}
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
    const forData = function(){
      const type = typeof props.comp.directives.for.value
      if(type === 'string'){
        return []
      }else{
        return props.comp.directives.for.value
      }
    }
    return () => [
      isFor.value && forData().map((item: any, index: any) => {
        return renderDom({
          row: item,
          index,
          keyProp: props.comp.directives.for.idkey
        })
      }) || renderDom({})
    ]
  }
}
