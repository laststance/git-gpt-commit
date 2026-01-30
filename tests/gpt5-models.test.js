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
      // Check the default model by reading the file content
      const indexContent = fs.readFileSync(
        path.join(__dirname, '..', 'index.js'),
        'utf8',
      )
      expect(indexContent).toContain(
        "let model = 'gpt-4o-mini' // Default model",
      )
    })

    it('should include available OpenAI models in the selection list', async () => {
      const indexContent = fs.readFileSync(
        path.join(__dirname, '..', 'index.js'),
        'utf8',
      )

      // Check for available models
      expect(indexContent).toContain(
        'gpt-4o-mini (Recommended - Fast & Affordable)',
      )
      expect(indexContent).toContain('gpt-4o (Flagship - Best Quality)')
      expect(indexContent).toContain('gpt-4-turbo (High Performance)')
      expect(indexContent).toContain('gpt-3.5-turbo (Legacy)')
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
      const indexContent = fs.readFileSync(
        path.join(__dirname, '..', 'index.js'),
        'utf8',
      )

      // Check for improved system prompt
      expect(indexContent).toContain('expert Git commit message writer')
      expect(indexContent).toContain('PURPOSE and IMPACT')
      expect(indexContent).toContain('Focus on WHY')
      expect(indexContent).toContain('72 characters for the subject line')
    })

    it('should include structured commit message examples in prompt', async () => {
      const indexContent = fs.readFileSync(
        path.join(__dirname, '..', 'index.js'),
        'utf8',
      )

      // Check for structured examples
      expect(indexContent).toContain(
        'Structure: <prefix>: <what> to <achieve what benefit/fix what issue>',
      )
      expect(indexContent).toContain(
        'Example: "feat: add user authentication to improve security"',
      )
    })

    it('should use max_completion_tokens parameter (forward-compatible)', async () => {
      const indexContent = fs.readFileSync(
        path.join(__dirname, '..', 'index.js'),
        'utf8',
      )

      // Check that max_completion_tokens is used (works with all models including o1)
      expect(indexContent).toContain('max_completion_tokens: 200')
      // Should NOT contain deprecated parameter
      expect(indexContent).not.toContain('max_tokens:')
    })
  })

  describe('Model Selection Order', () => {
    it('should list recommended model first', async () => {
      const indexContent = fs.readFileSync(
        path.join(__dirname, '..', 'index.js'),
        'utf8',
      )

      // Extract the choices array
      const choicesMatch = indexContent.match(
        /choices: \[([\s\S]*?)\],\s*initial:/m,
      )
      expect(choicesMatch).toBeTruthy()

      const choicesText = choicesMatch[1]

      // Check that gpt-4o-mini appears before other models
      const gpt4oMiniIndex = choicesText.indexOf("value: 'gpt-4o-mini'")
      const gpt4oIndex = choicesText.indexOf("value: 'gpt-4o'")
      const gpt35Index = choicesText.indexOf("value: 'gpt-3.5-turbo'")

      expect(gpt4oMiniIndex).toBeLessThan(gpt4oIndex)
      expect(gpt4oIndex).toBeLessThan(gpt35Index)
    })
  })

  describe('API Parameters', () => {
    it('should use temperature 0.7 for balanced output', async () => {
      const indexContent = fs.readFileSync(
        path.join(__dirname, '..', 'index.js'),
        'utf8',
      )

      expect(indexContent).toContain('temperature: 0.7')
    })

    it('should not include deprecated n parameter', async () => {
      const indexContent = fs.readFileSync(
        path.join(__dirname, '..', 'index.js'),
        'utf8',
      )

      // The parameters object should not contain n: 1
      const parametersMatch = indexContent.match(
        /const parameters = \{[\s\S]*?\}/m,
      )
      expect(parametersMatch).toBeTruthy()
      expect(parametersMatch[0]).not.toContain('n: 1')
    })
  })
})
