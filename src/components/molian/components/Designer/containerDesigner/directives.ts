import {
    h,
    computed,
    inject,
    markRaw,
    withDirectives,
    watch,
    onUnmounted,
    shallowRef,
    unref
} from 'vue'
import {
    compsEls,
    selectedComp,
    variableData
} from '../designerData'
import {
    dragIndex,
    isDraggable,
} from '../draggable'
import vCustomDirectives from '@molian/utils/useDirectives'
import { isIf, isFor, isShow, getForEachList, isNotSlot, parseProps, createSlot } from '@molian/utils/useCore'
export const directives = {
    props: <any>['comp', 'index', 'modelValue', 'parentNode', 'slots', 'inheritProps', 'expandAPI'],
    setup(props: {
        modelValue: any;
        parentNode: any;
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
        index: number | any;
        slots: any;
        inheritProps: any;
        expandAPI: any;
    }, { slots, expose }: any) {
        const comps: any = inject('mlComps')
        const elRef = shallowRef()

        const propsData: any = computed(() => {
            // 调用parseProps函数解析组件的props，并返回解析结果
            return parseProps(props.comp.value, comps.value, variableData.value, {}, {}, 'designer')
        })
        
        // 简化的emit数据计算
        const emitData = computed(() => {
            const cacheOn = props.comp.value.cacheOn
            if (!cacheOn || typeof cacheOn !== 'object') {
                return {}
            }
            
            const emitObj: Record<string, any> = {}
            
            Object.entries(cacheOn).forEach(([key, element]) => {
                if (key.startsWith('update:')) {
                    const onStr = key.charAt(0).toUpperCase() + key.slice(1)
                    emitObj['on' + onStr] = element
                }
            })
            
            return emitObj
        })
        // 简化的类名计算
        const computedClass = computed(() => {
            const comp = props.comp.value
            const compConfig = unref(comps)[comp.name]
            
            return {
                'designer-comp': compConfig && compConfig.inheritAttrs !== false,
                'hiddenComps': unref(dragIndex) === props.index,
                'selectedComp': unref(selectedComp)?.key === comp.key,
                'designer-comp-is-empty': !comp.directives?.text && !unref(isDraggable) && isNotSlot(comp.slots),
                [`comp_${comp.key}`]: true
            }
        })

        // 简化的组件标签计算
        const currentTag = computed(() => {
            const comp = props.comp.value
            const compConfig = unref(comps)[comp.name]
            
            if (!compConfig) {
                return comp.name || 'div'
            }
            
            return compConfig.comp 
                ? markRaw(compConfig.comp) 
                : compConfig.name
        })

        /**
         * 简化的DOM渲染函数
         * @param domForAttr 渲染参数对象
         * @returns VNode
         */
        const renderDom = (domForAttr: { row?: any; index?: any; keyProps?: any; type?: any }) => {
            const { row, index, keyProps } = domForAttr
            const comp = props.comp.value
            
            // 插槽数据创建
            const slotData = comp.directives?.for
                ? createSlot(row, index, comp, props.inheritProps)
                : props.inheritProps
            
            // 样式计算
            const styleComputed = computed(() => {
                const showResult = isShow({ 
                    comp, 
                    $slot: slotData, 
                    expandAPI: props.expandAPI 
                })
                return showResult ? {} : { display: 'none' }
            })
            
            // 构建属性对象
            const attrObj: any = {
                style: styleComputed,
                ...unref(propsData),
                ...unref(emitData),
                class: unref(computedClass),
                id: comp.id,
                'data-key': comp.key,
                isDesigner: true,
                ref: (el: any) => {
                    elRef.value = el
                }
            }
            
            // key处理
            if (typeof index === 'number' && index >= 0) {
                attrObj.key = keyProps?.idKey ? row?.[keyProps.idKey] : index
            }
            
            // 插槽处理
            const nowSlots = Object.fromEntries(
                Object.entries(slots).map(([key, value]) => [
                    key,
                    keyProps 
                        ? (value as Function)(slotData) 
                        : () => (value as Function)(slotData)
                ])
            )
            
            // 创建VNode
            const currentTagValue = unref(currentTag)
            const directiveConfig = {
                comp,
                $slot: slotData,
                variable: unref(variableData),
                expandAPI: props.expandAPI
            }
            
            const vnode = typeof currentTagValue === 'string'
                ? withDirectives(
                    h(currentTagValue, attrObj, nowSlots.default),
                    [[vCustomDirectives(directiveConfig)]]
                )
                : withDirectives(
                    h(currentTagValue, attrObj, nowSlots),
                    [[vCustomDirectives(directiveConfig)]]
                )
            return vnode
        }
        /**
         * 简化的for循环列表数据
         */
        const newForEachList = computed(() => {
            const comp = props.comp.value
            if (!comp.directives?.for) return null
            
            return getForEachList(comp, unref(variableData), props.expandAPI)
        })
        // 简化的inheritAttrs为false的组件处理
        if (comps.value[props.comp.value.name]?.inheritAttrs === false) {
            const watchSource = compsEls[props.comp.value.id]
            if (watchSource) {
                watch(watchSource, (resetDom) => {
                    if (!resetDom) return
                    
                    nextTick(() => {
                        // 设置基础属性
                        resetDom.id = props.comp.value.id
                        resetDom.dataset.key = props.comp.value.key
 
                        // 简化的样式和类名更新
                        watch([computedClass, () => isShow({ 
                            comp: props.comp.value, 
                            $slot: props.inheritProps, 
                            expandAPI: props.expandAPI 
                        })], ([classes, showResult]) => {
                            if (resetDom) {
                                resetDom.className = Object.entries(classes)
                                    .filter(([, active]) => active)
                                    .map(([className]) => className)
                                    .join(' ')
                                
                                if (!showResult) {
                                    resetDom.style.display = 'none'
                                } else {
                                    resetDom.style.display = ''
                                }
                            }
                        }, { immediate: true })
                    })
                })
            }
        }
        expose(elRef)
        /**
         * 简化的渲染函数
         */
        return () => {
            const comp = props.comp.value
            const slotData = props.inheritProps
            const expandAPIValue = props.expandAPI
            
            // 处理for指令渲染
            const forListData = unref(newForEachList)
            if (forListData?.data?.length > 0 && isFor({ comp, $slot: slotData, expandAPI: expandAPIValue })) {
                return forListData.data.map((row: any, index: number) => 
                    renderDom({
                        row,
                        index,
                        keyProps: comp.directives?.for,
                        type: forListData.type
                    })
                )
            }
            
            // 处理条件渲染
            if (isIf({ comp, $slot: slotData, expandAPI: expandAPIValue })) {
                return [renderDom({})]
            }
            
            return []
        }
    }
}

export default directives
