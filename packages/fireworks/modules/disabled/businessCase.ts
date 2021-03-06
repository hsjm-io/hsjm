import { Schema } from '@hsjm/shared'
import { FirestoreReference } from '../shared/validators'
import { Identity } from '../modules/coreIdentity'
import { Data } from './data'
import { Organization } from './organization'

export interface Case extends Data {
  description?: string
  contactIds?: string[]
  clientIds?: string
  readonly clients?: FirestoreReference<Organization>[]
  readonly clientFrontId?: string
  readonly clientFinalId?: string
  readonly clientFront?: FirestoreReference<Organization>
  readonly clientFinal?: FirestoreReference<Organization>
  readonly contacts?: FirestoreReference<Identity>[]
}

export const caseSchema: Schema = {}
