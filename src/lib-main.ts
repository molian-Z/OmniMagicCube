import 'virtual:svg-icons-register';
import type { App } from 'vue'

import Plug from '@molian/utils/plug';
import Designer from '@molianComps/designer/index.vue';
import Render from '@molianComps/render/index.vue';
export const installDesigner = function (app: App, options: any) {
  app.use(Plug, options);
  app.component('OmcDesigner', Designer);
}
export const installRender = function (app: App) {
  app.component('OmcRender', Render);
}

export const install = function (app: App, options: any) {
  app.use(Plug, options);
  app.component('OmcDesigner', Designer);
  app.component('OmcRender', Render);
}

export default install