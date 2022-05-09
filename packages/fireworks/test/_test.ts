import { validateRuleSet, validateSchema } from '@hsjm/shared'
import { identitySchema } from '../modules/identity'

const identity = {
  id: '323400230dj3ej20',
  name: '   Jogn Dought   ',
  // ownerIds: ['323400230dj3ej20'],
  // createdById: 'dwadwa',
  contactEmails: [
    'contact@google.com',
    'contactgoogle2',
  ],

}

;(async() => {
  const results = await validateRuleSet(identity.ownerIds, identitySchema.ownerIds)

  // delete results.results
  console.log(results)
})()
