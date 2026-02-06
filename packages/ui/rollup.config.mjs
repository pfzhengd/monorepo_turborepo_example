import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import dts from 'rollup-plugin-dts'
import JSON from '@rollup/plugin-json'
import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'
import alias from '@rollup/plugin-alias'
import vuePlugin from '@vitejs/plugin-vue'
import ts from 'typescript'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import html from 'rollup-plugin-html2'
import rollupPostcss from 'rollup-plugin-postcss'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import sass from 'sass'
import pxtorem from 'postcss-pxtorem'
import copy from 'rollup-plugin-copy'
import nodePolyfills from 'rollup-plugin-node-polyfills'

function getPlugins () {
  return [
    vuePlugin(),
    typescript({
      exclude: 'node_modules/**',
      typescript: ts
    }),
    resolve(),
    commonjs(),
    nodePolyfills(),
    alias({
      entries: [{
        find: '@src',
        replacement: './src'
      },
      {
        find: '@type',
        replacement: './types'
      }
      ]
    }),
    JSON(),
    rollupPostcss({
      extensions: ['.css', '.scss'],
      plugins: [
        autoprefixer(),
        cssnano(),
        pxtorem({
          rootValue: 14,
          propList: ['*']
        })
      ],
      use: [
        [
          'sass',
          {
            includePaths: ['./node_modules'],
            sass
          }
        ]
      ],
      extract: true
    }),
    copy({
      targets: [{
        src: 'src/assets/fonts',
        dest: 'lib/assets'
      },
      {
        src: 'src/assets/vue',
        dest: 'lib/assets'
      }
      ]
    })
  ]
}

function getExternal () {
  return ['vue']
}

function getGlobals () {
  return {
    vue: 'Vue'
  }
}

function genRollupConfig (module) {
  return {
    input: `./src/${module.input}`,
    output: [{
      exports: 'auto',
      format: 'umd',
      name: module.name,
      file: `lib/${module.output}`,
      globals: getGlobals()
    }],
    watch: {
      include: 'src/**'
    },
    plugins: getPlugins(),
    external: getExternal()
  }
}

const moduleNames = [{
  name: 'Index',
  input: 'index.ts',
  output: 'index.js'
}]

export default () => {
  const config = moduleNames.map((module) => {
    return genRollupConfig(module)
  })

  if (process.env.NODE_ENV === 'production') {
    config.forEach((val) => {
      val.plugins.push(
        terser({
          mangle: true,
          output: {
            comments: /@COMPILER_INJECT/i
          }
        })
      )
    })
    config.push({
      input: './src/index.ts',
      output: [{
        file: 'lib/types/index.d.ts',
        format: 'es'
      }],
      plugins: [dts()]
    })
  } else {
    config.forEach((val) => {
      if (val.input.includes('index.ts')) {
        const plugins = [
          serve({
            open: false, // 在服务器启动时自动在浏览器中打开应用
            contentBase: ['lib'], // 服务器从哪个文件夹提供内容
            host: '127.0.0.1',
            port: 4000 // 服务器端口号
          }),
          livereload('lib'), // 如果您希望使用实时重载
          html({
            template: 'src/public/index.html', // 模板文件路径
            fileName: 'index.html', // 生成的文件名称
            onlinePath: '.'
          })
        ]
        val.plugins.push(...plugins)
      }
    })
  }

  return config
}
