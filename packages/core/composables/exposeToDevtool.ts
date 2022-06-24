import { isProduction } from '@hsjm/shared'
import { getCurrentInstance, nextTick, reactive } from 'vue-demi'

/**
 * Exposes an object to the Vue Devtools.
 * @param object The object to expose
 */
export const exposeToDevtool = async(object: Record<string, any>) => {
  const instance = getCurrentInstance()
  if (!instance || isProduction) return

  // --- Await init.
  await nextTick()

  // @ts-expect-error: `devtoolsRawSetupState` property not referenced.
  instance.setupState = reactive(object)
}
