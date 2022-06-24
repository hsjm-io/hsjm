import { isProduction } from '@hsjm/shared'
import { getCurrentInstance, nextTick, reactive } from 'vue-demi'

/**
 * Exposes an object to the Vue Devtools.
 * @param object The object to expose
 */
export const exposeToDevtool = <T extends Record<string, any>>(object: T): T => {
  // --- Get current component instance.
  const instance = getCurrentInstance()
  if (!instance || isProduction) return object

  // @ts-expect-error: ignore --- Update `setupState` on next tick.
  nextTick().then(() => instance.setupState = reactive(object))

  // --- Return the object.
  return object
}
