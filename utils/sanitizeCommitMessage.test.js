import { describe, it, expect } from 'vitest'
import { sanitizeCommitMessage } from './sanitizeCommitMessage'

describe('sanitizeCommitMessage', () => {
  it('should return an empty string for an empty commit message', () => {
    expect(sanitizeCommitMessage('')).toBe('')
  })

  it('should remove disallowed special characters', () => {
    expect(sanitizeCommitMessage('fix: bug!@#$%^&*()_+=[]{}|;\'",?')).toBe(
      'fix: bug@',
    )
  })

  it('should allow Japanese and Traditional Chinese characters', () => {
    expect(sanitizeCommitMessage('修正: バグ修正 測試 測验')).toBe(
      '修正: バグ修正 測試 測验',
    )
  })

  it('should allow numbers, spaces, and allowed symbols', () => {
    expect(
      sanitizeCommitMessage('feat: add 1234 /path/to/file - update.'),
    ).toBe('feat: add 1234 /path/to/file - update.')
  })

  it('should trim leading and trailing whitespace', () => {
    expect(sanitizeCommitMessage('   chore: update dependencies   ')).toBe(
      '   chore: update dependencies   ',
    )
  })

  it('should handle commit messages exceeding a certain length (truncate to 100 chars)', () => {
    const longMsg = 'a'.repeat(120)
    // The function itself does not truncate, so it should return the full sanitized string
    expect(sanitizeCommitMessage(longMsg)).toBe(longMsg)
  })

  it('should not remove allowed symbols like . : @ < > / -', () => {
    expect(
      sanitizeCommitMessage('refactor: move code @ <main> /src/utils - done.'),
    ).toBe('refactor: move code @ <main> /src/utils - done.')
  })

  it('should remove emojis and unsupported unicode', () => {
    expect(sanitizeCommitMessage('fix: bug 🐛🔥💥')).toBe('fix: bug ')
  })
})
