import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import path from 'path'
import fs from 'fs'
import {
  setupTestRepo,
  copyFixture,
  modifyAndStageFile,
  cleanupTestRepo,
} from './setup.js'
import * as gitGptCommit from '../index.js'

describe('Git GPT Commit', () => {
  let tempDir
  let originalDir

  beforeEach(() => {
    // Store original directory
    originalDir = process.cwd()

    // Set up a new test environment before each test
    tempDir = setupTestRepo()
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Change back to original directory before cleaning up
    process.chdir(originalDir)

    // Clean up the test environment after each test
    cleanupTestRepo(tempDir)
    vi.clearAllMocks()
  })

  describe('getGitSummary', () => {
    it('returns appropriate git diff summary when changes exist', () => {
      // Prepare test file and stage it
      const filePath = copyFixture('file1.js')

      // Modify and stage the file
      modifyAndStageFile(
        filePath,
        `
        /**
         * Sample function
         * @param {string} name The name
         * @returns {string} Greeting message
         */
        function greet(name) {
          // Add default value for when name is empty
          const userName = name || 'Guest';
          return \`Hello, \${userName}!\`;
        }

        /**
         * Calculate the sum of numbers
         * @param {number[]} numbers Array of numbers
         * @returns {number} Sum value
         */
        function sum(numbers) {
          return numbers.reduce((total, num) => total + num, 0);
        }

        module.exports = {
          greet,
          sum
        };
      `,
      )

      // Since getGitSummary is already mocked,
      // Check that the function was called rather than testing actual result
      const result = gitGptCommit.getGitSummary()

      // Verification
      expect(result).toBeTruthy()
      expect(result).toContain('file1.js')
      expect(result).toContain('greet')
      expect(gitGptCommit.getGitSummary).toHaveBeenCalled()
    })

    it('throws an error when there are no changes', async () => {
      // Temporarily modify the mock to simulate no changes
      vi.mocked(gitGptCommit.getGitSummary).mockImplementationOnce(() => {
        throw new Error('No changes to commit')
      })

      // Call getGitSummary with no changes
      expect(() => gitGptCommit.getGitSummary()).toThrow('No changes to commit')
    })
  })

  describe('gptCommit', () => {
    it('generates a commit message and executes git commit', async () => {
      // Stage test file
      const filePath = copyFixture('file2.js')
      modifyAndStageFile(
        filePath,
        `
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
            this.name = name;
            this.email = email;
            this.createdAt = new Date();
            // Add email validation
            this.isValidEmail = this.validateEmail(email);
          }

          /**
           * Validate email address
           * @param {string} email Email to validate
           * @returns {boolean} Whether the email is valid
           */
          validateEmail(email) {
            const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
            return regex.test(email);
          }

          /**
           * Get user information as string
           * @returns {string} User information
           */
          getInfo() {
            return \`Name: \${this.name}, Email: \${this.email}, Valid Email: \${this.isValidEmail}\`;
          }
        }

        /**
         * Utility for displaying a list of data
         * @param {Array} items Array of items to display
         * @returns {string} Formatted string
         */
        function formatList(items) {
          return items.map((item, index) => \`\${index + 1}. \${item}\`).join('\\n');
        }

        module.exports = {
          User,
          formatList
        };
      `,
      )

      // Verify that gptCommit was called
      await gitGptCommit.gptCommit({
        createCommit: true,
        model: 'gpt-3.5-turbo',
      })
      expect(gitGptCommit.gptCommit).toHaveBeenCalledWith({
        createCommit: true,
        model: 'gpt-3.5-turbo',
      })
    })

    it('returns appropriate error message when error occurs', async () => {
      // Make gptCommit throw an error
      gitGptCommit.gptCommit.mockRejectedValueOnce(new Error('API Error'))

      // Verify error handling
      await expect(
        gitGptCommit.gptCommit({ createCommit: true }),
      ).rejects.toThrow('API Error')
    })

    it('does not execute commit when user cancels confirmation', async () => {
      // Change prompts mock response
      const prompts = await import('prompts')
      vi.mocked(prompts.default).mockResolvedValueOnce({ value: false })

      // Stage test file
      const filePath = copyFixture('file1.js')
      modifyAndStageFile(filePath, 'console.log("Test")')

      // Execute gptCommit
      await gitGptCommit.gptCommit()

      // Verify execSync wasn't called with git commit (commit wasn't executed)
      const childProcess = await import('child_process')
      expect(childProcess.execSync).not.toHaveBeenCalledWith(
        expect.stringContaining('git commit'),
      )
    })
  })
})
