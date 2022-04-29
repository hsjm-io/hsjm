import { Data } from './types'

export interface Invoice extends Data {
  accountId?: string

  items: {
    name: string
    price: number
    count: number
  }[]

  readonly price: number
}
