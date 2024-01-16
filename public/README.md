# OmniMagicCube 无界魔方

[文档中心](https://www.yuque.com/u12572940/wujiemofang)
### 商用请保留版权信息
[演示网址](http://demo.mlyt.top/)
```
这是一个支持VUE3主流UI组件库的可视化框架
问题交流请加QQ群：685018059
```

# 使用说明

- 注意下方内容默认采用element-plus组件库作为示例。其他UI库请按照实际名称进行替换。
- 目前已经支持tdesign-vue-next、element-plus、naive、ant-design-vue、vexip、arco库。
- 只有设计器需要。单独引入render时不需要。

## 集成到项目中

### 1.main.js
```
import {ElMessage , ElNotification } from 'element-plus';

// designer
import omc from 'omni-magic-cube';
import 'omni-magic-cube/index.css'
// ...UI框架引入,注意一定要在其他UI库引入完成后在对我们的组件进行引入。因为它首先会获取所有的全局组件进行配置
app.use(omc, {
    useUI:"element-plus",
    compsConfig: {
        globalComps:{
            message:ElMessage,
            notify:ElNotification
        }
    },
});
```

### 2.最后在需要使用我们的组件的地方引入即可
```
<script setup>
</script>

<template>
  <OmcDesigner width="100vw" height="100vh" />
</template>

<style>
body{
  background: #F9F9F9;
  overflow: hidden;
}
</style>

```
