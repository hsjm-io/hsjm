import { DefineComponent, resolveComponent } from 'vue-demi'

/**
 * Resolves to a Vue Component or HTML Tag name.
 * @param {string} type The type to resolve
 * @returns {DefineComponent|keyof HTMLElementTagNameMap}
 */
export const resolveComponentType = <T extends DefineComponent>(type: string) => (/^[A-Z]/.test(type)
  ? resolveComponent(type) as T
  : type as keyof HTMLElementTagNameMap)
