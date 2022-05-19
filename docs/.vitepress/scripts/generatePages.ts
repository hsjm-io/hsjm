import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { capitalize } from '../../../packages/shared'
import metadata from './metadata.json'

const generateItem = (x: any) => `- [${x.name}](${x.sourceFile}) - ${x.description ?? 'No description'}`

const generatePage = (documentation: typeof metadata[number]) => {
  const functions = [
    ...documentation.flatMap(x => x.functions),
    ...documentation.flatMap(x => x.constants),
  ]

  const types = [
    ...documentation.flatMap(x => x.interfaces),
    ...documentation.flatMap(x => x.types),
  ]

  const composables = functions.filter(x => x.name.startsWith('use'))
  const utilities = functions.filter(x => !x.name.startsWith('use'))
  const components = functions.filter(x => /^[A-Z].+/.test(x.name))

  return [
    // documentation.readme,
    `# ${capitalize(documentation[0].name)}`,
    documentation[0].description,
    // documentation.readme,

    // --- Generate functions.
    (composables.length > 0 && `## Composables\n${composables.map(generateItem).join('\n')}`),
    (components.length > 0 && `## Components\n${components.map(generateItem).join('\n')}`),
    (utilities.length > 0 && `## Utilities\n${utilities.map(generateItem).join('\n')}`),
    (types.length > 0 && `## Types\n${types.map(generateItem).join('\n')}`),
  ]
    .flat()
    .filter(Boolean)
    .join('\n\n')
}

// --- Generate markdowns and write.
metadata.forEach((documentation) => {
  const file = generatePage(documentation)
  const filePath = join(__dirname, `../../api/${documentation[0].name}.md`)
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, file)
})
