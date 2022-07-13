import { Component, resolveComponent } from 'vue-demi'

/**
 * Resolves to a Vue Component or HTML Tag name.
 * @param {string} type The type to resolve
 * @returns {Component|keyof HTMLElementTagNameMap}
 */
export const resolveComponentType = <T extends Component, K extends string = string>(type: K): K extends keyof HTMLElementTagNameMap ? K : K | T => (
  /^[A-Z]/.test(type)
    ? <any>resolveComponent(type)
    : type
)
