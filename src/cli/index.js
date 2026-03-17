import { program } from 'commander'

import { ConfigManager } from '../config/index.js'

import {
  createCommitCommand,
  createModelCommand,
  createLangCommand,
  createPrefixCommand,
  createEmojiCommand,
  createApiKeyCommand,
  createConfigCommand,
} from './commands/index.js'

/**
 * Setup and run the CLI
 * @param {object} [options] - Options
 * @param {ConfigManager} [options.config] - Config manager instance (for testing)
 */
export function setupCli(options = {}) {
  // Use provided config or create new one
  const config = options.config || new ConfigManager()

  // Load configuration at startup
  config.load()

  // Create command handlers with dependencies
  const deps = { config }

  // Register commands
  program
    .command('commit')
    .description(
      'Generate a Git commit message based on the summary of changes',
    )
    .action(createCommitCommand(deps))

  program
    .command('model')
    .description('Select the model to use')
    .action(createModelCommand(deps))

  program
    .command('lang')
    .description('Select the commit message language')
    .action(createLangCommand(deps))

  program
    .command('prefix')
    .description('Toggle commit message prefix (e.g., fix:, feat:, refactor:)')
    .action(createPrefixCommand(deps))

  program
    .command('emoji')
    .description('Toggle emoji support in commit messages')
    .action(createEmojiCommand(deps))

  program
    .command('open-api-key')
    .description('Manage your OpenAI API key')
    .action(createApiKeyCommand(deps))

  program
    .command('config')
    .description('Show current configuration')
    .action(createConfigCommand(deps))

  // Handle invalid commands
  program.on('command:*', () => {
    console.error('Invalid command: %s\n', program.args.join(' '))
    program.help()
  })

  return program
}

/**
 * Main entry point for the CLI
 * @param {string[]} [args] - Command line arguments
 */
export function runCli(args = process.argv) {
  const program = setupCli()
  program.parse(args)
}

export default runCli
