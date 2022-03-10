import { defineConfig } from "rollup"
import pkg from './package.json'

//--- Import Rollup plugins.
import analyze from 'rollup-plugin-analyzer'
import commonJs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import dts from 'rollup-plugin-dts'
import { optimizeLodashImports } from '@optimize-lodash/rollup-plugin'
import babel from '@rollup/plugin-babel'
import { terser } from 'rollup-plugin-terser'

/** Exported config object. */
const baseConfig = defineConfig({
  input: './src/index.ts',
  external: [
    ...Object.keys(pkg.dependencies),
    ...Object.keys(pkg.optionalDependencies),
    /lodash\/.*/,
    /firebase\/.*/
  ],
})

// --- Config for `*.mjs` export.
const configModule = defineConfig({
  ...baseConfig,
  
  output: {
    file: pkg.module,
    format: 'es',
    sourcemap: true,
  },

  plugins: [
    analyze({ limit: 0, summaryOnly: true }),
    typescript({ sourceMap: true, removeComments: true }),
    nodeResolve({ preferBuiltins: true, browser: true }),
    commonJs({ transformMixedEsModules: true }),
    optimizeLodashImports({ appendDotJs: true }),
    babel({ babelHelpers: 'bundled' }),
  ]
})

// --- Config for `*.cjs` export.
const configCommonJs = defineConfig({
  ...baseConfig,

  output: [
    { file: pkg.main, format: 'cjs', sourcemap: true },
    { file: pkg.main.replace('.cjs', '.min.cjs'), sourcemap: true, format: 'cjs', plugins: [terser()] },
  ],

  plugins: [
    typescript({ sourceMap: true, removeComments: true }),
    nodeResolve({ preferBuiltins: true, browser: true }),
    commonJs({ transformMixedEsModules: true }),
    optimizeLodashImports(),
    babel({ babelHelpers: 'bundled' }),
  ]
})

// --- Config for `*.iife` export.
const configIife = defineConfig({
  ...baseConfig,
  
  output: {
    file: pkg.unpkg,
    format: 'iife',
    sourcemap: 'inline',
    globals: {
      'vue-demi': 'VueDemi',
      '@vueuse/shared': 'VueUse',
      '@vueuse/core': 'VueUse',
    },
    plugins: [
      typescript({ sourceMap: false }),
      nodeResolve ({ preferBuiltins: true, browser: true }),
      // optimizeLodashImports({
      //   appendDotJs: false,
      // }),
      // commonJs(),
      // babel({ babelHelpers: 'bundled', }),
    ]
  },
})

// --- Config for `d.ts` export.
const configDts = defineConfig({
  ...baseConfig,

  output: {
    dir: 'dist',
    format: 'es',
  },

  plugins: [
    typescript(),
    dts(),
  ]
})

// --- Export config
export default [
  configModule,
  configCommonJs,
  // configIife,
  configDts
]
