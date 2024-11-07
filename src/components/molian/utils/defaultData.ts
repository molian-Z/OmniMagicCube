import { onMounted, onBeforeMount, onBeforeUnmount, onUpdated, onBeforeUpdate, onUnmounted, onErrorCaptured, onActivated, onDeactivated, ref } from 'vue'
import { useStorage } from '@vueuse/core'
/**
 * defaultCategory 默认分类
 * basic会注册到所有UI面板中
 */
export const defaultCategory: IConfig.IDefaultCategory[] = [{
    index: 10,
    icon: 'basic',
    name: 'basic',
    component: ['MlHorizontalContainer', 'MlVerticalContainer', 'SvgIcon', 'IconPicker', 'MlEcharts', 'MlSubForm']
}, {
    index: 20,
    icon: 'container',
    name: 'layout',
    component: [/.*Tabs.*/, /.*TabPane.*/, /.*Layout.*/, /.*Container.*/, /.*Header.*/, /.*Main.*/, /.*Footer.*/, /.*Aside.*/, /.*Grid.*/, /.*Cell.*/, /.*Split.*/, /.*List.*/, /.*Row.*/, /.*Col$/, /.*Carousel.*/, /.*Collapse.*/, /.*Steps.*/, /.*Step.*/, /.*Descriptions.*/, /.*DescriptionsItem.*/]
}, {
    index: 30,
    icon: 'menu',
    name: 'menu',
    rule: /.*(Anchor|Breadcrumb|Dropdown|Menu).*/
}, {
    index: 40,
    icon: 'form',
    name: 'form',
    component: [/.*Form$/, /.*FormItem$/, /.*Autocomplete.*/, /.*Input.*/, /.*Select.*/, /.*Option.*/, /.*Picker.*/,
         /.*Checkbox.*/, /.*Radio.*/, /.*Switch.*/, /.*Cascader.*/, /.*Slider.*/, /.*Textarea.*/, /.*Transfer.*/,
         /.*Segmented.*/, /.*Mention.*/, /.*Rate.*/, /.*Upload.*/, /.*Wheel.*/]
}, {
    index: 50,
    icon: 'content',
    name: 'content',
    rule: /.*(Button|Link|Text|Avatar|Badge|Progress|Bubble|Calendar|Card|Carousel|Collapse|Ellipsis|Highlight|Image|Result|Table|Pagination|TabNav|Tag|TimeAgo|Timeline|Tooltip|Tree|Viewer|Empty).*/
}, {
    index: 60,
    icon: 'modal',
    name: 'modal',
    rule: /.*(Alert|Confirm|Contextmenu|Drawer|Loading|Message|Modal|Dialog|Notice|progress|Skeleton|spin|Toast|Tour|Popover|Popper|Popconfirm).*/
}, {
    index: 70,
    icon: 'more',
    name: 'more',
    rule: /.*(Affix|FullScreen|Masker|Overflow|Renderer|ResizeObserver|Scrollbar|VirtualList|Watermark|Space|Divider|Backtop|AutoResizer|Statistic|Countdown|Icon|ConfigProvider).*/
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
export const defaultAttrsMap = ref<IConfig.IDefaultAttrsMap>({
    SvgIcon: {
        icon: {
            default: 'comps-default'
        },
        size: {
            default: 32
        },
    },
})

/**
 * defaultNativeEventMap 默认原生事件映射表
 */
export const defaultNativeEventMap = ref<IConfig.IEventMap>({
    click: ['evt'], //点击
    dblclick: ['evt'], //双击
    contextmenu: ['evt'], //右键
    mouseenter: ['evt'], //鼠标移入
    mouseleave: ['evt'], //鼠标移出
    keydown: ['evt'], //按键按下
    keyup: ['evt'], //按键抬起
    keypress: ['evt'], //按键按下
})

/**
 * defaultLifecycleMap 默认生命周期映射表
 */
export const defaultLifecycleMap = ref<IConfig.ILifecycleMap>({
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
})

/**
 * 默认插槽地图(用于记录各组件插槽及限制放入组件)
 * @param {object} ComponentMap 组件对象
 * @param {object} ComponentMap.component component对应组件名
 * @param {object|boolean|string} ComponentMap.component.slots slots应为该组件的具名或true时为无限制
 * @param {array[string]} ComponentMap.component.slots.allowComps 允许哪些组件在该插槽内显示例如forms下要显示form-item即可在这里限制
 * @returns {ComponentMap} ComponentMap 返回默认插槽地图
 */

export const defaultSlotsMap = ref<IDefaultSlotsMap>({
    div: {
        default: 'auto'
    },
    span: {
        default: 'auto'
    },
    ul: {
        default: {
            auto: true,
            allowComps: ['li']
        }
    },
    li: {
        default: 'auto'
    },
})

export const dbName = "molian-cube"
export const contextLevel = 3
export const cloudUrl = ref<string>("https://wujie.mlyt.top/getData")
export const AIURL = "https://wujie.mlyt.top/getAI"
export const iconifyUrl = ref<string>("http://flower.molianpro.com:33000")
export const setting = useStorage<Setting.Config>('omc_setting', {
    immerseLeftMode: true,
    immerseRightMode: true
})