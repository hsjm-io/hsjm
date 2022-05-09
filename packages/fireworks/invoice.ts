
export interface Invoice {
  accountId?: string

  items: {
    name: string
    price: number
    count: number
  }[]

  readonly price: number
}
