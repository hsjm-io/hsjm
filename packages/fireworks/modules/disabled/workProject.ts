import { Case } from './businessCasenessCase'
import { Data } from './data'

export interface WorkProject extends Data, Case {
  budgetMin?: number
  budgetMax?: number
  stateTender?: undefined | 'answered' | 'awaiting' | 'won' | 'lost'
  stateNeed?: undefined | 'expressed' | 'harmonized' | 'defined' | 'locked'
}
