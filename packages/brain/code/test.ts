import { generateFunction } from './generateFunction'

const main = async() => {
  const code = await generateFunction({
    apiKey: 'sk-3T6SgMnF9LmemotGehjNYXdZhOHXaZ37RCvz2Gs7',
    description: 'Transform a string to uppercase',
    language: 'rust',
    languageFeatures: 'no-dependencies',
  })

  console.log(code)
}

main()
