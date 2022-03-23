import L from 'leaflet'
import { computed, defineComponent, render, PropType, watch, h } from 'vue-demi'
import { TileLayerOptions, useLeaflet, UseLeafletOptions } from '@hsjm/leaflet'

export const Map = defineComponent({
  name: 'Map',

  props: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
    zoom: { type: Number, default: 8 },
    layers: { type: [Array, Object] as PropType<TileLayerOptions | TileLayerOptions[]>, default: [] },
    options: { type: Object as PropType<UseLeafletOptions>, default: {} }
  },

  emits: [
    'update:lat',
    'update:lng',
    'update:zoom',
  ],

  setup: (props, { slots, emit }) => {
    
    const markers = computed(() => {
    const slot = slots.default

    if(slot && slot()) return slot()
      .flatMap(x => [x, ...x.children as any[]])
      .filter(x => isFinite(+x.props?.lat) && isFinite(+x.props?.lng))
      .map(vnode => {

        const div = document.createElement('div')
        render(vnode, div)

        // @ts-ignore
        const { lat, lng } = vnode.props
        const icon = L.divIcon({
          html: div.children?.[0] as HTMLElement,
          className: 'w-0 h-0'
        })
        const marker = L.marker([lat, lng], { icon })
        return marker
      })
    else return []
  })

    const { lat, lng, zoom } = useLeaflet('map', {
      initialLat: props.lat,
      initialLng: props.lng,
      tileLayers: props.layers,

    }, markers)
    
    watch([lat, lng, zoom], ([lat, lng, zoom]) => {
      emit('update:lat', lat)
      emit('update:lng', lng)
      emit('update:zoom', zoom)
    })

    // --- Render the VNode.
    return () => h('div', { id: 'map' }, slots)
  },
})
