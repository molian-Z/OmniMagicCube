import {
    h,
    computed,
    withModifiers,
    inject,
    markRaw,
    withDirectives
} from 'vue'
import { watchDebounced } from '@vueuse/core'
import {
    compsRef,
    selectedComp,
    setSelectedComp,
    variableData
} from '../designerData'
import {
    isDraggable,
    dragIndex,
    dropIndex,
    useDraggable,
    onDragenter
} from '../draggable'
import { useMenus } from './menus'
import {
    parseStyle
} from '@molian/utils/css-generator'
import vCustomDirectives from '@molian/utils/useDirectives'
import { isIf, isFor, isShow, getForEachList, isNotSlot, parseProps, createSlot } from '@molian/utils/useCore'
export const directives = {
    props: <any>['comp', 'index', 'modelValue', 'parentNode', 'slots', 'inheritProps'],
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
    }, context: any) {
        let { slots, emits, expose }: any = context
        const comps: any = inject('mlComps')
        const message: any = inject("mlMessage")
        const { showMenu, hideMenu, ContextMenu } = <any>inject('cmdMenu');
        const compData: any = computed({
            get() {
                return props.modelValue
            },
            set(val: any) {
                emits('update:modelValue', val)
            }
        })
        const {
            showToolbar
        } = useDraggable(comps, compData, message)
        const elRef = ref()

        /**
         * 处理点击事件的函数，用于处理在组件上的点击行为
         * @param evt 点击事件对象，类型为any，以便兼容不同的事件格式
         * @param comp 被点击的组件，类型为any，因为组件的类型可能多种多样
         * @param index 组件的索引，表示是第几个同类型的组件被点击，类型为number
         * 
         * 此函数存在处理多次点击同一个常规组件的情况，通过尝试捕获的方式来停止事件的传播，
         * 并设置被选中的组件和显示工具栏
         */
        const onClick = function (evt: any, comp: any, index: number) {
            // 尝试阻止事件传播，以处理不同来源的事件格式
            try {
                if (evt.e) {
                    evt.e.stopPropagation()
                } else {
                    evt.stopPropagation()
                }
            } catch (e) {
                // 如果阻止事件传播过程中出现异常，打印异常信息
                console.log(e)
            }
            // 设置选中的组件
            setSelectedComp(comp)
            // 显示工具栏，传入事件对象、组件、组件索引和模型值
            showToolbar(evt, comp, index, props.modelValue)
        }
        const { menus } = useMenus()
        /**
         * 右键点击事件处理函数
         * 
         * @param {any} evt - 触发事件的对象
         * @param {any} comp - 被点击的组件
         * @param {number} index - 组件的索引位置
         */
        const onContextmenu = function (evt: any, comp: any, index: number) {
            // 阻止默认右键菜单的显示
            evt.preventDefault();
            try {
                // 兼容不同浏览器的事件对象
                if (evt.e) {
                    evt.e.stopPropagation()
                } else {
                    evt.stopPropagation()
                }
            } catch (e) {
                // 异常捕获，避免影响主程序运行
                console.log(e)
            }
            // 设置当前选中的组件
            setSelectedComp(comp)
            // 显示自定义右键菜单
            showToolbar(evt, comp, index, props.modelValue)
            // 确保DOM更新后，再显示右键菜单
            nextTick(() => {
                showMenu({
                    zIndex: 1200,
                    x: evt.x,
                    y: evt.y,
                    minWidth: 130,
                    // xOffset: 10,
                    // menuTransitionProps:{
                    //     name:'fade',
                    //     mode:'out-in'
                    // },
                    customClass: "context-menu__list",
                    items: menus.value
                });
            })
        }

        // 定义一个计算属性propsData，用于解析和计算组件的props
        const propsData: any = computed(() => {
            // 调用parseProps函数解析组件的props，并返回解析结果
            return parseProps(props.comp, comps.value, variableData.value, {})
        })
        // 根据组件的缓存配置计算需要发射的数据
        const emitData: any = computed(() => {
            // 初始化发射对象
            const emitObj: any = {}
            // 遍历组件的缓存配置
            for (const key in props.comp.cacheOn) {
                // 确保key是props.comp.cacheOn的直接属性
                if (Object.prototype.hasOwnProperty.call(props.comp.cacheOn, key)) {
                    // 处理以'update:'开头的键
                    if (key.startsWith('update:')) {
                        // 获取缓存的元素
                        const element = props.comp.cacheOn[key];
                        // 将键名转换为事件格式，首字母大写
                        const onStr = key.charAt(0).toUpperCase() + key.slice(1);
                        // 构造发射对象的属性名，以'on'开头，后跟转换后的键名
                        emitObj['on' + onStr] = element
                    }
                }
            }
            // 返回构造好的发射对象
            return emitObj
        })

        // 计算组件的类名，基于当前状态动态生成
        const computedClass = computed(() => {
            // 返回一个对象，其中包含不同条件下的类名
            return {
                // 如果当前组件允许继承属性，则添加' designer-comp'类
                'designer-comp': comps.value[props.comp.name] && comps.value[props.comp.name].inheritAttrs !== false,
                // 当拖动索引与当前组件索引相同时，添加'hiddenComps'类
                'hiddenComps': dragIndex.value === props.index,
                // 当放置索引与当前组件索引相同且组件可拖动时，添加'is-margin'类
                'is-margin': dropIndex.value === props.index && isDraggable.value,
                // 当选中的组件与当前组件相同时，添加'selectedComp'类
                'selectedComp': selectedComp && selectedComp.value && selectedComp.value.key === props.comp.key,
                // 当组件内没有文本指令且不可拖动且不是插槽时，添加'designer-comp-is-empty'类
                'designer-comp-is-empty': !props.comp.directives.text && !isDraggable.value && isNotSlot(props.comp.slots)
            }
        })

        // 自定义指令支持
        let currentTag = ""
        // 当前组件名不存在于comps.value中时，默认使用div作为当前标签
        if (!comps.value[props.comp.name]) {
            currentTag = 'div'
        } else {
            // 当前组件名存在于comps.value中时，根据其类型决定当前标签
            // 如果是组件实例，则使用markRaw标记原始对象以优化性能
            // 如果是组件名称，则直接使用该名称作为标签
            currentTag = comps.value[props.comp.name].comp ? markRaw(comps.value[props.comp.name].comp) : comps.value[props.comp.name].name
        }
        const renderDom: any = (domForAttr: { row?: any; index?: any; keyProps?: any; type?: any }) => {
            const { row, index, keyProps } = domForAttr
            // 根据组件指令创建插槽数据，如果存在for指令，则创建对应的插槽，否则使用继承的属性
            const slotData = props.comp.directives && props.comp.directives.for ? createSlot(row, index, props.comp, props.inheritProps) : props.inheritProps
            // 构建组件的属性对象，包括样式、数据、事件处理函数和类名等
            const attrObj = {
                style: { ...parseStyle(props.comp.css, props.comp.key), ...!isShow({ comp: props.comp, $slot: slotData, expandAPI: {} }) && { display: 'none' } || {} },
                // 合并组件的数据和发射的数据
                ...propsData.value,
                ...emitData.value,
                // setText({ comp: props.comp, $slot: slotData, expandAPI: {} })
                // 绑定点击事件处理函数，并使用修饰符
                onClick: withModifiers(($event: any) => onClick($event, props.comp, props.index), ['self', 'prevent', 'stop']),
                // 绑定上下文菜单事件处理函数，并使用修饰符
                onContextmenu: withModifiers(($event: any) => onContextmenu($event, props.comp, props.index), ['self', 'prevent', 'stop']),
                // 绑定拖拽悬停事件处理函数，并使用修饰符
                onDragover: withModifiers(() => onDragenter(props.index, props.comp, null, null), ['self', 'prevent']),
                // 绑定拖拽开始事件处理函数，并使用修饰符
                // onDragstart: withModifiers((evt: any) => onDragStart(evt, props.comp), ['self', 'prevent']),
                // 绑定拖拽结束事件处理函数
                // onDragend: onDragend,
                // 绑定拖放事件处理函数，并使用修饰符
                // onDrop: withModifiers(($event: any) => onDrop($event, null, null), ['self', 'stop']),
                // 绑定鼠标进入事件处理函数，并使用修饰符
                // onMouseenter: withModifiers(($event) => onMouseEnter($event, props.comp, props.index), ['self','native']), // 暂且取消经过选择
                // 设置组件的类名
                class: computedClass.value,
                // 设置组件的ID
                id: props.comp.id,
                // 设置组件的键值，用于识别组件
                ['data-key']: props.comp.key,
                // 表示是否在设计模式下
                isDesigner: true,
                // 设置组件的引用
                ref: elRef
            }
            if (index >= 0) {
                attrObj.key = keyProps.idKey && row[keyProps.idKey] || index || null
            }
            const nowSlots: {
                [key: string]: any;
            } = {}
            // 遍历slots对象的每个属性
            for (const key in slots) {
                if (Object.hasOwnProperty.call(slots, key)) {
                    const value = slots[key];
                    // 如果keyProps存在
                    if (keyProps) {
                        // 插槽写入 slotData
                        nowSlots[key] = value(slotData)
                    } else {
                        nowSlots[key] = () => value(slotData)
                    }
                }
            }
            // 当前标签为字符串类型时，执行特定逻辑
            if (typeof currentTag === 'string') {
                // 使用withDirectives和h函数创建带有自定义指令的VNode
                // withDirectives函数用于添加指令，h函数用于创建VNode
                // vCustomDirectives是自定义指令的名称，{ comp: props.comp, $slot: slotData }是指令的绑定参数
                return withDirectives(
                    h(currentTag, attrObj, nowSlots.default),
                        [
                            [vCustomDirectives({ comp: props.comp, $slot: slotData, variable: variableData.value, expandAPI: {} })]
                        ]
                    )
            } else {
                // 当前标签非字符串类型时，执行其他逻辑
                // 同样使用withDirectives和h函数创建带有自定义指令的VNode，但此处的nowSlots未指定默认值
                return withDirectives(h(currentTag, attrObj, nowSlots),
                    [
                        [vCustomDirectives({ comp: props.comp, $slot: slotData, variable: variableData.value, expandAPI: {} })]
                    ]
                )
            }
        }
        let newForEachList = computed(() => {
            return getForEachList(props.comp, variableData)
        })
        // 出现极端情况解决方案。如元素不存在以及无法对元素进行修改的情况
        // 监听inheritAttrs为false的组件
        if (comps.value[props.comp.name].inheritAttrs === false) {
            watchDebounced(compsRef[props.comp.id], (resetDom) => {
                //if(!resetDom?.forceWatch) return 
                // await nextTick()
                nextTick(() => {
                    resetDom.id = props.comp.id
                    resetDom.dataset.key = props.comp.key
                    //...propsData,
                    resetDom.onclick = ($event: any) => onClick($event, props.comp, props.index)
                    resetDom.oncontextmenu = ($event: any) => onContextmenu($event, props.comp, props.index)
                    // resetDom.ondragstart = (evt: any) => onDragStart(evt, props.comp)
                    // resetDom.ondragend = onDragend
                    // 不可使用
                    resetDom.ondragover = () => {
                        onDragenter(props.index, props.comp, null, compData)
                    }
                    const styleData: any = computed(() => {
                        return { ...parseStyle(props.comp.css, props.comp.key), ...!isShow({ comp: props.comp, $slot: props.inheritProps, expandAPI: {} }) && { display: 'none' } || {} }
                    })
                    // 监听并修改样式数据及更新视图组件
                    watchDebounced(styleData, (newAttrs) => {
                        Object.keys(newAttrs).forEach(item => {
                            resetDom.style[item] = newAttrs[item]
                        })
                    }, {
                        immediate: true,
                        debounce: 300,
                        maxWait: 1000,
                    });

                    // 监听并修改属性数据及更新视图组件
                    watchDebounced(() => propsData, (newProps) => {
                        Object.keys(newProps).forEach(item => {
                            try {
                                resetDom[item] = newProps[item]
                            } catch (error) {
                                console.log('属性不允许修改')
                            }

                        })
                    }, {
                        immediate: true,
                        debounce: 300,
                        maxWait: 1000,
                    });

                    // 监听并修改class数据及更新视图组件
                    watchDebounced(computedClass, (newClass: any) => {
                        Object.keys(newClass).forEach(item => {
                            if (!!newClass[item]) {
                                resetDom.classList.add(item)
                            } else {
                                resetDom.classList.remove(item)
                            }
                        })
                    }, {
                        immediate: true,
                        debounce: 300,
                        maxWait: 1000,
                    });
                })
            }, {
                debounce: 300,
                maxWait: 1000,
            })
        }
        expose(elRef.value)
        // 返回一个函数，根据不同的条件渲染DOM元素
        return () => [
            // 当newForEachList存在且有数据时，并且满足isFor条件，对数据进行map遍历，渲染每个元素
            !!newForEachList.value && newForEachList.value.data && newForEachList.value.data.length > 0 && !!isFor({ comp: props.comp, $slot: props.inheritProps, expandAPI: {} }) &&
            newForEachList.value.data.map((row: any, index: any) => {
                // 使用renderDom函数渲染特定的DOM元素，传入当前项、索引、for指令和类型
                return renderDom({
                    row,
                    index,
                    keyProps: props.comp.directives.for,
                    type: newForEachList.value.type
                })
            })
            // 当满足isIf条件时，渲染空的DOM元素
            || isIf({ comp: props.comp, $slot: props.inheritProps, expandAPI: {} }) && renderDom({})
            || null
        ]
    }
}
