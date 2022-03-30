import functions from 'firebase-functions'
import admin from 'firebase-admin'
import { UserRecord } from 'firebase-functions/v1/auth'
import { compact } from '@hsjm/core'

type UserCreateBindFirestoreFunction<T> = (...parameters: Parameters<functions.CloudFunction<UserRecord>>) => T

/**
 * Instantiate a function that creates a Firestore record assigned to the user.
 * @param extend Function to extend the document.
 * @returns Firebase function instance.
 */
export const userBindFirestore = <T extends admin.firestore.DocumentData>(extend?: UserCreateBindFirestoreFunction<T>) => {
  // --- Create firestore document linked to user.
  const onCreate = functions.auth.user().onCreate((user, context) =>
    admin.firestore().collection('users').doc(user.uid).set({
      fullName: user.displayName,
      firstName: user.displayName?.split(' ')[0],
      lastName: user.displayName?.split(' ').slice(1).join(' '),
      contactEmail: compact([user.email, ...user.providerData.map(x => x.email)]),
      contactPhone: compact([user.phoneNumber, ...user.providerData.map(x => x.phoneNumber)]),
      ...(extend ? extend(user, context) : {}),
    }))

  // --- Delete document on user deletion.
  const onDelete = functions.auth.user().onDelete(user =>
    admin.firestore().collection('users').doc(user.uid).delete(),
  )

  // --- Return functions.
  return {
    userBindFirestore_onCreate: onCreate,
    userBindFirestore_onDelete: onDelete,
  }
}
