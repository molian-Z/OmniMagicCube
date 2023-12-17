/**
 * defaultCategory 默认分类
 * basic会注册到所有UI面板中
 */
export const defaultCategory = [{
    icon: 'basic',
    name: 'basic',
    component:['div','span','ul','li','text']
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
// export const defaultCompMap = [{
//     name: 'container',
//     title: '布局', // 后期应转为I18N的名称
//     icon: 'container',
//     rule: /.*(container).*/
// }]

export const defaultAttrsMap = {
    TRow: {
        align: {
            default:'center',
            optionItems: ['top', 'center', 'end', 'stretch', 'baseline']
        },
        justify: {
            default:'center',
            optionItems: ['start', 'end', 'center', 'space-around', 'space-between', 'space-evenly']
        }
    }
}

export const defaultNativeEventMap = {
    click:['evt'], //点击
    dblClick:['evt'], //双击
    mouseEnter:['evt'], //鼠标移入
    mouseLeave:['evt'], //鼠标移出
    keyDown:['evt'], //按键按下
    keyUp:['evt'], //按键抬起
    keyPress:['evt'], //按键按下
    wheel:['evt'], //滚轮滚动
    contextmenu:['evt'], //右键
    scroll:['evt'], //滚动
    resize:['evt'], //窗口大小改变
}

export const defaultPageEventMap = {
    beforeCreate:"",
    created:"",
    beforeMount:"",
    mounted:"",
    beforeUpdate:"",
    updated:"",
    beforeUnmount:"",
    unmounted:"",
    errorCaptured: ['err', 'vm', 'info'],
    activated:"",
    deactivated:""
}

/**
 * 默认插槽地图(用于记录各组件插槽及限制放入组件)
 * @param {object} ComponentMap 组件对象
 * @param {object} ComponentMap.component component对应组件名
 * @param {object|boolean|string} ComponentMap.component.slots slots应为该组件的具名或true时为无限制
 * @param {array[string]} ComponentMap.component.slots.allowComps 允许哪些组件在该插槽内显示例如forms下要显示form-item即可在这里限制
 * @returns {ComponentMap} ComponentMap 返回默认插槽地图
 */
export const defaultSlotsMap = {
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
 * 输入项目中使用的UI方便框架内部解析
 */
export const uiMapping = {
    current: "tdesign-vue-next",
    data: [{
        name: 'tdesign-vue-next',
        prefix: 'T',
        icon: "TDesign",
        compMapping: {
            "Button": {
                "text": {
                    "variant": "text"
                },
            },
            "Tag":{},
            "Input": {},
            "InputNumber": {},
            "Select": {},
            "Switch": {},
            "Tooltip": {},
            "Popup": {},
            "RadioGroup": {},
            "RadioButton": {},
            "Dialog":{}
        }
    }, {
        name: 'element-plus',
        prefix: 'El',
        icon: "ElementPlus",
        compMapping: {
            "Button": {
                "theme":"type"
            },
            "Input": {
                "prefixIcon": "prefix"
            },
            "InputNumber": {},
            "Select": {
                "component": "SelectV2",
                "size": {
                    "size": "small",
                    "props": {
                        options: 'children'
                    }
                }
            },
            "Tooltip": {},
            "Popup": {
                "component": "Popover",
                "default": "reference",
                "content": "default"
            },
            "RadioGroup": {},
            "RadioButton": {
                "value": "label"
            }
        }
    }, {
        name: 'ant-design-vue',
        prefix: 'A',
        icon: "Ant",
        compMapping: {
            "Button": {
                "theme":"type",
                "text": {
                    "type": "text"
                },
            },
            "Input": {
                "prefixIcon": "prefix",
                "modelValue": "value",
                "onUpdate:modelValue": "onUpdate:value"
            },
            "InputNumber": {},
            "Select": {
                "modelValue": "value",
                "onUpdate:modelValue": "onUpdate:value"
            },
            "Tooltip": {},
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
            }
        }
    }, {
        name: 'naive',
        prefix: 'N',
        icon: "naive",
        compMapping: {
            "Button": {
                "type": "theme",
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
    }, {
        name: 'vexip',
        prefix: 'V',
        icon: "vexip",
        compMapping: {
            "Button": {
                "type": "theme",
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