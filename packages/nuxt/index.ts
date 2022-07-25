/* eslint-disable unicorn/prevent-abbreviations */
import { resolve } from 'node:path'
import { defineNuxtModule } from '@nuxt/kit'
import { moduleExists, requireSafe } from '@hsjm/shared'
import { VitePluginFonts, VitePluginFontsOptions } from 'vite-plugin-fonts'
import VitePluginCompress from 'vite-plugin-compress'
type VitePluginCompressOptions = Parameters<typeof VitePluginCompress>[0]

const packages = [
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
  },
  defaults: {
    components: true,
    autoImports: true,
    optimizeDependencies: true,
  },
  setup(options, nuxt) {
    // opt-out Vite deps optimization for Hsjm
    nuxt.hook('vite:extend', ({ config }: any) => {
      config.optimizeDeps = config.optimizeDeps || {}
      config.optimizeDeps.exclude = config.optimizeDeps.exclude || []
      config.optimizeDeps.exclude.push(...packages)
    })

    // add pacages to transpile target for alias resolution
    nuxt.options.build = nuxt.options.build || {}
    nuxt.options.build.transpile = nuxt.options.build.transpile || []
    nuxt.options.build.transpile.push(...packages)

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
    if (options.optimizeDependencies) {
      nuxt.options.vite = nuxt.options.vite || {}
      nuxt.options.vite.optimizeDeps = nuxt.options.vite.optimizeDeps || {}
      nuxt.options.vite.optimizeDeps.include = nuxt.options.vite.optimizeDeps.include || []
      nuxt.options.vite.optimizeDeps.include.push(...packages)
    }

    // --- Auto imports
    if (options.autoImports) {
      nuxt.hook('autoImports:sources', (presets) => {
        // --- Avoid duplicate imports
        const presetFroms = new Set(presets.map(preset => preset.from))
        const presetImports = new Set(presets.flatMap(preset => preset.imports))

        // --- Add Hsjm imports
        for (const from of packages) {
          // --- Avoid duplicate imports
          if (presetFroms.has(from)) {
            console.warn(`[hsjm] Skipping duplicate import from ${from}`)
            continue
          }

          // --- Make sure the module exists
          if (!moduleExists(from)) {
            console.warn(`[hsjm] Skipping auto-import of ${from} because it does not exist.`)
            continue
          }

          // --- List all exports of the module
          const imports = requireSafe(from)
          const names = Object.keys(imports)

          // --- Push import preset
          presets.push({
            from: resolve('./node_modules', from),
            names,
            imports: names,
            priority: -1,
          })
        }
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
