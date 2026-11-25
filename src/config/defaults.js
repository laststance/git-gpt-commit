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
 * Successors for every model that an earlier release offered in
 * `git gpt model` (v0.8 to v0.11), all retired or being retired by OpenAI.
 *
 * A saved config can still name one of these models, and the API rejects it
 * once the model shuts down. {@link ConfigManager.load} swaps in the successor
 * so commits keep working without asking the user to choose a model again. The
 * successors follow OpenAI's deprecations page, mapped to the nearest model in
 * {@link availableModels}. `gpt-5-thinking` was never an API model ID.
 */
// gstack-shortcut(dec-41c32f17-1263-4686-ba20-533136d3953c): swaps immediately, so orgs allowlisting only gpt-4o/gpt-4o-mini/gpt-4.1-mini break before 2027-01-14, upgrade when a user reports it or a still-running model joins this table
export const retiredModelReplacements = {
  // Shut down 2026-09-28
  'gpt-3.5-turbo-instruct': 'gpt-6.1-terra',
  // Shut down 2026-10-23
  'gpt-3.5-turbo': 'gpt-6.1-terra',
  'gpt-4': 'gpt-6.2-sol',
  'gpt-4-turbo': 'gpt-6.2-sol',
  'gpt-4.1-nano': 'gpt-6-luna',
  // Shut down 2026-12-11
  'gpt-5': 'gpt-6.2-sol',
  'gpt-5-mini': 'gpt-6.1-terra',
  'gpt-5-nano': 'gpt-6-luna',
  'gpt-5-pro': 'gpt-6.2-sol',
  'gpt-5-thinking': 'gpt-6.2-sol',
  // Shut down 2027-01-14
  'gpt-4o': 'gpt-6-luna',
  'gpt-4o-mini': 'gpt-6-luna',
  'gpt-4.1-mini': 'gpt-6-luna',
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
