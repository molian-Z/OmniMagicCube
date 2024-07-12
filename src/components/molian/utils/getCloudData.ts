import {
  cloudUrl
} from './defaultData'
import { useUI,UIData } from './UIMap'
import {
  getAll,
  add
} from './indexedDB'
import {
  slotsMap,
  currentRegComps,
  parseSlot
} from './compsConfig'

import {
  langObj,
  language
} from './lang'
export async function getCloudData() {
  //其次获取已有的本地数据
  const localData = await getAll(useUI.value)
  // 比对已有数据找出需云端获取的数据
  const prefixObj = UIData.find(item => {
    return item.name === useUI.value
  })
  const nowData: {
    type?: string | undefined;
    data?: any[] | undefined;
    [key: string]: any;
  } = {}
  if (prefixObj) {
    const currentDBData = Object.keys(currentRegComps.value).reduce((result: any[], item) => {
      if (item.indexOf(prefixObj.prefix) === 0) {
        result.push({
          name: item,
          component: currentRegComps.value[item]
        })
      }
      return result
    }, [])
    // 查询i18n slots attrs中缺少的数据
    const pendingData: { type: any; data: any[] | { tag: any; attrs: any }[] | { tag: any; attrs: string[] }[] }[] = []
    localData.forEach(localItem => {
      const data = currentDBData.filter(item => {
        return localItem.data.findIndex((fItem: { key: any }) => fItem.key === item.name)
      }).map(item => {
        const {
          name,
          emits,
          slots,
          updateModel,
          props
        } = item.component
        return {
          name,
          emits,
          slots,
          updateModel,
          props
        }
      })
      if (data.length > 0) {
        if (localItem.type === 'slots') {
          if (localItem.data.length === 0) {
            pendingData.push({
              type: localItem.type,
              data: data.map(item => {
                return item.name
              })
            })
          } else {
            nowData[localItem.type] = localItem.data
          }
        } else if (localItem.type === 'attrs') {
          if (localItem.data.length === 0) {
            pendingData.push({
              type: localItem.type,
              data: data.map(item => {
                return {
                  tag: item.name,
                  attrs: item.props
                }
              })
            })
          } else {
            nowData[localItem.type] = localItem.data
          }
        } else if (localItem.type === 'i18n') {
          if (localItem.data.length === 0) {
            pendingData.push({
              type: localItem.type,
              data: data.map(item => {
                return {
                  tag: item.name,
                  attrs: Object.keys(item.props).map(item => {
                    return item
                  })
                }
              })
            })
          } else {
            nowData[localItem.type] = localItem.data
          }
        }
      }
    })
    // 请求云端数据
    if (pendingData.length > 0) {
      const res = await fetch(cloudUrl, {
        method: 'post',
        body: JSON.stringify({
          UIName: useUI.value,
          lang: language.value,
          data: pendingData
        })
      })
      // 将云端数据写入本地数据中
      const cloudData = await res.json()
      if (cloudData.code === 0) {
        cloudData.data.forEach((item: { data: any[]; type: string }) => {
          item.data.forEach(fitem => {
            add(item.type, {
              key: fitem.tag,
              value: fitem.data,
              UIName: useUI.value
            }).then(res => {
              //console.log(res)
            })
          })
          nowData[item.type] = item.data.map(mItem => {
            return {
              key: mItem.tag,
              value: mItem.data,
              UIName: useUI.value
            }
          })
        })
      }
    }
    // 初始化项目
    for (const key in nowData) {
      if (Object.hasOwnProperty.call(nowData, key)) {
        const element = nowData[key];
        if (key === 'slots') {
          element.forEach((item: { key: string | number; value: { [key: string]: string | boolean | { allowComps?: string[] | undefined; auto?: boolean | undefined } } }) => {
            let compEl = currentRegComps.value[item.key]
            if (!slotsMap.value[item.key]) {
              slotsMap.value[item.key] = item.value
            }
            if(!compEl){
                compEl = {
                    slots: Object.assign({}, parseSlot(item.value))
                }
            }else{
                compEl.slots = Object.assign({}, parseSlot(item.value), compEl.slots)
            }
          })
        } else if (key === 'attrs') {
          element.forEach((item: { key: string | number; value: { [x: string]: any } }) => {
            const compEl = currentRegComps.value[item.key]
            for (const key in item.value) {
              if (Object.hasOwnProperty.call(item.value, key)) {
                const prop = item.value[key];
                compEl.props[key] = {
                  ...compEl.props[key],
                  ...prop
                }
              }
            }
          })
        } else if (key === 'i18n') {
          element.forEach((item: { value: { [x: string]: { [x: string]: any } }; key: any }) => {
            const newLang:any = language.value
            for (const langKey in item.value[newLang]) {
              if (Object.hasOwnProperty.call(item.value[newLang], langKey)) {
                const langText = item.value[newLang][langKey];
                const langPath = `attrs.${item.key}.${langKey}`
                if (!langObj.value[langPath]) {
                  langObj.value[langPath] = langText
                }
              }
            }
          })
        }
      } 
    }
  }
}