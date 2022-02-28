import { ComponentResolver } from 'unplugin-vue-components/types'

interface PompauteResolverOptions {
}

export const PompauteResolver = (options?: PompauteResolverOptions): ComponentResolver => ({
  type: 'component',
  resolve: (name: string) => {
    return { 
      Button: { path: 'pompaute', importName: 'Button' },
      RouterLink: { path: 'vue-router', importName: 'RouterLink' }
    }[name]
  }
})