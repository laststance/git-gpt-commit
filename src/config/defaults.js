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
  model: 'gpt-6-luna',
  language: 'English',
  prefixEnabled: true,
  allowEmojis: true,
  apiKey: null,
}

/**
 * OpenAI models offered by `git gpt model`, cheapest first.
 *
 * GPT-6 models reason by default and count those hidden tokens against
 * `max_completion_tokens`, so each entry pins the lowest `reasoningEffort` the
 * model accepts. A one-line commit message needs no deliberation, and a higher
 * level would add cost and latency. GPT-6.2 Sol rejects `none`, so it uses `low`.
 * Read by {@link generateCommitMessage} to build each request.
 */
export const availableModels = [
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
]

/**
 * Successors for models that earlier releases offered in `git gpt model` and
 * that OpenAI has retired or is retiring.
 *
 * A saved config can still name one of these models, and the API rejects it
 * once the model shuts down. {@link ConfigManager.load} swaps in the successor
 * so commits keep working without asking the user to choose a model again. The
 * successors follow OpenAI's deprecations page, mapped to the nearest model in
 * {@link availableModels}.
 */
export const retiredModelReplacements = {
  'gpt-4o-mini': 'gpt-6-luna',
  'gpt-4o': 'gpt-6-luna',
  'gpt-4-turbo': 'gpt-6.2-sol',
  'gpt-3.5-turbo': 'gpt-6.1-terra',
}

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
