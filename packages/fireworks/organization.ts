import { createSharedFirestore } from '@hsjm/firebase'
import { Schema, isArrayNotEmpty, isArrayOf, isStringFirestoreId, isStringNotEmpty, isStringUrl, isUndefined, trim } from '@hsjm/shared'
import { FirestoreReference } from './utils'
import { Data, dataSchema } from './data'
import { Identity } from './identity'

export interface Organization extends Data {
  nameLegal?: string
  description?: string
  logo?: string

  // --- Business
  domain?: string
  siren?: string
  siret?: string
  itin?: string
  vatin?: string

  // --- Contacts
  contactSocials?: string[]
  contactIds?: string[]
  readonly contacts?: FirestoreReference<Identity>[]
}

export const organizationSchema: Schema = {
  ...dataSchema,
  nameLegal: [[isUndefined], [isStringNotEmpty, trim]],
  description: [[isUndefined], [isStringNotEmpty, trim]],
  logo: [[isUndefined], [isStringUrl]],

  domain: [[isUndefined], [isStringNotEmpty, trim]],
  siren: [[isUndefined], [isStringNotEmpty, trim]],
  siret: [[isUndefined], [isStringNotEmpty, trim]],
  itin: [[isUndefined], [isStringNotEmpty, trim]],
  vatin: [[isUndefined], [isStringNotEmpty, trim]],

  contactSocials: [[isUndefined], [isArrayNotEmpty, [isArrayOf, [isStringUrl]]]],
  contactIds: [[isUndefined], [isArrayNotEmpty, [isArrayOf, [isStringFirestoreId]]]],
}

export const useOrganizations = createSharedFirestore<Organization>('organizations')
