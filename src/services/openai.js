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
 * Generate a completion using OpenAI chat API
 * @param {OpenAI} client - The OpenAI client
 * @param {object} params - The completion parameters
 * @param {string} params.model - The model to use
 * @param {Array} params.messages - The messages array
 * @param {number} [params.temperature=0.7] - The temperature
 * @param {number} [params.maxTokens=200] - Max completion tokens
 * @returns {Promise<string>} The generated message content
 * @throws {ApiKeyError} When API key is invalid (401)
 * @throws {ModelNotFoundError} When model is not found (404)
 * @throws {RateLimitError} When rate limit is exceeded (429)
 * @throws {Error} For other API errors
 */
export async function generateCompletion(client, params) {
  const { model, messages, temperature = 0.7, maxTokens = 200 } = params

  try {
    const response = await client.chat.completions.create({
      model,
      messages,
      temperature,
      max_completion_tokens: maxTokens,
    })
    return response.choices[0].message.content.trim()
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
}
