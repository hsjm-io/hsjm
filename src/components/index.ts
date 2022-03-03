import { defineAsyncComponent } from 'vue-demi';
import { Button } from './Button'
import { Layout } from './Layout'
import { Icon } from './Icon'
import { Nato } from './Nato'

const ButtonLazy = defineAsyncComponent(() => import('./Button'))
const LayoutLazy = defineAsyncComponent(() => import('./Layout'))
const IconLazy = defineAsyncComponent(() => import('./Icon'))
const NatoLazy = defineAsyncComponent(() => import('./Nato'))

export {
  Button, ButtonLazy,
  Layout, LayoutLazy,
  Icon, IconLazy,
  Nato, NatoLazy,
}
