
import { modelValue, fullLoading, createComp } from '@molianComps/Designer/designerData';
import { currentRegComps } from '@molian/utils/compsConfig';
/**
 * 处理 AI 响应变更并应用到设计器
 * @param {AIResponse.Response} response - AI 响应数据
 * @returns {object} - 应用变更的结果信息
 */
export const applyAIChanges = (response: any) => {
    try {
        if (fullLoading && fullLoading.value) {
            fullLoading.value = true;
        }

        // 如果没有变更数据，直接返回
        if (!response || !response.changes || !response.changes.length) {
            console.log("没有可应用的 AI 变更");
            return {
                success: false,
                message: "没有可应用的 AI 变更",
                successCount: 0,
                totalCount: 0,
                successIndices: [],
                failedIndices: [],
                details: []
            };
        }

        // 获取目标组件
        const targetComponent = response.component?.id
            ? findComponentById(modelValue.value, response.component.id)
            : modelValue.value; // 如果没有指定组件ID，使用整个模型
        if (!targetComponent && response.component?.id) {
            console.log(`找不到 ID 为 ${response.component.id} 的组件`);
            return {
                success: false,
                message: `找不到 ID 为 ${response.component.id} 的组件`,
                successCount: 0,
                totalCount: response.changes.length,
                successIndices: [],
                failedIndices: Array.from({ length: response.changes.length }, (_, i) => i),
                details: response.changes.map((_:any, i:number) => ({ 
                    index: i, 
                    success: false, 
                    message: `找不到目标组件` 
                }))
            };
        }

        // 创建模型的深拷贝，以便在出错时可以回滚
        const originalModel = JSON.parse(JSON.stringify(modelValue.value));

        let successCount = 0;
        const totalChanges = response.changes.length;
        const successIndices: number[] = [];
        const failedIndices: number[] = [];
        const details: Array<{index: number, success: boolean, message: string}> = [];

        try {
            // 处理每个变更
            for (let i = 0; i < response.changes.length; i++) {
                const change = response.changes[i];
                const { type, path } = change;
                try {
                    // 解析属性路径，获取目标属性信息，传入操作类型
                    const targetInfo = resolvePropertyPath(targetComponent, path, type);
                    if (!targetInfo) {
                        failedIndices.push(i);
                        details.push({ 
                            index: i, 
                            success: false, 
                            message: `无法解析路径 ${path}` 
                        });
                        continue;
                    }
                    // 对于非添加操作，如果目标不存在且不是新属性，则跳过
                    if (targetInfo.target === null && !targetInfo.isNewProp && type !== 'added') {
                        console.log(`路径 ${path} 对应的目标不存在，无法执行 ${type} 操作`);
                        failedIndices.push(i);
                        details.push({ 
                            index: i, 
                            success: false, 
                            message: `路径 ${path} 对应的目标不存在，无法执行 ${type} 操作` 
                        });
                        continue;
                    }

                    // 根据变更类型应用不同的操作
                    switch (type) {
                        case 'added':
                            // 添加新属性或组件
                            applyAddChange(targetInfo, change);
                            successCount++;
                            successIndices.push(i);
                            details.push({ 
                                index: i, 
                                success: true, 
                                message: `成功添加 ${path}` 
                            });
                            break;
                        case 'modified':
                            // 修改现有属性
                            applyModifyChange(targetInfo, change);
                            successCount++;
                            successIndices.push(i);
                            details.push({ 
                                index: i, 
                                success: true, 
                                message: `成功修改 ${path}` 
                            });
                            break;
                        case 'removed':
                            // 移除属性或组件
                            applyRemoveChange(targetInfo, change);
                            successCount++;
                            successIndices.push(i);
                            details.push({ 
                                index: i, 
                                success: true, 
                                message: `成功移除 ${path}` 
                            });
                            break;
                        case 'reordered':
                            // 重新排序子组件
                            applyReorderChange(targetInfo, change);
                            successCount++;
                            successIndices.push(i);
                            details.push({ 
                                index: i, 
                                success: true, 
                                message: `成功重排序 ${path}` 
                            });
                            break;
                        default:
                            console.log(`不支持的变更类型: ${type}`);
                            failedIndices.push(i);
                            details.push({ 
                                index: i, 
                                success: false, 
                                message: `不支持的变更类型: ${type}` 
                            });
                    }
                } catch (error) {
                    console.error(`应用变更 ${path} 失败:`, error);
                    failedIndices.push(i);
                    details.push({ 
                        index: i, 
                        success: false, 
                        message: `应用变更失败: ${error instanceof Error ? error.message : String(error)}` 
                    });
                }
            }

            return {
                success: successCount > 0,
                message: `成功应用 ${successCount}/${totalChanges} 个变更`,
                successCount,
                totalCount: totalChanges,
                successIndices,
                failedIndices,
                details
            };
        } catch (error) {
            // 如果出现错误，回滚到原始模型
            console.error("应用 AI 变更失败，正在回滚:", error);
            modelValue.value = originalModel;
            return {
                success: false,
                message: `应用 AI 变更失败: ${error instanceof Error ? error.message : String(error)}`,
                successCount: 0,
                totalCount: totalChanges,
                successIndices: [],
                failedIndices: Array.from({ length: totalChanges }, (_, i) => i),
                details: response.changes.map((_:any, i:number) => ({ 
                    index: i, 
                    success: false, 
                    message: `应用失败并回滚` 
                }))
            };
        }
    } catch (error) {
        console.error("应用 AI 变更失败:", error);
        return {
            success: false,
            message: `应用 AI 变更失败: ${error instanceof Error ? error.message : String(error)}`,
            successCount: 0,
            totalCount: response?.changes?.length || 0,
            successIndices: [],
            failedIndices: response?.changes ? Array.from({ length: response.changes.length }, (_, i) => i) : [],
            details: []
        };
    } finally {
        if (fullLoading && fullLoading.value) {
            fullLoading.value = false;
        }
    }
};

