/**
 * Custom error classes for service layer
 * These are thrown by services and caught by CLI layer
 */

/**
 * Error thrown when API key is missing or invalid
 */
export class ApiKeyError extends Error {
  constructor(message = 'Invalid or missing API key') {
    super(message)
    this.name = 'ApiKeyError'
  }
}

/**
 * Error thrown when the specified model is not found
 */
export class ModelNotFoundError extends Error {
  constructor(model) {
    super(`Model "${model}" not found`)
    this.name = 'ModelNotFoundError'
    this.model = model
  }
}

/**
 * Error thrown when rate limit is exceeded
 */
export class RateLimitError extends Error {
  constructor(message = 'Rate limit exceeded. Please try again later.') {
    super(message)
    this.name = 'RateLimitError'
  }
}

/**
 * Error thrown when git operations fail
 */
export class GitError extends Error {
  constructor(message) {
    super(message)
    this.name = 'GitError'
  }
}

/**
 * Error thrown when there are no staged changes
 */
export class NoChangesError extends Error {
  constructor(message = 'No changes to commit') {
    super(message)
    this.name = 'NoChangesError'
  }
}
