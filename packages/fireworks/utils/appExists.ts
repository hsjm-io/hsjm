import { getApps } from 'firebase/app'

/**
 * Check if app is initialized and ready to use.
 * @param {string} [appName] The name of the app. (Default: `"[DEFAULT]"`)
 * @returns {boolean} `true` if app is initialized and ready to use.
 */
export const appExists = (appName = '[DEFAULT]'): boolean => {
  const apps = getApps()
  return apps.some(app => app.name === appName)
}
