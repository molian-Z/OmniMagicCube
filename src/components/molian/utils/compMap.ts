import {App, ref} from 'vue'
import { defaultCompMap } from './defaultData'

export const compMap = ref<any[]>([])

const registerCompMap = function(app:App, currentCompMap: any[], options: { compMap: any; iconPrefix?: string | undefined }){
    currentCompMap.forEach((item: { icon: string }) =>{
        compMap.value.push({
            ...item,
            icon:options.iconPrefix ? options.iconPrefix+'-'+item.icon : 'compIcon-'+item.icon
        })
    })
    app.provide('mlCompMap', compMap)
}

/**
 * install方法 该库负责给组件数据写入icon以及文本名称
 * @param {* App} app 
 * @param {* 配置数据} options 
 */
export const compMapInstall = function (app: App<any>, options: { compMap: any; iconPrefix?: string | undefined; }) {
    let currentCompMap = []
    currentCompMap.push(...defaultCompMap)
    if(options.compMap && options.compMap.length > 0){
        currentCompMap.push(...options.compMap)
    }
    registerCompMap(app, currentCompMap, options)
}