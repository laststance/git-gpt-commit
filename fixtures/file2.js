/**
 * User data class
 */
class User {
  /**
   * Initialize user
   * @param {string} name Username
   * @param {string} email Email address
   */
  constructor(name, email) {
    this.name = name
    this.email = email
    this.createdAt = new Date()
  }

  /**
   * Get user information as string
   * @returns {string} User information
   */
  getInfo() {
    return `Name: ${this.name}, Email: ${this.email}`
  }
}

/**
 * Utility for displaying a list of data
 * @param {Array} items Array of items to display
 * @returns {string} Formatted string
 */
function formatList(items) {
  return items.map((item, index) => `${index + 1}. ${item}`).join('\n')
}

module.exports = {
  User,
  formatList,
}
