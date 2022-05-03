import { createSharedFirestore } from '@hsjm/firebase'
import { Organization } from './crm'
import { Data, History, Identity } from './base'

export type ContractType = 'freelance' | 'temporary' | 'indefinite' | 'interim'
export type RateType = 'hourly' | 'daily' | 'weekly' | 'monthly'

export interface WorkRole extends Data {
  icon?: string
  image?: string
  description?: string
  skillIds?: string[]
  readonly skills?: WorkSkill[]
}

export interface WorkSkill extends Data {
  icon?: string
  image?: string
  description?: string
  type?: 'functionnal' | 'technical' | 'human' | 'certification'
  roleIds?: string[]
  readonly roles?: WorkRole[]
}

export interface WorkResource extends Data, Identity {
  workRoleIds?: string[]
  workSkillIds?: string[]
  workSkillFavoriteIds?: string[]
  workLocation?: string

  // --- Requirements
  workRate?: number
  workRateType?: RateType
  workContractType?: ContractType[]
  workMaxDistance?: number
  workMaxTravelTime?: number

  // --- References
  readonly roles: WorkRole[]
  readonly skills: WorkSkill[]
  readonly skillsFavorite?: WorkSkill[]
  readonly locationLat?: string
  readonly locationLng?: string
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
  rateType?: RateType
  contractType?: ContractType[]
  contractTypePrefered?: ContractType
  daysPerWeekMin?: number
  daysPerWeekMax?: number
  remoteDaysPerWeekMin?: number
  remoteDaysPerWeekMax?: number

  // --- Computed
  readonly companyFrontId?: string
  readonly companyFinalId?: string

  // --- References
  readonly companies: Organization[]
  readonly companyFront: Organization
  readonly companyFinal: Organization
  readonly matches: WorkMatch[]
  readonly roles: WorkRole[]
  readonly skills?: WorkSkill[]
  readonly skillsOptional?: WorkSkill[]
  readonly locationLat?: string
  readonly locationLng?: string
}

export interface WorkMatch extends Data, History<WorkMatch> {
  resourceId?: string
  positionId?: string
  status?: 'draft' | 'proposed' | 'accepted' | 'ongoing' | 'refused' | 'aborted' | 'finished'
  startAt?: string
  endAt?: string
  rate?: number
  rateType?: RateType
  contractType?: ContractType
  daysPerWeek?: number
  remoteDaysPerWeek?: number

  // ---
  readonly resource?: WorkResource
  readonly position?: WorkPosition
}

export interface WorkReport extends Data {
  resourceId?: string
  positionId?: string
  startedAt?: string
  endedAt?: string
  content?: string
  proofUrls?: string[]
}

export const useWorks = createSharedFirestore<WorkPosition>('workPositions')
export const useWorkSkills = createSharedFirestore<WorkSkill>('workSkills')
export const useWorkResources = createSharedFirestore<WorkResource>('persons')
