import { MaybeRef, debouncedWatch, createUnrefFn } from '@vueuse/core'
import { ComputedRef, isRef, ref, Ref } from 'vue-demi'
import axios from 'axios'

interface UseGeocodingOptions {
  /**
   * All geocoding requests must include an [access token](https://docs.mapbox.com/help/glossary/access-token/).
   */
  access_token?: string

  /** 
   * One of `mapbox.places` or `mapbox.places-permanent`, as described
   * in the [Endpoints section](https://docs.mapbox.com/api/search/geocoding/#endpoints).
   * 
   * ### `mapbox.places`
   * Requests to the mapbox.places endpoint must be triggered by user activity.
   * Any results must be displayed on a Mapbox map and cannot be stored permanently,
   * as described in Mapbox’s [terms of service](https://www.mapbox.com/legal/tos)
   * and included [service terms](https://www.mapbox.com/legal/service-terms).
   * 
   * ### `mapbox.places-permanent`
   * The `mapbox.places-permanent` endpoint gives you access to two services: permanent
   * geocoding and batch geocoding. If you're interested in using the `mapbox.places-permanent`
   * endpoint for these use cases, contact [Mapbox sales](https://www.mapbox.com/contact/sales/).
   * It's important to speak with an Account Manager on the Sales team prior to making requests
   * to the `mapbox.places-permanent` endpoint, as unsuccessful requests made by an account
   * that does not have access to the endpoint may be billable.
   * 
   * Note that the `mapbox.places-permanent` endpoint does not include point-of-interest (POI)
   * features. The data available for other feature types may vary slightly compared to the
   * data available in the `mapbox.places` endpoint.
   */
  endpoint?: 'mapbox.places' | 'mapbox.places-permanent'
  /** 
   * Specify whether to return autocomplete results (true, default) or not (false).
   * When autocomplete is enabled, results will be included that start with the requested
   * string, rather than just responses that match it exactly. For example, a query for
   * India might return both India and Indiana with autocomplete enabled, but only India
   * if it’s disabled.
   * 
   * When autocomplete is enabled, each user keystroke counts as one request to the Geocoding
   * API. For example, a search for "coff" would be reflected as four separate Geocoding API
   * requests. To reduce the total requests sent, you can configure your application to only
   * call the Geocoding API after a specific number of characters are typed.
   */
  autocomplete?: boolean

  /** 
   * Limit results to only those contained within the supplied bounding box. Bounding boxes
   * should be supplied as four numbers separated by commas, in `minLon,minLat,maxLon,maxLat`
   * order. The bounding box cannot cross the 180th meridian.
   */
  bbox?: number

  /** 
   * Limit results to one or more countries. Permitted values are
   * [ISO 3166 alpha 2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)
   * country codes separated by commas.
   */
   country?: number

  /** 
   * Specify whether the Geocoding API should attempt approximate, as well as exact,
   * matching when performing searches (`true`, default), or whether it should opt out
   * of this behavior and only attempt exact matching (`false`). For example, the default
   * setting might return `Washington, DC` for a query of `wahsington`, even though the
   * query was misspelled.
   */
   fuzzyMatch?: boolean

  /** 
   * Specify the user’s language. This parameter controls the language of the text supplied
   * in responses, and also affects result scoring, with results matching the user’s query
   * in the requested language being preferred over results that match in another language.
   * For example, an autocomplete query for things that start with `Frank` might return
   * `Frankfurt` as the first result with an English (`en`) language parameter, but `Frankreich`
   * (“France”) with a German (`de`) language parameter.
   * 
   * Options are [IETF language tags](https://en.wikipedia.org/wiki/IETF_language_tag)
   * comprised of a mandatory [ISO 639-1 language code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)
   * and, optionally, one or more IETF subtags for country or script.
   * 
   * More than one value can also be specified, separated by commas, for applications
   * that need to display labels in multiple languages.
   * 
   * For more information on which specific languages are supported, see the
   * [language coverage section.](https://docs.mapbox.com/api/search/geocoding/#language-coverage)
   */
   language?: boolean

   /** 
    * Specify the maximum number of results to return. The default is `5`
    * and the maximum supported is `10`.
    */
    limit?: number

   /** 
    * Bias the response to favor results that are closer to this location.
    * Provided as two comma-separated coordinates in `longitude,latitude` `order`,
    * or the string `ip` to bias based on reverse IP lookup.
    */
    proximity?: string

