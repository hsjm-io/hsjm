import { FirestoreReference } from '../utils'
import { Data } from './data'
import { Identity } from './identity'

export interface Event extends Data {
  participantIds?: string[]
  participants?: FirestoreReference<Identity>[]
  meetingUrl?: string
  briefing?: string
  debriefing?: string
}
