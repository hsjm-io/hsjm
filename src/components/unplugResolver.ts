import { ComponentResolver } from 'unplugin-vue-components/types'

interface UnplugResolverOptions {
  prefix?: boolean | string
}

export const unplugResolver = (options = {} as UnplugResolverOptions): ComponentResolver => ({
  type: 'component',
  resolve: (name: string) => {
    const { prefix = '' } = options
    return {
      [`${prefix}Button`]: { path: 'pompaute', importName: 'Button' },
      [`${prefix}Icon`]: { path: 'pompaute', importName: 'Icon' },
      [`${prefix}Nato`]: { path: 'pompaute', importName: 'Nato' },
      [`${prefix}Layout`]: { path: 'pompaute', importName: 'Layout' },
    }[name]
  },
})
