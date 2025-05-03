import { vi } from 'vitest'

vi.mock('child_process', () => {
  return {
    execSync: vi.fn(),
  }
})

import { describe, it, expect, beforeEach } from 'vitest'
import { validateTestFixtureCommitMessage } from '../utils/validateTestFixtureCommitMessage'
import * as path from 'path'
import * as fs from 'fs'
import OpenAI from 'openai'
import { execSync } from 'child_process'
import dotenv from 'dotenv'

dotenv.config({ path: path.join(process.cwd(), '.env') })

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

describe('Test Fixture Commit Message Validation', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should validate commit messages when test fixture files are modified', async () => {
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

    execSync.mockReturnValue(testFixtureDiff)

    const messages = [
      {
        role: 'system',
        content:
          'You are a helpful assistant. Write the commit message in English. This commit modifies test fixtures, so begin your message with "test:" and include "update fixture for [functionality]".',
      },
      {
        role: 'user',
        content: `Generate a Git commit message based on the following summary: ${testFixtureDiff}\n\nCommit message: `,
      },
    ]

    const parameters = {
      model: 'gpt-4o',
      messages,
      n: 1,
      temperature: 0,
      max_tokens: 50,
    }

    const response = await openai.chat.completions.create(parameters)
    const message = response.choices[0].message.content.trim()

    const isValidCommitMessage = validateTestFixtureCommitMessage(
      message,
      'array',
    )

    expect(isValidCommitMessage).toBe(true)
  })

  it('should reject invalid commit messages for fixture changes', async () => {
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

    execSync.mockReturnValue(testFixtureDiff)

    const messages = [
      {
        role: 'system',
        content:
          'You are a helpful assistant. Write the commit message in English. This is a bugfix, so begin your message with "fix:".',
      },
      {
        role: 'user',
        content: `Generate a Git commit message based on the following summary: ${testFixtureDiff}\n\nCommit message: `,
      },
    ]

    const parameters = {
      model: 'gpt-4o',
      messages,
      n: 1,
      temperature: 0,
      max_tokens: 50,
    }

    const response = await openai.chat.completions.create(parameters)
    const message = response.choices[0].message.content.trim()

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
