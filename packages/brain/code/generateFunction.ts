import { OpenaiOptions, openaiService } from '@hsjm/services'
import { OpenaiCompleteOptions } from './../../services/openai/types'
import { examples } from './examples'

export type GenerateFunctionLanguage = 'typescript' | 'javascript' | 'rust'

export interface GenerateFunctionOptions {
  description: string
  language: GenerateFunctionLanguage
  documentation?: string
  name?: string
  languageVersion?: string
  languageFeatures?: string
}

const createPrompt = (options: GenerateFunctionOptions) => {
  const {
    description,
    language,
    name = '',
    languageVersion = 'latest',
    languageFeatures = 'stable',
    documentation = '',
  } = options

  return [
    examples[language],
    '\n-----\n',
    `Generate a ${language} function declaration and make sure it only has these specific features:`,
    `- name: ${name}`,
    `- description: ${description}`,
    `- language: ${language}`,
    `- languageVersion: ${languageVersion}`,
    `- languageFeatures: ${languageFeatures}`,
    `- documentation: ${documentation}`,
    '\n---\n',
  ]
    .filter(Boolean)
    .join('\n')
}

export const generateFunction = async(options: GenerateFunctionOptions & Partial<OpenaiOptions & OpenaiCompleteOptions>) => {
  // --- Instantiate OpenAI service.
  const { complete } = openaiService(options)

  // --- Request GPT-3
  const { choices } = await complete({
    max_tokens: 512,
    temperature: 0.75,
    ...options,
    stop: '-----',
    best_of: 1,
    model: 'text-davinci-002',
    prompt: createPrompt(options),
  })

  // --- Return first choice.
  return choices[0].text.trim()
}
