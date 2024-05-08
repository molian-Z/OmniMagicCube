// import 'virtual:svg-icons-register';
import Render from '@molianComps/render/index.vue'
import { Icon, addAPIProvider } from '@iconify/vue'
import SvgIcon from '@molianComps/svg-icon/index.vue'
import IconPicker from '@molianComps/icon-picker/index.vue'
import MlHorizontalContainer from '@molianComps/MolianLayoutContainer/horizontalContainer.vue'
import MlVerticalContainer from '@molianComps/MolianLayoutContainer/verticalContainer.vue'
import MlSubContainer from '@molianComps/MolianLayoutContainer/subContainer.vue'
addAPIProvider('', {
    resources: ['http://flower.molianpro.com:33000'],
})
import { App } from '@vue/runtime-dom';
const installRender = function (app: App) {
    app.component('SvgIcon', SvgIcon)
    app.component('IconPicker', IconPicker)
    app.component('MlHorizontalContainer', MlHorizontalContainer)
    app.component('MlVerticalContainer', MlVerticalContainer)
    app.component('MlSubContainer', MlSubContainer)
    app.component('OmcRender', Render);
}
export default installRender