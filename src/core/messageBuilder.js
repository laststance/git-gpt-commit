/**
 * Build the system message for GPT
 * @param {string} language - The target language for commit messages
 * @returns {object} The system message object
 */
export function buildSystemMessage(language) {
  return {
    role: 'system',
    content:
      'You are an expert Git commit message writer. Generate semantic, meaningful commit messages that explain the PURPOSE and IMPACT of changes, not just what changed. ' +
      'Focus on WHY the change was made and its benefits. Write in ' +
      language +
      '. Keep messages concise but descriptive, under 72 characters for the subject line.',
  }
}

/**
 * Build the user message for GPT with the diff
 * @param {string} diff - The git diff content
 * @param {boolean} prefixEnabled - Whether to include conventional commit prefixes
 * @returns {object} The user message object
 */
export function buildUserMessage(diff, prefixEnabled) {
  const content = prefixEnabled
    ? `Analyze the following git diff and generate a semantic commit message that explains the purpose and impact of these changes.
Use an appropriate conventional commit prefix (feat:, fix:, chore:, refactor:, perf:, test:, style:, docs:, build:, ci:, revert:) based on the type and intent of changes.
Structure: <prefix>: <what> to <achieve what benefit/fix what issue>
Example: "feat: add user authentication to improve security"

Git diff summary:
${diff}

Commit message: `
    : `Analyze the following git diff and generate a semantic commit message that explains the purpose and impact of these changes.
Focus on the intent and benefit of the changes, not just listing what was modified.
Structure: <what was done> to <achieve what benefit/fix what issue>
Example: "Add user authentication to improve application security"

Git diff summary:
${diff}

Commit message: `

  return {
    role: 'user',
    content,
  }
}

/**
 * Build the complete messages array for GPT
 * @param {object} options - The options
 * @param {string} options.diff - The git diff content
 * @param {string} options.language - The target language
 * @param {boolean} options.prefixEnabled - Whether to use prefixes
 * @returns {Array} The messages array
 */
export function buildMessages({ diff, language, prefixEnabled }) {
  return [buildSystemMessage(language), buildUserMessage(diff, prefixEnabled)]
}
