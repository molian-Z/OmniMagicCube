import {
    defineComponent,
    h,
    computed,
    shallowRef,
    onMounted
} from 'vue'

interface Slot {
    slots: any;
    attrs: any;
    tag: string;
}

interface ComponentAttrs {
    [key: string]: any;
}

interface RenderSlot {
    slots?: RenderSlot | RenderSlot[] | (() => any);
    attrs?: Record<string, any>;
    tag: string;
}

interface ComponentMap {
    [key: string]: {
        comp: string | Component<any>;
    };
}

// 添加最大递归深度限制
const MAX_RECURSION_DEPTH = 50;

/**
 * 创建一个渲染函数
 */
function createRender(
    slots: RenderSlot | RenderSlot[] | (() => any) | string,
    attrs: Record<string, any>,
    tag: string,
    comps: ComponentMap,
    depth = 0
): VNode {
    // 添加递归深度检查
    if (depth > MAX_RECURSION_DEPTH) {
        console.warn(`递归深度超过${MAX_RECURSION_DEPTH}层，可能存在循环引用`);
        return h('div', { class: 'recursion-error' }, '递归深度超限');
    }

    const processSlots = (slotData: any) => {
        if (Array.isArray(slotData)) {
            return slotData.map((item:any) => createRender(
                item.slots, 
                item.attrs, 
                item.tag, 
                comps, 
                depth + 1
            ));
        }

        if (typeof slotData === 'object' && slotData !== null) {
            return createRender(
                slotData.slots, 
                slotData.attrs, 
                slotData.tag, 
                comps, 
                depth + 1
            );
        }

        if (typeof slotData === 'function') {
            return slotData();
        }

        return () => slotData;
    };

    // 检查组件是否存在
    if (!comps[tag]) {
        console.warn(`组件 ${tag} 不存在`);
        return h('div', { class: 'component-not-found' }, `组件 ${tag} 不存在`);
    }

    return h(comps[tag], attrs, processSlots(slots));
}

// 组件缓存
const componentCache = new Map();

/**
 * 创建一个控制组件的工厂函数
 */
export const createControl = function (
    prefix: string,
    compName: string,
    newAttrs: Record<string, string | object | Function>,
    app?: any
) {
    // 检查缓存中是否已存在该组件
    const cacheKey = `${prefix}${compName}`;
    if (componentCache.has(cacheKey)) {
        return componentCache.get(cacheKey);
    }

    const component = defineComponent({
        inheritAttrs: false,
        setup(_, { attrs, slots }) {
            const comps = shallowRef(app?._context?.components || {});
            const controlTagRef = shallowRef(null);
            
            // 使用shallowRef减少深层响应式转换
            const currentSlots = shallowRef({});
            
            // 在mounted时获取组件，避免在setup中频繁查找
            onMounted(() => {
                try {
                    controlTagRef.value = comps.value[`${prefix}${compName}`];
                } catch (error) {
                    console.error(`组件${prefix}${compName}不存在:`, error);
                }
            });

            // 优化插槽处理，减少不必要的对象创建
            const updateSlots = () => {
                const slotMap: any = {};
                for (const key in slots) {
                    const mappedKey: any = newAttrs[key] || key;
                    slotMap[mappedKey] = slots[key];
                }
                currentSlots.value = slotMap;
            };
            
            // 初始化插槽
            updateSlots();

            // 使用memo优化属性计算
            const getAttrs = computed(() => {
                if (!Object.keys(attrs).length) {
                    return { ref: 'ref' };
                }

                const objAttrs: ComponentAttrs = { ref: 'ref' };
                
                // 优化数组处理函数
                const processArraySlot = (items: Slot[]) => {
                    if (!items.length) return;
                    
                    const processedSlots:any = {};
                    items.forEach((item, index) => {
                        processedSlots[`slot${index}`] = createRender(
                            item.slots, 
                            item.attrs, 
                            item.tag, 
                            comps.value
                        );
                    });
                    currentSlots.value = processedSlots;
                };

                // 优化属性处理函数
                const processAttribute = (key: string, currentAttr: any) => {
                    if (!currentAttr) return;
                    
                    if (Array.isArray(currentAttr)) {
                        processArraySlot(currentAttr);
                    } else if (!currentAttr._isSlot) {
                        objAttrs[key] = currentAttr;
                    } else {
                        const slotObj:any = currentSlots.value;
                        slotObj[key] = createRender(
                            currentAttr.slots,
                            currentAttr.attrs,
                            currentAttr.tag,
                            comps.value
                        );
                        currentSlots.value = slotObj;
                    }
                };

                // 优化属性遍历
                for (const key in attrs) {
                    const attrType = typeof newAttrs[key];
                    
                    try {
                        switch (attrType) {
                            case 'string':
                                objAttrs[newAttrs[key] as string] = attrs[key];
                                break;
                            case 'object':
                                if (newAttrs[key]) {
                                    Object.assign(objAttrs, newAttrs[key]);
                                }
                                break;
                            case 'function':
                                const newAttr = (newAttrs[key] as Function)(attrs[key]);
                                if (newAttr) {
                                    for (const attrKey in newAttr) {
                                        processAttribute(attrKey, newAttr[attrKey]);
                                    }
                                }
                                break;
                            default:
                                objAttrs[key] = attrs[key];
                        }
                    } catch (error) {
                        console.error(`处理属性 ${key} 时出错:`, error);
                        objAttrs[key] = attrs[key];
                    }
                }

                return objAttrs;
            });

            return () => {
                const tag = controlTagRef.value;
                if (!tag) {
                    return h('div', { class: 'component-loading' }, `加载组件 ${prefix}${compName} 中...`);
                }
                return h(tag, getAttrs.value, currentSlots.value);
            };
        }
    });

    // 将组件添加到缓存
    componentCache.set(cacheKey, component);
    return component;
};