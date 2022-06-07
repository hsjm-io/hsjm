import { Ref } from 'vue-demi'
import { createSharedComposable } from '@vueuse/shared'
import { templateRef, useElementSize, useWindowScroll } from '@vueuse/core'

interface UseLayoutOptions {
  rootEl?: Ref<HTMLElement | SVGElement>
  headerEl?: Ref<HTMLElement | SVGElement>
  footerEl?: Ref<HTMLElement | SVGElement>
}

/**
 * Returns an object with various information related to the layout of an element.
 * @param {UseLayoutOptions} [options]
 * @returns {UseLayout}
 */
export const useLayout = createSharedComposable((options?: UseLayoutOptions) => {
  const { y: scroll } = useWindowScroll()

  const root = options?.rootEl ?? templateRef('root')
  const header = options?.headerEl ?? templateRef('header')
  const footer = options?.footerEl ?? templateRef('footer')

  const { height, width } = useElementSize(root)
  const { height: headerHeight, width: widthHeight } = useElementSize(header)
  const { height: footerHeight, width: footerWidth } = useElementSize(footer)

  return {
    scroll,
    height,
    width,
    headerHeight,
    widthHeight,
    footerHeight,
    footerWidth,
  }
})
