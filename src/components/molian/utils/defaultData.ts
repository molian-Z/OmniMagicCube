import { onMounted, onBeforeMount, onBeforeUnmount, onUpdated, onBeforeUpdate, onUnmounted, onErrorCaptured, onActivated, onDeactivated } from 'vue'
export type IDefaultCategory = {
    icon?: string;
    name?: string;
    component?: (string)[];
    rule?: RegExp;
};
export interface IDefaultAttrsMap {
    [key: string]: any;
}

export interface IEventMap {
    [key: string]: (string)[] | string;
}

export interface ILifecycleMap {
    [key: string]: {
        codeVar: string[];
        code: string;
        function?: any;
    };
}

export interface IDefaultSlotsMap {
    [key: string]: {
        [key: string]: {
            allowComps?: (string)[];
            auto?: boolean;
        } | string | boolean;
    };
}

export interface IUiMapping {
    current: string;
    data: Array<IData>;
}
export type IData = {
    name: string;
    prefix: string;
    icon?: string;
    compMapping?: ICompMapping;
};
export interface ICompMapping {
    Button?: IButton;
    Tag?: Record<string, unknown>;
    Input?: IInput;
    InputNumber?: Record<string, unknown>;
    Select?: Record<string, unknown>;
    Switch?: Record<string, unknown>;
    Tooltip?: ITooltip;
    Popup?: IPopup;
    RadioGroup?: Record<string, unknown>;
    RadioButton?: IRadioButton;
    Cascader?: ICascader;
    CascaderPanel?: ICascader;
    Dropdown?: IDropdown;
    Dialog?: IDialog;
}

export interface IDialog {
    appendToBody?: IAppendToBody | string;
    visible?: boolean | string;
    destroyOnClose?: string;
    header?: string;
    component?: string;
    [key: string]: any;
}
export interface IAppendToBody {
    attach?: string;
    component?: string;
    [key: string]: any;
}
export interface IDropdown {
    optionItems?: unknown;
    component?: string;
    [key: string]: any;
}
export interface ICascader {
    optionItems?: string;
    checkStrictly?: any;
    component?: string;
    valueType?: string | any;
    [key: string]: any;
}
export interface IRadioButton {
    value?: string;
    component?: string;
    [key: string]: any;
}
export interface IPopup {
    component?: string;
    default?: string;
    content?: string;
    trigger?: any;
    visible?: any;
    [key: string]: any;
}
export interface ITooltip {
    content?: IContent | string;
    component?: string;
    [key: string]: any;
}
export interface IContent {
    content?: string;
    destroyOnClose?: boolean;
    component?: string;
    [key: string]: any;
}
export interface IInput {
    prefixIcon?: string;
    onKeyup?: Record<string, unknown>;
    onEnter?: Record<string, unknown>;
    modelValue?: string;
    ['onUpdate:modelValue']?: string;
    component?: string;
}
export interface IButton {
    theme?: string | any;
    text?: IText | string;
    component?: string;
}
export interface IText {
    variant?: string;
    type?: string;
    component?: string;
}


/**
 * defaultCategory 默认分类
 * basic会注册到所有UI面板中
 */
export const defaultCategory: IDefaultCategory[] = [{
    icon: 'basic',
    name: 'basic',
    component: ['div', 'span', 'ul', 'li', 'text']
}, {
    icon: 'container',
    name: 'layout',
    rule: /.*(Row|Col|Container|Header|Main|Footer|Aside|Layout|Grid|Cell|Split|List).*/
}, {
    icon: 'menu',
    name: 'menu',
    rule: /.*(Anchor|Breadcrumb|Dropdown|Menu|Pagination).*/
}, {
    icon: 'form',
    name: 'form',
    rule: /.*(Input|Picker|Checkbox|Radio|Form|AutoComplete|Cascader|Select|Slider|Switch|Textarea|Transfer|Upload|Wheel).*/
}, {
    icon: 'content',
    name: 'content',
    rule: /.*(Avatar|Badge|Bubble|Calendar|Card|Carousel|Collapse|Ellipsis|Highlight|Image|Result|Table|TabNav|Tabs|Tag|TimeAgo|Timeline|Tooltip|Tree|Viewer).*/
}, {
    icon: 'modal',
    name: 'modal',
    rule: /.*(Alert|Confirm|Contextmenu|Drawer|Loading|Message|Modal|Notice|progress|Skeleton|spin|Toast|Tour).*/
}, {
    icon: 'more',
    name: 'more',
    rule: /.*(Affix|FullScreen|Masker|Overflow|Renderer|ResizeObserver|Scrollbar|VirtualList).*/
}]

