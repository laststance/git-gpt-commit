/**
 * Sanitizes a commit message by removing quote characters that can cause
 * issues with shell commands.
 *
 * Only removes: " (double quote), ' (single quote), ` (backtick)
 * When allowEmojis is false, also removes emoji characters.
 *
 * @param {string} message - The commit message to sanitize
 * @param {boolean} [allowEmojis=true] - Whether to preserve emoji characters
 * @returns {string} The sanitized commit message
 */
export function sanitizeCommitMessage(message, allowEmojis = true) {
  // Remove quote literals that can cause shell escaping issues
  let result = message.replace(/["'`]/g, '')

  // Strip emojis if disabled
  if (!allowEmojis) {
    result = result.replace(
      /\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu,
      '',
    )
  }

  return result
}
