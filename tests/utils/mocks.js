import { vi } from 'vitest'

/**
 * Mock OpenAI API response
 * @param {string} content Response content
 * @param {Object} options Additional options
 * @returns {Object} Mocked OpenAI response
 */
export function mockOpenAIResponse(content, options = {}) {
  const defaultResponse = {
    model: options.model || 'gpt-4o',
    choices: [
      {
        message: {
          content,
          role: 'assistant',
        },
        finish_reason: 'stop',
        index: 0,
      },
    ],
    usage: {
      prompt_tokens: 219,
      completion_tokens: 58,
      total_tokens: 277,
    },
    object: 'chat.completion',
  }

  return {
    ...defaultResponse,
    ...options,
  }
}

/**
 * Mock OpenAI API error
 * @param {string} errorMessage Error message
 * @param {number} statusCode HTTP status code
 * @returns {Object} Mocked API error
 */
export function mockOpenAIError(errorMessage = 'API Error', statusCode = 500) {
  const error = new Error(errorMessage)
  error.status = statusCode
  error.statusText = 'Internal Server Error'
  return error
}

/**
 * Mock user input
 * @param {Array} responses Array of responses to mock (e.g., [true, false])
 * @returns {Function} Mock function
 */
export function mockUserInput(responses) {
  let callIndex = 0

  return vi.fn().mockImplementation(() => {
    if (callIndex < responses.length) {
      return Promise.resolve({ value: responses[callIndex++] })
    }
    return Promise.resolve({ value: false })
  })
}

/**
 * Mock Git diff result
 * @param {string} diffOutput Diff string to output
 * @returns {Function} Mock function
 */
export function mockGitDiff(diffOutput) {
  return vi.fn().mockResolvedValue({
    stdout: diffOutput,
    stderr: '',
  })
}

/**
 * Mock process exit
 * @returns {Function} Mock function
 */
export function mockProcessExit() {
  return vi.fn().mockImplementation((code) => {
    throw new Error(`Process exited with code ${code}`)
  })
}

/**
 * Mock command execution
 * @param {Object} commandMap Map of commands and their outputs
 * @returns {Function} Mock function
 */
export function mockExecSync(commandMap) {
  return vi.fn().mockImplementation((command) => {
    for (const [cmdPattern, output] of Object.entries(commandMap)) {
      if (command.includes(cmdPattern)) {
        return typeof output === 'function' ? output() : output
      }
    }

    // Default response
    return Buffer.from('Command executed')
  })
}
