import OpenAI from 'openai'

import { ApiKeyError, ModelNotFoundError, RateLimitError } from './errors.js'

/**
 * Create an OpenAI client instance
 * @param {string} apiKey - The OpenAI API key
 * @returns {OpenAI} The OpenAI client instance
 * @throws {ApiKeyError} When API key is missing
 */
export function createClient(apiKey) {
  if (!apiKey) {
    throw new ApiKeyError('No OpenAI API key provided')
  }
  return new OpenAI({ apiKey })
}

/**
 * Send one Chat Completions request and return the reply text.
 *
 * Called by {@link generateCommitMessage} once per `git gpt commit`. The request
 * never sends `temperature` because GPT-6 models reject it while reasoning.
 * Output style is controlled through `reasoning_effort` instead.
 *
 * @param {OpenAI} client - The OpenAI client
 * @param {object} params - The completion parameters
 * @param {string} params.model - The model to use
 * @param {Array} params.messages - The messages array
 * @param {'none'|'low'|'medium'|'high'|'xhigh'|'max'} [params.reasoningEffort] - Sent as
 *   `reasoning_effort`. If omitted, the API uses the model's default level.
 * @param {number} [params.maxTokens=1000] - Cap on `max_completion_tokens`. It
 *   includes hidden reasoning tokens, so leave headroom above the visible reply.
 * @returns {Promise<string>} The generated message content, trimmed
 * @throws {ApiKeyError} When API key is invalid (401)
 * @throws {ModelNotFoundError} When the model is unknown or retired (404)
 * @throws {RateLimitError} When rate limit is exceeded (429)
 * @throws {Error} When the reply has no text, or for other API errors
 *
 * @example
 * ```js
 * const text = await generateCompletion(client, {
 *   model: 'gpt-6-luna',
 *   messages,
 *   reasoningEffort: 'none',
 * })
 * ```
 */
export async function generateCompletion(client, params) {
  const { model, messages, reasoningEffort, maxTokens = 1000 } = params

  let response
  try {
    response = await client.chat.completions.create({
      model,
      messages,
      max_completion_tokens: maxTokens,
      // Models listed in availableModels always set this. Other models get the API default.
      ...(reasoningEffort && { reasoning_effort: reasoningEffort }),
    })
  } catch (err) {
    if (err.status === 401) {
      throw new ApiKeyError('Invalid API key. Run: git gpt open-api-key add')
    }
    if (err.status === 404) {
      throw new ModelNotFoundError(model)
    }
    if (err.status === 429) {
      throw new RateLimitError()
    }
    throw new Error(`OpenAI API Error: ${err.message}`)
  }

  const content = response.choices[0]?.message?.content?.trim()
  // Reasoning can use the whole token budget and leave no visible text
  if (!content) {
    throw new Error(
      'OpenAI returned an empty commit message. Try again, or choose another model with: git gpt model',
    )
  }
  return content
}