/**
 * 默认组件地图(赋值名称以及图标) //暂且弃用
 */
export const defaultCompMap = [{
    name: 'container',
    title: '布局', // 后期应转为I18N的名称
    icon: 'container',
    rule: /.*(container).*/
}]


/**
 * defaultAttrsMap 默认属性映射表
 */
export const defaultAttrsMap: IDefaultAttrsMap = {
    TRow: {
        align: {
            default: 'center',
            optionItems: ['top', 'center', 'end', 'stretch', 'baseline']
        },
        justify: {
            default: 'center',
            optionItems: ['start', 'end', 'center', 'space-around', 'space-between', 'space-evenly']
        }
    }
}

/**
 * defaultAttrsMap 默认原生事件映射表
 */
export const defaultNativeEventMap: IEventMap = {
    click: ['evt'], //点击
    dblclick: ['evt'], //双击
    mouseenter: ['evt'], //鼠标移入
    mouseleave: ['evt'], //鼠标移出
    keydown: ['evt'], //按键按下
    keyup: ['evt'], //按键抬起
    keypress: ['evt'], //按键按下
    wheel: ['evt'], //滚轮滚动
    contextmenu: ['evt'], //右键
    scroll: ['evt'], //滚动
    resize: ['evt'], //窗口大小改变
}

/**
 * defaultLifecycleMap 默认生命周期映射表
 */
export const defaultLifecycleMap: ILifecycleMap = {
    beforeCreate: {
        codeVar: [],
        code: ''
    },
    created: {
        codeVar: [],
        code: ''
    },
    beforeMount: {
        codeVar: [],
        code: '',
        function:onBeforeMount,
    },
    mounted: {
        codeVar: [],
        code: '',
        function:onMounted,
    },
    beforeUpdate: {
        codeVar: [],
        code: '',
        function:onBeforeUpdate,
    },
    updated: {
        codeVar: [],
        code: '',
        function:onUpdated,
    },
    beforeUnmount: {
        codeVar: [],
        code: '',
        function:onBeforeUnmount,
    },
    unmounted: {
        codeVar: [],
        code: '',
        function:onUnmounted,
    },
    errorCaptured: {
        codeVar: ['err', 'vm', 'info'],
        code: '',
        function:onErrorCaptured,
    },
    activated: {
        codeVar: [],
        code: '',
        function:onActivated,
    },
    deactivated: {
        codeVar: [],
        code: '',
        function:onDeactivated,
    }
}

/**
 * 默认插槽地图(用于记录各组件插槽及限制放入组件)
 * @param {object} ComponentMap 组件对象
 * @param {object} ComponentMap.component component对应组件名
 * @param {object|boolean|string} ComponentMap.component.slots slots应为该组件的具名或true时为无限制
 * @param {array[string]} ComponentMap.component.slots.allowComps 允许哪些组件在该插槽内显示例如forms下要显示form-item即可在这里限制
 * @returns {ComponentMap} ComponentMap 返回默认插槽地图
 */

export const defaultSlotsMap: IDefaultSlotsMap = {
    TRow: {
        default: {
            auto: true,
            allowComps: ['TCol']
        }
    },
    TCol: {
        default: 'auto'
    },
    TLayout: {
        default: {
            allowComps: ['THeader', 'TLayout', 'TContent', 'TAside', 'TFooter']
        }
    },
    TSpace: {
        default: 'auto'
    },
    TForm: {
        default: {
            allowComps: ['TFormItem']
        },
    },
    TFormItem: {
        default: 'auto'
    },
    TList: {
        header: true,
        default: {
            auto: true,
            allowComps: ['TListItem']
        },
        footer: true,
        asyncLoading: true
    },
    TListItem: {
        action: true,
        default: {
            auto: true,
            allowComps: ['TListItemMeta']
        },
        content: true,
    },
    TListItemMeta: {
        avatar: true,
        description: true,
        image: true,
        title: true
    }
}

/**
 * UI组件库映射表
 * 输入项目中使用的UI方便框架内部解析
 */

