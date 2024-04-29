import {
    langInstall
} from './lang'
import {
    compsInstall
} from './compsConfig'
import { useUI, UIData, usePrefix, debug } from './UIMap'
import type { App } from 'vue'
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css';
import ContextMenu from '@imengyu/vue3-context-menu/lib/vue3-context-menu.es';
import VConsole from 'vconsole';
import { Icon, addAPIProvider } from '@iconify/vue'
import IconPicker from '@molianComps/icon-picker/index.vue'
addAPIProvider('', {
    resources: ['http://flower.molianpro.com:33000'],
})
console.log(`%c无界魔方%cOmni Magic Cube V1.0.0%c
%cTo:墨联墨客`,
    'background: #2D74FF; color: #fff; border-radius:3px;padding:4px 8px;font-size:14px;font-weight:bold;',
    'background: #5b92ff; color: #fff; border-radius:3px;padding:4px 8px;margin-top:5px;font-size:14px;',
    '',
    'background: #5b92ff; color: #fff; border-radius:3px;padding:4px 8px;margin-top:5px;font-size:12px;',
)

export default {
    install(app: App<any>, options: any = {
        customComps: {}
    }) {
        app.component('Icon', Icon)
        app.component('IconPicker', IconPicker)
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
        langInstall(app)
        compsInstall(app, options.compsConfig)


        // 注册右键菜单组件
        app.use(ContextMenu);
        const { showContextMenu, closeContextMenu, transformMenuPosition, isAnyContextMenuOpen } = ContextMenu
        app.provide('cmdMenu', {
            showMenu: showContextMenu,
            hideMenu: closeContextMenu,
            moveMenu: transformMenuPosition,
            isOpenedMenu: isAnyContextMenuOpen
        })
        if(!!debug.value){
            const vConsole = new VConsole();
        }
    }
}