import { FirebaseContext, Module, getModuleMock } from '../shared'

export const mock = (module: Module, { admin, functions }: FirebaseContext) => functions.https
  .onCall(async() => admin.firestore()
    .collection(module.collection)
    .doc()
    .set(getModuleMock(module)),
  )
