import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import autoImport from 'unplugin-auto-import/vite'
import components from 'unplugin-vue-components/vite'
import visualizer from 'rollup-plugin-visualizer'
import dts from 'vite-plugin-dts'

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
    }),
    visualizer(),
    dts({ rollupTypes: true })
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
    lib: {
      entry: resolve(__dirname, "../src/lib-main.ts"), //指定组件编译入口文件
      name: "omni-magic-cube",
      fileName: (format) => `index.${format}.js`,
      formats: ["es", "cjs", 'umd'],
    }, //库编译模式配置
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ["vue", "element-plus", "naive-ui", "tdesign-vue-next", "vexip-ui", "ant-design-vue", "ace-builds", "ace-builds/src-min-noconflict/snippets/javascript", "ace-builds/src-min-noconflict/ext-beautify", "ace-builds/esm-resolver"],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: "Vue",
          ['ace-builds']: "ace-builds",
          ['ace-builds/src-min-noconflict/snippets/javascript']:"ace-builds/src-min-noconflict/snippets/javascript",
          // ['ace-builds/src-min-noconflict/worker-javascript']: "ace-builds/src-min-noconflict/worker-javascript",
          ['ace-builds/src-min-noconflict/ext-beautify']: "ace-builds/src-min-noconflict/ext-beautify",
          ['ace-builds/esm-resolver']: "ace-builds/esm-resolver"
        },
        assetFileNames: 'index.css',
        exports:"named"
      },
    },
  }
})

