import { camelCase, firestoreId, isBrowser, isNode, slug } from '@hsjm/shared'
import { InferType, array, date, object, string } from 'yup'
import { reference } from './utils'

/** Base schema for all documents. */
export const dataSchema = object({
  // --- Base information.
  id: string()
    .when({ is: () => isNode })
    .required()
    .matches(firestoreId),

  slug: string()
    .when({ is: () => isNode })
    .required()
    .transform(camelCase)
    .matches(slug),

  name: string()
    .required(),

  // --- Ownership.
  ownerIds: array()
    .of(string().required().matches(firestoreId))
    .required()
    .compact()
    .min(1),

  owners: array()
    .when({ is: () => isBrowser })
    .of(reference.required())
    .required()
    .compact()
    .min(1),

  // --- Metadata.
  createdAt: date().required(),
  createdById: string().required().matches(slug),
  createdBy: reference,
  updatedAt: date().required(),
  updatedById: string().required().matches(slug),
  updatedBy: reference,
})

/** Base schema for all documents assigned to an identity. */
export const identitySchema = object({
  ...dataSchema.fields,
  fullName: string().trim(),
  firstName: string().trim(),
  lastName: string().trim(),
  portrait: string().trim().url(),
  contactEmails: array().of(string().required().email()).compact(),
  contactPhones: array().of(string().required()).compact(),
  contactSocials: array().of(string().required().url()).compact(),
})

export type Data = InferType<typeof dataSchema>
export type Identity = InferType<typeof identitySchema>

export interface History<T = Data> {
  readonly history?: T[]
}

export interface Hierarchy<T = Data> {
  parentId?: string
  childrenIds?: string
  readonly parent?: T
  readonly childrens?: T[]
}
