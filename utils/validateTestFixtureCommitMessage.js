/**
 * Validates that commit messages for test fixture changes follow the required format
 * Format: "test: update fixture for [functionality]"
 *
 * @param {string} message - The commit message to validate
 * @param {string} [fixtureType] - Optional fixture type to validate against
 * @returns {boolean} Returns true if the message is valid, false otherwise
 */
export function validateTestFixtureCommitMessage(message, fixtureType = null) {
  if (!message) {
    return false
  }

  const basicFormatRegex = /^test(\(fixtures\))?:/i
  if (!basicFormatRegex.test(message)) {
    return false
  }

  const updateFixtureRegex =
    /update fixture|add fixture|modify fixture|fixture change/i
  if (!updateFixtureRegex.test(message)) {
    return false
  }

  if (
    fixtureType &&
    !message.toLowerCase().includes(fixtureType.toLowerCase())
  ) {
    return false
  }

  return true
}
