import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import autoImport from 'unplugin-auto-import/vite'
import components from 'unplugin-vue-components/vite'
// import visualizer from 'rollup-plugin-visualizer'
// import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
    base: './', // 这里更改打包相对绝对路径
    plugins: [
        vue(),
        // createSvgIconsPlugin({
        //   // Specify the icon folder to be cached
        //   iconDirs: [resolve(process.cwd(), 'src/components/molian/assets/icons')],
        //   // Specify symbolId format
        //   symbolId: 'icon-[dir]-[name]',
        // }),
        autoImport({
            imports: [
                'vue'
            ],
            dts: './src/types/auto-imports.d.ts',
            dirs: [
                './src/components/molian/utils',
                './src/components/molian/components'
            ],
            // 禁用警告信息
            eslintrc: {
                enabled: false
            },
            // 减少扫描范围，避免重复导入警告
            ignore: [
                '**/node_modules/**',
                '**/dist/**',
                '**/libDist/**',
                '**/types/**'
            ],
            // 禁用重复导入检查
            vueTemplate: false
        }),
        components({
            dirs: ['src/components'],
            include: [/\.vue$/, /\.vue\?vue/, /\.tsx$/],
            dts: './src/types/components.d.ts',
        }),
        // visualizer(),
        // dts({ rollupTypes: true })
    ],
    resolve: {
        alias: {
            "@": resolve(__dirname, '../src'), // 路径别名
            "@molian": resolve(__dirname, '../src/components/molian'),
            "@molianComps": resolve(__dirname, '../src/components/molian/components'),
        }
    },
    build: {
        outDir: "libDist", //输出文件名称
        // sourcemap: false,
        emptyOutDir:false,
        lib: {
            entry: resolve(__dirname, "../src/lib-render-main.ts"), //指定组件编译入口文件
            name: "OmniMagicCubeRender",
            fileName: (format) => `render.${format}.js`,
            formats: ["es", "cjs"],
        }, //库编译模式配置
        rollupOptions: {
            // 确保外部化处理那些你不想打包进库的依赖
            external: ["vue", "element-plus", "naive-ui", "tdesign-vue-next", "vexip-ui", "ant-design-vue", "monaco-editor", "echarts",
                "@popperjs/core",
                "@imengyu/vue3-context-menu",
                "@vueuse/core",
                "@vueuse/integrations",
                "@vueuse/math",
                "fuse.js",
                "gsap",
                "change-case",
                "dexie",
                "es-toolkit",
                "sortablejs",
                "vue3-colorpicker",
                "@iconify/vue",
                'vue-i18n',
                'highlight.js',
                'highlight.js/styles/github.css',
            ],
            output: {
                // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
                globals: {
                    vue: "Vue",
                    echarts: "echarts"
                },
                assetFileNames: 'render.css',
                exports: "named"
            },
        },
    }
})

