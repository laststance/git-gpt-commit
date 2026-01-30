import fs from 'fs'
import os from 'os'
import path from 'path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { defaults } from '../../../src/config/defaults.js'
import { ConfigManager } from '../../../src/config/index.js'

describe('ConfigManager', () => {
  let testConfigPath
  let configManager

  beforeEach(() => {
    // Create a unique temp config file for each test
    testConfigPath = path.join(os.tmpdir(), `test-config-${Date.now()}.json`)
    configManager = new ConfigManager(testConfigPath)
  })

  afterEach(() => {
    // Clean up temp config file
    if (fs.existsSync(testConfigPath)) {
      fs.unlinkSync(testConfigPath)
    }
  })

  describe('constructor', () => {
    it('initializes with default values', () => {
      const config = configManager.getAll()
      expect(config.model).toBe(defaults.model)
      expect(config.language).toBe(defaults.language)
      expect(config.prefixEnabled).toBe(defaults.prefixEnabled)
      expect(config.apiKey).toBe(defaults.apiKey)
    })
  })

  describe('load', () => {
    it('returns defaults when config file does not exist', () => {
      const config = configManager.load()
      expect(config.model).toBe('gpt-4o-mini')
      expect(config.language).toBe('English')
    })

    it('loads existing config from file', () => {
      fs.writeFileSync(
        testConfigPath,
        JSON.stringify({ model: 'gpt-4o', language: '日本語' }),
      )
      const config = configManager.load()
      expect(config.model).toBe('gpt-4o')
      expect(config.language).toBe('日本語')
    })

    it('merges file config with defaults', () => {
      fs.writeFileSync(testConfigPath, JSON.stringify({ model: 'gpt-4o' }))
      const config = configManager.load()
      expect(config.model).toBe('gpt-4o')
      expect(config.language).toBe('English') // default preserved
    })

    it('handles corrupted JSON gracefully', () => {
      fs.writeFileSync(testConfigPath, 'not valid json')
      const config = configManager.load()
      expect(config.model).toBe('gpt-4o-mini') // defaults used
    })
  })

  describe('save', () => {
    it('saves partial config to file', () => {
      configManager.save({ model: 'gpt-4o' })
      const fileContent = JSON.parse(fs.readFileSync(testConfigPath, 'utf8'))
      expect(fileContent.model).toBe('gpt-4o')
    })

    it('merges with existing config on disk', () => {
      fs.writeFileSync(testConfigPath, JSON.stringify({ language: '日本語' }))
      configManager.save({ model: 'gpt-4o' })
      const fileContent = JSON.parse(fs.readFileSync(testConfigPath, 'utf8'))
      expect(fileContent.model).toBe('gpt-4o')
      expect(fileContent.language).toBe('日本語')
    })

    it('updates in-memory config', () => {
      configManager.save({ model: 'gpt-4o' })
      expect(configManager.get('model')).toBe('gpt-4o')
    })
  })

  describe('get', () => {
    it('returns specific config value', () => {
      configManager.load()
      expect(configManager.get('model')).toBe('gpt-4o-mini')
    })
  })

  describe('set', () => {
    it('sets value and saves to disk', () => {
      configManager.set('model', 'gpt-4o')
      expect(configManager.get('model')).toBe('gpt-4o')
      const fileContent = JSON.parse(fs.readFileSync(testConfigPath, 'utf8'))
      expect(fileContent.model).toBe('gpt-4o')
    })
  })

  describe('delete', () => {
    it('removes key from disk config', () => {
      fs.writeFileSync(
        testConfigPath,
        JSON.stringify({ apiKey: 'sk-test', model: 'gpt-4o' }),
      )
      configManager.load()
      configManager.delete('apiKey')
      const fileContent = JSON.parse(fs.readFileSync(testConfigPath, 'utf8'))
      expect(fileContent.apiKey).toBeUndefined()
      expect(fileContent.model).toBe('gpt-4o')
    })

    it('resets in-memory value to default', () => {
      configManager.set('apiKey', 'sk-test')
      configManager.delete('apiKey')
      expect(configManager.get('apiKey')).toBe(defaults.apiKey)
    })
  })

  describe('getAll', () => {
    it('returns a copy of config', () => {
      const config = configManager.getAll()
      config.model = 'modified'
      expect(configManager.get('model')).toBe('gpt-4o-mini') // original unchanged
    })
  })

  describe('getPath', () => {
    it('returns the config file path', () => {
      expect(configManager.getPath()).toBe(testConfigPath)
    })
  })
})
