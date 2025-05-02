import { describe, it, expect, beforeEach, vi } from 'vitest'
import { validateTestFixtureCommitMessage } from '../utils/validateTestFixtureCommitMessage'
import * as path from 'path'
import * as fs from 'fs'

const mockExec = vi.fn()
vi.mock('child_process', () => ({
  execSync: mockExec,
}))

const mockOpenAIResponse = {
  choices: [
    {
      message: {
        content: '',
      },
    },
  ],
}

describe('Test Fixture Commit Message Validation', () => {
  beforeEach(() => {
    vi.resetAllMocks()

    mockOpenAIResponse.choices[0].message.content =
      'test: update fixture for array methods'
  })

  it('should validate commit messages when test fixture files are modified', () => {
    const testFixtureDiff = `
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

    mockExec.mockReturnValue(testFixtureDiff)

    const isValidCommitMessage = validateTestFixtureCommitMessage(
      mockOpenAIResponse.choices[0].message.content,
      'array',
    )

    expect(isValidCommitMessage).toBe(true)
  })

  it('should reject invalid commit messages for fixture changes', () => {
    const testFixtureDiff = `
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

    mockExec.mockReturnValue(testFixtureDiff)

    mockOpenAIResponse.choices[0].message.content = 'fix: update some code'

    const isValidCommitMessage = validateTestFixtureCommitMessage(
      mockOpenAIResponse.choices[0].message.content,
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
