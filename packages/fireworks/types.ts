import { User } from './moduleUser'

export interface Data {
  readonly id?: string
  readonly slug?: string
  name?: string

  // --- Security & Timestamps
  ownerIds?: string[]
  readonly owners?: User[]
  readonly createdAt?: string
  readonly createdById?: string
  readonly createdBy?: User
  readonly updatedAt?: string
  readonly updatedById?: string
  readonly updatedBy?: User
}

export interface Person {
  firstName?: string
  lastName?: string
  portrait?: string

  // --- Contact
  contactEmails?: string[]
  contactPhones?: string[]
  contactSocials?: string[]
}

export interface History<T extends Data> {
  readonly history?: T[]
}

export interface Hierarchy<T extends Data> {
  parentId?: string
  childrenIds?: string
  readonly parent?: T
  readonly childrens?: T[]
}
