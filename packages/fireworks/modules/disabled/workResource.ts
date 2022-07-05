import { Identity } from '../coreIdentity'
import { Data } from './data'
import { WorkContractType, WorkRateType } from './workPosition'
import { WorkRole } from './workRole'
import { WorkSkill } from './workSkill'

export interface WorkResource extends Data, Identity {
  workRoleIds?: string[]
  workSkillIds?: string[]
  workSkillFavoriteIds?: string[]
  workLocation?: string

  // --- Requirements
  workRate?: number
  workRateType?: WorkRateType
  workContractType?: WorkContractType[]
  workMaxDistance?: number
  workMaxTravelTime?: number

  // --- References
  readonly roles: WorkRole[]
  readonly skills: WorkSkill[]
  readonly skillsFavorite?: WorkSkill[]
  readonly locationLat?: string
  readonly locationLng?: string
}
