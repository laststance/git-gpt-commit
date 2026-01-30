import { describe, expect, it, vi } from 'vitest'

import { generateCommitMessage } from '../../../src/core/commitGenerator.js'

describe('commitGenerator', () => {
  describe('generateCommitMessage', () => {
    it('generates and sanitizes commit message', async () => {
      const mockOpenaiService = {
        generateCompletion: vi
          .fn()
          .mockResolvedValue('feat: add "new" feature'),
      }
      const mockClient = {}

      const result = await generateCommitMessage(
        { openaiService: mockOpenaiService, client: mockClient },
        {
          diff: 'test diff',
          model: 'gpt-4o-mini',
          language: 'English',
          prefixEnabled: true,
        },
      )

      // Quotes should be sanitized
      expect(result).toBe('feat: add new feature')
    })

    it('passes correct parameters to openai service', async () => {
      const mockOpenaiService = {
        generateCompletion: vi.fn().mockResolvedValue('test message'),
      }
      const mockClient = { id: 'test-client' }

      await generateCommitMessage(
        { openaiService: mockOpenaiService, client: mockClient },
        {
          diff: 'my diff',
          model: 'gpt-4o',
          language: '日本語',
          prefixEnabled: false,
        },
      )

      expect(mockOpenaiService.generateCompletion).toHaveBeenCalledWith(
        mockClient,
        expect.objectContaining({
          model: 'gpt-4o',
          temperature: 0.7,
          maxTokens: 200,
        }),
      )

      // Check messages structure
      const call = mockOpenaiService.generateCompletion.mock.calls[0]
      const messages = call[1].messages
      expect(messages).toHaveLength(2)
      expect(messages[0].role).toBe('system')
      expect(messages[0].content).toContain('Write in 日本語')
      expect(messages[1].role).toBe('user')
      expect(messages[1].content).toContain('my diff')
    })

    it('propagates errors from openai service', async () => {
      const mockOpenaiService = {
        generateCompletion: vi.fn().mockRejectedValue(new Error('API Error')),
      }

      await expect(
        generateCommitMessage(
          { openaiService: mockOpenaiService, client: {} },
          {
            diff: 'diff',
            model: 'gpt-4o-mini',
            language: 'English',
            prefixEnabled: true,
          },
        ),
      ).rejects.toThrow('API Error')
    })
  })
})
