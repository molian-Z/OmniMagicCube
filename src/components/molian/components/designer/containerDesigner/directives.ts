import {
    h,
    computed,
    withModifiers,
    inject,
    markRaw,
    withDirectives
} from 'vue'
import {
    compsRef,
    compsEl,
    selectedComp,
    globalAttrs
} from '../designerData'
import {
    isDraggable,
    dragIndex,
    dropIndex,
    useDraggable,
    onDragenter
} from '../draggable'
import { menuData } from './menus'
import {
    parseStyle
} from '@molian/utils/css-generator'
import vCustomDirectives from '@molian/utils/useDirectives'
import { isIf, isFor, isShow, getForEachList, isNotSlot } from '@molian/utils/useCore'
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
        } | any;
        index: number | any
    }, context: any) {
        let { slots, emits, expose }: any = context
        const comps: any = inject('mlComps')
        const message: any = inject('ml-message')
        const { showMenu, isOpenedMenu } = <any>inject('cmdMenu');
        const compData: any = computed({
            get() {
                return props.modelValue
            },
            set(val: any) {
                emits('update:modelValue', val)
            }
        })
        const {
            onDragStart,
            onDrop,
            onDragend,
            showToolbar
        } = useDraggable(comps, compData, message)
        const elRef = ref()
        // const onMouseEnter = function (evt, comp, index) {
        //   showToolbar(evt, comp, index, props.modelValue.value)
        // }

        const onClick = function (evt: any, comp: null, index: null) {
            // 常规组件存在多次点击
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

        const onContextmenu = function (evt: any, comp: null, index: null) {
            evt.preventDefault();
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
            showMenu({
                zIndex: 1200,
                x: evt.x,
                y: evt.y,
                minWidth: 130,
                customClass: "context-menu__list",
                items: menuData.value
            });
        }

        // props
        const propsData: any = computed(() => {
            let newProps: any = {}
            for (const key in props.comp.attrs) {
                if (Object.hasOwnProperty.call(props.comp.attrs, key)) {
                    const element = props.comp.attrs[key];
                    if (!!element.value) {
                        newProps[key] = element.value
                    }
                }
            }
            return newProps
        })

        const computedClass = computed(() => {
            return {
                'designer-comp': comps.value[props.comp.name].inheritAttrs !== false,
                'hiddenComps': dragIndex.value === props.index,
                'is-margin': dropIndex.value === props.index && isDraggable.value,
                'selectedComp': selectedComp && selectedComp.value && selectedComp.value.key === props.comp.key,
                'designer-comp-is-empty': !props.comp.directives.text && !isDraggable.value && isNotSlot(props.comp.slots)
            }
        })

        const variable = computed(() => {
            return globalAttrs.variable
        })

        // 自定义指令支持
        const currentTag = comps.value[props.comp.name].comp ? markRaw(comps.value[props.comp.name].comp) : comps.value[props.comp.name].name
        const renderDom: any = (domForAttr: { row?: any; index?: any; keyProps?: any; type?: any }) => {
            const { row, index, keyProps, type } = domForAttr
            const attrObj = {
                style: { ...parseStyle(props.comp.css, props.comp.key), ...!isShow(props.comp) && { display: 'none' } || {} },
                ...propsData.value,
                // onMouseenter: withModifiers(($event) => onMouseEnter($event, props.comp, props.index), ['self','native']), // 暂且取消经过选择
                onClick: withModifiers(($event: any) => onClick($event, props.comp, props.index), ['self', 'native', 'prevent', 'stop']),
                onContextmenu: withModifiers(($event: any) => onContextmenu($event, props.comp, props.index), ['self', 'native', 'prevent', 'stop']),
                // onDragstart: withModifiers((evt: any) => onDragStart(evt, props.comp), ['self', 'prevent']),
                // onDragend: onDragend,
                onDragover: withModifiers((evt: any) => onDragenter(props.index, props.comp), ['self', 'prevent']),
                //onDrop: withModifiers(($event: any) => onDrop($event, null, null), ['self', 'stop']),
                class: computedClass.value,
                id: props.comp.id,
                ['data-key']: props.comp.key,
                ref: elRef
            }
            if (index >= 0) {
                attrObj.key = keyProps.idKey && row[keyProps.idKey] || index || null
            }
            const nowSlots: {
                [key: string]: any;
            } = {}
            for (const key in slots) {
                if (Object.hasOwnProperty.call(slots, key)) {
                    const value = slots[key];
                    if (keyProps) {
                        const obj: any = {}
                        if (!!keyProps['dataKey']) {
                            if (type === 'object') {
                                obj[keyProps['dataKey']] = row.value
                            } else {
                                obj[keyProps['dataKey']] = row
                            }
                        }
                        if (!!keyProps['objectKey'] && type === 'object') {
                            obj[keyProps['objectKey']] = row.key
                        }
                        if (!!keyProps['indexKey'] && !!keyProps['dataKey']) {
                            obj[keyProps['indexKey']] = index
                        }
                        nowSlots[key] = value(obj)
                    } else {
                        nowSlots[key] = value({
                            row,
                            index
                        })
                    }
                }
            }
            if (typeof currentTag === 'string') {
                return withDirectives(h(currentTag, attrObj, nowSlots.default), [[vCustomDirectives, props.comp]])
            } else {
                return withDirectives(h(currentTag, attrObj, nowSlots), [[vCustomDirectives, props.comp]])
            }
        }
        let newForEachList = computed(() => {
            return getForEachList(props.comp, variable)
        })
        // 出现极端情况解决方案。如元素不存在以及无法对元素进行修改的情况
        // 监听inheritAttrs未false的组件
        //if (comps.value[props.comp.name].inheritAttrs === false) {
        watch(() => compsRef[props.comp.id], async (resetDom) => {
            //if(!resetDom?.forceWatch) return 
            await nextTick()
            resetDom.id = props.comp.id
            resetDom.dataset.key = props.comp.key
            //...propsData,
            resetDom.onclick = ($event: any) => onClick($event, props.comp, props.index)
            resetDom.oncontextmenu = ($event: any) => onContextmenu($event, props.comp, props.index)
            // resetDom.ondragstart = (evt: any) => onDragStart(evt, props.comp)
            // resetDom.ondragend = onDragend
            // 不可使用
            resetDom.ondragover = (evt: any) => {
                // console.log(evt.target)
                onDragenter(props.index, props.comp, null, compData)
            }
            // resetDom.ondrop = ($event: any) => onDrop($event, null, null)
            const styleData: any = computed(() => {
                return { ...parseStyle(props.comp.css, props.comp.key), ...!isShow(props.comp) && { display: 'none' } || {} }
            })
            // 监听并修改样式数据及更新视图组件
            watch(styleData, (newAttrs) => {
                Object.keys(newAttrs).forEach(item => {
                    resetDom.style[item] = newAttrs[item]
                })
            }, {
                immediate: true
            })

            // 监听并修改属性数据及更新视图组件
            watch(propsData, (newProps) => {
                Object.keys(newProps).forEach(item => {
                    resetDom[item] = newProps[item]
                })
            }, {
                immediate: true
            })

            // 监听并修改class数据及更新视图组件
            watch(computedClass, (newClass: any) => {
                Object.keys(newClass).forEach(item => {
                    if (!!newClass[item]) {
                        resetDom.classList.add(item)
                    } else {
                        resetDom.classList.remove(item)
                    }
                })
            }, {
                immediate: true
            })
        })
        //}
        expose(elRef)
        return () => [
            isFor(props.comp) && newForEachList.value.data.map((row: any, index: any) => {
                return renderDom({
                    row,
                    index,
                    keyProps: props.comp.directives.for,
                    type: newForEachList.value.type
                })
            }) || isIf(props.comp) && renderDom({}) || null
        ]
    }
}
