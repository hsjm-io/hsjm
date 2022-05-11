import { Data } from './data'

export interface Hierarchy<T = Data> {
  parentId?: string
  childrenIds?: string
  readonly parent?: T
  readonly childrens?: T[]
}
