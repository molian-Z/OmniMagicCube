import { App, ref, watch } from 'vue'
import { useNavigatorLanguage } from '@vueuse/core'
const langs = import.meta.glob(`../i18n/*/*.json`, { eager: true })
export const { language } = useNavigatorLanguage()

export const langObj = ref<any>({})

export const i18nt = function (langName: string):string {
    return langObj.value[langName] || langName.split('.')[langName.split('.').length - 1]
}

const getLangData = function (langName: string) {
    let langObjCache = {}
    for (const key in langs) {
        if (Object.hasOwnProperty.call(langs, key)) {
            const element: any = langs[key];
            const lang = key.split('/')
            const langDirIndex = lang.findIndex(item => {
                return item === 'i18n'
            })
            if (lang[langDirIndex + 1] === langName) {
                const obj = {
                    [lang[lang.length - 1].split('.')[0]]: element.default
                }
                langObjCache = Object.assign({}, langObjCache, flatten(obj))
            }
        }
    }
    langObj.value = langObjCache
}

export const langInstall = function (app: App<any>) {
    watch(language, (newVal: any) => {
        getLangData(newVal)
    }, {
        immediate: true
    })
    app.provide('mlLangs', i18nt)
}


const flatten = (data: any) => {
    const result: any = {};
    const isEmpty = (x: any) => Object.keys(x).length === 0;
    const recurse = (cur: any, prop: any) => {
        if (Object(cur) !== cur) {
            result[prop] = cur;
        } else if (Array.isArray(cur)) {
            const length = cur.length;
            for (let i = 0; i < length; i++) {
                recurse(cur[i], `${prop}[${i}]`);
            }
            if (length === 0) {
                result[prop] = [];
            }
        } else {
            if (!isEmpty(cur)) {
                Object.keys(cur).forEach((key) =>
                    recurse(cur[key], prop ? `${prop}.${key}` : key)
                );
            } else {
                result[prop] = {};
            }
        }
    };
    recurse(data, "");
    return result;
};

function flattenJson(json: any) {
    let result: any = {};
    for (let key in json) {
        if (typeof json[key] === 'object' && json[key] !== null) {
            let flatKey = key;

            // console.log(json[key])
            // for (let subKey in json[key]) {
            //     if (typeof json[key][subKey] === 'string') {
            //         result[flatKey + '.' + subKey] = json[key][subKey];
            //     }else{
            //         console.log(json[key][subKey])
            //         json[key][subKey] = flattenJson( json[key][subKey])
            //     }
            // }
        } else {
            result[key] = json[key];
        }
    }
    return result;
}  