export interface OpenaiOptions {
  /**
   * Base URL of the OpenAI's API.
   */
  baseURL?: string
  /**
   * The OpenAI API uses API keys for authentication. Visit your
   * [API Keys](https://beta.openai.com/account/api-keys)
   * page to retrieve the API key you'll use in your requests.
   *
   * **Remember that your API key is a secret!** Do not share it with others
   * or expose it in any client-side code (browsers, apps). Production
   * requests must be routed through your own backend server where your
   * API key can be securely loaded from an environment variable or key
   * management service.
   */
  apiKey?: string
  /**
   * For users who belong to multiple organizations, you can pass a
   * header to specify which organization is used for an API request.
   * Usage from these API requests will count against the specified
   * organization's subscription quota.
   */
  organization?: string
}

export interface OpenaiCompleteOptions {
  /**
   * ID of the model to use. You can use the List models API to see all of
   * your available models, or see our Model overview for descriptions of them.
   */
  model: string
  /**
   * The prompt(s) to generate completions for, encoded as a string,
   * array of strings, array of tokens, or array of token arrays.
   *
   * Note that  is the document separator that the model sees during training,
   * so if a prompt is not specified the model will generate as if from the
   * beginning of a new document.
   */
  prompt?: string | string[]
  /**
   * The suffix that comes after a completion of inserted text.
   */
  suffix?: string
  /**
   * The maximum number of tokens to generate in the completion.
   *
   * The token count of your prompt plus `max_tokens` cannot exceed the model's
   * context length. Most models have a context length of 2048 tokens (except for
   * the newest models, which support 4096).
   */
  max_tokens?: number
  /**
   * What sampling temperature to use. Higher values means the model will take
   * more risks. Try 0.9 for more creative applications, and 0 (argmax sampling)
   * for ones with a well-defined answer.
   *
   * We generally recommend altering this or `top_p` but not both.
   */
  temperature?: number
  /**
   * An alternative to sampling with temperature, called nucleus sampling, where
   * the model considers the results of the tokens with top_p probability mass.
   * So 0.1 means only the tokens comprising the top 10% probability mass are
   * considered.
   *
   * We generally recommend altering this or `temperature` but not both.
   */
  top_p?: number
  /**
   * How many completions to generate for each prompt.
   *
   * Note: Because this parameter generates many completions, it can quickly
   * consume your token quota. Use carefully and ensure that you have reasonable
   * settings for `max_tokens` and `stop`.
   */
  n?: number
  /**
   * Whether to stream back partial progress. If set, tokens will be sent as
   * data-only server-sent events as they become available, with the stream
   * terminated by a `data: [DONE]` message.
   */
  stream?: boolean
  /**
   * Include the log probabilities on the `logprobs` most likely tokens, as well
   * the chosen tokens. For example, if `logprobs` is 5, the API will return a list
   * of the 5 most likely tokens. The API will always return the logprob of the
   * sampled token, so there may be up to `logprobs+1` elements in the response.
   *
   * The maximum value for `logprobs` is 5. If you need more than this, please
   * contact support@openai.com and describe your use case.
   */
  logprobs?: number
  /**
   * Echo back the prompt in addition to the completion
   */
  echo?: boolean
  /**
   * Up to 4 sequences where the API will stop generating further tokens. The
   * returned text will not contain the stop sequence.
   */
  stop?: string | string[]
  /**
   * Number between -2.0 and 2.0. Positive values penalize new tokens based on
   * whether they appear in the text so far, increasing the model's likelihood
   * to talk about new topics.
   *
   * @see [See more information about frequency and presence penalties.](https://beta.openai.com/docs/api-reference/parameter-details)
   */
  presence_penalty?: number
  /**
   * Number between -2.0 and 2.0. Positive values penalize new tokens based on
   * their existing frequency in the text so far, decreasing the model's
   * likelihood to repeat the same line verbatim.
   *
   * @see [See more information about frequency and presence penalties.](https://beta.openai.com/docs/api-reference/parameter-details)
   */
  frequency_penalty?: number
  /**
   * Generates best_of completions server-side and returns the "best" (the one
   * with the highest log probability per token). Results cannot be streamed.
   *
   * When used with `n`, `best_of` controls the number of candidate completions and
   * `n` specifies how many to return – `best_of` must be greater than `n`.
   *
   * Note: Because this parameter generates many completions, it can quickly
   * consume your token quota. Use carefully and ensure that you have reasonable
   * settings for `max_tokens` and stop.
   */
  best_of?: number
  /**
   * Modify the likelihood of specified tokens appearing in the completion.
   *
   * Accepts a json object that maps tokens (specified by their token ID in the
   * GPT tokenizer) to an associated bias value from -100 to 100. You can use
   * this [tokenizer tool](https://beta.openai.com/tokenizer?view=bpe)
   * (which works for both GPT-2 and GPT-3) to convert text
   * to token IDs. Mathematically, the bias is added to the logits generated by
   * the model prior to sampling. The exact effect will vary per model, but
   * values between -1 and 1 should decrease or increase likelihood of selection;
   * values like -100 or 100 should result in a ban or exclusive selection of
   * the relevant token.
   *
   * As an example, you can pass `{"50256": -100}` to prevent the  token from
   * being generated.
   */
  logit_bias?: Record<number, number>
  /**
   * A unique identifier representing your end-user, which will help OpenAI to
   * monitor and detect abuse.
   */
  user?: string
}

export interface OpenaiCompleteResult {
  /**
   * ID of the completion request
   */
  id: string
  /**
   * Type of the object the ID refers to
   */
  object: string
  /**
   * Timestamp of when the completion was made
   */
  created: number
  /**
   * Name of the model used to complete the request
   */
  model: string
  /**
   * Array of completion choices
   */
  choices: {
    /**
     * Text of the completion
     */
    text: string
    /**
     * Index of the completion
     */
    index: number
    /**
     * Log probabilities of the completion
     */
    logprobs: number | null
    /**
     * Reason the completion finished
     */
    finish_reason: string
  }[]
}
