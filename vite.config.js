import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import visualizer from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    createSvgIconsPlugin({
      // Specify the icon folder to be cached
      iconDirs: [resolve(process.cwd(), 'src/components/molian/assets/icons')],
      // Specify symbolId format
      symbolId: 'icon-[dir]-[name]',
    }),
    //可视化Bundle
		visualizer(),
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
