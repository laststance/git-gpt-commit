import { availableModels } from '../config/defaults.js'
import { sanitizeCommitMessage } from '../utils/sanitizeCommitMessage.js'

import { buildMessages } from './messageBuilder.js'

/**
 * Generate a commit message from a git diff using OpenAI.
 *
 * Called by the `git gpt commit` handler. It looks up the reasoning effort
 * pinned for the selected model in {@link availableModels}. A model set by hand
 * in the config file is not listed there, so the API uses its default level.
 *
 * @param {object} deps - Dependencies (for DI)
 * @param {object} deps.openaiService - The OpenAI service
 * @param {object} deps.client - The OpenAI client instance
 * @param {object} options - Options
 * @param {string} options.diff - The git diff content
 * @param {string} options.model - The OpenAI model ID
 * @param {string} options.language - The target language
 * @param {boolean} options.prefixEnabled - Whether to use prefixes
 * @param {boolean} [options.allowEmojis=true] - Whether to allow emojis
 * @returns {Promise<string>} The sanitized, trimmed commit message
 * @throws {Error} When the message is empty after sanitizing, plus any error
 *   from {@link generateCompletion}
 */
export async function generateCommitMessage(deps, options) {
  const { openaiService, client } = deps
  const { diff, model, language, prefixEnabled, allowEmojis = true } = options

  const messages = buildMessages({ diff, language, prefixEnabled })
  const reasoningEffort = availableModels.find(
    (candidate) => candidate.value === model,
  )?.reasoningEffort

  const rawMessage = await openaiService.generateCompletion(client, {
    model,
    messages,
    reasoningEffort,
    maxTokens: 1000,
  })

  const message = sanitizeCommitMessage(rawMessage, allowEmojis).trim()
  // A reply made only of quotes or (with emojis off) emojis sanitizes to nothing
  if (!message) {
    throw new Error(
      'The generated commit message was empty after removing quotes and emojis. Try again, or choose another model with: git gpt model',
    )
  }
  return message
}
