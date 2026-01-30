import { availableLanguages } from '../../config/defaults.js'
import { select } from '../../services/prompt.js'

/**
 * Create the language selection command handler
 * @param {object} deps - Dependencies
 * @param {import('../../config/index.js').ConfigManager} deps.config - Config manager
 * @returns {Function} The command handler
 */
export function createLangCommand({ config }) {
  return async function langAction() {
    const selectedLanguage = await select(
      'Select a language for commit messages',
      availableLanguages,
      0,
    )

    if (selectedLanguage) {
      config.set('language', selectedLanguage)
      console.log(
        `Language set to ${selectedLanguage} and saved to configuration`,
      )
    }
  }
}
