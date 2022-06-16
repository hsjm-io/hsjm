import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import windiCssPalettes from 'windicss/colors'
import { createPalette } from '@hsjm/shared'
import axios from 'axios'
import { logPalette } from '../utils'

axios.get('https://tsmcdgolhhtzzotghypz.supabase.co/rest/v1/shades?limit=1000', {
  headers: {
    apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MTQ2MDU1MiwiZXhwIjoxOTU3MDM2NTUyfQ.wKYvxV79TzOi82vwodfZjJqf2IRR7hYhxaWyj8cA-lk',
    authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MTQ2MDU1MiwiZXhwIjoxOTU3MDM2NTUyfQ.wKYvxV79TzOi82vwodfZjJqf2IRR7hYhxaWyj8cA-lk',
  },
})
  .then((response) => {
    // --- Extract palettes.
    const twShadePalettes = response.data.map((x: any) => ({
      50: x.colors[0],
      100: x.colors[1],
      200: x.colors[2],
      300: x.colors[3],
      400: x.colors[4],
      500: x.colors[5],
      600: x.colors[6],
      700: x.colors[7],
      800: x.colors[8],
      900: x.colors[9],
    }))

    const windiPalettes = Object
      .values(windiCssPalettes)
      .filter(x => typeof x !== 'string')

    const data = [
      createPalette('#EDC4B1', { stepUp: 3, stepDown: 7, hueShift: 0 }),
      createPalette('#2A669F', { stepUp: 12, stepDown: 7, hueShift: -59 }),
      createPalette('#9F2A2A', { stepUp: 12, stepDown: 7, hueShift: 44 }),
      ...twShadePalettes,
      ...windiPalettes,
    ]

    data.forEach(logPalette)
    writeFileSync(join(__dirname, './data.json'), JSON.stringify(data, undefined, 2))
  })
