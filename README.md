# OmniMagicCube 无界魔方

### 商用请保留版权信息
[演示网址](http://demo.mlyt.top/)
```
这是一个支持VUE3主流UI组件库的可视化框架
这个框架跟市面上的其他可视化框架是完全不同的产品。
因为我们不需要对组件进行任何的封装。
这个特性注定它会支持所有VUE3的常规组件库。
我们在支持常规的render与designer的同时支持了代码生成功能。
它将是真正意义上的全组件生成而非预置的组件生成。
当然我们还支持了一个全新的特性。我们将采用broadcastchannel（频道广播）来直接支持不同标签页间的数据通信。


严格意义来讲我们对他的定义是系统的一个模块。
我们希望在所有的vue3项目中都可以轻松的使用它。
```

# 使用说明

- 注意下方内容默认采用TDeisnVue组件库作为示例。其他UI库请按照实际名称进行替换

## 集成到项目中

### 1.复制components中的molian到自己的项目中,并对vite.config进行以下配置

```
export default defineConfig({
  plugins: [
    ...您的内容
    createSvgIconsPlugin({
      // Specify the icon folder to be cached
      iconDirs: [resolve(process.cwd(), 'src/components/molian/assets/icons')],
      // Specify symbolId format
      symbolId: 'icon-[dir]-[name]',
    })
    // 如果已经存在该插件仅需在iconDirs中加入我们的路径
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, 'src'), // 路径别名
      "@molian": resolve(__dirname, 'src/components/molian'),
      "@molianDesigner": resolve(__dirname, 'src/components/molian/components/designer'),
      "@molianRender": resolve(__dirname, 'src/components/molian/components/render'),
      "@molianComps": resolve(__dirname, 'src/components/molian/components'),
    },
    extensions: ['.js', '.vue', '.json', '.ts', '.jsx'] // 使用路径别名时想要省略的后缀名，可以自己 增减
  },

})

```
### 2.main.js
```
import plug from '@molian/utils/plug' // 我们需要引入plug进行配置
// 我们需要获取全局组件message以及notify，传入plug中,它将给予我们提示能力
// TDesign
import TDesign, {MessagePlugin, NotifyPlugin} from 'tdesign-vue-next';


// ...UI框架引入,注意一定要在其他UI库引入完成后在对我们的组件进行引入。因为它首先会获取所有的全局组件进行配置
app.use(plug, {
    compsConfig: {
        globalComps:{
            message:MessagePlugin,
            notify:NotifyPlugin
        }
    },
});
```

### 3.修改配置
我们需要在 utils/defaultData中修改我们的配置,其中uiMapping可以将我们系统中所使用的组件换成我们所需要的UI库。
目前配置有5个组件库。其他适配请参照该文件自行配置。因组件还在开发阶段该内容暂不过多赘述。

### 4.最后在需要使用我们的组件的地方引入即可
```
<script setup>
import designer from '@molianDesigner/index.vue'
</script>

<template>
  <designer width="100vw" height="100vh" />
</template>

<style>
body{
  background: #F9F9F9;
  overflow: hidden;
}
</style>

```
