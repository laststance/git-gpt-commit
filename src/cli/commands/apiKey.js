import { select, password, confirm } from '../../services/prompt.js'
import { maskApiKey } from '../../utils/maskApiKey.js'

/**
 * Create the API key management command handler
 * @param {object} deps - Dependencies
 * @param {import('../../config/index.js').ConfigManager} deps.config - Config manager
 * @returns {Function} The command handler
 */
export function createApiKeyCommand({ config }) {
  return async function apiKeyAction() {
    const actionResponse = await select(
      'What would you like to do with your OpenAI API key?',
      [
        { title: 'Add or update API key', value: 'add' },
        { title: 'Show API key (masked)', value: 'show' },
        { title: 'Delete API key', value: 'delete' },
      ],
      0,
    )

    if (!actionResponse) {
      console.log('Action cancelled.')
      return
    }

    switch (actionResponse) {
      case 'add': {
        const inputKey = await password('Enter your OpenAI API key')
        if (inputKey) {
          config.set('apiKey', inputKey)
          console.log('API key saved to configuration.')
        } else {
          console.log('Action cancelled.')
        }
        break
      }

      case 'delete': {
        const confirmDelete = await confirm(
          'Are you sure you want to delete your stored API key?',
          false,
        )
        if (confirmDelete) {
          config.delete('apiKey')
          console.log('API key deleted from configuration.')
        } else {
          console.log('Action cancelled.')
        }
        break
      }

      case 'show': {
        const currentKey = config.get('apiKey')
        console.log(`OpenAI API key: ${maskApiKey(currentKey)}`)
        break
      }
    }
  }
}
