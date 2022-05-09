import { Schema, compact, defaultToContext, isArrayEmpty, isArrayNotEmpty, isArrayOf, isStringEmail, isStringFirestoreId, isStringNotEmpty, isStringUrl, isUndefined, join, toContext, trim } from '@hsjm/shared'
import { createSharedFirestore, get, useAuth } from '@hsjm/firebase'
import { createSharedComposable } from '@vueuse/shared'
import { FirestoreReference, toFirestoreReference } from './utils'
import { Data, dataSchema } from './data'
import { Organization } from './organization'

export interface Identity extends Data {
  userId?: string
  name: string
  firstName?: string
  lastName?: string
  title?: string
  portraitUrl?: string
  contactEmails?: string[]
  contactPhones?: string[]
  contactSocials?: string[]
  organizationIds?: string[]
  readonly organizations?: FirestoreReference<Organization>[]
}

/** Schema for identity documents. */
export const identitySchema: Schema = {
  ...dataSchema,

  name: [
    [isStringNotEmpty, trim],
    [[defaultToContext, ['firstName', 'lastName']], compact, [join, ' '], trim],
  ],

  firstName: [
    [isUndefined],
    [isStringNotEmpty, trim],
    [[defaultToContext, 'name'], v => v.split(' ')[0]],
  ],

  lastName: [
    [isUndefined],
    [isStringNotEmpty, trim],
    [[defaultToContext, 'name'], v => v.split(' ').slice(1).join(' ')],
  ],

  title: [
    [isUndefined],
    [isStringNotEmpty, trim],
  ],

  portraitUrl: [
    [isUndefined],
    [isStringUrl],
  ],

  contactEmails: [
    [isUndefined],
    [isArrayEmpty],
    [[isArrayOf, [isStringEmail]]],
  ],

  contactPhones: [
    [isUndefined],
    [isArrayNotEmpty, compact, [isArrayOf, [isStringNotEmpty]]],
  ],

  contactSocials: [
    [isUndefined],
    [isArrayEmpty],
    [[isArrayOf, [isStringUrl]]],
  ],

  userId: [
    [isStringFirestoreId],
    [isUndefined],
  ],

  user: [
    [[toContext, 'userId'], toFirestoreReference],
    [isUndefined],
  ],
}

/** Reactive `Profile` composable. */
export const useIdentities = createSharedFirestore<Identity>('identity')

/** Current user's profile. */
export const useProfile = createSharedComposable(() => {
  const { user } = useAuth()
  return get<Identity>('identity', { userId: user.value?.uid }, { userId: user.value?.uid }, { pickFirst: true })
})
