import { computed, inject } from 'vue';
import { selectedComp, modelValue } from '../../designerData';
import { getNthParent } from '@molian/utils/useCore';

/**
 * 组件属性处理的共享逻辑
 */
export function useComponentProps() {
    const comps: any = inject('mlComps');

    /**
     * 获取当前组件的属性
     */
    const currentAttrs = computed(() => {
        if (!selectedComp.value) return {};
        return selectedComp.value.attrs;
    });

    /**
     * 获取当前组件的emits
     */
    const currentEmits = computed(() => {
        try {
            if (!selectedComp.value) return [];

            const component = comps.value?.[selectedComp.value.name];
            if (!component || !Array.isArray(component.emits)) {
                return [];
            }

            return component.emits
                .filter((item: string) => typeof item === 'string' && item.indexOf('update:') === 0)
                .map((item: string) => ({
                    prop: item.replace('update:', ''),
                    emit: item,
                }));
        } catch (error) {
            console.error('获取组件emits失败:', error);
            return [];
        }
    });

    /**
     * 获取当前组件的所有属性配置
     */
    const getAllProps = () => {
        if (!selectedComp.value || !comps.value) return {};
        return comps.value[selectedComp.value.name]?.props || {};
    };

    /**
     * 根据属性名称获取组件属性配置
     */
    const getProp = (keyName: string) => {
        if (!selectedComp.value) return undefined;
        return comps.value[selectedComp.value.name]?.props?.[keyName];
    };

    /**
     * 从父组件的nextAttrs中获取属性配置
     */
    const getParentProp = (keyName: string) => {
        if (!selectedComp.value || !selectedComp.value.id) {
            return undefined;
        }

        // 检查是否是首层组件（直接在根数组中的组件）
        const isRootLevel = modelValue.value.some(comp => comp.id === selectedComp.value.id);
        if (isRootLevel) {
            return undefined; // 首层组件没有父组件属性
        }

        // 获取直接父组件 (level = 1)
        const parentComp = getNthParent(modelValue.value, selectedComp.value.id, 1);
        if (!parentComp || !parentComp.nextAttrs) {
            return undefined;
        }

        return parentComp.nextAttrs[keyName];
    };

    /**
     * 判断属性是否应该被移除
     */
    const isRemoveAttr = (keyName: string) => {
        if (!selectedComp.value) return false;
        const prop = getProp(keyName);
        return !!prop?.removeAttr;
    };

    /**
     * 按order字段对对象进行排序
     */
    const sortObjectByKeys = (obj: any) => {
        if (!obj || typeof obj !== 'object') return obj;

        const sortedKeys = Object.keys(obj).sort((a, b) => {
            const orderA = obj[a]?.order ?? 100;
            const orderB = obj[b]?.order ?? 100;
            return orderA - orderB;
        });

        const sortedObj: any = {};
        sortedKeys.forEach(key => {
            sortedObj[key] = obj[key];
        });
        return sortedObj;
    };

    /**
     * 通用属性过滤函数
     * @param allProps 所有属性配置对象
     * @param attrs 当前属性值对象
     * @param showRemoveAttr 是否显示带有 removeAttr 标志的属性
     * @param contextName 上下文名称，用于错误日志
     */
    const filterPropsCommon = (
        allProps: Record<string, any>,
        attrs: Record<string, any>,
        showRemoveAttr: boolean = false,
        contextName: string = 'prop'
    ) => {
        const filteredProps: Record<string, any> = {};

        // 移除emits相关的属性
        const emitProps = new Set();
        if (Array.isArray(currentEmits.value)) {
            currentEmits.value.forEach((item: any) => {
                if (item?.prop) {
                    emitProps.add(item.prop);
                }
            });
        }
        
        Object.keys(allProps).forEach((key) => {
            // 跳过emits相关的属性
            if (emitProps.has(key)) return;

            const prop = allProps[key];
            if (!prop) return;

            // 根据 showRemoveAttr 参数决定是否显示该属性
            const shouldShow = showRemoveAttr ? !!prop.removeAttr : !prop.removeAttr;
            if (!shouldShow) return;

            // 检查 hidden 条件
            if (typeof prop.hidden === 'function') {
                try {
                    if (prop.hidden(attrs)) return;
                } catch (hiddenError) {
                    console.warn(`Hidden function error for ${contextName} ${key}:`, hiddenError);
                    return;
                }
            } else if (prop.hidden) {
                return;
            }

            // 存储属性配置对象，而不是属性值
            filteredProps[key] = prop;
        });

        return sortObjectByKeys(filteredProps) || {};
    };

    /**
     * 过滤当前组件属性的函数
     * @param showRemoveAttr 是否显示带有 removeAttr 标志的属性
     */
    const getFilteredProps = (showRemoveAttr = false) => {
        if (!selectedComp.value) return {};

        const allProps = getAllProps();
        const attrs = currentAttrs.value || {};
        
        return filterPropsCommon(allProps, attrs, showRemoveAttr, 'prop');
    };

    /**
     * 更新组件属性和事件处理函数
     */
    const updateAttrs = (item: any, value: any) => {
        if (value.type === 'variable') {
            if (value.value == undefined) {
                currentAttrs.value[item.prop] = undefined;
                selectedComp.value.on[item.emit] = undefined;
            } else {
                currentAttrs.value[item.prop] = value;
                if (selectedComp.value && value.value?.join?.('.')) {
                    selectedComp.value.on[item.emit] = {
                        type: 'function',
                        value: {
                            code: `this.vars.${value.value.join('.')} = value;`,
                            codeVar: ['value'],
                            functionMode: 'function',
                            modifiers: [],
                        },
                    };
                }
            }
        } else {
            currentAttrs.value[item.prop] = value;
        }
    };

    return {
        currentAttrs,
        currentEmits,
        getAllProps,
        getProp,
        getParentProp,
        getFilteredProps,
        filterPropsCommon,
        isRemoveAttr,
        sortObjectByKeys,
        updateAttrs,
    };
}

/**
 * 父组件属性处理的共享逻辑
 */
export function useParentProps() {
    const comps: any = inject('mlComps');
    const { currentEmits, sortObjectByKeys, filterPropsCommon } = useComponentProps();

    /**
     * 获取父组件数据
     */
    const parentComp = computed(() => {
        if (!selectedComp.value || !selectedComp.value.id) {
            return null;
        }

        // 检查是否是首层组件（直接在根数组中的组件）
        const isRootLevel = modelValue.value.some(comp => comp.id === selectedComp.value.id);
        if (isRootLevel) {
            return null; // 首层组件没有父组件
        }

        // 获取直接父组件 (level = 1)
        return getNthParent(modelValue.value, selectedComp.value.id, 1);
    });

    /**
     * 获取父组件的属性
     */
    const parentAttrs = computed(() => {
        if (parentComp.value) {
            return comps.value[parentComp.value.name].nextAttrs || {}
        } else {
            return {}
        }
    });

    /**
     * 获取过滤后的父组件属性配置
     * @param showRemoveAttr 是否显示具有 removeAttr 标志的属性
     * @returns 过滤后的父组件属性配置对象
     */
    const getFilteredParentProps = (showRemoveAttr: boolean = false) => {
        if (!parentComp.value || !comps.value[parentComp.value.name]) {
            return {};
        }

        const allParentProps = comps.value[parentComp.value.name].nextAttrs || {};
        const attrs = parentAttrs.value || {};
        
        return filterPropsCommon(allParentProps, attrs, showRemoveAttr, 'parent prop');
    };

    return {
        parentComp,
        parentAttrs,
        getFilteredParentProps,
    };
}