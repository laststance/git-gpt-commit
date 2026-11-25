import fs from 'fs'
import os from 'os'
import path from 'path'

import { afterEach, beforeEach, describe, expect, test } from 'vitest'

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
    test('initializes with default values', () => {
      const config = configManager.getAll()
      expect(config.model).toBe(defaults.model)
      expect(config.language).toBe(defaults.language)
      expect(config.prefixEnabled).toBe(defaults.prefixEnabled)
      expect(config.apiKey).toBe(defaults.apiKey)
    })
  })

  describe('load', () => {
    test('returns defaults when config file does not exist', () => {
      const config = configManager.load()
      expect(config.model).toBe('gpt-6-luna')
      expect(config.language).toBe('English')
    })

    test('loads existing config from file', () => {
      fs.writeFileSync(
        testConfigPath,
        JSON.stringify({ model: 'gpt-6.2-sol', language: '日本語' }),
      )
      const config = configManager.load()
      expect(config.model).toBe('gpt-6.2-sol')
      expect(config.language).toBe('日本語')
    })

    test('merges file config with defaults', () => {
      fs.writeFileSync(testConfigPath, JSON.stringify({ model: 'gpt-6.2-sol' }))
      const config = configManager.load()
      expect(config.model).toBe('gpt-6.2-sol')
      expect(config.language).toBe('English') // default preserved
    })

    test('switches a saved gpt-4o-mini config to gpt-6-luna so commits keep working after the shutdown', () => {
      // Arrange
      fs.writeFileSync(testConfigPath, JSON.stringify({ model: 'gpt-4o-mini' }))

      // Act
      const config = configManager.load()

      // Assert
      expect(config.model).toBe('gpt-6-luna')
    })

    test('switches every model that past releases offered in the picker to its GPT-6 successor', () => {
      // Arrange
      const loadModel = (savedModel) => {
        fs.writeFileSync(testConfigPath, JSON.stringify({ model: savedModel }))
        return new ConfigManager(testConfigPath).load().model
      }

      // Act
      const loaded = {
        'gpt-3.5-turbo-instruct': loadModel('gpt-3.5-turbo-instruct'),
        'gpt-3.5-turbo': loadModel('gpt-3.5-turbo'),
        'gpt-4': loadModel('gpt-4'),
        'gpt-4-turbo': loadModel('gpt-4-turbo'),
        'gpt-4.1-nano': loadModel('gpt-4.1-nano'),
        'gpt-4.1-mini': loadModel('gpt-4.1-mini'),
        'gpt-4o': loadModel('gpt-4o'),
        'gpt-5-thinking': loadModel('gpt-5-thinking'),
      }

      // Assert
      expect(loaded).toEqual({
        'gpt-3.5-turbo-instruct': 'gpt-6.1-terra',
        'gpt-3.5-turbo': 'gpt-6.1-terra',
        'gpt-4': 'gpt-6.2-sol',
        'gpt-4-turbo': 'gpt-6.2-sol',
        'gpt-4.1-nano': 'gpt-6-luna',
        'gpt-4.1-mini': 'gpt-6-luna',
        'gpt-4o': 'gpt-6-luna',
        'gpt-5-thinking': 'gpt-6.2-sol',
      })
    })

    test('switches a saved GPT-5 family model to its successor so commits survive the 2026-12-11 shutdown', () => {
      // Arrange
      const loadModel = (savedModel) => {
        fs.writeFileSync(testConfigPath, JSON.stringify({ model: savedModel }))
        return new ConfigManager(testConfigPath).load().model
      }

      // Act
      const loaded = {
        'gpt-5': loadModel('gpt-5'),
        'gpt-5-mini': loadModel('gpt-5-mini'),
        'gpt-5-nano': loadModel('gpt-5-nano'),
        'gpt-5-pro': loadModel('gpt-5-pro'),
      }

      // Assert
      expect(loaded).toEqual({
        'gpt-5': 'gpt-6.2-sol',
        'gpt-5-mini': 'gpt-6.1-terra',
        'gpt-5-nano': 'gpt-6-luna',
        'gpt-5-pro': 'gpt-6.2-sol',
      })
    })

    test('keeps a hand-set model named like an Object.prototype key instead of swapping in a function', () => {
      // Arrange
      fs.writeFileSync(testConfigPath, JSON.stringify({ model: 'constructor' }))

      // Act
      const config = configManager.load()

      // Assert
      expect(config.model).toBe('constructor')
    })

    test('leaves the config file untouched when a retired model is switched', () => {
      // Arrange
      fs.writeFileSync(testConfigPath, JSON.stringify({ model: 'gpt-4o-mini' }))

      // Act
      configManager.load()

      // Assert
      const fileContent = JSON.parse(fs.readFileSync(testConfigPath, 'utf8'))
      expect(fileContent.model).toBe('gpt-4o-mini')
    })

    test('keeps a hand-picked model that is not retired', () => {
      // Arrange
      fs.writeFileSync(
        testConfigPath,
        JSON.stringify({ model: 'gpt-5.4-mini' }),
      )

      // Act
      const config = configManager.load()

      // Assert
      expect(config.model).toBe('gpt-5.4-mini')
    })

    test('handles corrupted JSON gracefully', () => {
      fs.writeFileSync(testConfigPath, 'not valid json')
      const config = configManager.load()
      expect(config.model).toBe('gpt-6-luna') // defaults used
    })
  })

  describe('save', () => {
    test('saves partial config to file', () => {
      configManager.save({ model: 'gpt-6.2-sol' })
      const fileContent = JSON.parse(fs.readFileSync(testConfigPath, 'utf8'))
      expect(fileContent.model).toBe('gpt-6.2-sol')
    })

    test('merges with existing config on disk', () => {
      fs.writeFileSync(testConfigPath, JSON.stringify({ language: '日本語' }))
      configManager.save({ model: 'gpt-6.2-sol' })
      const fileContent = JSON.parse(fs.readFileSync(testConfigPath, 'utf8'))
      expect(fileContent.model).toBe('gpt-6.2-sol')
      expect(fileContent.language).toBe('日本語')
    })

    test('updates in-memory config', () => {
      configManager.save({ model: 'gpt-6.2-sol' })
      expect(configManager.get('model')).toBe('gpt-6.2-sol')
    })
  })

  describe('get', () => {
    test('returns specific config value', () => {
      configManager.load()
      expect(configManager.get('model')).toBe('gpt-6-luna')
    })
  })

  describe('set', () => {
    test('sets value and saves to disk', () => {
      configManager.set('model', 'gpt-6.2-sol')
      expect(configManager.get('model')).toBe('gpt-6.2-sol')
      const fileContent = JSON.parse(fs.readFileSync(testConfigPath, 'utf8'))
      expect(fileContent.model).toBe('gpt-6.2-sol')
    })
  })

  describe('delete', () => {
    test('removes key from disk config', () => {
      fs.writeFileSync(
        testConfigPath,
        JSON.stringify({ apiKey: 'sk-test', model: 'gpt-6.2-sol' }),
      )
      configManager.load()
      configManager.delete('apiKey')
      const fileContent = JSON.parse(fs.readFileSync(testConfigPath, 'utf8'))
      expect(fileContent.apiKey).toBeUndefined()
      expect(fileContent.model).toBe('gpt-6.2-sol')
    })

    test('resets in-memory value to default', () => {
      configManager.set('apiKey', 'sk-test')
      configManager.delete('apiKey')
      expect(configManager.get('apiKey')).toBe(defaults.apiKey)
    })
  })

  describe('getAll', () => {
    test('returns a copy of config', () => {
      const config = configManager.getAll()
      config.model = 'modified'
      expect(configManager.get('model')).toBe('gpt-6-luna') // original unchanged
    })
  })

  describe('getPath', () => {
    test('returns the config file path', () => {
      expect(configManager.getPath()).toBe(testConfigPath)
    })
  })
})
