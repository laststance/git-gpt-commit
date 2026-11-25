import { describe, expect, test, vi } from 'vitest'

import { generateCommitMessage } from '../../../src/core/commitGenerator.js'

describe('commitGenerator', () => {
  describe('generateCommitMessage', () => {
    test('generates and sanitizes commit message', async () => {
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
          model: 'gpt-6-luna',
          language: 'English',
          prefixEnabled: true,
        },
      )

      // Quotes should be sanitized
      expect(result).toBe('feat: add new feature')
    })

    test('passes correct parameters to openai service', async () => {
      const mockOpenaiService = {
        generateCompletion: vi.fn().mockResolvedValue('test message'),
      }
      const mockClient = { id: 'test-client' }

      await generateCommitMessage(
        { openaiService: mockOpenaiService, client: mockClient },
        {
          diff: 'my diff',
          model: 'gpt-6.2-sol',
          language: '日本語',
          prefixEnabled: false,
        },
      )

      expect(mockOpenaiService.generateCompletion).toHaveBeenCalledWith(
        mockClient,
        expect.objectContaining({
          model: 'gpt-6.2-sol',
          reasoningEffort: 'low',
          maxTokens: 1000,
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

    test('asks gpt-6-luna for no reasoning so the default model stays fast and cheap', async () => {
      // Arrange
      const mockOpenaiService = {
        generateCompletion: vi.fn().mockResolvedValue('feat: add login'),
      }

      // Act
      await generateCommitMessage(
        { openaiService: mockOpenaiService, client: {} },
        {
          diff: 'diff',
          model: 'gpt-6-luna',
          language: 'English',
          prefixEnabled: true,
        },
      )

      // Assert
      const params = mockOpenaiService.generateCompletion.mock.calls[0][1]
      expect(params.reasoningEffort).toBe('none')
    })

    test('leaves reasoning effort unset for a model added by hand to the config file', async () => {
      // Arrange
      const mockOpenaiService = {
        generateCompletion: vi.fn().mockResolvedValue('feat: add login'),
      }

      // Act
      await generateCommitMessage(
        { openaiService: mockOpenaiService, client: {} },
        {
          diff: 'diff',
          model: 'gpt-5.4-mini',
          language: 'English',
          prefixEnabled: true,
        },
      )

      // Assert
      const params = mockOpenaiService.generateCompletion.mock.calls[0][1]
      expect(params.reasoningEffort).toBeUndefined()
    })

    test('propagates errors from openai service', async () => {
      const mockOpenaiService = {
        generateCompletion: vi.fn().mockRejectedValue(new Error('API Error')),
      }

      await expect(
        generateCommitMessage(
          { openaiService: mockOpenaiService, client: {} },
          {
            diff: 'diff',
            model: 'gpt-6-luna',
            language: 'English',
            prefixEnabled: true,
          },
        ),
      ).rejects.toThrow('API Error')
    })
  })
})
