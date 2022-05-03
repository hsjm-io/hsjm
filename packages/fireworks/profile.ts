import { firestoreId } from '@hsjm/shared'
import { createSharedComposable } from '@vueuse/shared'
import { GetOptions, createSharedFirestore, useAuth } from '@hsjm/firebase'
import functions from 'firebase-functions'
import admin from 'firebase-admin'
import { UserRecord } from 'firebase-functions/v1/auth'
import { InferType, object, string } from 'yup'
import { identitySchema } from './base'

// --- Schema.
export const schemaProfile = object({
  ...identitySchema.fields,
  userId: string().required().matches(firestoreId),
  avatar: string().url(),
})

// --- Type
export type Profile = InferType<typeof schemaProfile>

// --- Composable.
export const useProfiles = createSharedFirestore<Profile>('identity')
export const useUser = createSharedComposable((options?: GetOptions) => {
  const { user } = useAuth()
  const { get } = useProfiles()
  return get(user.value?.uid, <any>{ id: user.value?.uid }, options)
})

// --- Firebase hooks.
type UserToProfile<T> = (...parameters: Parameters<functions.CloudFunction<UserRecord>>) => T

/**
 * Return functions that creates a Firestore record assigned to the user.
 * @param extend Function to extend the document.
 * @returns Firebase function instance.
 */
export const createProfileOnUserCreate = <T extends admin.firestore.DocumentData>(extend?: UserToProfile<T>) =>
  functions.auth.user().onCreate((user, context) =>
    admin.firestore().collection('identity').doc(user.uid).set(<Profile>{
      avatar: user.photoURL,
      fullName: user.displayName,
      firstName: user.displayName?.split(' ')[0],
      lastName: user.displayName?.split(' ').slice(1).join(' '),
      contactEmails: [user.email],
      contactPhones: [user.phoneNumber],
      ...(extend ? extend(user, context) : {}),
    }))

export const deleteProfileOnUserDelete = functions.auth.user().onDelete(user =>
  admin.firestore().collection('identity').doc(user.uid).delete(),
)