/**
 * 根据 ID 查找组件
 * @param {any} model - 组件模型
 * @param {string} id - 组件 ID
 * @returns {any} - 找到的组件
 */
const findComponentById = (model: any, id: string): any => {
    if (!model) return null;

    // 检查当前组件
    if (model.id === id) {
        return model;
    }

    // 检查子组件数组
    if (Array.isArray(model)) {
        for (const item of model) {
            const found = findComponentById(item, id);
            if (found) return found;
        }
        return null;
    }

    // 检查子组件
    if (model.children) {
        if (Array.isArray(model.children)) {
            for (const child of model.children) {
                const found = findComponentById(child, id);
                if (found) return found;
            }
        } else {
            const found = findComponentById(model.children, id);
            if (found) return found;
        }
    }

    // 检查插槽
    if (model.slots) {
        for (const slotName in model.slots) {
            if (Array.isArray(model.slots[slotName])) {
                for (const slotItem of model.slots[slotName]) {
                    const found = findComponentById(slotItem, id);
                    if (found) return found;
                }
            } else if (model.slots[slotName] && model.slots[slotName].children) {
                // 处理插槽中的 children 数组
                const slotChildren = model.slots[slotName].children;
                if (Array.isArray(slotChildren)) {
                    for (const child of slotChildren) {
                        const found = findComponentById(child, id);
                        if (found) return found;
                    }
                } else {
                    const found = findComponentById(slotChildren, id);
                    if (found) return found;
                }
            }
        }
    }

    return null;
};

/**
 * 解析属性路径，获取目标属性信息
 * @param {any} component - 组件对象
 * @param {string} path - 属性路径
 * @param {string} operationType - 操作类型，如 'added', 'modified', 'removed', 'reordered'
 * @returns {any} - 目标属性信息
 */
