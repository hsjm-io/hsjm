import { createSharedComposable } from '@vueuse/shared'
import { GetOptions, createSharedFirestore, useAuth } from '@hsjm/firebase'
import { Data, Person } from './types'

export interface User extends Data, Person {
  avatar?: string
  profileId?: string
  permissionIds?: string[]
  readonly permission?: Permissions[]
}

export interface Permissions extends Data {}

export const useUsers = createSharedFirestore<User>('persons')
export const usePermissions = createSharedFirestore<Permissions>('permissions')

/** Current user's profile. */
export const useUser = createSharedComposable((options?: GetOptions) => {
  const { userId } = useAuth()
  const { get } = useUsers()
  return get(userId, <any>{ id: userId }, options)
})
