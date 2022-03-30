import { ClientRequest, IncomingMessage } from 'node:http'
import { RequestOptions, request } from 'node:https'

export interface FetchOptions extends RequestOptions {
  encoding?: BufferEncoding
  returnResponse?: boolean
  parsers: Array<(data: any, url: string, options: FetchOptions) => any>
}

export interface FetchResponse<T> extends IncomingMessage {
  data: T
  request: ClientRequest
}

export interface Fetch {
  (url: string | URL, options: FetchOptions & { returnResponse: true }): Promise<FetchResponse<any>>
  <T>(url: string | URL, options: FetchOptions & { returnResponse: true }): Promise<FetchResponse<T>>
  (url: string | URL, options?: FetchOptions): Promise<any>
  <T>(url: string | URL, options?: FetchOptions): Promise<T>
}

const defaultParsers: FetchOptions['parsers'] = [
  data => JSON.parse(data),
]

/**
 * Fetch data from URL.
 * @param url Request URL.
 * @param options Request options
 * @see https://ozzyczech.cz/js/fetch-in-pure-node-js/
 */
export const fetch: Fetch = (url: string | URL, options = {} as FetchOptions) =>
  new Promise<any>((resolve, reject) => {
    const { parsers = defaultParsers, encoding, returnResponse } = options

    // @ts-expect-error: IncomingMessage is not compatible with FetchResponse at first.
    const clientRequest = request(url, options, (response: FetchResponse<any>) => {
      // --- Read data
      const data: Buffer[] = []
      response.on('data', chunk => data.push(chunk))
      response.request = clientRequest

      // --- Resolve promise and try to parse as string and then with custom parsers.
      response.on('end', () => {
        try {
          response.data = Buffer.concat(data).toString(encoding)
          try { for (const parser of parsers) response.data = parser(response.data, url.toString(), options) }
          catch {}
        }
        catch (error) { reject(error) }
        resolve(returnResponse ? response : response.data)
      })
    })

    clientRequest.on('error', reject)
    clientRequest.end()
  })