const resolvePropertyPath = (component: any, path: string, operationType: string = '') => {
    if (!component || !path) return null;

    // 处理路径格式，支持点号和斜杠分隔
    const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
    // 支持点号分隔的路径
    const pathParts = normalizedPath.split('.');
    // 从组件开始查找
    let current: any = component;
    let parent: any = null;
    let prop = null;
    
    // 检查是否是插槽相关路径
    const isSlotPath = normalizedPath.startsWith('slots.');
    // 只有添加操作允许创建不存在的插槽路径
    const canCreatePath = operationType === 'added' || !isSlotPath;

    // 遍历路径部分
    for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i];
        parent = current;

        // 处理数组索引，如 children[0]
        const arrayMatch = part.match(/^(\w+)\[(\d+)\]$/);
        if (arrayMatch) {
            const [, propName, indexStr] = arrayMatch;
            const index = parseInt(indexStr, 10);
            prop = index;

            // 先访问属性
            if (!parent[propName] || !Array.isArray(parent[propName])) {
                // 特殊处理插槽的 children
                if (propName === 'children' && parent.children === undefined && parent.type === 'slot') {
                    // 初始化插槽的 children 数组
                    parent.children = [];
                } else {
                    console.log(`路径 ${path} 中的 ${propName} 不是数组或不存在`);
                    return null;
                }
            }

            // 检查数组索引是否越界
            if (index >= parent[propName].length) {
                return null;
            }

            // 如果是最后一部分，返回父数组和索引
            if (i === pathParts.length - 1) {
                return {
                    target: parent[propName][index],
                    parent: parent[propName],
                    prop: index,
                    isArray: true
                };
            }

            // 否则继续向下访问
            current = parent[propName][index];
            if (current === undefined && i < pathParts.length - 1) {
                // 只有在允许创建路径时才创建中间对象
                if (canCreatePath) {
                    current = {};
                    parent[propName][index] = current;
                } else {
                    console.log(`路径 ${path} 中的 ${propName}[${index}] 不存在，且不允许创建`);
                    return null;
                }
            }
        } else {
            prop = part;

            // 普通属性访问
            if (!(part in current)) {
                // 如果属性不存在但是是最后一个部分，可能是要添加的新属性
                if (i === pathParts.length - 1) {
                    return {
                        target: null,
                        parent: current,
                        prop: part,
                        isNewProp: true
                    };
                }

                // 如果是中间路径且不存在，创建空对象
                if (i < pathParts.length - 1) {
                    // 只有在允许创建路径时才创建空对象
                    if (canCreatePath) {
                        current[part] = {};
                    } else {
                        return null;
                    }
                } else {
                    return null;
                }
            }

            // 如果是最后一部分，返回父对象和属性名
            if (i === pathParts.length - 1) {
                return {
                    target: current[part],
                    parent: current,
                    prop: part
                };
            }

            // 否则继续向下访问
            current = current[part];
        }

        if (!current && i < pathParts.length - 1) {
            console.log(`路径 ${path} 中的 ${part} 解析后为 null 或 undefined`);
            return null;
        }
    }

    // 如果路径为空，返回组件本身
    return { target: component, parent: null, prop: null };
};

/**
 * 应用添加变更
 * @param {any} targetInfo - 目标属性信息
 * @param {any} change - 变更信息
 */
const applyAddChange = (targetInfo: any, change: any) => {
    const { value, valueType } = change;

    if (!targetInfo) return;
    const { parent, prop, isArray, isNewProp } = targetInfo;
    // 处理数组元素添加
    if (isArray) {
        // 查找组件配置
        const compConfig = currentRegComps.value[value.name]
        // 如果添加的是组件对象且有type属性，使用createComp初始化
        if (value && typeof value === 'object' && compConfig) {
                // 使用createComp创建基础组件结构
                const baseComp = createComp(compConfig);
                // 合并AI提供的属性到基础组件
                const mergedComp = deepMerge(baseComp, value);
                // 添加到数组的特定位置
                parent.splice(prop, 0, mergedComp);
                return;
        }
    } else if (isNewProp) {
        // 添加新属性，确保符合类型定义
        if (prop.startsWith('attrs.') || (parent.attrs && prop in parent.attrs)) {
            // 属性应该具有 type 和 value 结构
            const type = valueType || typeof value;
            parent[prop] = {
                type,
                value
            };
        } else {
            // 非属性字段直接赋值
            parent[prop] = value;
        }
    } else if (Array.isArray(parent)) {
        // 如果添加的是组件对象且有type属性，使用createComp初始化
        if (value && typeof value === 'object' && value.type) {
            // 查找组件配置
            const compConfig = currentRegComps.value[value.name]
            if (compConfig) {
                // 使用createComp创建基础组件结构
                const baseComp = createComp(compConfig);
                // 合并AI提供的属性到基础组件
                const mergedComp = deepMerge(baseComp, value);
                // 添加到数组末尾
                parent.push(mergedComp);
                return;
            }
        }
        // 如果不是组件或找不到组件配置，直接添加
        parent.push(value);
    } else if (parent && prop) {
        // 添加或修改属性，确保符合类型定义
        if (prop.startsWith('attrs.') || (parent.attrs && prop in parent.attrs)) {
            // 属性应该具有 type 和 value 结构
            const type = valueType || typeof value;
            parent[prop] = {
                type,
                value
            };
        } else {
            // 非属性字段直接赋值
            parent[prop] = value;
        }
    }
};

/**
 * 深度合并两个对象
 * @param {any} target - 目标对象
 * @param {any} source - 源对象
 * @returns {any} - 合并后的对象
 */
