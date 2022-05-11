import { Data } from './data'

export interface History<T = Data> {
  readonly history?: T[]
}
