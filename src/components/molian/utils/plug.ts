import {
    langInstall
} from './lang'
import {
    compsInstall
} from './compsConfig'
import { App } from 'vue'

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
        langInstall(app)
        compsInstall(app, options.compsConfig)
    }
}