import fs from 'fs'
import os from 'os'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest'

import {
  availableModels,
  defaults,
  retiredModelReplacements,
} from '../src/config/defaults.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

describe('Model Configuration', () => {
  let originalConfigFile
  const CONFIG_FILE = path.join(os.homedir(), '.git-gpt-commit-config.json')

  beforeEach(() => {
    // Backup existing config if it exists
    if (fs.existsSync(CONFIG_FILE)) {
      originalConfigFile = fs.readFileSync(CONFIG_FILE, 'utf8')
    }
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Restore original config if it existed
    if (originalConfigFile) {
      fs.writeFileSync(CONFIG_FILE, originalConfigFile)
    } else if (fs.existsSync(CONFIG_FILE)) {
      fs.unlinkSync(CONFIG_FILE)
    }
    vi.clearAllMocks()
  })

  describe('Default Model', () => {
    test('new installs default to gpt-6-luna, the cheapest current model', () => {
      // Assert
      expect(defaults.model).toBe('gpt-6-luna')
    })

    test('model picker offers current GPT-6 models cheapest first, each with an accepted reasoning effort', () => {
      // Assert
      expect(availableModels).toEqual([
        {
          title: 'gpt-6-luna (Recommended - Fastest & Cheapest)',
          value: 'gpt-6-luna',
          reasoningEffort: 'none',
        },
        {
          title: 'gpt-6.1-terra (Balanced - Clearer Writing)',
          value: 'gpt-6.1-terra',
          reasoningEffort: 'none',
        },
        {
          title: 'gpt-6.2-sol (High Quality)',
          value: 'gpt-6.2-sol',
          reasoningEffort: 'low',
        },
      ])
    })

    test('every retired model is swapped to a model the picker still offers', () => {
      // Arrange
      const offered = availableModels.map((model) => model.value)

      // Act
      const successors = [...new Set(Object.values(retiredModelReplacements))]

      // Assert
      expect(successors.every((successor) => offered.includes(successor))).toBe(
        true,
      )
    })

    test('model picker preselects the default model', () => {
      // Assert
      expect(availableModels[0].value).toBe('gpt-6-luna')
    })

    test('should save selected model to config file', () => {
      // Arrange
      const testConfig = { model: 'gpt-6.2-sol' }

      // Act
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(testConfig, null, 2))

      // Assert
      const savedConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'))
      expect(savedConfig.model).toBe('gpt-6.2-sol')
    })
  })

  describe('Semantic Commit Messages', () => {
    test('should have improved system prompt for semantic messages', async () => {
      const messageBuilderContent = fs.readFileSync(
        path.join(__dirname, '..', 'src', 'core', 'messageBuilder.js'),
        'utf8',
      )

      // Check for improved system prompt
      expect(messageBuilderContent).toContain(
        'expert Git commit message writer',
      )
      expect(messageBuilderContent).toContain('PURPOSE and IMPACT')
      expect(messageBuilderContent).toContain('Focus on WHY')
      expect(messageBuilderContent).toContain(
        '72 characters for the subject line',
      )
    })

    test('should include structured commit message examples in prompt', async () => {
      const messageBuilderContent = fs.readFileSync(
        path.join(__dirname, '..', 'src', 'core', 'messageBuilder.js'),
        'utf8',
      )

      // Check for structured examples
      expect(messageBuilderContent).toContain(
        'Structure: <prefix>: <what> to <achieve what benefit/fix what issue>',
      )
      expect(messageBuilderContent).toContain(
        'Example: "feat: add user authentication to improve security"',
      )
    })

    test('should use max_completion_tokens parameter (forward-compatible)', async () => {
      const openaiServiceContent = fs.readFileSync(
        path.join(__dirname, '..', 'src', 'services', 'openai.js'),
        'utf8',
      )

      // Check that max_completion_tokens is used (required by reasoning models)
      expect(openaiServiceContent).toContain('max_completion_tokens')
      // Should NOT contain deprecated parameter as the parameter name
      expect(openaiServiceContent).not.toMatch(/\bmax_tokens\s*:/)
    })
  })

  describe('API Parameters', () => {
    test('never sends temperature, which GPT-6 models reject while reasoning', async () => {
      // Arrange
      const readSource = (...segments) =>
        fs.readFileSync(path.join(__dirname, '..', 'src', ...segments), 'utf8')

      // Act
      const openaiServiceContent = readSource('services', 'openai.js')
      const commitGeneratorContent = readSource('core', 'commitGenerator.js')

      // Assert
      expect(openaiServiceContent).not.toMatch(/\btemperature\s*:/)
      expect(commitGeneratorContent).not.toMatch(/\btemperature\s*:/)
    })

    test('should not include deprecated n parameter', async () => {
      const openaiServiceContent = fs.readFileSync(
        path.join(__dirname, '..', 'src', 'services', 'openai.js'),
        'utf8',
      )

      // The create call should not contain n: 1
      expect(openaiServiceContent).not.toContain('n: 1')
    })
  })
})
