import prompts from 'prompts'

/**
 * Show a confirmation prompt
 * @param {string} message - The message to display
 * @param {boolean} [initial=true] - The initial value
 * @returns {Promise<boolean>} User's response
 */
export async function confirm(message, initial = true) {
  const response = await prompts({
    type: 'confirm',
    name: 'value',
    message,
    initial,
  })
  return response.value ?? false
}

/**
 * Show a selection prompt
 * @param {string} message - The message to display
 * @param {Array<{title: string, value: *}>} choices - The choices to display
 * @param {number} [initial=0] - The initial selection index
 * @returns {Promise<*>} The selected value
 */
export async function select(message, choices, initial = 0) {
  const response = await prompts({
    type: 'select',
    name: 'value',
    message,
    choices,
    initial,
  })
  return response.value
}

/**
 * Show a password input prompt
 * @param {string} message - The message to display
 * @returns {Promise<string|undefined>} The entered password
 */
export async function password(message) {
  const response = await prompts({
    type: 'password',
    name: 'value',
    message,
  })
  return response.value
}
