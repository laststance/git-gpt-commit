import { select } from '../../services/prompt.js'

/**
 * Create the prefix toggle command handler
 * @param {object} deps - Dependencies
 * @param {import('../../config/index.js').ConfigManager} deps.config - Config manager
 * @returns {Function} The command handler
 */
export function createPrefixCommand({ config }) {
  return async function prefixAction() {
    const currentEnabled = config.get('prefixEnabled')

    // Show current state
    console.log(
      `Prefixes are currently ${currentEnabled ? 'enabled' : 'disabled'}.`,
    )

    const choices = [
      { title: 'Enable prefixes', value: true },
      { title: 'Disable prefixes', value: false },
    ]

    const selectedValue = await select(
      'Set commit message prefixes (e.g., fix:, feat:, refactor:)',
      choices,
      currentEnabled ? 0 : 1,
    )

    if (selectedValue !== undefined) {
      config.set('prefixEnabled', selectedValue)
      console.log(
        `Prefix ${selectedValue ? 'enabled' : 'disabled'} and saved to configuration`,
      )
    }
  }
}
