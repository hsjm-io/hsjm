import { ComponentResolver } from 'unplugin-vue-components/types'

interface PompauteResolverOptions {
  prefix?: boolean | string
}

export const PompauteResolver = (options = {} as PompauteResolverOptions): ComponentResolver => ({
  type: 'component',
  resolve: (name: string) => {

    const prefix = options.prefix || ''

    return {
      [`${prefix}Button`]: { path: 'pompaute', importName: 'Button' },
      [`${prefix}Icon`]: { path: 'pompaute', importName: 'Icon' },
      [`${prefix}Nato`]: { path: 'pompaute', importName: 'Nato' },
    }[name]
  }
})
