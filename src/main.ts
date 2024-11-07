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

const app = createApp(App);
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
const options: plug.designerInstall = {
    useUI: "element-plus",
    compsConfig: {
        globalComps: {
            Message: MessagePlugin,
            Notify: NotifyPlugin
        },
        allowDiffCateReg: false, // 允许不同分类重复注册同一组件
        hiddenComps: [], //隐藏组件
        allowRegPropsAndEmit: false, // 允许同一属性同时注册props以及emit 通常在v-model:xxx分离时使用
        categoryList: [], // 注册分类
        customComps: {}, // 自定义组件注册
        cateRules: [], //暂不支持
        clearDefaultCategory: false, // 移除已经定义的分类列表
        clearDefaultComps: false, // 移除全局默认注册的组件
        registerCloud: true, // 是否允许从远端获取组件数据
        registerCloudUrl: '', // 注册组件数据的链接
        // 插槽地图映射
        slotsMap: function () {
            return {
                TinyRow: {
                    default: {
                        auto: true, //自动添加插槽
                        allowComps: ['TinyCol'] // 该组件的该插槽只能放置这些组件
                    }
                },
                ElRow: {
                    default: {
                        auto: true,
                        allowComps: [{
                            name: 'ElCol',
                        }],
                        appendComps: [{
                            name: 'ElCol',
                            attrs: {
                                span: 12
                            }
                        }]
                    }
                },
                ElCol: {
                    default: {
                        auto: true,
                        appendComps: [
                            {
                                name: "ElFormItem",
                            },
                            {
                                name: "ElRow",
                            },
                        ],
                    },
                    header: true
                },
            }
        },
        // 生命周期映射
        lifecycleMap: {
            // 生命周期名称，默认值以及默认的参数名
            custom: {
                codeVar: [],
                code: ''
            },
        },
        // 默认原生事件映射
        nativeEventMap: {
            wheel: ['evt'], //滚轮滚动
            scroll: ['evt'], //滚动
            resize: ['evt'], //窗口大小改变
        },
        // 默认属性映射
        attrsMap: {
            TRow: {
                align: {
                    default: 'center',
                    optionItems: ['top', 'center', 'end', 'stretch', 'baseline']
                },
                justify: {
                    default: 'center',
                    optionItems: ['start', 'end', 'center', 'space-around', 'space-between', 'space-evenly']
                }
            },
            MlSubForm: {
                isAdd: {
                    default: true,
                },
                isAppend: {
                    default: true,
                },
                isDelete: {
                    default: true,
                },
                // maxHeight: {
                //     removeAttr: true // 移除属性 // 移除后仍可使用default进行默认值赋值
                // }
            },
            ElInputNumber: {
                change: {
                    removeAttr: true
                }
            }
        }
    },
    iconUrl: 'http://flower.molianpro.com:33000',
    // i18nInstance: useI18n(),
}
app.use(plug, options);

app.mount('#app');