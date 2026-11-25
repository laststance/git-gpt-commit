import { describe, expect, test, vi } from 'vitest'

import {
  ApiKeyError,
  ModelNotFoundError,
  RateLimitError,
} from '../../../src/services/errors.js'
import {
  createClient,
  generateCompletion,
} from '../../../src/services/openai.js'

// Mock OpenAI module
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation((config) => ({
    apiKey: config.apiKey,
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  })),
}))

describe('openai service', () => {
  describe('createClient', () => {
    test('throws ApiKeyError when no API key provided', () => {
      expect(() => createClient(null)).toThrow(ApiKeyError)
      expect(() => createClient('')).toThrow(ApiKeyError)
      expect(() => createClient(undefined)).toThrow(ApiKeyError)
    })

    test('creates client with valid API key', () => {
      // Should not throw when valid API key provided
      expect(() => createClient('sk-test-key')).not.toThrow()
      const client = createClient('sk-test-key')
      expect(client).toBeDefined()
    })
  })

  describe('generateCompletion', () => {
    test('returns the trimmed reply text', async () => {
      // Arrange
      const mockClient = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [{ message: { content: '  feat: add new feature  ' } }],
            }),
          },
        },
      }

      // Act
      const result = await generateCompletion(mockClient, {
        model: 'gpt-6-luna',
        messages: [{ role: 'user', content: 'test' }],
        reasoningEffort: 'none',
      })

      // Assert
      expect(result).toBe('feat: add new feature')
    })

    test('sends reasoning_effort and a 1000-token cap without temperature, which GPT-6 rejects', async () => {
      // Arrange
      const mockClient = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [{ message: { content: 'feat: add new feature' } }],
            }),
          },
        },
      }

      // Act
      await generateCompletion(mockClient, {
        model: 'gpt-6-luna',
        messages: [{ role: 'user', content: 'test' }],
        reasoningEffort: 'none',
      })

      // Assert
      expect(mockClient.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-6-luna',
        messages: [{ role: 'user', content: 'test' }],
        max_completion_tokens: 1000,
        reasoning_effort: 'none',
      })
    })

    test('omits reasoning_effort so the API default applies when none is given', async () => {
      // Arrange
      const mockClient = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [{ message: { content: 'result' } }],
            }),
          },
        },
      }

      // Act
      await generateCompletion(mockClient, {
        model: 'gpt-5.4-mini',
        messages: [],
      })

      // Assert
      expect(mockClient.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-5.4-mini',
        messages: [],
        max_completion_tokens: 1000,
      })
    })

    test('explains how to recover when reasoning leaves the reply empty', async () => {
      // Arrange
      const mockClient = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [{ message: { content: '' }, finish_reason: 'length' }],
            }),
          },
        },
      }

      // Act
      const result = generateCompletion(mockClient, {
        model: 'gpt-6.2-sol',
        messages: [],
        reasoningEffort: 'low',
      })

      // Assert
      await expect(result).rejects.toThrow(
        'OpenAI returned an empty commit message. Try again, or choose another model with: git gpt model',
      )
    })

    // Value: protects=empty-reply guard for whitespace-only, null and choice-less replies; fails_when=guard trims nothing or indexes choices[0] unsafely (TypeError/blank commit); why_new=existing test covers only ''; seam=none; no_claim=real API shapes
    test('rejects whitespace-only, null and choice-less replies instead of returning a blank commit message', async () => {
      // Arrange
      const expectedMessage =
        'OpenAI returned an empty commit message. Try again, or choose another model with: git gpt model'
      const clientReplying = (response) => ({
        chat: {
          completions: { create: vi.fn().mockResolvedValue(response) },
        },
      })
      const params = { model: 'gpt-6-luna', messages: [] }

      // Act
      const whitespaceReply = generateCompletion(
        clientReplying({ choices: [{ message: { content: '  \n ' } }] }),
        params,
      )
      const nullReply = generateCompletion(
        clientReplying({ choices: [{ message: { content: null } }] }),
        params,
      )
      const noChoices = generateCompletion(
        clientReplying({ choices: [] }),
        params,
      )

      // Assert
      await expect(whitespaceReply).rejects.toThrow(expectedMessage)
      await expect(nullReply).rejects.toThrow(expectedMessage)
      await expect(noChoices).rejects.toThrow(expectedMessage)
    })

    // Value: protects=404 error text tells the user to run `git gpt model`; fails_when=hint dropped from ModelNotFoundError or 404 not mapped to it; why_new=existing 404 test checks class only; seam=none; no_claim=CLI printing
    test('tells the user to run git gpt model when the model returns 404', async () => {
      // Arrange
      const mockClient = {
        chat: {
          completions: {
            create: vi
              .fn()
              .mockRejectedValue({ status: 404, message: 'Model not found' }),
          },
        },
      }

      // Act
      const result = generateCompletion(mockClient, {
        model: 'gpt-4o-mini',
        messages: [],
      })

      // Assert
      await expect(result).rejects.toThrow(
        'Model "gpt-4o-mini" not found. Choose another with: git gpt model',
      )
    })

    test('refuses a subject cut off by the token cap instead of offering it as the commit message', async () => {
      // Arrange
      const mockClient = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [
                {
                  message: { content: 'fix: handle' },
                  finish_reason: 'length',
                },
              ],
            }),
          },
        },
      }

      // Act
      const result = generateCompletion(mockClient, {
        model: 'gpt-6.2-sol',
        messages: [],
        reasoningEffort: 'low',
      })

      // Assert
      await expect(result).rejects.toThrow(
        'OpenAI stopped before finishing the commit message. Try again, or choose another model with: git gpt model',
      )
    })

    test('refuses a reply cut short by the content filter instead of offering the partial text as the commit message', async () => {
      // Arrange
      const mockClient = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [
                {
                  message: { content: 'feat: add user' },
                  finish_reason: 'content_filter',
                },
              ],
            }),
          },
        },
      }

      // Act
      const result = generateCompletion(mockClient, {
        model: 'gpt-6-luna',
        messages: [],
        reasoningEffort: 'none',
      })

      // Assert
      await expect(result).rejects.toThrow(
        "OpenAI's content filter cut the commit message short. Try again, or choose another model with: git gpt model",
      )
    })

    test('throws ApiKeyError on 401 status', async () => {
      const mockClient = {
        chat: {
          completions: {
            create: vi
              .fn()
              .mockRejectedValue({ status: 401, message: 'Invalid API key' }),
          },
        },
      }

      await expect(
        generateCompletion(mockClient, { model: 'gpt-6-luna', messages: [] }),
      ).rejects.toThrow(ApiKeyError)
    })

    test('throws ModelNotFoundError on 404 status', async () => {
      const mockClient = {
        chat: {
          completions: {
            create: vi
              .fn()
              .mockRejectedValue({ status: 404, message: 'Model not found' }),
          },
        },
      }

      await expect(
        generateCompletion(mockClient, {
          model: 'invalid-model',
          messages: [],
        }),
      ).rejects.toThrow(ModelNotFoundError)
    })

    test('throws RateLimitError on 429 status', async () => {
      const mockClient = {
        chat: {
          completions: {
            create: vi
              .fn()
              .mockRejectedValue({ status: 429, message: 'Rate limited' }),
          },
        },
      }

      await expect(
        generateCompletion(mockClient, { model: 'gpt-6-luna', messages: [] }),
      ).rejects.toThrow(RateLimitError)
    })

    test('throws generic Error for other API errors', async () => {
      const mockClient = {
        chat: {
          completions: {
            create: vi
              .fn()
              .mockRejectedValue({ status: 500, message: 'Server error' }),
          },
        },
      }

      await expect(
        generateCompletion(mockClient, { model: 'gpt-6-luna', messages: [] }),
      ).rejects.toThrow('OpenAI API Error: Server error')
    })

    test('uses a custom token cap and reasoning effort', async () => {
      // Arrange
      const mockClient = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [{ message: { content: 'result' } }],
            }),
          },
        },
      }

      // Act
      await generateCompletion(mockClient, {
        model: 'gpt-6.2-sol',
        messages: [],
        reasoningEffort: 'low',
        maxTokens: 500,
      })

      // Assert
      expect(mockClient.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-6.2-sol',
        messages: [],
        max_completion_tokens: 500,
        reasoning_effort: 'low',
      })
    })
  })
})
