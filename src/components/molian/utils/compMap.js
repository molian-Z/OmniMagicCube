import {ref} from 'vue'
import { defaultCompMap } from './defaultData'

export const compMap = ref([])

const registerCompMap = function(app, currentCompMap, {iconPrefix}){
    currentCompMap.forEach(item =>{
        compMap.value.push({
            ...item,
            icon:iconPrefix ? iconPrefix+'-'+item.icon : 'compIcon-'+item.icon
        })
    })
    app.provide('mlCompMap', compMap)
}

/**
 * install方法 该库负责给组件数据写入icon以及文本名称
 * @param {* App} app 
 * @param {* 配置数据} options 
 */
export const install = function (app, options) {
    let currentCompMap = []
    currentCompMap.push(...defaultCompMap)
    if(options.compMap && options.compMap.length > 0){
        currentCompMap.push(...options.compMap)
    }
    registerCompMap(app, currentCompMap, options)
}