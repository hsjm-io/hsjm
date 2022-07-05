import { FirestoreReference } from '../shared/validators'
import { Identity } from '../modules/coreIdentity'
import { Data } from './data'

export interface Event extends Data {
  participantIds?: string[]
  participants?: FirestoreReference<Identity>[]
  meetingUrl?: string
  briefing?: string
  debriefing?: string
}