export const uiMapping: IUiMapping = {
    current: "tdesign-vue-next",
    data: [{
        name: 'tdesign-vue-next',
        prefix: 'T',
        icon: "TDesign",
        compMapping: {
            "Button": {
                "theme": "theme",
                "text": {
                    "variant": "text"
                },
            },
            "Tag": {},
            "Input": {
                "prefixIcon": "prefixIcon",
                "onKeyup": {}
            },
            "InputNumber": {},
            "Select": {},
            "Switch": {},
            "Tooltip": {
                "content": {
                    "content": "content",
                    "destroyOnClose": true
                }
            },
            "Popup": {
                "component": "Popup",
                "default": "default",
                "content": "content"
            },
            "RadioGroup": {},
            "RadioButton": {
                "value": "label"
            },
            "Cascader": {
                "optionItems": "options"
            },
            "CascaderPanel": {
                "optionItems": "options"
            },
            "Dropdown": {
                "optionItems": (data: any) => {
                    return {
                        "options": data.map((item: any) => {
                            return {
                                content: item.label,
                                value: item.value,
                                disabled: item.disabled,
                                onClick: item.onclick
                            }
                        })
                    }
                }
            },
            "Dialog": {
                "appendToBody": {
                    "attach": "body"
                }
            }
        }
    }, {
        name: 'element-plus',
        prefix: 'El',
        icon: "ElementPlus",
        compMapping: {
            "Button": {
                "theme": "type",
                "text": "text"
            },
            "Tag": {
                "theme": "type"
            },
            "Input": {
                "prefixIcon": "prefix",
                "onEnter": {}
            },
            "InputNumber": {},
            "Select": {
                "component": "SelectV2", // 切换组件
                "size": { // 设置大小的同时设置组件的props
                    "size": "small",
                    "props": {
                        options: 'children'
                    }
                }
            },
            "Switch": {},
            "Tooltip": {
                "content": "content"
            },
            "Popup": {
                "component": "Popover",
                "default": "reference",
                "content": "default",
                "trigger": {
                    "trigger": "click",
                    "width": "auto"
                }
            },
            "RadioGroup": {},
            "RadioButton": {
                "value": "label"
            },
            "Cascader": {
                "optionItems": "options",
                "checkStrictly": {
                    "props": {
                        "checkStrictly": true,
                    }
                }
            },
            "CascaderPanel": {
                "optionItems": "options",
                "checkStrictly": {
                    "props": {
                        "checkStrictly": true,
                    }
                }
            },
            "Dropdown": {
                "optionItems": (data: any) => {
                    return {
                        dropdown: {
                            _isSlot: true,
                            tag: 'ElDropdownMenu',
                            attrs: {},
                            slots: data.map((item: any) => {
                                return {
                                    _isSlot: true,
                                    tag: "ElDropdownItem",
                                    attrs: {
                                        disabled: item.disabled,
                                        onClick: item.onclick,
                                        command: item.value
                                    },
                                    slots: item.label
                                }
                            })
                        }
                    }
                }
            },
            "Dialog": {
                "visible": "modelValue",
                "onUpdate:visible": "onUpdate:modelValue",
                "destroyOnClose": "destroy-on-close",
                "appendToBody": "append-to-body",
                "header": "title"
            }
        }
    }, {
        name: 'ant-design-vue',
        prefix: 'A',
        icon: "Ant",
        compMapping: {
            "Button": {
                "theme": (type: string) => {
                    if (type === 'warning') {
                        return {
                            type: 'primary',
                            danger: true
                        }
                    }
                    return {
                        type: 'primary'
                    }
                },
                "text": {
                    "type": "link"
                },
            },
            "Tag": {},
            "Input": {
                "prefixIcon": "prefix",
                "modelValue": "value",
                "onUpdate:modelValue": "onUpdate:value"
            },
            "InputNumber": {
                "modelValue": 'value',
                "onUpdate:modelValue": "onUpdate:value",
            },
            "Select": {
                "modelValue": "value",
                "onUpdate:modelValue": "onUpdate:value"
            },
            "Switch": {
                "modelValue": 'value',
                "onUpdate:modelValue": "onUpdate:value",
            },
            "Tooltip": {
                "content": "title"
            },
            "Popup": {
                "component": "Popover"
            },
            "RadioGroup": {
                "modelValue": 'value',
                "onUpdate:modelValue": "onUpdate:value",
                "variant": {
                    "buttonStyle": "solid"
                }
            },
            "RadioButton": {
                "value": "label"
            },
            "Cascader": {
                "optionItems": "options",
                "valueType": (data: string) => {
                    if (data === 'full') {
                        return {
                            "changeOnSelect": true
                        }
                    }
                    return {}
                },
                "modelValue": 'value',
                "onUpdate:modelValue": "onUpdate:value",
            },
            "CascaderPanel": {
                "component": "Cascader",
                "optionItems": "options",
                "valueType": (data: string) => {
                    if (data === 'full') {
                        return {
                            "changeOnSelect": true
                        }
                    }
                    return {}
                },
                "modelValue": 'value',
                "onUpdate:modelValue": "onUpdate:value",
            },
            "Dropdown": {
                "optionItems": (data: any) => {
                    return {
                        overlay: {
                            _isSlot: true,
                            tag: 'AMenu',
                            attrs: {},
                            slots: data.map((item: any) => {
                                return {
                                    _isSlot: true,
                                    tag: "AMenuItem",
                                    attrs: {
                                        disabled: item.disabled,
                                        onClick: item.onclick,
                                        command: item.value
                                    },
                                    slots: item.label
                                }
                            })
                        }
                    }
                }
            },
            "Dialog": {
                "component": "Modal",
                "appendToBody": {
                    "getContainer": () => document.body,
                    "zIndex": 1001
                },
                "header": "title",
                "visible": "open",
                "onUpdate:visible": "onUpdate:open"
            }
        }
    }, {
        name: 'naive',
        prefix: 'N',
        icon: "naive",
        compMapping: {
            "Button": {
                "theme": "type",
                "text": "text"
            },
            "Tag": {
                "theme": "type"
            },
            "Input": {
                "prefixIcon": "prefix",
                "onEnter": {},
                "modelValue": 'value',
                "onUpdate:modelValue": "onUpdate:value",
            },
            "InputNumber": {
                "modelValue": 'value',
                "onUpdate:modelValue": "onUpdate:value",
            },
            "Select": {
                "modelValue": "value",
                "onUpdate:modelValue": "onUpdate:value",
                "size": {
                    "size": "small",
                    "virtualScroll": false
                }
            },
            "Switch": {
                "modelValue": 'value',
                "onUpdate:modelValue": "onUpdate:value",
            },
            "Tooltip": {
                "default": "trigger",
                "content": (text: any) => {
                    return {
                        "default": {
                            _isSlot: true,
                            tag: "NEllipsis",
                            attrs: {},
                            slots: text
                        }
                    }
                },
            },
            "Popup": {
                "component": "Popover",
                "default": "trigger",
                "content": "default",
                "trigger": {
                    "trigger": "click",
                    "style": "min-width:180px;"
                },
                "visible": "show",
                "onUpdate:visible": "onUpdate:show"
            },
            "RadioGroup": {
                "modelValue": 'value',
                "onUpdate:modelValue": "onUpdate:value",
            },
            "RadioButton": {
                "value": "label"
            },
            "Cascader": {
                "optionItems": "options",
                "checkStrictly": {
                    "checkStrategy": "all",
                    "separator": ".",
                    "virtualScroll": false,
                    "cascade": false
                },
                "modelValue": (value: string[]) => {
                    return {
                        "value": value[value.length - 1]
                    }
                },
                "onUpdate:modelValue": "onUpdate:value",
            },
            "CascaderPanel": {
                "component": "Cascader",
                "optionItems": "options",
                "checkStrictly": {
                    "checkStrategy": "all",
                    "separator": ".",
                    "virtualScroll": false,
                    "cascade": false
                },
                "modelValue": (value: string[]) => {
                    return {
                        "value": value[value.length - 1]
                    }
                },
                "onUpdate:modelValue": "onUpdate:value",
            },
            "Dropdown": {
                "optionItems": (data: any[]) => {
                    return {
                        "options": data.map((item: { label: any; value: any; disabled: any; onclick: any; }) => {
                            return {
                                label: item.label,
                                key: item.value,
                                disabled: item.disabled,
                                props: {
                                    onClick: item.onclick,
                                }
                            }
                        })
                    }
                }
            },
            "Dialog": {
                "component": "Modal",
                "visible": "show",
                "onUpdate:visible": "onUpdate:show",
                "destroyOnClose": "destroy-on-close",
                "appendToBody": {
                    "preset": "dialog",
                    "style": {
                        "width": "80vw"
                    },
                },
                "header": "title",
                "footer": "action"
            }
        }
    }, {
        name: 'vexip',
        prefix: 'V',
        icon: "vexip",
        compMapping: {
            "Button": {
                "theme": "type",
                "text": {
                    "variant": "text"
                },
            },
            "Input": {},
            "InputNumber": {},
            "Select": {},
            "Switch": {},
            "Tooltip": {},
            "Popup": {},
            "RadioGroup": {},
        }
    }]
}

export const dbName = "molian-cube"

export const cloudUrl = "http://wujie.mlyt.top/getData"