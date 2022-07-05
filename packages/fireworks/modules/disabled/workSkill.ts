import { Data } from './data'
import { WorkRole } from './workRole'

export interface WorkSkill extends Data {
  icon?: string
  image?: string
  description?: string
  type?: 'functionnal' | 'technical' | 'human' | 'certification'
  roleIds?: string[]
  readonly roles?: WorkRole[]
}
