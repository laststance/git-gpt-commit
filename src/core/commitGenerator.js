import { sanitizeCommitMessage } from '../utils/sanitizeCommitMessage.js'

import { buildMessages } from './messageBuilder.js'

/**
 * Generate a commit message from a git diff using OpenAI
 * @param {object} deps - Dependencies (for DI)
 * @param {object} deps.openaiService - The OpenAI service
 * @param {object} deps.client - The OpenAI client instance
 * @param {object} options - Options
 * @param {string} options.diff - The git diff content
 * @param {string} options.model - The GPT model to use
 * @param {string} options.language - The target language
 * @param {boolean} options.prefixEnabled - Whether to use prefixes
 * @param {boolean} [options.allowEmojis=true] - Whether to allow emojis
 * @returns {Promise<string>} The sanitized commit message
 */
export async function generateCommitMessage(deps, options) {
  const { openaiService, client } = deps
  const { diff, model, language, prefixEnabled, allowEmojis = true } = options

  const messages = buildMessages({ diff, language, prefixEnabled })

  const rawMessage = await openaiService.generateCompletion(client, {
    model,
    messages,
    temperature: 0.7,
    maxTokens: 200,
  })

  return sanitizeCommitMessage(rawMessage, allowEmojis)
}
