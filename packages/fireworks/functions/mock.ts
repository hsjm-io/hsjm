import { Module, firebaseAdmin, firebaseFunctions } from '../shared'
import { getModuleMock } from './../shared/getModuleMock'

export const mock = <T>(module: Module) => firebaseFunctions?.https.onCall(
  async() => firebaseAdmin
    ?.firestore()
    .collection('identity')
    .doc()
    .set(getModuleMock<T>(module),
    ),
)
