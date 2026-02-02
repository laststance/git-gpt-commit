import { describe, it, expect } from 'vitest'

import { sanitizeCommitMessage } from './sanitizeCommitMessage'

describe('sanitizeCommitMessage', () => {
  it('should return an empty string for an empty commit message', () => {
    expect(sanitizeCommitMessage('')).toBe('')
  })

  it('should remove quote characters (double, single, backtick)', () => {
    expect(
      sanitizeCommitMessage('fix: "bug" with \'quotes\' and `backticks`'),
    ).toBe('fix: bug with quotes and backticks')
  })

  it('should preserve all other special characters', () => {
    expect(sanitizeCommitMessage('fix: bug!@#$%^&*()_+=[]{}|;,?')).toBe(
      'fix: bug!@#$%^&*()_+=[]{}|;,?',
    )
  })

  it('should allow Japanese and Traditional Chinese characters', () => {
    expect(sanitizeCommitMessage('修正: バグ修正 測試 測验')).toBe(
      '修正: バグ修正 測試 測验',
    )
  })

  it('should allow numbers, spaces, and symbols', () => {
    expect(
      sanitizeCommitMessage('feat: add 1234 /path/to/file - update.'),
    ).toBe('feat: add 1234 /path/to/file - update.')
  })

  it('should preserve leading and trailing whitespace', () => {
    expect(sanitizeCommitMessage('   chore: update dependencies   ')).toBe(
      '   chore: update dependencies   ',
    )
  })

  it('should handle long commit messages without truncation', () => {
    const longMsg = 'a'.repeat(120)
    expect(sanitizeCommitMessage(longMsg)).toBe(longMsg)
  })

  it('should preserve conventional commit format with parentheses', () => {
    expect(sanitizeCommitMessage('feat(auth): add login feature')).toBe(
      'feat(auth): add login feature',
    )
  })

  it('should preserve breaking change indicator (!)', () => {
    expect(sanitizeCommitMessage('feat!: breaking API change')).toBe(
      'feat!: breaking API change',
    )
  })

  it('should preserve issue references (#)', () => {
    expect(sanitizeCommitMessage('fix: resolve issue #123')).toBe(
      'fix: resolve issue #123',
    )
  })

  it('should allow emojis by default', () => {
    expect(sanitizeCommitMessage('fix: bug 🐛🔥💥')).toBe('fix: bug 🐛🔥💥')
  })

  it('should allow emojis when allowEmojis is true', () => {
    expect(sanitizeCommitMessage('fix: bug 🐛🔥💥', true)).toBe(
      'fix: bug 🐛🔥💥',
    )
  })

  it('should strip emojis when allowEmojis is false', () => {
    expect(sanitizeCommitMessage('fix: bug 🐛🔥💥', false)).toBe('fix: bug ')
  })

  it('should only remove quotes from mixed content', () => {
    expect(
      sanitizeCommitMessage('feat(scope)!: add "dark mode" for issue #42 🎨'),
    ).toBe('feat(scope)!: add dark mode for issue #42 🎨')
  })
})
