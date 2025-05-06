// TODO should allow emojis
export function sanitizeCommitMessage(message) {
  // Unicode regex: Allow only all characters (including Japanese and Traditional Chinese), numbers, spaces, and symbols.
  return message.replace(/[^\p{L}\p{N}\s.:@<>\/-]/gu, '')
}
