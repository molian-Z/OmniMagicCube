import { modelValue, fullLoading, selectedComp } from '../../components/Designer/designerData'
import { contextLevel } from '@molian/utils/defaultData'
import { getNthParent } from '@molian/utils/useCore'
import { createTemplate } from '@molian/utils/template-generator'
import basePrompt from '@molianComps/Designer/AIPrompt/basePrompt.md?raw'

/**
 * 获取当前选中组件的数据，如果没有选中则返回所有数据
 * @returns {Object} - 包含选中组件或所有组件的数据
 */
export const getSelectedAIData = () => {
    // 如果有选中的组件
    if (selectedComp.value) {
        return {
            selectedComp: formatComponentForAI(selectedComp.value),
            isSelected: true,
            contextCode: createContextCode(selectedComp.value.ref)
        };
    } else {
        // 如果没有选中组件，返回所有数据
        return {
            modelValue: formatModelForAI(modelValue.value),
            isSelected: false,
            contextCode: createContextCode()
        };
    }
};

/**
 * 格式化组件数据，提取AI需要的关键信息
 * @param {any} component - 原始组件数据
 * @returns {Object} - 格式化后的组件数据
 */
const formatComponentForAI = (component: any) => {
    if (!component) return null;

    // 提取AI需要的关键属性
    const {
        name, tag, category, ref, attrs, props, css, on,
        slots, children, text, value
    } = component;

    // 构建格式化后的组件对象
    const formattedComponent: any = {
        name, tag, category, ref
    };

    // 只添加存在的属性
    if (attrs) formattedComponent.attrs = attrs;
    if (props) formattedComponent.props = props;
    if (css) formattedComponent.css = css;
    if (on) formattedComponent.on = on;
    if (slots) formattedComponent.slots = slots;
    if (text !== undefined) formattedComponent.text = text;
    if (value !== undefined) formattedComponent.value = value;

    // 递归处理子组件
    if (children) {
        formattedComponent.children = Array.isArray(children)
            ? children.map(child => formatComponentForAI(child))
            : formatComponentForAI(children);
    }

    return formattedComponent;
};

/**
 * 格式化模型数据，提取AI需要的关键信息
 * @param {any} model - 原始模型数据
 * @returns {Array|Object} - 格式化后的模型数据
 */
const formatModelForAI = (model: any) => {
    if (!model) return null;

    if (Array.isArray(model)) {
        return model.map(item => formatComponentForAI(item));
    }

    return formatComponentForAI(model);
};

/**
 * 创建上下文代码
 * @param {string} ref - 组件引用
 * @returns {string} - 上下文代码
 */
/**
 * 创建上下文代码
 * @param {string} ref - 组件引用
 * @returns {Object} - 包含代码表示和JSON数据的对象
 */
const createContextCode = (ref?: string) => {
    const contextModelValue = ref
        ? getNthParent(modelValue.value, ref, contextLevel)
        : modelValue.value;

    // 根据contextModelValue的类型决定如何传递给createTemplate
    const templateInput = Array.isArray(contextModelValue)
        ? contextModelValue
        : [contextModelValue];

    return {
        codeRepresentation: createTemplate(templateInput),
        // 压缩JSON数据，移除多余空格和换行
        jsonData: JSON.stringify(contextModelValue)
    };
};

/**
 * 根据ref查找组件
 * @param {any} model - 组件模型
 * @param {string} ref - 组件引用
 * @returns {any} - 找到的组件
 */
const findCompByRef: any = function (model: any, ref: string) {
    if (!model) return null;

    if (Array.isArray(model)) {
        for (const item of model) {
            const found = findCompByRef(item, ref);
            if (found) return found;
        }
    } else if (model.ref === ref) {
        return model;
    } else if (model.children) {
        return findCompByRef(model.children, ref);
    }

    return null;
}

/**
 * 根据AI生成的数据更新组件
 * @param {any} aiGeneratedData - AI生成的组件数据
 * @param {string} targetRef - 目标组件引用，不提供则根据当前选中状态决定
 * @returns {boolean} - 更新是否成功
 */
