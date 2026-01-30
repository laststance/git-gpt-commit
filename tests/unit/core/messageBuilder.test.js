import { describe, expect, it } from 'vitest'

import {
  buildMessages,
  buildSystemMessage,
  buildUserMessage,
} from '../../../src/core/messageBuilder.js'

describe('messageBuilder', () => {
  describe('buildSystemMessage', () => {
    it('includes the language in the message', () => {
      const message = buildSystemMessage('English')
      expect(message.role).toBe('system')
      expect(message.content).toContain('Write in English')
    })

    it('works with different languages', () => {
      const message = buildSystemMessage('日本語')
      expect(message.content).toContain('Write in 日本語')
    })
  })

  describe('buildUserMessage', () => {
    const sampleDiff = '+function hello() { return "world" }'

    it('includes conventional commit prefixes when enabled', () => {
      const message = buildUserMessage(sampleDiff, true)
      expect(message.role).toBe('user')
      expect(message.content).toContain('conventional commit prefix')
      expect(message.content).toContain('feat:')
      expect(message.content).toContain('fix:')
      expect(message.content).toContain(sampleDiff)
    })

    it('excludes conventional commit prefixes when disabled', () => {
      const message = buildUserMessage(sampleDiff, false)
      expect(message.role).toBe('user')
      expect(message.content).not.toContain('conventional commit prefix')
      expect(message.content).toContain(sampleDiff)
    })
  })

  describe('buildMessages', () => {
    it('returns array with system and user messages', () => {
      const messages = buildMessages({
        diff: 'test diff',
        language: 'English',
        prefixEnabled: true,
      })

      expect(messages).toHaveLength(2)
      expect(messages[0].role).toBe('system')
      expect(messages[1].role).toBe('user')
    })

    it('passes correct options to each message builder', () => {
      const messages = buildMessages({
        diff: 'my diff content',
        language: 'Français',
        prefixEnabled: false,
      })

      expect(messages[0].content).toContain('Write in Français')
      expect(messages[1].content).toContain('my diff content')
      expect(messages[1].content).not.toContain('conventional commit prefix')
    })
  })
})
