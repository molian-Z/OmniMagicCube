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
    compsEls,
    selectedComp,
    setSelectedComp,
    setZoomMode,
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
    }, { slots, emits, expose }: any) {
        const comps: any = inject('mlComps')
        const message: any = inject("mlMessage")
        const { showMenu } = <any>inject('cmdMenu');
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
        // 修改监听函数，在props.comp.value变化时清除缓存
        watch(() => props.comp.value, (newVal: any, oldVal: any) => {
            // 清除渲染缓存，强制重新渲染
            renderCache.clear()
            // 清除事件处理函数缓存
            eventHandlersCache.clear()
        }, {
            deep: true
        })
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
            setSelectedComp(comp, evt)
            // 显示工具栏，传入事件对象、组件、组件索引和模型值
            showToolbar(evt, comp, index, props.modelValue)
        }

        /** 
         * 处理双击事件的函数，用于处理在组件上的双击行为
         */
        const onDblclick = function (evt: any, comp: any) {
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
            setZoomMode(comp)
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
            setSelectedComp(comp, evt)
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
            return parseProps(props.comp.value, comps.value, variableData.value, {}, {}, 'designer')
        })
        // 根据组件的缓存配置计算需要发射的数据
        const emitData: any = computed(() => {
            // 初始化发射对象
            const emitObj: any = {}
            // 遍历组件的缓存配置
            for (const key in props.comp.value.cacheOn) {
                // 确保key是props.comp.value.cacheOn的直接属性
                if (Object.prototype.hasOwnProperty.call(props.comp.value.cacheOn, key)) {
                    // 处理以'update:'开头的键
                    if (key.startsWith('update:')) {
                        // 获取缓存的元素
                        const element = props.comp.value.cacheOn[key];
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
                'designer-comp': comps.value[props.comp.value.name] && comps.value[props.comp.value.name].inheritAttrs !== false,
                // 当拖动索引与当前组件索引相同时，添加'hiddenComps'类
                'hiddenComps': dragIndex.value === props.index,
                // 当放置索引与当前组件索引相同且组件可拖动时，添加'is-margin'类
                // 'is-margin': dropIndex.value === props.index && isDraggable.value,
                // 当选中的组件与当前组件相同时，添加'selectedComp'类
                'selectedComp': selectedComp && selectedComp.value && selectedComp.value.key === props.comp.value.key,
                // 当组件内没有文本指令且不可拖动且不是插槽时，添加'designer-comp-is-empty'类
                'designer-comp-is-empty': !props.comp.value.directives.text && !isDraggable.value && isNotSlot(props.comp.value.slots),
                [`comp_${props.comp.value.key}`]: true,
            }
        })

        // 自定义指令支持
        let currentTag = ""
        // 当前组件名不存在于comps.value中时，默认使用div作为当前标签
        if (!comps.value[props.comp.value.name]) {
            currentTag = props.comp.value.name || 'div'
        } else {
            // 当前组件名存在于comps.value中时，根据其类型决定当前标签
            // 如果是组件实例，则使用markRaw标记原始对象以优化性能
            // 如果是组件名称，则直接使用该名称作为标签
            currentTag = comps.value[props.comp.value.name].comp ? markRaw(comps.value[props.comp.value.name].comp) : comps.value[props.comp.value.name].name
        }
        // 修改事件处理函数缓存的实现
        const eventHandlersCache = new Map();

        /**
         * 创建事件处理函数
         * 此函数用于生成和缓存特定于组件实例和索引的事件处理函数
         * 它通过组合组件ID和索引来创建缓存键，以确保每个组件实例的事件处理函数是唯一的
         * 如果在缓存中找到现有的事件处理函数，则直接返回，以避免重复创建
         * 
         * @param comp 组件实例，用于访问组件ID和传递给事件处理函数
         * @param index 组件的索引，用于创建唯一的缓存键和传递给某些事件处理函数
         * @returns 返回一个包含各种事件处理函数的对象
         */
        const createEventHandlers = (comp: any, index: number) => {
            // 使用对象作为缓存键
            const cacheKey = `${comp.id}_${index}`;
            const cached = eventHandlersCache.get(cacheKey);
            if (cached) return cached;
            
            const handlers = {
                // 点击事件处理函数
                onClick: withModifiers(($event: any) => onClick($event, comp, index), ['self', 'prevent', 'stop']),
                // 双击事件处理函数
                ondblclick: withModifiers(($event: any) => onDblclick($event, comp), ['self', 'prevent', 'stop']),
                // 上下文菜单事件处理函数
                onContextmenu: withModifiers(($event: any) => onContextmenu($event, comp, index), ['self', 'prevent', 'stop']),
                // 拖拽悬浮事件处理函数
                onDragover: withModifiers(() => onDragenter(index, comp, null, null), ['self', 'prevent'])
            };
            
            eventHandlersCache.set(cacheKey, handlers);
            return handlers;
        };

        // 修改渲染缓存的实现
        const renderCache = new Map();
        /**
         * 渲染 DOM 元素
         * 此函数根据提供的属性生成或更新 DOM 元素，以用于组件渲染
         * 它通过计算属性、事件处理程序和插槽来创建或更新 VNode
         * 
         * @param domForAttr 包含行数据、索引、键属性和类型的对象
         * @returns 返回生成或更新的 VNode
         */
        const renderDom = (domForAttr: { row?: any; index?: any; keyProps?: any; type?: any }) => {
            const { row, index, keyProps } = domForAttr;
        
            // 使用更详细的缓存键，包含组件的关键属性
            const cacheKey = JSON.stringify({
                compId: props.comp.value.id,
                compKey: props.comp.value.key,  // 添加key属性
                compProps: JSON.stringify(propsData.value),  // 添加props的哈希值
                row: row?.id,
                index,
                keyProps: keyProps?.idKey
            });
        
            // 检查缓存，但对于for指令或props变化时不使用缓存
            const cached = renderCache.get(cacheKey);
            if (cached && !props.comp.value.directives?.for) {
                return cached;
            }
        
            // 优化插槽数据创建
            const slotData = props.comp.value.directives?.for
                ? createSlot(row, index, props.comp.value, props.inheritProps)
                : props.inheritProps;
        
            // 优化属性对象创建
            const attrObj = {
                style: computed(() => ({
                    ...(!isShow({ comp: props.comp.value, $slot: slotData, expandAPI: props.expandAPI }) && { display: 'none' } || {})
                })),
                ...propsData.value,
                ...emitData.value,
                ...createEventHandlers(props.comp.value, props.index),
                class: computedClass.value,
                id: props.comp.value.id,
                ['data-key']: props.comp.value.key,
                isDesigner: true,
                ref: elRef
            };
        
            // 优化 key 处理
            if (index >= 0) {
                attrObj.key = keyProps?.idKey ? row[keyProps.idKey] : index;
            }
        
            // 优化插槽处理
            const nowSlots:any = Object.entries(slots).reduce((acc, [key, value]) => {
                acc = { ...acc, [key]: keyProps ? (value as Function)(slotData) : () => (value as Function)(slotData) };
                return acc;
            }, {});
        
            // 创建 VNode
            const vnode = typeof currentTag === 'string'
                ? withDirectives(
                    h(currentTag, attrObj, nowSlots.default),
                    [[vCustomDirectives({ comp: props.comp.value, $slot: slotData, variable: variableData.value, expandAPI: props.expandAPI })]]
                )
                : withDirectives(
                    h(currentTag, attrObj, nowSlots),
                    [[vCustomDirectives({ comp: props.comp.value, $slot: slotData, variable: variableData.value, expandAPI: props.expandAPI })]]
                );
        
            // 缓存结果
            if (!props.comp.value.directives?.for) {
                renderCache.set(cacheKey, vnode);
            }
        
            return vnode;
        };
        const newForEachList = computed(() => {
            // 添加条件判断，避免不必要的计算
            if (!props.comp.value.directives?.for) return null;
            return getForEachList(props.comp.value, variableData, props.expandAPI)
        })
        // 出现极端情况解决方案。如元素不存在以及无法对元素进行修改的情况
        // 监听inheritAttrs为false的组件
        if (comps.value[props.comp.value.name] && comps.value[props.comp.value.name].inheritAttrs === false) {
            watchDebounced(compsEls[props.comp.value.id], (resetDom) => {
                //if(!resetDom?.forceWatch) return 
                // await nextTick()
                nextTick(() => {
                    resetDom.id = props.comp.value.id
                    resetDom.dataset.key = props.comp.value.key
                    //...propsData,
                    resetDom.onclick = ($event: any) => onClick($event, props.comp.value, props.index)
                    resetDom.oncontextmenu = ($event: any) => onContextmenu($event, props.comp.value, props.index)
                    // resetDom.ondragstart = (evt: any) => onDragStart(evt, props.comp.value)
                    // resetDom.ondragend = onDragend
                    // 不可使用
                    resetDom.ondragover = () => {
                        onDragenter(props.index, props.comp.value, null, compData)
                    }
                    const batchUpdateDOM = (resetDom: HTMLElement | any) => {
                        const updates = reactive({
                            styles: computed(() => {
                                return { ...!isShow({ comp: props.comp.value, $slot: props.inheritProps, expandAPI: props.expandAPI }) && { display: 'none' } || {} }
                            }),
                            props: computed(() => propsData.value),
                            classes: computed(() => computedClass.value)
                        });
                        watchDebounced(() => updates, (newValues) => {
                            nextTick(() => {
                                // 批量处理样式更新
                                if (newValues.styles) {
                                    Object.assign(resetDom.style, newValues.styles);
                                }
                                // 批量处理属性更新
                                if (newValues.props) {
                                    Object.entries(newValues.props).forEach(([key, value]) => {
                                        try {
                                            resetDom[key] = value;
                                        } catch (error) {
                                            console.warn(`属性 ${key} 不可修改`);
                                        }
                                    });
                                }
                                // 批量处理类名更新
                                if (newValues.classes) {
                                    resetDom.className = Object.entries(newValues.classes)
                                        .filter(([, active]) => active)
                                        .map(([className]) => className)
                                        .join(' ');
                                }
                            });
                        }, {
                            immediate: true,
                            debounce: 300,
                            maxWait: 1000
                        });
                    };
                    batchUpdateDOM(resetDom)
                })
            }, {
                debounce: 300,
                maxWait: 1000,
            })
        }
        onUnmounted(() => {
            eventHandlersCache.clear();
            renderCache.clear();
        });
        expose(elRef)
        // 返回一个函数，根据不同的条件渲染DOM元素
        return () => [
            // 当newForEachList存在且有数据时，并且满足isFor条件，对数据进行map遍历，渲染每个元素
            !!newForEachList.value && newForEachList.value.data && newForEachList.value.data.length > 0 && !!isFor({ comp: props.comp.value, $slot: props.inheritProps, expandAPI: props.expandAPI }) &&
            newForEachList.value.data.map((row: any, index: any) => {
                // 使用renderDom函数渲染特定的DOM元素，传入当前项、索引、for指令和类型
                return renderDom({
                    row,
                    index,
                    keyProps: props.comp.value.directives.for,
                    type: newForEachList.value.type
                })
            })
            // 当满足isIf条件时，渲染空的DOM元素
            || isIf({ comp: props.comp.value, $slot: props.inheritProps, expandAPI: props.expandAPI }) && renderDom({})
            || null
        ]
    }
}
