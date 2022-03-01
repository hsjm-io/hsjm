import { createSharedComposable } from '@vueuse/shared'
import { delay, uniqueId } from 'lodash'
import { ref, Ref } from 'vue-demi'

/** Configurable alert object. */
interface Alert {
  /** Unique id for lifecycle handling. Defaults to auto-generated one. */
  id?: string
  /** Content of the alert. */
  text: string
  /** Type of alert. Defines the design of the toast. */
  type?: 'error' | 'success' | 'warning' | 'info'
  /** Duration of the alert in ms. */
  duration?: number
}

export const useAlert = createSharedComposable(() => {

  // --- Initialize global alert pool.
  const alerts = ref([] as Alert[])

  // --- Alert lifecycle.
  const alert = (alert: Alert) => {
    alert.id = alert.id ?? uniqueId()
    alerts.value = alerts.value.concat(alert)
    delay(() => alerts.value = alerts.value.filter(x => x.id !== alert.id), alert.duration ?? 5000)
  }

  // --- Shortcut methods.
  const alertError = (text: string) => alert({ text, type: 'error' })
  const alertSuccess = (text: string) => alert({ text, type: 'success' })
  const alertWarning = (text: string) => alert({ text, type: 'warning' })

  // --- Return pool and methods.
  return { alerts: alerts as Ref<Alert[]>, alert, alertError, alertSuccess, alertWarning }
})
