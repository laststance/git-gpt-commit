import os from 'os'
import path from 'path'

/**
 * Path to the user's configuration file
 */
export const CONFIG_FILE = path.join(
  os.homedir(),
  '.git-gpt-commit-config.json',
)

/**
 * Default configuration values
 */
export const defaults = {
  model: 'gpt-4o-mini',
  language: 'English',
  prefixEnabled: true,
  allowEmojis: true,
  apiKey: null,
}

/**
 * Available GPT models for selection
 */
export const availableModels = [
  {
    title: 'gpt-4o-mini (Recommended - Fast & Affordable)',
    value: 'gpt-4o-mini',
  },
  { title: 'gpt-4o (Flagship - Best Quality)', value: 'gpt-4o' },
  { title: 'gpt-4-turbo (High Performance)', value: 'gpt-4-turbo' },
  { title: 'gpt-3.5-turbo (Legacy)', value: 'gpt-3.5-turbo' },
]

/**
 * Available languages for commit messages
 */
export const availableLanguages = [
  { title: 'English', value: 'English' },
  { title: 'Spanish', value: 'Spanish' },
  { title: '日本語', value: '日本語' },
  { title: 'Français', value: 'Français' },
  { title: 'Deutsch', value: 'Deutsch' },
  { title: 'Italiano', value: 'Italiano' },
  { title: '한국어', value: '한국어' },
  { title: '简体中文', value: '简体中文' },
  { title: '繁體中文', value: '繁體中文' },
  { title: 'Nederlands', value: 'Nederlands' },
  { title: 'Русский', value: 'Русский' },
  { title: 'Português do Brasil', value: 'Português do Brasil' },
]
