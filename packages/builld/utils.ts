import { defineConfig, OutputOptions } from 'rollup'
import { readFileSync } from 'fs'
import { join, resolve } from 'path'

//--- Import Rollup plugins.
import analyze from 'rollup-plugin-analyzer'
import esbuild, { Options as ESBuildOptions } from 'rollup-plugin-esbuild'
import babel from '@rollup/plugin-babel'
import dts from 'rollup-plugin-dts'
import { optimizeLodashImports, OptimizeLodashOptions } from '@optimize-lodash/rollup-plugin'
import { camelCase, upperFirst } from 'lodash'

const esbuildMinifer = (options?: ESBuildOptions) => ({
  name: 'esbuild-minifer',
  renderChunk: esbuild(options).renderChunk,
})

const lodashOptimize = (options?: OptimizeLodashOptions) => ({
  name: 'lodash-optimize',
  transform: optimizeLodashImports(options).transform,
})

const globals = (name: string) => {
  if (name === 'leaflet') return 'L'
  if (name === 'lodash') return 'lodash'
  if (name.match('^lodash\/?.*$')) return `lodash.${name.split('/').slice(1).join('.')}`
  if (name.match('^@vueuse\/?.*$')) return 'VueUse'
  if (name.match('^@hsjm\/?.*$')) return 'Hsjm'
  if (name.match('^vue-demi$')) return 'VueDemi'
  return upperFirst(camelCase(name))
}

const importPackage = (path: string): Record<string, any> => {
  return JSON.parse(readFileSync(path).toString())
}

export const createRollupConfig = (path: string) => {

  const name = path.split('/').pop() as string
  const pathRoot = join(__dirname, '..')
  const pathEntry = join(path, 'index.ts')
  const pkg = importPackage(resolve(pathRoot, path, 'package.json'))
  const pkgRoot = importPackage(resolve(pathRoot, 'package.json'))

  const external = [...new Set([
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.peerDependencies ?? {}),
    ...Object.keys(pkgRoot.dependencies ?? {}),
    ...Object.keys(pkgRoot.peerDependencies ?? {}),
  ])]

  // --- Base config.
  const configSrc = defineConfig({
    input: pathEntry,
    output: [],
    external: external,
    plugins: [
      esbuild({ sourceMap: true, target: 'esnext' }),
      babel({ babelHelpers: 'bundled' }),
    ],
  });

  // --- Add ESModule config.
  (<OutputOptions[]>configSrc.output).push({
    file: join('dist', name, pkg.module),
    format: 'es',
    sourcemap: true,
  });

  // --- Add CommonJS config.
  (<OutputOptions[]>configSrc.output).push({
    file: join('dist', name, pkg.main),
    format: 'cjs',
    sourcemap: true,
  },
  {
    file: join('dist', name, pkg.main.replace('.cjs', '.min.cjs')),
    sourcemap: true,
    format: 'cjs',
    plugins: [esbuildMinifer({ minify: true })]
  });

  // --- Add IIFE config.
  (<OutputOptions[]>configSrc.output).push({
    name: upperFirst(camelCase(pkg.name)),
    file: join('dist', name, pkg.unpkg.replace('.min', '')),
    format: 'iife',
    sourcemap: true,
    globals: globals,
  },
  {
    name: upperFirst(camelCase(pkg.name)),
    file: join('dist', name, pkg.unpkg.replace('.cjs', '.min.cjs')),
    format: 'iife',
    sourcemap: true,
    globals: globals,
    plugins: [esbuildMinifer({ minify: true })]
  });

  // --- Config for 'd.ts' export.
  const configDts = defineConfig({
    ...configSrc,

    output: {
      file: join('dist', name, pkg.types),
      format: 'es'
    },

    plugins: [
      esbuild(),
      dts(),
    ]
  });

  // --- Export config.
  return [
    configSrc,
    configDts
  ]
}
