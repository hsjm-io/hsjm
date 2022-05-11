import { Schema, compact, isArrayEmpty, isArrayOf, isNil, isStringEmail, isStringFirestoreId, isStringNotEmpty, isStringUrl, join, toContext, trim } from '@hsjm/shared'
import { createSharedFirestore, get, useAuth } from '@hsjm/firebase'
import { createSharedComposable } from '@vueuse/shared'
import { FirestoreReference } from '../utils'
import { Data, dataSchema } from './data'
import { Organization } from './organization'

export interface Identity extends Data {
  userId?: string
  name: string
  title?: string
  avatar?: string
  contactEmails?: string[]
  contactPhones?: string[]
  contactSocials?: string[]
  organizationIds?: string[]
  readonly firstName?: string
  readonly lastName?: string
  readonly organizations?: FirestoreReference<Organization>[]
}

/** Schema for identity documents. */
export const identitySchema: Schema = {
  ...dataSchema,

  name: [
    [[toContext, ['firstName', 'lastName']], compact, [join, ' '], trim],
    [isStringNotEmpty, trim],
  ],

  firstName: [
    [[toContext, 'name'], v => v.split(' ')[0], isStringNotEmpty],
    [isNil],
  ],

  lastName: [
    [[toContext, 'name'], v => v.split(' ').slice(1).join(' '), isStringNotEmpty],
    [isNil],
  ],

  title: [
    [isNil],
    [isStringNotEmpty, trim],
  ],

  avatar: [
    [isNil],
    [isStringUrl],
  ],

  contactEmails: [
    [isNil],
    [isArrayEmpty],
    [[isArrayOf, [isStringEmail]]],
  ],

  contactPhones: [
    [isNil],
    [isArrayEmpty],
    [[isArrayOf, [isStringNotEmpty]]],
  ],

  contactSocials: [
    [isNil],
    [isArrayEmpty],
    [[isArrayOf, [isStringUrl]]],
  ],

  userId: [
    [isStringFirestoreId],
    [isNil],
  ],
}
