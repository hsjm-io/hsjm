import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { isObjectLike, pickBy } from 'lodash'
import { fetchModule } from '@hsjm/core'

const dataImport = async() => {
  const { colors } = await fetchModule('https://raw.githubusercontent.com/windicss/windicss/main/src/config/colors.ts')
  writeFileSync(resolve(__dirname, 'data.json'), JSON.stringify(pickBy(colors, isObjectLike), undefined, 2))
}

dataImport()
