/**
 * Masks an API key for safe display.
 * Shows only first 4 and last 4 characters.
 * @param {string|null} key - The API key to mask
 * @returns {string} The masked key or 'none' if key is falsy
 */
export function maskApiKey(key) {
  if (!key) return 'none'
  if (key.length <= 8) return '****'
  return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`
}
