import { createSharedFirestore } from '@hsjm/firebase'
import { Data, Identity } from './base'

export interface Contact extends Data, Identity {
  organizationIds?: string[]
  readonly organizations?: Organization[]
}

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
  readonly contacts?: Contact[]
}

export interface Case extends Data {
  description?: string

  // --- Client
  clientIds?: string
  readonly clients?: Organization[]
  readonly clientFrontId?: string
  readonly clientFinalId?: string
  readonly clientFront?: Organization
  readonly clientFinal?: Organization

  // --- Contacts
  contactIds?: string[]
  readonly contacts?: Contact[]

  // --- Dates
  emitedAt?: string
  deadlinedAt?: string

  // --- Initial context.
  budgetMin?: number
  budgetMax?: number
  stateTender: undefined | 'answered' | 'awaiting' | 'won' | 'lost'
  stateNeed: undefined | 'expressed' | 'harmonized' | 'defined' | 'locked'
}

export interface Activity extends Data {
  participantIds?: string[]
  participans?: Contact[]
  meetingUrl?: string
  briefing?: string
  debriefing?: string
}

export interface Invoice {
  accountId?: string

  items: {
    name: string
    price: number
    count: number
  }[]

  readonly price: number
}

export const useOrganizations = createSharedFirestore<Organization>('organizations')
export const useContacts = createSharedFirestore<Contact>('persons')
export const useCase = createSharedFirestore<Case>('case')
