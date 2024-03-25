import { createApp } from 'vue';
import plug from '@molian/utils/plug';
import App from './App.vue';
import 'virtual:svg-icons-register';
// TDesign
import TDesign, { MessagePlugin, NotifyPlugin } from 'tdesign-vue-next';
// vexip-ui
import { install } from 'vexip-ui';
// naive-ui
import naive from 'naive-ui';
// ant
import Antd from 'ant-design-vue';
// element-plus
import ElementPlus from 'element-plus';
// arco
import ArcoVue from '@arco-design/web-vue';
// tiny-vue
import TinyVue from '@opentiny/vue';

import 'tdesign-vue-next/es/style/index.css';
import 'element-plus/dist/index.css';
import 'vexip-ui/css/index.css';
import 'ant-design-vue/dist/reset.css';
import '@arco-design/web-vue/dist/arco.css';
import '@molian/assets/styles/global.scss';
import test from '@molianComps/test/index.vue'
const app = createApp(App);
app.component('ElRowTest', test)
app.use(TDesign);
app.use(install, { prefix: 'V' });
app.use(naive);
app.use(Antd);
app.use(ElementPlus);
app.use(ArcoVue, {
    // 用于改变使用组件时的前缀名称
    componentPrefix: 'Arco'
});

app.use(TinyVue);
app.use(plug, {
    useUI: "element-plus",
    compsConfig: {
        globalComps: {
            message: MessagePlugin,
            notify: NotifyPlugin
        }
    },
});

app.mount('#app');