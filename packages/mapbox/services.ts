import { SdkConfig } from '@mapbox/mapbox-sdk/lib/classes/mapi-client'
import geocodeClient, { GeocodeRequest, GeocodeResponse } from '@mapbox/mapbox-sdk/services/geocoding'
import directionsClient, { DirectionsRequest, DirectionsResponse } from '@mapbox/mapbox-sdk/services/directions'
import mapMatchingClient, { MapMatchingRequest, MapMatchingResponse } from '@mapbox/mapbox-sdk/services/map-matching'
import optimizationClient, { OptimizationRequest } from '@mapbox/mapbox-sdk/services/optimization'
import { MaybeRef, createSharedComposable } from '@vueuse/shared'
import { computedAsync } from '@vueuse/core'
import { Ref, unref } from 'vue-demi'

let config = <SdkConfig>{}
export const initializeMapbox = createSharedComposable((options = {} as SdkConfig) =>
  config = options)

/**
 * The Mapbox Geocoding API does two things: forward geocoding and reverse geocoding.
 *
 * Forward geocoding converts location text into geographic coordinates, turning
 * `2 Lincoln Memorial Circle NW` into `-77.050,38.889`.
 *
 * Reverse geocoding turns geographic coordinates into place names, turning `-77.050, 38.889`
 * into `2 Lincoln Memorial Circle NW`. These location names can vary in specificity,
 * from individual addresses to states and countries that contain the given coordinates.
 * @param request Request parameters.
 * @returns Request response.
 */
export const useGeocoding = (request: MaybeRef<GeocodeRequest>): Ref<GeocodeResponse> =>
  computedAsync(async() => {
    const { query } = unref(request)
    const service = typeof query === 'string'
      ? geocodeClient(config).forwardGeocode
      : geocodeClient(config).reverseGeocode
    return await service(unref(request))
      .send()
      .then(response => response.body)
  }, {})

/**
 * An isochrone, from the Greek root words iso (equal) and chrone (time), is a line that connects points of
 * equal travel time around a given location. The Mapbox Isochrone API computes areas that are reachable
 * within a specified amount of time from a location, and returns the reachable regions as contours of
 * polygons or lines that you can display on a map. This API also supports contours based on distance.
 *
 * With the Isochrone API, you can:
 * - Calculate isochrones up to 60 minutes using driving, cycling, or walking profiles
 * - Define delivery or service zones based on travel times from a starting location
 * - Illustrate travel times on a map with lines or polygons
 * - Create geofences to trigger location-aware user experiences, notifications, or events
 * @param request Request parameters.
 * @returns Request response.
 */
// import isocroneClient from '@mapbox/mapbox-sdk/services/isochrone'
// export const useIsochrone = (request: MaybeRef<IsochroneRequest>): Ref<IsochroneResponse> =>
//   computedAsync(() => isocroneClient(config).getContours(unref(request)).send().then(response => response.body), {})

/**
 * The **Mapbox Directions API** will show you how to get where you're going. With the Directions API, you can:
 *
 * - Calculate optimal driving, walking, and cycling routes using traffic- and incident-aware routing
 * - Produce turn-by-turn instructions
 * - Produce routes with up to 25 coordinates for the driving, driving-traffic, walking, and cycling profiles.
 * @param request Request parameters.
 * @returns Request response.
 */
export const useDirections = (request: MaybeRef<DirectionsRequest>): Ref<DirectionsResponse> =>
  computedAsync(() => directionsClient(config).getDirections(unref(request)).send().then(response => response.body), {})

/**
 * The **Mapbox Map Matching API** snaps fuzzy, inaccurate traces from a GPS unit or a phone to the OpenStreetMap
 * road and path network using the Directions API. This produces clean paths that can be displayed on a map
 * or used for other analysis.
 * @param request Request parameters.
 * @returns Request response.
 */
export const useMapMatching = (request: MaybeRef<MapMatchingRequest>): Ref<MapMatchingResponse> =>
  computedAsync(() => mapMatchingClient(config).getMatch(unref(request)).send().then(response => response.body), {})

/**
 * The **Mapbox Optimization API*** returns a duration-optimized route between the input coordinates. This is also known
 * as solving the Traveling Salesperson Problem. A typical use case for the Optimization API is planning the route
 * for deliveries in a city. You can retrieve a route for car driving, bicycling, and walking.
 * @param request Request parameters.
 * @returns Request response.
 */
export const useOptimization = (request: MaybeRef<OptimizationRequest>): Ref<JSON> =>
  computedAsync(() => optimizationClient(config).getOptimization(unref(request)).send().then(response => response.body), {})
