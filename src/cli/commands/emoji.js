import { select } from '../../services/prompt.js'

/**
 * Create the emoji toggle command handler
 * @param {object} deps - Dependencies
 * @param {import('../../config/index.js').ConfigManager} deps.config - Config manager
 * @returns {Function} The command handler
 */
export function createEmojiCommand({ config }) {
  return async function emojiAction() {
    const currentEnabled = config.get('allowEmojis')

    console.log(
      `Emojis are currently ${currentEnabled ? 'enabled' : 'disabled'}.`,
    )

    const choices = [
      { title: 'Enable emojis 🎉', value: true },
      { title: 'Disable emojis', value: false },
    ]

    const selectedValue = await select(
      'Allow emojis in commit messages?',
      choices,
      currentEnabled ? 0 : 1,
    )

    if (selectedValue !== undefined) {
      config.set('allowEmojis', selectedValue)
      console.log(
        `Emojis ${selectedValue ? 'enabled' : 'disabled'} and saved to configuration`,
      )
    }
  }
}
