import {
    compsInstall
} from './compsConfig'
import { useUI, UIData, usePrefix, debug } from './UIMap'
import {iconifyUrl} from './defaultData'
import type { App } from 'vue'
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'
import ContextMenu from '@imengyu/vue3-context-menu/lib/vue3-context-menu.es'
import { Icon, addAPIProvider } from '@iconify/vue'
import SvgIcon from '@molianComps/SvgIcon/index.vue'
import IconPicker from '@molianComps/IconPicker/index.vue'
import MlHorizontalContainer from '@molianComps/MolianLayoutContainer/horizontalContainer.vue'
import MlVerticalContainer from '@molianComps/MolianLayoutContainer/verticalContainer.vue'
import MlSubContainer from '@molianComps/MolianLayoutContainer/subContainer.vue'
import MlSubForm from '@molianComps/MlSubForm/index.vue'
import MlEcharts from '@molianComps/Echarts/index.vue'
import MlTagInput from '@molianComps/TagInput/index.vue'
// import MlCodeEditor from '@molianComps/MlCodeEditor/index.vue'
import messages from '@intlify/unplugin-vue-i18n/messages'
import { setupI18n } from '@molian/locales'
console.log(`%c无界魔方%cOmni Magic Cube V${import.meta.env.PACKAGE_VERSION}%c
%cTo:墨联墨客`,
    'background: #2D74FF; color: #fff; border-radius:3px;padding:4px 8px;font-size:14px;font-weight:bold;',
    'background: #5b92ff; color: #fff; border-radius:3px;padding:4px 8px;margin-top:5px;font-size:14px;',
    '',
    'background: #5b92ff; color: #fff; border-radius:3px;padding:4px 8px;margin-top:5px;font-size:12px;',
)

export default {
    install(app: App, options: plug.designerInstall) {
        let i18nInstance:any
        if(!options.i18nInstance) {
            options.i18nInstance = setupI18n()
            app.use(options.i18nInstance)
            i18nInstance = options.i18nInstance.global
        } else {
            i18nInstance = options.i18nInstance
            const i18nObj:any = messages
            Object.keys(i18nObj).forEach(key => {
                i18nInstance.mergeLocaleMessage(key, i18nObj[key])
            })
        }
        app.component('SvgIcon', SvgIcon)
        app.component('Icon', Icon)
        app.component('IconPicker', IconPicker)
        app.component('MlHorizontalContainer', MlHorizontalContainer)
        app.component('MlVerticalContainer', MlVerticalContainer)
        app.component('MlSubContainer', MlSubContainer)
        app.component('MlEcharts', MlEcharts)
        app.component('MlSubForm', MlSubForm)
        app.component('MlTagInput',MlTagInput)
        // app.component('MlCodeEditor', MlCodeEditor)
        if(!!options.iconUrl){
            iconifyUrl.value = options.iconUrl
        }
        addAPIProvider('', {
            resources: [iconifyUrl.value],
        })
        useUI.value = options.useUI || useUI.value
        if (!!options.usePrefix) {
            const uiIndex = UIData.findIndex(item => item.name === useUI.value)
            if (uiIndex > -1) {
                UIData[uiIndex].prefix = options.usePrefix
            }
        }
        usePrefix.value = options.usePrefix || null
        if (options.useData) {
            // UIData = options.useData
            UIData.length = 0
            UIData.push(...options.useData)
        }
        compsInstall(app, options.compsConfig, i18nInstance)

        // 注册右键菜单组件
        app.use(ContextMenu);
        const { showContextMenu, closeContextMenu, transformMenuPosition, isAnyContextMenuOpen } = ContextMenu
        app.provide('cmdMenu', {
            showMenu: showContextMenu,
            hideMenu: closeContextMenu,
            moveMenu: transformMenuPosition,
            isOpenedMenu: isAnyContextMenuOpen
        })
    }
}