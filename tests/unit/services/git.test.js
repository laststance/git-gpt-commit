import { execFileSync, execSync } from 'child_process'

import { describe, expect, test, vi } from 'vitest'

import { GitError } from '../../../src/services/errors.js'
import { executeCommit } from '../../../src/services/git.js'

vi.mock('child_process', () => ({
  exec: vi.fn(),
  execFileSync: vi.fn(),
  execSync: vi.fn(),
}))

describe('git service', () => {
  describe('executeCommit', () => {
    test('passes a model-written message containing $(...) to git as literal text, never through a shell', () => {
      // Arrange
      const message = 'feat: add $(touch /tmp/pwned) and $HOME; echo hi'

      // Act
      executeCommit(message)

      // Assert
      expect(execFileSync).toHaveBeenCalledWith('git', [
        'commit',
        '-m',
        'feat: add $(touch /tmp/pwned) and $HOME; echo hi',
      ])
      expect(execSync).not.toHaveBeenCalled()
    })

    test('reports a failed commit as GitError with the git error text', () => {
      // Arrange
      execFileSync.mockImplementation(() => {
        throw new Error('nothing to commit')
      })

      // Act
      const commit = () => executeCommit('feat: add login form')

      // Assert
      expect(commit).toThrow(GitError)
      expect(commit).toThrow('Failed to commit: nothing to commit')
    })
  })
})
