import { Data } from './data'
import { WorkSkill } from './workSkill'

export interface WorkRole extends Data {
  icon?: string
  image?: string
  description?: string
  skillIds?: string[]
  readonly skills?: WorkSkill[]
}
