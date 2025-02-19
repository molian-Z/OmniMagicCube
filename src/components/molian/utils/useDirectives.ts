import { runOn } from '@molian/utils/customFunction'
interface CompObj {
    comp: {
        directives: {
            text: {
                type: 'variable' | 'string' | 'function';
                value: any;
            };
        };
        vars: Record<string, any>;
    };
    variable: any;
    expandAPI: any;
    $slot: any;
}

interface HTMLElementWithOnce extends HTMLElement {
    _once?: boolean;
}

interface CustomOnceCompObj {
    comp?: string | null;
}

interface TextDomElement extends HTMLElement {
    childNodes: NodeListOf<HTMLElement & { id?: string }>;
}

interface DirectiveCompObj extends CompObj {
    comp: CompObj['comp'] & {
        slots: Record<string, any>;
        directives: CompObj['comp']['directives'] & {
            once?: boolean;
        };
    };
}

interface DirectiveElement extends TextDomElement {
    textContent: string;
}

/**
 * 自定义文本指令
 * 
 * @param {any} el - DOM元素
 * @param {any} binding - 绑定对象，包含指令的属性和变量
 * 
 * 此函数主要用于在指定的DOM元素内插入动态文本内容
 * 它根据指令的类型（变量、字符串或函数）来决定插入的文本内容
 * 该函数还监听变量的变化，并在变量变化时更新文本内容
 */
export const customText = (compObj: CompObj): ComputedRef<string> | string => {
    const { directives, vars } = compObj.comp;
    const { text } = directives;

    switch (text.type) {
        case 'variable':
            return computed(() => {
                const value = text.value.reduce((result: any, key: string) => {
                    return result?.[key];
                }, vars);

                if (typeof value === 'function') {
                    return value({
                        comp: compObj.comp,
                        $slot: compObj.$slot
                    });
                }

                return typeof value === 'object' 
                    ? JSON.stringify(value)
                    : String(value ?? '');
            });

        case 'string':
            return text.value;

        case 'function':
            return runOn(text, compObj.variable, compObj.expandAPI)({
                comp: compObj.comp,
                $slot: compObj.$slot
            });

        default:
            return '';
    }
};

/**
 * 自定义指令customOnce的定义，用于在组件的生命周期中只执行一次操作
 * 这个指令在元素挂载和更新时检查条件，并相应地更新元素的文本内容
 */
export const customOnce = {
    mounted: (el: HTMLElementWithOnce, compObj: CustomOnceCompObj) => {
        el._once = true;
        el.textContent = compObj.comp ?? el.innerHTML;
    },

    updated: (el: HTMLElementWithOnce, compObj: CustomOnceCompObj) => {
        if (!el._once && compObj?.comp) {
            el.textContent = compObj.comp;
        }
    }
};

const updateTextContent = (el: DirectiveElement, text: string, hasSlots: boolean): void => {
    if (hasSlots) {
        setTextDom(el, text);
    } else {
        el.textContent = text;
    }
};

export default (compObj: DirectiveCompObj) => {
    const newText = compObj.comp.directives?.text ? customText(compObj) : null;
    const hasSlots = Object.keys(compObj.comp.slots).length > 0;

    return {
        mounted(el: DirectiveElement) {
            if (compObj.comp.directives.text) {
                if (isRef(newText)) {
                    watch(
                        () => newText.value,
                        (value) => updateTextContent(el, value, hasSlots),
                        { immediate: true }
                    );
                } else {
                    updateTextContent(el, newText, hasSlots);
                }
            }

            if (compObj.comp.directives.once) {
                customOnce.mounted(el, compObj);
            }
        },

        updated(el: DirectiveElement) {
            if (compObj.comp.directives.text && !isRef(newText)) {
                updateTextContent(el, newText, hasSlots);
            }
        },
    };
};

const setTextDom = (el: TextDomElement, text: string): void => {
    // 查找并移除已存在的自定义文本节点
    let textContainer = el.querySelector('#custom-text');
    if (textContainer) {
        // 如果内容相同，直接返回
        if (textContainer.textContent === text) {
            return;
        }
        // 直接更新现有节点的内容
        textContainer.textContent = text;
    } else {
        // 首次创建节点
        textContainer = document.createElement('text');
        textContainer.id = 'custom-text';
        textContainer.textContent = text;
        el.appendChild(textContainer);
    }
};