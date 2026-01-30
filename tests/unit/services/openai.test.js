import { describe, expect, it, vi } from 'vitest'

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
    it('throws ApiKeyError when no API key provided', () => {
      expect(() => createClient(null)).toThrow(ApiKeyError)
      expect(() => createClient('')).toThrow(ApiKeyError)
      expect(() => createClient(undefined)).toThrow(ApiKeyError)
    })

    it('creates client with valid API key', () => {
      // Should not throw when valid API key provided
      expect(() => createClient('sk-test-key')).not.toThrow()
      const client = createClient('sk-test-key')
      expect(client).toBeDefined()
    })
  })

  describe('generateCompletion', () => {
    it('returns generated message content', async () => {
      const mockClient = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [{ message: { content: '  feat: add new feature  ' } }],
            }),
          },
        },
      }

      const result = await generateCompletion(mockClient, {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'test' }],
      })

      expect(result).toBe('feat: add new feature')
      expect(mockClient.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'test' }],
        temperature: 0.7,
        max_completion_tokens: 200,
      })
    })

    it('throws ApiKeyError on 401 status', async () => {
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
        generateCompletion(mockClient, { model: 'gpt-4o-mini', messages: [] }),
      ).rejects.toThrow(ApiKeyError)
    })

    it('throws ModelNotFoundError on 404 status', async () => {
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

    it('throws RateLimitError on 429 status', async () => {
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
        generateCompletion(mockClient, { model: 'gpt-4o-mini', messages: [] }),
      ).rejects.toThrow(RateLimitError)
    })

    it('throws generic Error for other API errors', async () => {
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
        generateCompletion(mockClient, { model: 'gpt-4o-mini', messages: [] }),
      ).rejects.toThrow('OpenAI API Error: Server error')
    })

    it('uses custom temperature and maxTokens', async () => {
      const mockClient = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [{ message: { content: 'result' } }],
            }),
          },
        },
      }

      await generateCompletion(mockClient, {
        model: 'gpt-4o',
        messages: [],
        temperature: 0.5,
        maxTokens: 100,
      })

      expect(mockClient.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4o',
        messages: [],
        temperature: 0.5,
        max_completion_tokens: 100,
      })
    })
  })
})