export const updateFromAI = (aiGeneratedData: any, targetRef?: string) => {
    try {
        // 显示加载状态
        if (fullLoading && fullLoading.value) {
            fullLoading.value = true;
        }

        // 如果指定了目标引用
        if (targetRef) {
            const targetComp = findCompByRef(modelValue.value, targetRef);
            if (targetComp) {
                Object.assign(targetComp, aiGeneratedData);
                return true;
            }
            return false;
        }
        // 如果有选中组件
        else if (selectedComp.value) {
            Object.assign(selectedComp.value, aiGeneratedData);
            return true;
        }
        // 否则更新整个模型
        else if (aiGeneratedData) {
            if (Array.isArray(aiGeneratedData)) {
                modelValue.value = aiGeneratedData;
            } else if (typeof aiGeneratedData === 'object') {
                // 如果是对象，检查是否有modelValue属性
                if (aiGeneratedData.modelValue) {
                    modelValue.value = aiGeneratedData.modelValue;
                } else {
                    // 否则直接替换
                    modelValue.value = aiGeneratedData;
                }
            }
            return true;
        }

        return false;
    } catch (error) {
        console.error("AI数据更新失败:", error);
        return false;
    } finally {
        // 隐藏加载状态
        if (fullLoading && fullLoading.value) {
            fullLoading.value = false;
        }
    }
};

/**
 * 获取适合当前场景的AI提示模板
 * @param {Object} options - 选项对象
 * @param {string} options.templateName - 模板名称，默认为basePrompt
 * @param {string} options.templateContent - 父组件传递的模板内容
 * @param {Object} options.customData - 自定义数据，用于替换模板中的占位符
 * @param {boolean} options.smartSelect - 是否启用智能选择，默认为true
 * @returns {string} - 处理后的提示模板
 */
export const getAIPrompt = (options: {
    templateName?: string;
    templateContent?: string;
    customData?: any;
    smartSelect?: boolean;
} = {}) => {
    try {
        const {
            templateName = 'basePrompt',
            templateContent,
            customData = {},
            smartSelect = true
        } = options;

        let promptTemplate = '';

        // 优先使用父组件传递的模板内容
        if (templateContent) {
            promptTemplate = templateContent;
        } else {
            // 如果启用智能选择，则根据当前场景选择模板
            const finalTemplateName = smartSelect
                ? selectSmartTemplate(templateName)
                : templateName;

            // 获取模板内容
            promptTemplate = getTemplateContent(finalTemplateName);

            // 如果没有找到模板，返回基础模板
            if (!promptTemplate) {
                console.error(`未找到模板: ${finalTemplateName}`);
                return getBasePrompt();
            }
        }

        // 获取当前选中组件或全局数据
        const currentData = getSelectedAIData();

        // 智能分析当前组件，提取关键特性
        const componentFeatures = analyzeComponent(currentData);

        // 合并自定义数据、当前数据和组件特性
        const mergedData: any = {
            ...currentData,
            ...componentFeatures,
            ...customData
        };

        // 处理模板中的占位符
        let processedPrompt = promptTemplate;

        // 如果有选中组件，添加相关信息
        if (currentData.isSelected && currentData.selectedComp) {
            const comp = currentData.selectedComp;
            processedPrompt = processedPrompt.replace(/\[指定组件名称\]/g, comp.name || '');
            processedPrompt = processedPrompt.replace(/\[指定组件类别\]/g, comp.category || '');
            processedPrompt = processedPrompt.replace(/\[指定组件标签\]/g, comp.tag || '');

            // 智能添加组件特性描述
            if (componentFeatures.description) {
                processedPrompt = processedPrompt.replace(/\[组件描述\]/g, componentFeatures.description);
            }
        }

        // 处理其他自定义占位符
        Object.keys(mergedData).forEach(key => {
            const placeholder = `[${key}]`;
            if (processedPrompt.includes(placeholder)) {
                let value = mergedData[key];
                // 智能格式化值
                if (typeof value === 'object') {
                    value = JSON.stringify(value, null, 2);
                }
                processedPrompt = processedPrompt.replace(
                    new RegExp(placeholder, 'g'),
                    value
                );
            }
        });

        // 智能添加上下文提示
        processedPrompt = addContextualHints(processedPrompt, currentData);

        return processedPrompt;
    } catch (error) {
        console.error(`生成AI提示模板失败: ${error}`);
        return getBasePrompt();
    }
};

/**
 * 获取模板内容
 * @param {string} templateName - 模板名称
 * @returns {string} - 模板内容
 */
const getTemplateContent = (templateName: string) => {
    // 使用导入的模板文件而不是动态读取文件系统
    const templates: any = {
        'basePrompt': basePrompt,
    };

    return templates[templateName] || '';
};

/**
 * 智能选择最适合当前场景的模板
 * @param {string} defaultTemplate - 默认模板名称
 * @returns {string} - 选择的模板名称
 */
