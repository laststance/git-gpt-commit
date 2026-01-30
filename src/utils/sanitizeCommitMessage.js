/**
 * Sanitizes a commit message by removing quote characters that can cause
 * issues with shell commands.
 *
 * Only removes: " (double quote), ' (single quote), ` (backtick)
 * All other characters including emojis, symbols, and Unicode are preserved.
 *
 * @param {string} message - The commit message to sanitize
 * @returns {string} The sanitized commit message
 */
export function sanitizeCommitMessage(message) {
  // Remove only quote literals that can cause shell escaping issues
  return message.replace(/["'`]/g, '')
}
