import { availableModels } from '../../config/defaults.js'
import { select } from '../../services/prompt.js'

/**
 * Create the model selection command handler
 * @param {object} deps - Dependencies
 * @param {import('../../config/index.js').ConfigManager} deps.config - Config manager
 * @returns {Function} The command handler
 */
export function createModelCommand({ config }) {
  return async function modelAction() {
    const selectedModel = await select('Select a model', availableModels, 0)

    if (selectedModel) {
      config.set('model', selectedModel)
      console.log(`Model set to ${selectedModel} and saved to configuration`)
    }
  }
}
