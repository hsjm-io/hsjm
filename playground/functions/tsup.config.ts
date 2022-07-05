import { defineConfig } from 'tsup'
import { isProduction } from '../../packages/shared/index'

export default defineConfig({
  entry: ['index.ts'],
  external: isProduction ? [/vue/, /firebase/] : undefined,
  format: ['esm'],
  treeshake: false,
  minify: isProduction,
  splitting: true,
  sourcemap: false,
  metafile: false,
  clean: false,
  dts: false,
  shims: false,
})
