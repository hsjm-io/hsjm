import { GetOptions, createSharedFirestore, useAuth } from '@hsjm/firebase'

export interface User {
  id?: string
  /** Username */
  username?: string
  /** Contact email. */
  contactEmail?: string
  /** Contact phone. */
  contactPhone?: string
  /** Array of social links. */
  contactSocials?: string[]
  /** Avatar URL. */
  avatar?: string
  /** Full name. */
  fullName?: string
  /** First name. */
  firstName?: string
  /** Last name. */
  lastName?: string
  /** Last name */
  permissions?: string[]
}

export interface Permissions {
  id: string
}

export const useUsers = createSharedFirestore<User>('users')
export const usePermissions = createSharedFirestore<Permissions>('permissions')

/** Current user `Ref`. */
export const useUser = (options?: GetOptions) => {
  const { userId } = useAuth()
  const { get } = useUsers()
  return get(userId, { id: userId.value }, options)
}