const selectSmartTemplate = (defaultTemplate: string) => {
    const data = getSelectedAIData();
    // 如果没有选中组件，使用创建组件模板
    if (!data.isSelected) {
        return 'basePrompt';
    }

    // const comp = data.selectedComp;

    // 根据组件类型选择专用模板
    //   if (comp.category === 'form') {
    //     return 'editFormComponent';
    //   } else if (comp.category === 'container') {
    //     return 'editContainerComponent';
    //   } else if (comp.category === 'chart') {
    //     return 'editChartComponent';
    //   }

    //   // 根据组件复杂度选择模板
    //   if (comp.slots && Object.keys(comp.slots).length > 0) {
    //     return 'editComplexComponent';
    //   }

    // 默认返回指定的模板
    return defaultTemplate;
};

/**
 * 分析组件，提取关键特性
 * @param {Object} data - 组件数据
 * @returns {Object} - 组件特性
 */
const analyzeComponent = (data: any) => {
    if (!data.isSelected || !data.selectedComp) {
        return {};
    }

    const comp = data.selectedComp;
    const features: any = {
        description: '',
        keyAttributes: [],
        keyEvents: [],
        cssFeatures: []
    };

    // 分析组件名称和类别，生成描述
    features.description = `${comp.name}是一个${comp.category}类型的组件`;

    // 分析属性
    if (comp.attrs) {
        const attrKeys = Object.keys(comp.attrs);
        features.keyAttributes = attrKeys.slice(0, 5); // 取前5个关键属性
        features.description += `，具有${attrKeys.length}个属性`;
    }

    // 分析事件
    if (comp.on) {
        const eventKeys = Object.keys(comp.on);
        features.keyEvents = eventKeys;
        features.description += `，监听${eventKeys.length}个事件`;
    }

    // 分析CSS特性
    if (comp.css) {
        const cssKeys = Object.keys(comp.css);
        features.cssFeatures = cssKeys;

        // 添加布局信息
        if (comp.css.constX || comp.css.constY) {
            features.description += `，采用${comp.css.constX || 'default'}水平对齐和${comp.css.constY || 'default'}垂直对齐`;
        }
    }

    return features;
};

/**
 * 智能添加上下文提示
 * @param {string} prompt - 原始提示
 * @param {Object} data - 组件数据
 * @returns {string} - 增强后的提示
 */
const addContextualHints = (prompt: string, data: any) => {
    // 如果没有上下文代码，直接返回
    if (!data.contextCode) {
        return prompt;
    }

    // 添加上下文代码提示
    let enhancedPrompt = prompt;

    // 在提示末尾添加上下文信息
    enhancedPrompt += `\n\n## 上下文信息\n`;

    // 获取代码表示和JSON数据
    const codeRepresentation = data.contextCode.codeRepresentation || data.contextCode;
    const jsonData = data.contextCode.jsonData;

    if (data.isSelected) {
        enhancedPrompt += `当前选中的组件位于以下上下文中，请确保生成的组件与上下文风格保持一致：\n\`\`\`\n${codeRepresentation}\n\`\`\`\n`;

        // 添加压缩后的JSON数据
        if (jsonData) {
            enhancedPrompt += `\n### 组件数据（JSON格式）\n\`\`\`json\n${jsonData}\n\`\`\`\n`;
        }
    } else {
        enhancedPrompt += `当前页面的整体结构如下，请确保生成的组件与整体风格保持一致：\n\`\`\`\n${codeRepresentation}\n\`\`\`\n`;

        // 添加压缩后的JSON数据
        if (jsonData) {
            enhancedPrompt += `\n### 页面数据（JSON格式）\n\`\`\`json\n${jsonData}\n\`\`\`\n`;
        }
    }

    return enhancedPrompt;
};

/**
 * 获取基础提示模板
 * @returns {string} - 基础提示模板
 */
const getBasePrompt = () => {
    // 使用导入的basePrompt模板，而不是硬编码字符串
    let template = basePrompt;

    // 替换基本的占位符
    if (selectedComp.value) {
        // 如果有选中组件，替换为组件信息
        template = template.replace(/\[指定组件名称\]/g, selectedComp.value.name || '');
        template = template.replace(/\[指定组件类别\]/g, selectedComp.value.category || '');
        template = template.replace(/\[指定组件标签\]/g, selectedComp.value.tag || '');
    } else {
        // 如果没有选中组件，替换为页面编辑相关提示
        template = template.replace(/\[指定组件名称\]/g, '整个页面');
        template = template.replace(/\[指定组件类别\]/g, 'page');
        template = template.replace(/\[指定组件标签\]/g, 'page');

        // 可能需要额外修改模板内容，使其更适合页面级编辑
        template = template.replace(/组件JSON数据/g, '页面JSON数据');
        template = template.replace(/组件配置/g, '页面配置');
    }

    return template;
};

/**
 * 导出AI相关功能
 */
export default {
    getSelectedAIData,
    updateFromAI,
    findCompByRef,
    getAIPrompt
}