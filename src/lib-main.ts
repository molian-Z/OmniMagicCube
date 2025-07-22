import 'virtual:svg-icons-register';
import type { App } from 'vue'

import Plug from '@molian/utils/plug';
import Designer from '@molianComps/Designer/index.vue';
import Render from '@/components/molian/components/Render/index.vue';

// 全局安装设计器
export const installDesigner = function (app: App, options: plug.designerInstall) {
  app.use(Plug, options);
  app.component('OmcDesigner', Designer);
}

// 全局安装渲染器
export const installRender = function (app: App) {
  app.component('OmcRender', Render);
}

// 全局安装所有
export const install = function (app: any, options: plug.designerInstall) {
  app.use(Plug, options);
  app.component('OmcDesigner', Designer);
  app.component('OmcRender', Render);
}

// 导出单独组件供按需引入
export { Designer as OmcDesigner, Render as OmcRender };
export { default as Designer } from '@molianComps/Designer/index.vue';
export { default as Render } from '@/components/molian/components/Render/index.vue';

// 导出工具函数和类型
export { Plug };
export * from '@molian/utils/componentCore';
export * from '@molian/utils/css-generator';
export * from '@molian/utils/template-generator';

export default install