import { describe, it, expect } from 'vitest'
import { validateTestFixtureCommitMessage } from './validateTestFixtureCommitMessage'

describe('validateTestFixtureCommitMessage', () => {
  it('should return false for an empty commit message', () => {
    expect(validateTestFixtureCommitMessage('')).toBe(false)
  })

  it('should return true for valid test fixture commit messages', () => {
    expect(
      validateTestFixtureCommitMessage(
        'test: update fixture for array methods',
      ),
    ).toBe(true)
    expect(
      validateTestFixtureCommitMessage(
        'test(fixtures): add fixture for object utility',
      ),
    ).toBe(true)
    expect(
      validateTestFixtureCommitMessage(
        'test: modify fixture for string camelCase',
      ),
    ).toBe(true)
  })

  it('should return false for invalid test fixture commit messages', () => {
    expect(validateTestFixtureCommitMessage('feat: add new feature')).toBe(
      false,
    )
    expect(validateTestFixtureCommitMessage('fix: update test fixture')).toBe(
      false,
    )
    expect(validateTestFixtureCommitMessage('test: fix bug in main code')).toBe(
      false,
    )
  })

  it('should validate specific fixture types if provided', () => {
    expect(
      validateTestFixtureCommitMessage(
        'test: update fixture for array methods',
        'array',
      ),
    ).toBe(true)
    expect(
      validateTestFixtureCommitMessage(
        'test: update fixture for string methods',
        'array',
      ),
    ).toBe(false)
  })
})
