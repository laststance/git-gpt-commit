import { exec as originalExec, execFileSync, execSync } from 'child_process'
import { promisify } from 'util'

import { GitError, NoChangesError } from './errors.js'

const exec = promisify(originalExec)

/**
 * Get the staged diff, excluding lock files
 * @returns {Promise<string>} The staged diff content
 * @throws {NoChangesError} When there are no staged changes
 * @throws {GitError} When git command fails
 */
export async function getStagedDiff() {
  try {
    const { stdout } = await exec(
      "git diff --cached -- . ':(exclude)*lock.json' ':(exclude)*lock.yaml'",
    )
    const diff = stdout.trim()
    if (diff.length === 0) {
      throw new NoChangesError()
    }
    return diff
  } catch (error) {
    if (error instanceof NoChangesError) {
      throw error
    }
    throw new GitError(`Failed to get git diff: ${error.message}`)
  }
}

/**
 * Create a git commit with the given message.
 *
 * Called by the `git gpt commit` handler after the user confirms the generated
 * message. The message comes from the model, so it is handed to git as an
 * argument without a shell: `$(...)`, `$VAR` or `;` in it stay literal text
 * instead of being run.
 *
 * @param {string} message - The commit message
 * @throws {GitError} When git commit fails
 *
 * @example
 * ```js
 * executeCommit('feat: add login form')
 * ```
 */
export function executeCommit(message) {
  try {
    // No shell: model output must never be parsed as shell syntax
    execFileSync('git', ['commit', '-m', message])
  } catch (error) {
    throw new GitError(`Failed to commit: ${error.message}`)
  }
}

/**
 * Check if the current directory is a git repository
 * @returns {boolean} True if in a git repository
 */
export function isGitRepository() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}
