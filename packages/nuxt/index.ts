/* eslint-disable unicorn/prevent-abbreviations */
import { resolve } from 'node:path'
import { defineNuxtModule } from '@nuxt/kit'
import { VitePluginFonts, VitePluginFontsOptions } from 'vite-plugin-fonts'
import VitePluginCompress from 'vite-plugin-compress'
type VitePluginCompressOptions = Parameters<typeof VitePluginCompress>[0]

const moduleNames = [
  '@hsjm/shared',
  '@hsjm/core/utils',
  '@hsjm/core/composables',
  '@hsjm/fireworks/modules',
  '@hsjm/fireworks/composables',
]

export interface HsjmNuxtOptions {
  /**
   * Auto-imports functions and composables.
   * @default true
   */
  autoImports?: boolean
  /**
   * Auto-import components.
   * @default true
   */
  components?: boolean
  /**
   *
   * Options for `vite-plugin-fonts`
   * A vite plugin for auto-importing fonts.
   * @see https://github.com/stafyniaksacha/vite-plugin-fonts
   */
  fonts?: VitePluginFontsOptions
  /**
   * Options for `vite-plugin-compress`;
   * A vite plugin for compressing assets
   * @see https://github.com/alloc/vite-plugin-compress
   */
  compress?: VitePluginCompressOptions
  /**
   * Enable dependency optimization.
   * @default true
   * @see https://vitejs.dev/config/dep-optimization-options.html
   */
  optimizeDependencies?: boolean
}

/**
 * Auto import for Hsjm in Nuxt
 * Usage:
 *
 * ```ts
 * // nuxt.config.js
 * export deafult {
 *   buildModules: [
 *     '@hsjm/nuxt'
 *   ]
 * }
 * ```
 */
export default defineNuxtModule<HsjmNuxtOptions>({
  meta: {
    name: 'hsjm',
    configKey: 'hsjm',
    compatibility: {
      nuxt: '>=3.0.0',
      bridge: true,
    },
  },
  defaults: {
    components: true,
    autoImports: true,
    optimizeDependencies: true,
  },
  async setup(options, nuxt) {
    // add pacages to transpile target for alias resolution
    // nuxt.options.build = nuxt.options.build || {}
    // nuxt.options.build.transpile = nuxt.options.build.transpile || []
    // nuxt.options.build.transpile.push(...moduleNames)

    // --- Inject `vite-plugin-fonts` plugin.
    if (options.fonts) {
      nuxt.options.vite = nuxt.options.vite || {}
      nuxt.options.vite.plugins = nuxt.options.vite.plugins || []
      nuxt.options.vite.plugins.push(VitePluginFonts(options.fonts))
      nuxt.options.css = nuxt.options.css || []
      nuxt.options.css.push('virtual:fonts.css')
    }

    // --- Inject `vite-plugin-imagemin` plugin.
    if (options.compress) {
      nuxt.options.vite = nuxt.options.vite || {}
      nuxt.options.vite.plugins = nuxt.options.vite.plugins || []
      nuxt.options.vite.plugins.push(VitePluginCompress(options.compress))
    }

    // --- Auto imports components
    if (options.components) {
      nuxt.hook('components:dirs', (dirs: any[]) => {
        dirs.push({
          path: resolve('./node_modules/@hsjm/core/components'),
          extensions: ['ts'],
        })
      })
    }

    // --- Push dependency names to `optimizeDeps.include`
    if (typeof options.optimizeDependencies === 'boolean') {
      const key = options.optimizeDependencies ? 'include' : 'exclude'
      nuxt.options.vite = nuxt.options.vite || {}
      nuxt.options.vite.optimizeDeps = nuxt.options.vite.optimizeDeps || {}
      nuxt.options.vite.optimizeDeps[key] = nuxt.options.vite.optimizeDeps[key] || []
      nuxt.options.vite.optimizeDeps[key]?.push(...moduleNames)
    }

    // --- Auto imports
    if (options.autoImports) {
      // --- Get all imports from modules
      const modules = await Promise.all(moduleNames.map(async(moduleName) => {
        const module = await import(moduleName)
        return { from: moduleName, imports: Object.keys(module) }
      }))

      // --- Hook `autoImports:sources` to inject imports
      nuxt.hook('autoImports:sources', async(presets) => {
        const presetFroms = new Set(presets.map(preset => preset.from))
        const modulesToImport = modules.filter(module => (!presetFroms.has(module.from)))
        for (const { from, imports } of modulesToImport) presets.push({ from, imports, priority: -1 })
      })
    }
  },
})

declare module '@nuxt/schema' {
  interface NuxtConfig {
    hsjm?: HsjmNuxtOptions
  }
  interface NuxtOptions {
    hsjm?: HsjmNuxtOptions
  }
}