const deepMerge = (target: any, source: any): any => {
    if (!source) return target;
    
    const result = { ...target };
    
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (source[key] === null || source[key] === undefined) {
                continue;
            }
            
            if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (typeof target[key] === 'object' && !Array.isArray(target[key])) {
                    result[key] = deepMerge(target[key], source[key]);
                } else {
                    result[key] = { ...source[key] };
                }
            } else if (Array.isArray(source[key])) {
                result[key] = [...source[key]];
            } else {
                result[key] = source[key];
            }
        }
    }
    
    return result;
};

/**
 * 应用修改变更
 * @param {any} targetInfo - 目标属性信息
 * @param {any} change - 变更信息
 */
const applyModifyChange = (targetInfo: any, change: any) => {
    const { to, valueType, path } = change;
    if (!targetInfo) return;
    const { parent, prop, isArray } = targetInfo;

    // 检查是否是插槽相关路径
    const isSlotPath = path && path.startsWith('slots.');
    
    if (isArray) {
        // 修改数组元素
        parent[prop] = to;
    } else if (parent && prop) {
        // 检查属性是否存在
        if (!parent[prop]) {
            // 如果是插槽相关路径且属性不存在，则跳过创建
            if (isSlotPath) {
                console.log(`插槽路径 ${path} 不存在，跳过修改操作`);
                return;
            }
            
            // 如果属性不存在，创建一个新的属性对象
            const type = valueType || typeof to;
            parent[prop] = {
                type,
                value: to
            };
        }
        // 检查是否是属性对象（具有 type 和 value 结构）
        else if (typeof parent[prop] === 'object' && 'value' in parent[prop]) {
            // 修改属性对象的 value 字段
            parent[prop].value = to;
        } else {
            // 创建符合规范的属性结构
            const type = valueType || typeof to;
            parent[prop] = {
                type,
                value: to
            };
        }
    }
};

/**
 * 应用移除变更
 * @param {any} targetInfo - 目标属性信息
 * @param {any} change - 变更信息
 */
const applyRemoveChange = (targetInfo: any, change: any) => {
    if (!targetInfo) return;

    const { parent, prop, isArray } = targetInfo;

    if (isArray) {
        // 从数组中移除
        parent.splice(prop, 1);
    } else if (parent && prop) {
        // 删除属性
        delete parent[prop];
    }
};

/**
 * 应用重排序变更
 * @param {any} targetInfo - 目标属性信息
 * @param {any} change - 变更信息
 */
const applyReorderChange = (targetInfo: any, change: any) => {
    const { to, from, path } = change;

    // 基本验证
    if (!targetInfo || !Array.isArray(to)) {
        console.log('重排序变更缺少有效的目标信息或排序数组');
        return;
    }

    // 检查是否是插槽相关路径
    const isSlotPath = path && path.startsWith('slots.');

    const { parent, prop, target } = targetInfo;

    // 验证目标数组是否存在
    if (Array.isArray(target)) {
        // 验证源数组和目标数组长度是否匹配
        if (Array.isArray(from) && from.length !== target.length) {
            console.log(`重排序源数组长度(${from.length})与目标数组长度(${target.length})不匹配`);
            // 可以继续执行，但记录警告
        }

        // 检查目标数组是否为空
        if (target.length === 0) {
            console.log('目标数组为空，无法进行重排序');
            return; // 如果目标数组为空，停止重排序
        }

        // 直接替换目标数组
        while (target.length > 0) {
            target.pop();
        }
        to.forEach(item => target.push(item));
    } else if (parent && prop) {
        // 检查父对象中的属性是否为数组
        if (!Array.isArray(parent[prop])) {
            // 如果是插槽相关路径且属性不是数组，则跳过创建
            if (isSlotPath) {
                console.log(`插槽路径 ${path} 对应的属性不是数组，跳过重排序操作`);
                return;
            }
            
            console.log(`路径对应的属性 ${prop} 不是数组，无法进行重排序`);
            return; // 如果属性不是数组，停止重排序
        }

        // 验证源数组和目标数组长度是否匹配
        if (Array.isArray(from) && from.length !== parent[prop].length) {
            console.log(`重排序源数组长度(${from.length})与目标数组长度(${parent[prop].length})不匹配`);
            // 可以继续执行，但记录警告
        }

        // 替换父对象中的数组属性
        parent[prop] = [...to];
    } else {
        console.log('无法应用重排序变更：缺少有效的目标或父对象');
    }
};