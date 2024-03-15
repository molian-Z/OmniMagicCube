import { onMounted, onBeforeMount, onBeforeUnmount, onUpdated, onBeforeUpdate, onUnmounted, onErrorCaptured, onActivated, onDeactivated } from 'vue'
/**
 * defaultCategory 默认分类
 * basic会注册到所有UI面板中
 */
export const defaultCategory: IConfig.IDefaultCategory[] = [{
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
export const defaultAttrsMap: IConfig.IDefaultAttrsMap = {
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
export const defaultNativeEventMap: IConfig.IEventMap = {
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
export const defaultLifecycleMap: IConfig.ILifecycleMap = {
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
        function: onBeforeMount,
    },
    mounted: {
        codeVar: [],
        code: '',
        function: onMounted,
    },
    beforeUpdate: {
        codeVar: [],
        code: '',
        function: onBeforeUpdate,
    },
    updated: {
        codeVar: [],
        code: '',
        function: onUpdated,
    },
    beforeUnmount: {
        codeVar: [],
        code: '',
        function: onBeforeUnmount,
    },
    unmounted: {
        codeVar: [],
        code: '',
        function: onUnmounted,
    },
    errorCaptured: {
        codeVar: ['err', 'vm', 'info'],
        code: '',
        function: onErrorCaptured,
    },
    activated: {
        codeVar: [],
        code: '',
        function: onActivated,
    },
    deactivated: {
        codeVar: [],
        code: '',
        function: onDeactivated,
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

export const defaultSlotsMap: IConfig.IDefaultSlotsMap = {
    TinyRow: {
        default: {
            auto: true,
            allowComps: ['TinyCol']
        }
    },
    div:{
        default: 'auto'
    },
    span:{
        default: 'auto'
    },
    ul:{
        default: {
            auto: true,
            allowComps: ['li']
        }
    },
    li:{
        default: 'auto'
    }
}

export const dbName = "molian-cube"
export const contextLevel = 3
export const cloudUrl = "https://wujie.mlyt.top/getData"
export const AIURL = "https://wujie.mlyt.top/getAI"