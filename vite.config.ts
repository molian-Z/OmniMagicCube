import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import autoImport from 'unplugin-auto-import/vite'
import components from 'unplugin-vue-components/vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // 这里更改打包相对绝对路径
  server:{
    port: 53000,
    open: true,
  },
  plugins: [
    vue(),
    VitePWA({
      // 使用注入模式
      registerType: 'autoUpdate',
      // PWA的配置
      manifest: {
        name: '无界魔方',
        short_name: '无界魔方',
        description: '无界魔方公共云开发框架',
        icons: [
          {
            src: 'cube192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'cube512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
        // 其他配置...
      },
      // workbox的配置
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,svg}'],
        // 其他workbox配置...
      },
      // 其他插件配置...
    }),
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
      "@molianComps": resolve(__dirname, 'src/components/molian/components'),
    }
  },
  build:{
    sourcemap: true
  }
})
