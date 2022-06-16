import { createSharedFirestore, useAuth } from '@hsjm/firebase'
import { compact, isArrayEmpty, isArrayOf, isNil, isStringEmail, isStringFirestoreId, isStringNotEmpty, isStringUrl, join, toContext, trim } from '@hsjm/shared'
import { createSharedComposable } from '@vueuse/shared'
import { computed } from 'vue-demi'
import { mergeModules } from '../shared'
import { Data, dataSchema } from './coreData'

export interface Identity extends Data {
  readonly name: string
  firstName?: string
  lastName?: string
  title?: string
  avatar?: string
  contactEmails?: string[]
  contactPhones?: string[]
  contactSocials?: string[]
  organizationIds?: string[]
  // readonly organizations?: FirestoreReference<Organization>[]
  /**
   * User ID assigned to this user.
   * @optionnal
   */
  readonly userId?: string
}

/** Schema for identity documents. */
export const identitySchema = mergeModules(dataSchema, {
  collection: 'idenfity',
  fields: [
    {
      name: 'name',
      label: 'Nom complet',
      isReadonly: true,
      rules: [[toContext, ['firstName', 'lastName']], compact, [join, ' '], trim],
    },
    {
      name: 'firstName',
      label: 'Prénom',
      rules: [isStringNotEmpty, trim],
    },
    {
      name: 'lastName',
      label: 'Nom de famille',
      rules: [[isNil], [isStringNotEmpty, trim]],
    },
    {
      name: 'title',
      label: 'Titre / Profession',
      rules: [[isNil], [isStringNotEmpty, trim]],
    },
    {
      name: 'image',
      label: 'Avatar',
      rules: [[isNil], [isStringUrl]],
    },
    {
      name: 'contactEmails',
      label: 'Adresse(s) email de contact',
      rules: [
        [isNil],
        [isArrayEmpty],
        [[isArrayOf, [isStringEmail]]],
      ],
    },
    {
      name: 'contactSocials',
      label: 'Liens sociaux',
      rules: [
        [isNil],
        [isArrayEmpty],
        [[isArrayOf, [isStringUrl]]],
      ],
    },
    {
      name: 'contactPhones',
      label: 'Numero(s) de téléphone de contact',
      rules: [
        [isNil],
        [isArrayEmpty],
        [[isArrayOf, [isStringNotEmpty]]],
      ],
    },
    {
      name: 'userId',
      label: 'Identifiant de l\'utilisateur',
      rules: [
        [isStringFirestoreId],
        [isNil],
      ],
    },
  ],
})

export const useIdentities = createSharedFirestore<Identity>(identitySchema.collection)
export const useUserIdentity = createSharedComposable(() => {
  const { user } = useAuth()
  const { get } = useIdentities()
  const query = computed(() => ({ userId: user.value?.uid }))
  return get(query, {
    sync: true,
    pickFirst: true,
    keepAlive: true,
    initialValue: query.value,
  })
})
