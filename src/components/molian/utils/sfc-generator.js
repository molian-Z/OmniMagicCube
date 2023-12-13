const sourceCode = `  
<template>  
  <div>Hello, world!</div>  
</template>  
<script>  
export default {  
  name: 'MyComponent',  
  data() {  
    return {  
      message: 'Hello, world!'  
    }  
  }  
}  
</script>  
<style scoped>  
div {  
  color: red;  
}  
</style>  
`  
const result = compileTemplate({  
  source: sourceCode,  
  filename: 'example.sfc.vue',  
  id: 'example'  
})  
console.log(result) // 输出编译结果