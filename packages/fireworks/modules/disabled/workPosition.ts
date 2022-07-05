import { Organization } from './organization'
import { Data } from './data'
import { WorkRole } from './workRole'
import { WorkSkill } from './workSkill'
import { WorkResource } from './workResource'

export type WorkRateType = 'hourly' | 'daily' | 'weekly' | 'monthly'
export type WorkRateCurrenty = 'freelance' | 'temporary' | 'indefinite' | 'interim'
export type WorkContractType = 'freelance' | 'temporary' | 'indefinite' | 'interim'

export interface WorkPositionAssignmentReport {
  startedAt?: string
  endedAt?: string
  numberOfHours?: number
  numerOfDays?: number
  content?: string
}

export interface WorkPositionAssignment {
  resourceId?: string
  status?: 'draft' | 'proposed' | 'accepted' | 'ongoing' | 'refused' | 'aborted' | 'finished'
  rate?: number
  rateType?: WorkRateType
  contractType?: WorkContractType

  // --- Duration
  startAt?: string
  endAt?: string
  daysPerWeek?: number
  remoteDaysPerWeek?: number
  numberOfDays?: number
  numberOfWeeks?: number

  // --- Reports
  reports: WorkPositionAssignmentReport[]

  readonly resource?: WorkResource
}

export interface WorkPosition extends Data {
  description?: string
  expressedAt?: string
  deadlineAt?: string
  companyIds?: string[]
  matchIds?: string[]

  // --- Requirements
  roleIds?: string[]
  skillIds?: string[]
  skillOptionalIds?: string[]
  location?: string
  rate?: number
  rateType?: WorkRateType
  contractType?: WorkContractType[]
  contractTypePrefered?: WorkContractType
  daysPerWeekMin?: number
  daysPerWeekMax?: number
  remoteDaysPerWeekMin?: number
  remoteDaysPerWeekMax?: number

  // --- Assignments
  assignments: WorkPositionAssignment[]

  // --- Computed
  readonly companyFrontId?: string
  readonly companyFinalId?: string
  readonly locationLat?: string
  readonly locationLng?: string

  // --- References
  readonly companies: Organization[]
  readonly companyFront: Organization
  readonly companyFinal: Organization
  readonly roles: WorkRole[]
  readonly skills?: WorkSkill[]
  readonly skillsOptional?: WorkSkill[]
}
