import { defineConfig } from "rollup"
import RollupCommonJs from '@rollup/plugin-commonjs'
import RollupNodeResolve from '@rollup/plugin-node-resolve'
import RollupTypescript from '@rollup/plugin-typescript'
import RollupBabel from '@rollup/plugin-babel'
import RollupDts from 'rollup-plugin-dts'
import RollupVue from 'rollup-plugin-vue'
import { terser as RollupTerser } from 'rollup-plugin-terser'

const globals = {
  'vue-demi': 'VueDemi',
  '@vueuse/shared': 'VueUse',
  '@vueuse/core': 'VueUse',
}

/** Exported config object. */
const configs = []
const baseConfig = {
  input: './src/index.ts',
  external: [
    'crypto',
    'vue-demi',
    '@vueuse/core',
    '@vueuse/shared',
  ],
}

// --- Config for `*.cjs` export.
configs.push(defineConfig({
  ...baseConfig,

  output: [
    { file: 'dist/index.esm.js', format: 'esm' },
    { file: 'dist/index.cjs.js', format: 'cjs' },
    // { file: 'dist/index.amd.js', format: 'amd' },
    // { file: 'dist/index.iife.js', format: 'iife', name: 'Pompaute', globals },
    
    // { file: 'dist/index.esm.min.js', format: 'esm', sourcemap: true, plugins: [RollupTerser()] },
    // { file: 'dist/index.cjs.min.js', format: 'cjs', sourcemap: true, plugins: [RollupTerser()] },
    // { file: 'dist/index.amd.min.js', format: 'amd', sourcemap: true, plugins: [RollupTerser()] },
    // { file: 'dist/index.iife.min.js', format: 'iife', name: 'Pompaute', globals, sourcemap: true, plugins: [RollupTerser()] },
  ],

  plugins: [
    RollupTypescript({ sourceMap: false }),
    RollupNodeResolve({ preferBuiltins: false, browser: true }),
    RollupCommonJs({  }),
    RollupVue({}),
    RollupBabel({ babelHelpers: 'bundled', }),
  ]
}))

// --- Config for `d.ts` export.
configs.push(defineConfig({
  ...baseConfig,
  output: [{ file: 'dist/index.d.ts', format: 'es' }],
  plugins: [
    RollupDts(),
  ]
}))

// --- Export config
export default configs
