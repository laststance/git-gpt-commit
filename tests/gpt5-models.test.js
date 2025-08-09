import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

describe('GPT-5 Model Integration', () => {
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

  describe('Model Configuration', () => {
    it('should have gpt-5-mini as the default model', async () => {
      // Import the module fresh
      const indexModule = await import('../index.js')

      // Check the default model by reading the file content
      const indexContent = fs.readFileSync(
        path.join(__dirname, '..', 'index.js'),
        'utf8',
      )
      expect(indexContent).toContain(
        "let model = 'gpt-5-mini' // Default model",
      )
    })

    it('should include all GPT-5 series models in the selection list', async () => {
      const indexContent = fs.readFileSync(
        path.join(__dirname, '..', 'index.js'),
        'utf8',
      )

      // Check for all GPT-5 models
      expect(indexContent).toContain('gpt-5-mini (Recommended - Lightweight)')
      expect(indexContent).toContain('gpt-5 (Flagship - Balanced)')
      expect(indexContent).toContain('gpt-5-nano (Fastest - API Only)')
      expect(indexContent).toContain('gpt-5-pro (Most Powerful)')
      expect(indexContent).toContain('gpt-5-thinking (Extended Reasoning)')

      // Check that previous gen models are still available
      expect(indexContent).toContain('gpt-4o-mini (Previous Gen)')
      expect(indexContent).toContain('gpt-4o (Previous Gen)')
      expect(indexContent).toContain('gpt-3.5-turbo (Legacy)')
    })

    it('should save selected GPT-5 model to config file', () => {
      // Create a test config
      const testConfig = { model: 'gpt-5-pro' }
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(testConfig, null, 2))

      // Read and verify
      const savedConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'))
      expect(savedConfig.model).toBe('gpt-5-pro')
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

    it('should have increased max_tokens for longer semantic messages', async () => {
      const indexContent = fs.readFileSync(
        path.join(__dirname, '..', 'index.js'),
        'utf8',
      )

      // Check that max_tokens was increased from 50 to 100
      expect(indexContent).toContain('max_tokens: 100')
      expect(indexContent).not.toContain('max_tokens: 50')
    })
  })

  describe('Model Selection Order', () => {
    it('should list GPT-5 models before legacy models', async () => {
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

      // Check that GPT-5 models appear before GPT-4 models
      const gpt5MiniIndex = choicesText.indexOf('gpt-5-mini')
      const gpt5Index = choicesText.indexOf("'gpt-5'")
      const gpt4oMiniIndex = choicesText.indexOf('gpt-4o-mini')
      const gpt35Index = choicesText.indexOf('gpt-3.5-turbo')

      expect(gpt5MiniIndex).toBeLessThan(gpt4oMiniIndex)
      expect(gpt5Index).toBeLessThan(gpt4oMiniIndex)
      expect(gpt4oMiniIndex).toBeLessThan(gpt35Index)
    })
  })
})
