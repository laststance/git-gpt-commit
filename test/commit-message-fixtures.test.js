import { vi } from 'vitest'

vi.mock('child_process', () => {
  return {
    execSync: vi.fn(),
    exec: (cmd, callback) => {
      if (typeof callback === 'function') {
        callback(null, { stdout: mockGitDiff })
      }
    },
  }
})

vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn().mockImplementation(async (params) => {
            const systemMessage = params.messages[0].content
            let content = ''

            if (
              systemMessage.includes('test:') ||
              mockGitDiff.includes('test/fixtures/array/')
            ) {
              content = 'test: update fixture for array methods'
            } else {
              content = 'fix: improve string camelCase documentation'
            }

            return {
              choices: [
                {
                  message: {
                    content,
                  },
                },
              ],
            }
          }),
        },
      },
    })),
  }
})

import { describe, it, expect, beforeEach } from 'vitest'
import { validateTestFixtureCommitMessage } from '../utils/validateTestFixtureCommitMessage'
import * as path from 'path'
import * as fs from 'fs'
import { execSync } from 'child_process'
import { getGitSummary } from '../index.js'

let mockGitDiff = ''

describe('Test Fixture Commit Message Validation', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should validate commit messages when test fixture files are modified', async () => {
    mockGitDiff = `
diff --git a/test/fixtures/array/chunk.js b/test/fixtures/array/chunk.js
index 1234567..abcdefg 100644
--- a/test/fixtures/array/chunk.js
+++ b/test/fixtures/array/chunk.js
@@ -1,5 +1,6 @@
 /**
- * Creates an array of elements split into groups the length of size.
+ * Creates an array of elements split into groups the length of size.
+ * If array can't be split evenly, the final chunk will be the remaining elements.
  *
  * @param {Array} array - The array to process
  * @param {number} [size=1] - The length of each chunk
`

    const gitSummary = await getGitSummary()

    const message = 'test: update fixture for array methods'

    const isValidCommitMessage = validateTestFixtureCommitMessage(
      message,
      'array',
    )

    expect(isValidCommitMessage).toBe(true)
  })

  it('should reject invalid commit messages for fixture changes', async () => {
    mockGitDiff = `
diff --git a/test/fixtures/string/camelCase.js b/test/fixtures/string/camelCase.js
index 1234567..abcdefg 100644
--- a/test/fixtures/string/camelCase.js
+++ b/test/fixtures/string/camelCase.js
@@ -1,4 +1,5 @@
 /**
+ * Improved documentation.
  * Converts string to camel case.
  *
  * @param {string} string - The string to convert
`

    const gitSummary = await getGitSummary()

    const message = 'fix: improve string camelCase documentation'

    const isValidCommitMessage = validateTestFixtureCommitMessage(
      message,
      'string',
    )

    expect(isValidCommitMessage).toBe(false)
  })

  it('should recognize test fixture directory changes', () => {
    const fixturesPath = path.join(process.cwd(), 'test', 'fixtures')
    const exists = fs.existsSync(fixturesPath)

    expect(exists).toBe(true)

    const arrayDirExists = fs.existsSync(path.join(fixturesPath, 'array'))
    const objectDirExists = fs.existsSync(path.join(fixturesPath, 'object'))
    const stringDirExists = fs.existsSync(path.join(fixturesPath, 'string'))

    expect(arrayDirExists).toBe(true)
    expect(objectDirExists).toBe(true)
    expect(stringDirExists).toBe(true)
  })
})
