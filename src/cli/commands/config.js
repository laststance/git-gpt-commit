import { maskApiKey } from '../../utils/maskApiKey.js'

/**
 * Create the config display command handler
 * @param {object} deps - Dependencies
 * @param {import('../../config/index.js').ConfigManager} deps.config - Config manager
 * @returns {Function} The command handler
 */
export function createConfigCommand({ config }) {
  return function configAction() {
    const prefixEnabled = config.get('prefixEnabled')
    const model = config.get('model')
    const language = config.get('language')
    const apiKey = config.get('apiKey')
    const configPath = config.getPath()

    console.log(`  prefix: ${prefixEnabled ? 'enabled' : 'disabled'}`)
    console.log(`   model: ${model}`)
    console.log(`    lang: ${language}`)
    console.log(`  apikey: ${maskApiKey(apiKey)}`)
    console.log(`    path: ${configPath}`)
  }
}