   /** 
    * Specify whether to request additional metadata about the recommended navigation
    * destination corresponding to the feature (`true`) or not (`false`, default). Only
    * applicable for `address` features.
    * 
    * For example, if `routing=true` the response could include data about a point on the
    * road the feature fronts. Response features may include an array containing one
    * or more routable points. Routable points cannot always be determined. Consuming
    * applications should fall back to using the feature’s normal geometry for routing
    * if a separate routable point is not returned.
    */
    routing?: boolean

   /** 
    * Filter results to include only a subset (one or more) of the available feature types.
    * Options are `country`, `region`, `postcode`, `district`, `place`, `locality`, `neighborhood`,
    * `address`, and `poi`. Multiple options can be comma-separated. Note that `poi.landmark`
    * is a deprecated type that, while still supported, returns the same data as is
    * returned using the poi type.
    * 
    * For more information on the available types, see the
    * [data types section](https://docs.mapbox.com/api/search/geocoding/#data-types).
    */
    types?: string

   /** 
    * Available worldviews are: `cn`,`in`,`jp`,`us`. If a worldview is not set, `us`
    * worldview boundaries will be returned. For more information on using
    * worldviews, see the [worldviews section](https://docs.mapbox.com/api/search/geocoding/#worldviews).
    */
    worldview?: string
}

interface UseGeocodingReturn {
  /**
   * `"FeatureCollection"`, a GeoJSON type from the
   * [GeoJSON specification](https://tools.ietf.org/html/rfc7946).
   */
  type: string

  /**
   * **Forward geocode**s: An array of space and punctuation-separated strings from the original query.
   * **Reverse geocodes**: An array containing the coordinates being queried.
   */
  query: string[]

  /**
   * An array of feature objects.
   * **Forward geocodes**: Returned features are ordered by relevance.
   * **Reverse geocodes**: Returned features are ordered by index hierarchy,
   * from most specific features to least specific features that overlap the queried coordinates.
   * 
   * Read the [Search result prioritization](https://docs.mapbox.com/help/getting-started/geocoding/#search-result-prioritization)
   * guide to learn more about how returned features are organized in the Geocoding API response.
   */
  features: any[]
  /**
   * Attributes the results of the Mapbox Geocoding API to Mapbox.
   */
  attribution: string
}

/**
 * The Mapbox Geocoding API does two things: forward geocoding and reverse geocoding.
 * 
 * Forward geocoding converts location text into geographic coordinates,
 * turning `2 Lincoln Memorial Circle NW` into `-77.050,38.889`.
 * 
 * Reverse geocoding turns geographic coordinates into place names, turning `-77.050, 38.889` into
 * `2 Lincoln Memorial Circle NW`. These location names can vary in specificity, from individual
 * addresses to states and countries that contain the given coordinates.
 * 
 * For more background information on the Mapbox Geocoding API and how it works, see the
 * [How geocoding works guide](https://docs.mapbox.com/help/getting-started/geocoding/).
 * 
 * You may also use one of several [wrapper libraries](https://docs.mapbox.com/help/getting-started/geocoding/#libraries-and-plugins)
 * to integrate the Mapbox Geocoding API into an application instead of using it directly.
 * 
 * @param searchText The feature you’re trying to look up.
 * @param options Options for filtering.
 */
export function useGeocoding(searchText?: string, options?: UseGeocodingOptions): Promise<UseGeocodingReturn>
export function useGeocoding(searchText?: Ref<string>, options?: UseGeocodingOptions): Ref<UseGeocodingReturn>
export function useGeocoding(searchText?: ComputedRef<string | undefined>, options?: UseGeocodingOptions): Ref<UseGeocodingReturn>
export function useGeocoding(searchText?: MaybeRef<string | undefined>, options = {} as UseGeocodingOptions) {

  // --- Geocode request.
  const geocode = createUnrefFn((searchText?: string) => {
    const url = `https://api.mapbox.com/geocoding/v5/${options.endpoint ?? 'mapbox.places'}/${searchText}.json?`
    return searchText ? axios.get<UseGeocodingReturn>(url, { params: options }).then(res => res.data) : undefined
  })

  // --- If `searchText` is a ref. Make the value reactive.
  if (isRef(searchText)) {
    const data = ref()

    // --- Watch for changes in the searchText
    debouncedWatch(
      searchText,
      searchText => geocode(searchText)?.then(v => data.value = v),
      { debounce: 1000, immediate: true, deep: true }
    )

    // --- Return ref.
    return data as Ref<UseGeocodingReturn>
  }

  // --- Return value.
  else return geocode(searchText)
}
