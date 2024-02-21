// import 'virtual:svg-icons-register';
import Render from '@molianComps/render/index.vue';
import { App } from '@vue/runtime-dom';
const installRender = function (app: App) {
  app.component('OmcRender', Render);
}
export default installRender