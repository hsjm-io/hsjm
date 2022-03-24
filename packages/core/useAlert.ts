import { createSharedComposable } from '@vueuse/shared'
import { ref } from 'vue-demi'

/** Configurable alert object. */
interface Alert {
  /** Unique id for lifecycle handling. Defaults to auto-generated one. */
  id?: string
  /** Content of the alert. */
  text?: string
  /** Type of alert. Defines the design of the toast. */
  type?: 'error' | 'success' | 'warning' | 'info'
  /** Duration of the alert in ms. */
  duration?: number
}

/** Dismiss alert. */
type Dismiss = () => void

// --- Indexer.
let index = 0

/**
 * Return globally scoped registered functions to allow for UI alert managment.
 */
export const useAlert = createSharedComposable(() => {
  // --- Initialize global alert pool.
  const alerts = ref([] as Alert[])

  // --- Dismiss method.
  const dismiss = (alert: Alert) => { alerts.value = alerts.value.filter(x => x.id !== alert.id) }

  // --- Alert lifecycle.
  const alert = (alert: Alert): Dismiss => {
    alert.id = alert.id ?? (index++).toString()
    alerts.value = [...alerts.value, alert]
    const dismissThisAlert = () => dismiss(alert)
    setTimeout(dismissThisAlert, alert.duration ?? 5000)
    return dismissThisAlert
  }

  // --- Shortcut methods.
  const alertError = (text: string) => alert({ text, type: 'error' })
  const alertSuccess = (text: string) => alert({ text, type: 'success' })
  const alertWarning = (text: string) => alert({ text, type: 'warning' })

  // --- Return pool and methods.
  return {
    alerts,
    alert,
    alertError,
    alertSuccess,
    alertWarning,
    dismiss,
  }
})
