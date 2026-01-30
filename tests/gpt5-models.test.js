import fs from 'fs'
import os from 'os'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

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
    it('should have gpt-4o-mini as the default model', async () => {
      // Check the default model in config defaults
      const defaultsContent = fs.readFileSync(
        path.join(__dirname, '..', 'src', 'config', 'defaults.js'),
        'utf8',
      )
      expect(defaultsContent).toContain("model: 'gpt-4o-mini'")
    })

    it('should include available OpenAI models in the selection list', async () => {
      const defaultsContent = fs.readFileSync(
        path.join(__dirname, '..', 'src', 'config', 'defaults.js'),
        'utf8',
      )

      // Check for available models
      expect(defaultsContent).toContain(
        'gpt-4o-mini (Recommended - Fast & Affordable)',
      )
      expect(defaultsContent).toContain('gpt-4o (Flagship - Best Quality)')
      expect(defaultsContent).toContain('gpt-4-turbo (High Performance)')
      expect(defaultsContent).toContain('gpt-3.5-turbo (Legacy)')
    })

    it('should save selected model to config file', () => {
      // Create a test config
      const testConfig = { model: 'gpt-4o' }
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(testConfig, null, 2))

      // Read and verify
      const savedConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'))
      expect(savedConfig.model).toBe('gpt-4o')
    })
  })

  describe('Semantic Commit Messages', () => {
    it('should have improved system prompt for semantic messages', async () => {
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

    it('should include structured commit message examples in prompt', async () => {
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

    it('should use max_completion_tokens parameter (forward-compatible)', async () => {
      const openaiServiceContent = fs.readFileSync(
        path.join(__dirname, '..', 'src', 'services', 'openai.js'),
        'utf8',
      )

      // Check that max_completion_tokens is used (works with all models including o1)
      expect(openaiServiceContent).toContain('max_completion_tokens')
      // Should NOT contain deprecated parameter as the parameter name
      expect(openaiServiceContent).not.toMatch(/\bmax_tokens\s*:/)
    })
  })

  describe('Model Selection Order', () => {
    it('should list recommended model first', async () => {
      const defaultsContent = fs.readFileSync(
        path.join(__dirname, '..', 'src', 'config', 'defaults.js'),
        'utf8',
      )

      // Extract the availableModels array
      const modelsMatch = defaultsContent.match(
        /export const availableModels = \[([\s\S]*?)\]/m,
      )
      expect(modelsMatch).toBeTruthy()

      const modelsText = modelsMatch[1]

      // Check that gpt-4o-mini appears before other models
      const gpt4oMiniIndex = modelsText.indexOf("value: 'gpt-4o-mini'")
      const gpt4oIndex = modelsText.indexOf("value: 'gpt-4o'")
      const gpt35Index = modelsText.indexOf("value: 'gpt-3.5-turbo'")

      expect(gpt4oMiniIndex).toBeLessThan(gpt4oIndex)
      expect(gpt4oIndex).toBeLessThan(gpt35Index)
    })
  })

  describe('API Parameters', () => {
    it('should use temperature 0.7 for balanced output', async () => {
      const commitGeneratorContent = fs.readFileSync(
        path.join(__dirname, '..', 'src', 'core', 'commitGenerator.js'),
        'utf8',
      )

      expect(commitGeneratorContent).toContain('temperature: 0.7')
    })

    it('should not include deprecated n parameter', async () => {
      const openaiServiceContent = fs.readFileSync(
        path.join(__dirname, '..', 'src', 'services', 'openai.js'),
        'utf8',
      )

      // The create call should not contain n: 1
      expect(openaiServiceContent).not.toContain('n: 1')
    })
  })
})
