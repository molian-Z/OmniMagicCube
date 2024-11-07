import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import autoImport from 'unplugin-auto-import/vite'
import components from 'unplugin-vue-components/vite'
import visualizer from 'rollup-plugin-visualizer'
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
                './src/**',
            ],
        }),
        components({
            dirs: ['src/components'],
            include: [/\.vue$/, /\.vue\?vue/, /\.tsx$/],
            dts: './src/types/components.d.ts',
        }),
        visualizer(),
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
        outDir: "libRenderDist", //输出文件名称
        sourcemap: false,
        lib: {
            entry: resolve(__dirname, "../src/lib-render-main.ts"), //指定组件编译入口文件
            name: "omni-magic-cube__render",
            fileName: (format) => `render.${format}.js`,
            formats: ["es", "cjs", 'umd'],
        }, //库编译模式配置
        rollupOptions: {
            // 确保外部化处理那些你不想打包进库的依赖
            external: ["vue", "element-plus", "naive-ui", "tdesign-vue-next", "vexip-ui", "ant-design-vue", "ace-builds", "echarts",
                "@popperjs/core",
                "@imengyu/vue3-context-menu",
                "@vueuse/core",
                "@vueuse/integrations",
                "@vueuse/math",
                "fuse.js",
                "gsap",
                "change-case",
                "dexie",
                "lodash-es",
                "sortablejs",
                "vue3-colorpicker",
                "@iconify/vue",
                "ace-builds/src-min-noconflict/snippets/javascript",
                "ace-builds/src-min-noconflict/ext-beautify",
                "ace-builds/src-min-noconflict/theme-dracula",
                'ace-builds/src-min-noconflict/mode-javascript',
                'ace-builds/src-min-noconflict/mode-html',
                'ace-builds/src-min-noconflict/mode-css',
                'ace-builds/src-min-noconflict/ext-language_tools',
                "ace-builds/src-min-noconflict/mode-json",
                "ace-builds/src-min-noconflict/ext-searchbox",
                "ace-builds/src-min-noconflict/ext-error_marker",
                "ace-builds/src-min-noconflict/ext-linking",
                "ace-builds/src-min-noconflict/ext-emmet",
                "ace-builds/src-min-noconflict/ext-elastic_tabstops_lite",
                "ace-builds/src-min-noconflict/ext-command_bar",
                "ace-builds/src-min-noconflict/ext-beautify",
                "ace-builds/src-min-noconflict/ext-linking",
                "ace-builds/src-min-noconflict/ext-options",
                "ace-builds/src-min-noconflict/ext-prompt",
                "ace-builds/src-min-noconflict/worker-json",
                "ace-builds/src-min-noconflict/worker-javascript",
                "ace-builds/src-min-noconflict/worker-css",
                "ace-builds/src-min-noconflict/snippets/css",
                "ace-builds/src-min-noconflict/snippets/javascript",
                '/node_modules/ace-builds/src-min-noconflict/worker-json.js',
                '/node_modules/ace-builds/src-min-noconflict/worker-javascript.js',
                'vue-i18n'
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

