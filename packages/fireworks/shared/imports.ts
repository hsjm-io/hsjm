/* eslint-disable @typescript-eslint/consistent-type-imports */
import { requireSafe } from '@hsjm/shared'
export const firebaseAdmin = requireSafe<typeof import('firebase-admin')>('firebase-admin')
export const firebaseFunctions = requireSafe<typeof import('firebase-functions')>('firebase-functions')
