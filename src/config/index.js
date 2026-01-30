import fs from 'fs'

import { CONFIG_FILE, defaults } from './defaults.js'

/**
 * ConfigManager - Single source of truth for configuration
 * Eliminates global state by encapsulating all config operations
 */
export class ConfigManager {
  /**
   * @param {string} [configPath] - Optional custom config file path (for testing)
   */
  constructor(configPath = CONFIG_FILE) {
    this.configPath = configPath
    this.config = { ...defaults }
  }

  /**
   * Load configuration from disk
   * @returns {object} The loaded configuration merged with defaults
   */
  load() {
    try {
      if (fs.existsSync(this.configPath)) {
        const fileContent = fs.readFileSync(this.configPath, 'utf8')
        const fileConfig = JSON.parse(fileContent)
        this.config = { ...defaults, ...fileConfig }
      }
    } catch (error) {
      console.error('Error loading configuration:', error.message)
      // Continue with defaults on error
    }
    return this.config
  }

  /**
   * Save partial configuration to disk
   * @param {object} partial - Partial config to merge and save
   */
  save(partial) {
    try {
      // Load existing config first
      let existingConfig = {}
      if (fs.existsSync(this.configPath)) {
        existingConfig = JSON.parse(fs.readFileSync(this.configPath, 'utf8'))
      }
      // Merge with new config
      const updatedConfig = { ...existingConfig, ...partial }
      fs.writeFileSync(this.configPath, JSON.stringify(updatedConfig, null, 2))
      // Update in-memory config
      this.config = { ...this.config, ...partial }
    } catch (error) {
      console.error('Error saving configuration:', error.message)
    }
  }

  /**
   * Get a specific config value
   * @param {string} key - The config key to get
   * @returns {*} The config value
   */
  get(key) {
    return this.config[key]
  }

  /**
   * Set a specific config value and save to disk
   * @param {string} key - The config key to set
   * @param {*} value - The value to set
   */
  set(key, value) {
    this.config[key] = value
    this.save({ [key]: value })
  }

  /**
   * Delete a specific config key from disk
   * @param {string} key - The config key to delete
   */
  delete(key) {
    try {
      if (fs.existsSync(this.configPath)) {
        const existingConfig = JSON.parse(
          fs.readFileSync(this.configPath, 'utf8'),
        )
        delete existingConfig[key]
        fs.writeFileSync(
          this.configPath,
          JSON.stringify(existingConfig, null, 2),
        )
        this.config[key] = defaults[key] // Reset to default
      }
    } catch (error) {
      console.error('Error deleting configuration key:', error.message)
    }
  }

  /**
   * Get all configuration values (read-only copy)
   * @returns {object} Copy of the current configuration
   */
  getAll() {
    return { ...this.config }
  }

  /**
   * Get the config file path
   * @returns {string} The config file path
   */
  getPath() {
    return this.configPath
  }
}

// Export a singleton instance for convenience
export const configManager = new ConfigManager()

// Re-export defaults for external use
export {
  CONFIG_FILE,
  defaults,
  availableModels,
  availableLanguages,
} from './defaults.js'
