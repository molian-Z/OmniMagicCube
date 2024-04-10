// import 'virtual:svg-icons-register';
import Render from '@molianComps/render/index.vue';
import { Icon, addAPIProvider } from '@iconify/vue'
import IconPicker from '@molianComps/icon-picker/index.vue'
addAPIProvider('', {
  resources: ['http://flower.molianpro.com:33000'],
})
import { App } from '@vue/runtime-dom';
const installRender = function (app: App) {
  app.component('Icon', Icon)
  app.component('IconPicker', IconPicker)
  app.component('OmcRender', Render);
}
export default installRender