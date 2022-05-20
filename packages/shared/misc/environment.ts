import { requireSafe } from '../module'

/** Empty function. */
export const noop = () => {}

/** Empty async function. */
export const noopAsync = async() => {}

/** Current process's environment object. */
// @ts-expect-error: Property 'env' does not exist on type 'ImportMeta'.
export const environment = import.meta?.env ?? typeof process !== 'undefined' ? process.env : {}

/** Current process's environment object. */
export const getEnvironmentVariable = (name: string) => environment[name] ?? environment[`VITE_${name}`]

/** Is process running in development environment. */
export const isDevelopment = () => !!environment.DEV || environment.NODE_ENV !== 'production'

/** Is process running in production environment. */
export const isProduction = () => !isDevelopment

/** Is process running in browser. */
export const isBrowser = () => typeof window !== 'undefined' && typeof window.document !== 'undefined'

/** Is process running in NodeJs instance. */
export const isNode = () => typeof process !== 'undefined' && typeof process.versions?.node !== 'undefined'

/** Is process running in a web worker instance. */
export const isWebWorker = () => typeof self === 'object' && self.constructor?.name === 'DedicatedWorkerGlobalScope'

/** Is process running in a CLI context. */
export const isCli = () => requireSafe('node:process')?.argv?.length > 0