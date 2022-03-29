import functions from 'firebase-functions'
import admin from 'firebase-admin'

/** Create a Firestore record assigned to the user. */
export const onUserCreateExtend = functions.auth.user().onCreate((user) => {
  admin.firestore().collection('users').add({
    id: user.uid,
    fullName: user.displayName,
    firstName: user.displayName?.split(' ')[0],
    lastName: user.displayName?.split(' ').slice(1).join(' '),
    contactEmail: [user.email, user.providerData.map(x => x.email)],
    contactPhone: [user.phoneNumber, user.providerData.map(x => x.phoneNumber)],
  })
})
