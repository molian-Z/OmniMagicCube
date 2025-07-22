import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueI18n from '@intlify/unplugin-vue-i18n/vite'
import { VitePWA } from 'vite-plugin-pwa';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import autoImport from 'unplugin-auto-import/vite'
import components from 'unplugin-vue-components/vite'
import loadVersion from 'vite-plugin-package-version';
import vueDevTools from 'vite-plugin-vue-devtools'
import monacoEditorPlugin from 'vite-plugin-monaco-editor'
// https://vitejs.dev/config/
export default defineConfig({
    base: './', // 这里更改打包相对绝对路径
    server: {
        port: 53000,
        open: true,
    },
    plugins: [
        loadVersion(),
        vue(),
        vueDevTools(),
        VitePWA({
            // 使用注入模式
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            // devOptions: {
            //   enabled: true
            // },
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
            customDomId: '__molian_icons__dom__'
        }),
        autoImport({
            imports: [
                'vue'
            ],
            dts: './src/types/auto-imports.d.ts',
            dirs: [
                './src/types/**',
            ],
        }),
        components({
            dirs: ['src/components'],
            include: [/\.vue$/, /\.vue\?vue/, /\.tsx$/],
            dts: './src/types/components.d.ts',
        }),
        vueI18n({
            include: resolve(process.cwd(), 'src/components/molian/locales/lang/**'),
        }),
        monacoEditorPlugin({
            languageWorkers: ['editorWorkerService', 'typescript', 'json', 'css']
        }),
    ],
    resolve: {
        alias: {
            "@": resolve(__dirname, 'src'), // 路径别名
            "@molian": resolve(__dirname, 'src/components/molian'),
            "@molianComps": resolve(__dirname, 'src/components/molian/components'),
        }
    },
    build: {
        rollupOptions: {
            output: {
                // 使用 manualChunks 来定义分割策略
                manualChunks(id) {
                    // 按需分割第三方库
                    // if (id.includes('node_modules')) {
                    //   return id.toString().split('node_modules/')[1].split('/')[0].toString();
                    // }
                    // 根据文件名或目录分割你的代码
                    // 例如，将相同文件夹下的代码分割到同一个chunk
                    if (id.includes('src/components/')) {
                        return 'components';
                    }
                    // 如果有其他分割需求可以继续添加逻辑
                },
                // 以下配置可选，根据需要设置输出文件名
                entryFileNames: 'js/[name].[hash].js',
                chunkFileNames: 'js/[name].[hash].js',
                assetFileNames: '[ext]/[name].[hash].[ext]'
            }
        }
    }
})
