import path from 'path'
import process from 'process'

import { generateCommitMessage } from '../../core/commitGenerator.js'
import { NoChangesError } from '../../services/errors.js'
import { getStagedDiff, executeCommit } from '../../services/git.js'
import * as openaiService from '../../services/openai.js'
import { confirm } from '../../services/prompt.js'

/**
 * Load API key from environment if not in config
 * @param {string|null} configApiKey - API key from config
 * @returns {Promise<string|null>} The API key
 */
async function resolveApiKey(configApiKey) {
  if (configApiKey) return configApiKey

  // Try to load from .env
  const dotenv = await import('dotenv')
  const envPath = path.join(process.cwd(), '.env')
  dotenv.config({ path: envPath })

  return process.env.OPENAI_API_KEY || null
}

/**
 * Create the commit command handler
 * @param {object} deps - Dependencies
 * @param {import('../../config/index.js').ConfigManager} deps.config - Config manager
 * @returns {Function} The command handler
 */
export function createCommitCommand({ config }) {
  return async function commitAction() {
    try {
      // Get staged diff
      const diff = await getStagedDiff()

      // Resolve API key
      const apiKey = await resolveApiKey(config.get('apiKey'))
      if (!apiKey) {
        console.error(
          'No OpenAI API key found. Please set it using "git gpt open-api-key add".',
        )
        process.exit(1)
      }

      // Create OpenAI client
      const client = openaiService.createClient(apiKey)

      // Generate commit message
      const message = await generateCommitMessage(
        { openaiService, client },
        {
          diff,
          model: config.get('model'),
          language: config.get('language'),
          prefixEnabled: config.get('prefixEnabled'),
        },
      )

      // Confirm with user
      const confirmed = await confirm(`${message}.`)
      if (confirmed) {
        executeCommit(message)
        console.log('Committed with the suggested message.')
      } else {
        console.log('Commit canceled.')
      }
    } catch (error) {
      if (error instanceof NoChangesError) {
        console.log('No changes to commit. Commit canceled.')
        process.exit(0)
      }
      console.error(error.message)
      process.exit(1)
    }
  }
}
