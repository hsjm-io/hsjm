
import { Ref, ref, unref, watch } from 'vue-demi'
import { tryOnMounted } from '@vueuse/core'
import 'leaflet/dist/leaflet.css'
import {
  Map,
  MapOptions,
  Marker, map as createMap, tileLayer as createTileLayer,
} from 'leaflet'

export type TileLayerOptions = L.TileLayerOptions & { urlTemplate: string }

export interface UseLeafletOptions extends MapOptions {
  tileLayers: TileLayerOptions[] | TileLayerOptions
  initialLat?: number
  initialLng?: number
  initialZoom?: number
}

export const useLeaflet = (
  element: string | HTMLElement,
  options: UseLeafletOptions,
  markers = [] as Ref<Marker[]> | Marker[],
) => {
  // --- Initialize variables.
  const lat = ref(options.initialLat ?? 0)
  const lng = ref(options.initialLng ?? 0)
  const zoom = ref(options.initialZoom ?? 8)
  const map = ref({} as Map)
  let _markers = [] as Marker[]

  tryOnMounted(() => {
    // --- Initialize map.
    const _map = createMap(element, options)
      .setView([lat.value, lng.value], zoom.value)

    // --- Make sure var is an array.
    if (!Array.isArray(options.tileLayers))
      options.tileLayers = [options.tileLayers]

    // --- Add layers.
    for (const tileLayer of options.tileLayers)
      createTileLayer(tileLayer.urlTemplate, tileLayer).addTo(_map)

    // --- Sync map markers.
    watch(
      markers,
      (markers) => {
        for (const _marker of _markers) _marker.removeFrom(_map)
        _markers = []
        for (const marker of unref(markers)) _markers.push(marker.addTo(_map))
      },
      { immediate: true, deep: true },
    )

    // --- Sync map view with ref values.
    _map.on('move', () => {
      const center = _map.getCenter()
      lat.value = center.lat
      lng.value = center.lng
      zoom.value = _map.getZoom()
    })

    // --- Sync ref values with map view.
    watch([lat, lng, zoom], ([lat, lng, zoom]) =>
      _map.setView([lat, lng], zoom))

    // --- Set map.
    map.value = _map
  })

  return { lat, lng, zoom, map }
}
