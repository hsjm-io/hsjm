import { isProduction } from '@hsjm/shared/environment'
import { ComponentInternalInstance, getCurrentInstance, nextTick } from 'vue-demi'

/**
 * Exposes an object to the Vue Devtools.
 * @param {Record<string, any>} object The object to expose
 * @param {ComponentInternalInstance} [componentInstance] The component instance to expose to
 * @returns {Record<string, any>} The exposed object
 */
export const exposeToDevtool = <T extends Record<string, any>>(object: T, componentInstance?: ComponentInternalInstance | null): T => {
  // --- Get current component instance.
  const instance = componentInstance ?? getCurrentInstance()
  if (!instance || isProduction) return object

  // @ts-expect-error: ignore --- Update `setupState` on next tick.
  nextTick(() => instance.setupState = object)

  // --- Return the object.
  return object
}
