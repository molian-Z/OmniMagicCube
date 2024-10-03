import messages from '@intlify/unplugin-vue-i18n/messages'
import { cloneDeep } from 'lodash-es'
import { createI18n } from 'vue-i18n'

function setupI18n() {
    const i18n = createI18n({
        legacy: false,
        locale: 'zh-cn',
        flatJson: true,
        fallbackLocale: 'zh-cn',
        messages,
    })
    return i18n
}

function getLocales() {
    return cloneDeep(messages)
}

const localesName: Record<string, any> = {}
for (const key in messages) {
    switch (key) {
        case 'zh-cn':
            localesName[key] = '中文(简体)'
            break
        case 'zh-tw':
            localesName[key] = '中文(繁體)'
            break
        case 'en':
            localesName[key] = 'English'
            break
        case 'vi':
            localesName[key] = 'Tiếng Việt'
            break
        case 'ja':
            localesName[key] = '日本語'
            break
        case 'ko':
            localesName[key] = '한국어'
            break
    }
}

export {
    getLocales,
    localesName,
    setupI18n,
}
