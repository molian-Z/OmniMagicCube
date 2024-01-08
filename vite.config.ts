import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import autoImport from 'unplugin-auto-import/vite'
import components from 'unplugin-vue-components/vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // 这里更改打包相对绝对路径
  plugins: [
    vue(),
    createSvgIconsPlugin({
      // Specify the icon folder to be cached
      iconDirs: [resolve(process.cwd(), 'src/components/molian/assets/icons')],
      // Specify symbolId format
      symbolId: 'icon-[dir]-[name]',
    }),
    autoImport({
      imports: [
        'vue'
      ],
      dts: './src/types/auto-imports.d.ts',
      dirs: [
        './src/**',
      ],
    }),
    components({
      dirs: ['src/components'],
      include: [/\.vue$/, /\.vue\?vue/, /\.tsx$/],
      dts: './src/types/components.d.ts',
    })
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, 'src'), // 路径别名
      "@molian": resolve(__dirname, 'src/components/molian'),
      "@molianDesigner": resolve(__dirname, 'src/components/molian/components/designer'),
      "@molianRender": resolve(__dirname, 'src/components/molian/components/render'),
      "@molianComps": resolve(__dirname, 'src/components/molian/components'),
    }
  },
})
