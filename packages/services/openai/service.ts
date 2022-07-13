import axios from 'axios'
import { getVariable, pick } from '@hsjm/shared'
import { OpenaiCompleteOptions, OpenaiCompleteResult, OpenaiOptions } from './types'

export const openaiService = (options: OpenaiOptions) => {
  // --- Resolve config.
  const baseURL = options.baseURL || getVariable('OPENAI_BASE_URL') || 'https://api.openai.com/v1'
  const apiKey = options.apiKey || getVariable('OPENAI_API_KEY')
  const organization = options.organization || getVariable('OPENAI_ORGANIZATION')
  const config: any = { baseURL, headers: { Authorization: `Bearer ${apiKey}` } }
  if (organization) config.headers['OpenAI-Organization'] = organization

  // --- Instantiate axios service.
  const axiosInstance = axios.create(config)

  // --- Return methods.
  return {
    axiosInstance,

    /**
     * Given a prompt, the model will return one or more predicted completions,
     * and can also return the probabilities of alternative tokens at each position.
     * @param {OpenaiCompleteOptions} options completion options.
     * @returns {OpenaiCompleteResult} The completion results.
     * @returns
     */
    complete: async(options: OpenaiCompleteOptions): Promise<OpenaiCompleteResult> => {
      options = pick(options, [
        'best_of', 'echo', 'frequency_penalty', 'logit_bias', 'logprobs',
        'max_tokens', 'model', 'n', 'presence_penalty', 'prompt', 'stop',
        'stream', 'suffix', 'temperature', 'top_p', 'user',
      ])
      const { data } = await axiosInstance.post<OpenaiCompleteResult>('/completions', options)
      return data
    },
  }
}
