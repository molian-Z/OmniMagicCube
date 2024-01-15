import { createApp } from 'vue'
import plug from '@molian/utils/plug'
import App from './App.vue'
import 'virtual:svg-icons-register';
// TDesign
import TDesign, {MessagePlugin, NotifyPlugin} from 'tdesign-vue-next';
// vexip-ui
import { install } from 'vexip-ui'
// naive-ui
import naive from 'naive-ui'
// ant
import Antd from 'ant-design-vue';
// element-plus
import ElementPlus from 'element-plus'
import 'tdesign-vue-next/es/style/index.css';
import 'element-plus/dist/index.css'
import 'vexip-ui/css/index.css'
import '@molian/assets/styles/global.scss';
import 'ant-design-vue/dist/reset.css';
const app = createApp(App);
app.use(TDesign);
app.use(install, { prefix: 'V' });
app.use(naive);
app.use(Antd);
app.use(ElementPlus);
app.use(plug, {
    compsConfig: {
        globalComps:{
            message:MessagePlugin,
            notify:NotifyPlugin
        }
    },
});
app.mount('#app');