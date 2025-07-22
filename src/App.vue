<script setup lang="ts">
import designer from "@molianComps/Designer/index.vue";
const designerRef = ref(null);

function getAIPrompt() {
  //使用默认的 basePrompt
  const prompt = designerRef.value?.getAIPrompt();
  // 指定使用某个预定义模板：
//   const prompt = designerRef.value.getAIPrompt({ templateName: "editFormComponent" });
//   // 传递自定义模板内容：
//   const customTemplate = `请根据以下要求生成一个表单组件...`;
//   const prompt = getAIPrompt({ templateContent: customTemplate });
//   //混合使用，传递自定义数据：
//   const prompt = getAIPrompt({
//     templateName: "basePrompt",
//     customData: {
//       requiredFields: ["name", "email", "phone"],
//       formLayout: "vertical",
//     },
//   });
//   //禁用智能选择，强制使用指定模板：
//   const prompt = getAIPrompt({
//     templateName: "basePrompt",
//     smartSelect: false,
//   });
console.log(prompt)
const getSelectedAIData = designerRef.value?.getSelectedAIData();
console.log(getSelectedAIData)
}
</script>

<template>
  <designer ref="designerRef" width="100vw" height="100vh">
    <template v-slot:toolbarRight="scoped">
      <el-button @click="getAIPrompt">getAIPrompt</el-button>
    </template>
  </designer>
</template>

<style>
body {
  background: #f9f9f9;
  overflow: hidden;
}
</style>
