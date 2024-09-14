// import 'virtual:svg-icons-register';
import Render from '@/components/molian/components/Render/index.vue'
import { Icon, addAPIProvider } from '@iconify/vue'
import SvgIcon from '@molianComps/SvgIcon/index.vue'
import IconPicker from '@molianComps/IconPicker/index.vue'
import MlHorizontalContainer from '@molianComps/MolianLayoutContainer/horizontalContainer.vue'
import MlVerticalContainer from '@molianComps/MolianLayoutContainer/verticalContainer.vue'
import MlSubContainer from '@molianComps/MolianLayoutContainer/subContainer.vue'
import MlEcharts from '@molianComps/Echarts/index.vue'
import MlSubForm from '@molianComps/MlSubForm/index.vue'
import MlTagInput from '@molianComps/TagInput/index.vue'
// import MlCodeEditor from '@molianComps/MlCodeEditor/index.vue'
addAPIProvider('', {
    resources: ['http://flower.molianpro.com:33000'],
})
import { App } from '@vue/runtime-dom';
const installRender = function (app: App) {
    app.component('SvgIcon', SvgIcon)
    app.component('Icon', Icon)
    app.component('IconPicker', IconPicker)
    app.component('MlHorizontalContainer', MlHorizontalContainer)
    app.component('MlVerticalContainer', MlVerticalContainer)
    app.component('MlSubContainer', MlSubContainer)
    app.component('MlEcharts', MlEcharts)
    app.component('MlSubForm', MlSubForm)
    app.component('MlTagInput',MlTagInput)
    // app.component('MlCodeEditor', MlCodeEditor)
    app.component('OmcRender', Render)
}
export default installRender