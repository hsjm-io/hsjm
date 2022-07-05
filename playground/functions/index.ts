import admin from 'firebase-admin'
import functions from 'firebase-functions'

admin.initializeApp({
  projectId: 'my-project',
})

admin.firestore().settings({
  ignoreUndefinedProperties: true,
})

export const add = functions.https.onCall(async([a, b]: number[]) => a + b)
