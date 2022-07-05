import { FirebaseContext, Module, getModuleMock } from '../modules/utils'

/**
 * Generate and add a random document in the firestore database.
 * @param {Module} module - Module to generate a random document for.
 * @param {FirebaseContext} context - Firebase context.
 * @returns {Promise<void>}
 */
export const mock = (module: Module, { admin, functions }: FirebaseContext) => functions.https
  .onCall(async() => admin.firestore()
    .collection(module.path)
    .doc()
    .set(getModuleMock(module)),
  )
