import { ComponentResolver } from 'unplugin-vue-components/types'

const components = new Set([
  'Button',
  'Icon',
  'Input',
  'Switch',
  'Table',
])

export interface HsjmResolverOptions {
  /**
   * prefix for hsjm components used in templates
   *
   * @default ""
   */
  prefix?: string
}

/**
 * Unplugin component resolver for HSJM Vue components.
 * @param {HsjmResolverOptions} options Options of the resolver.
 */
export function HsjmUnpluginResolver(options: HsjmResolverOptions = {}): ComponentResolver {
  const { prefix = '' } = options
  return {
    type: 'component',
    resolve: (name: string) => {
      const componentName = name.slice(prefix.length)
      if (!name.startsWith(prefix)) return
      if (!components.has(componentName)) return
      return {
        name: componentName,
        from: '@hsjm/core',
      }
    },
  }
}
