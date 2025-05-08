#!/usr/bin/env node
import { exec as originalExec, execSync } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'
import process from 'process'
import { promisify } from 'util'

import { program } from 'commander'
import OpenAI from 'openai'
import prompts from 'prompts'

import { sanitizeCommitMessage } from './utils/sanitizeCommitMessage.js'

let openai
let model = 'gpt-4o' // Default model
let language = 'English' // Default language
// Define prefixState using closure for safer state management
const prefixState = (() => {
  let enabled = true // Default is enabled
  return {
    isEnabled: () => enabled,
    setEnabled: (value) => {
      enabled = value
      return value
    },
  }
})()

const CONFIG_FILE = path.join(os.homedir(), '.git-gpt-commit-config.json')

// Function to save config to file
function saveConfig(config) {
  try {
    // Load existing config first
    let existingConfig = {}
    if (fs.existsSync(CONFIG_FILE)) {
      existingConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'))
    }
    // Merge with new config
    const updatedConfig = { ...existingConfig, ...config }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updatedConfig, null, 2))
  } catch (error) {
    console.error('Error saving configuration:', error)
  }
}

// Function to load config from file
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'))
      if (config.model) {
        model = config.model
      }
      if (config.language) {
        language = config.language
      }
      if (config.prefixEnabled !== undefined) {
        prefixState.setEnabled(config.prefixEnabled)
      }
    }
  } catch (error) {
    console.error('Error loading configuration:', error)
    // Continue with default model if there's an error
  }
}

export async function getGitSummary() {
  try {
    const dotenv = await import('dotenv')
    const envPath = path.join(process.cwd(), '.env')
    dotenv.config({ path: envPath })
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const exec = promisify(originalExec)
    const { stdout } = await exec(
      "git diff --cached -- . ':(exclude)*lock.json' ':(exclude)*lock.yaml'",
    )
    const summary = stdout.trim()
    if (summary.length === 0) {
      return null
    }

    return summary
  } catch (error) {
    console.error('Error while summarizing Git changes:', error)
    process.exit(1)
  }
}

const gptCommit = async () => {
  const gitSummary = await getGitSummary()
  if (!gitSummary) {
    console.log('No changes to commit. Commit canceled.')
    process.exit(0)
  }

  const messages = [
    {
      role: 'system',
      content:
        'You are a helpful assistant. Write the commit message in ' +
        language +
        '.',
    },
    {
      role: 'user',
      content: prefixState.isEnabled()
        ? `Generate a Git commit message based on the following summary, with an appropriate prefix (add:, fix:, feat:, refactor:, chore:, perf:, test:, style:, docs:, merge:, build:, ci:, revert:, merge:) based on the type of changes: ${gitSummary}\n\nCommit message: `
        : `Generate a Git commit message based on the following summary: ${gitSummary}\n\nCommit message: `,
    },
  ]

  const parameters = {
    model,
    messages,
    n: 1,
    temperature: 0,
    max_tokens: 50,
  }

  const response = await openai.chat.completions.create(parameters)
  const message = response.choices[0].message.content.trim()
  const sanitizedMessage = sanitizeCommitMessage(message)

  const confirm = await prompts({
    type: 'confirm',
    name: 'value',
    message: `${sanitizedMessage}.`,
    initial: true,
  })

  if (confirm.value) {
    execSync(`git commit -m "${sanitizedMessage}"`)
    console.log('Committed with the suggested message.')
  } else {
    console.log('Commit canceled.')
  }
}

const gitExtension = (_args) => {
  // Load configuration at startup
  loadConfig()

  // No need to extract command and args since we're using Commander

  program
    .command('commit')
    .description(
      'Generate a Git commit message based on the summary of changes',
    )
    .action(async () => {
      await gptCommit()
    })

  program
    .command('model')
    .description('Select the model to use')
    .action(async () => {
      const response = await prompts({
        type: 'select',
        name: 'value',
        message: 'Select a model',
        choices: [
          { title: 'gpt-4o', value: 'gpt-4o' },
          { title: 'gpt-3.5-turbo-instruct', value: 'gpt-3.5-turbo-instruct' },
          { title: 'gpt-4-turbo', value: 'gpt-4-turbo' },
          { title: 'gpt-4', value: 'gpt-4' }, // New model added
        ],
        initial: 0,
      })

      model = response.value
      // Save the selected model to config file
      saveConfig({ model })
      console.log(`Model set to ${model} and saved to configuration`)
    })

  program
    .command('lang')
    .description('Select the commit message language')
    .action(async () => {
      const response = await prompts({
        type: 'select',
        name: 'value',
        message: 'Select a language for commit messages',
        choices: [
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
        ],
        initial: 0,
      })

      language = response.value
      // Save the selected language to config file
      saveConfig({ language })
      console.log(`Language set to ${language} and saved to configuration`)
    })

  program
    .command('prefix')
    .description('Toggle commit message prefix (e.g., fix:, feat:, refactor:)')
    .action(async () => {
      // Show the current state for user information
      console.log(
        `Prefixes are currently ${prefixState.isEnabled() ? 'enabled' : 'disabled'}.`,
      )

      const response = await prompts({
        type: 'select',
        name: 'value',
        message: 'Set commit message prefixes (e.g., fix:, feat:, refactor:)',
        choices: [
          { title: 'Enable prefixes', value: true },
          { title: 'Disable prefixes', value: false },
        ],
        initial: prefixState.isEnabled() ? 0 : 1,
      })

      // Update state and save to config
      const newValue = prefixState.setEnabled(response.value)
      saveConfig({ prefixEnabled: newValue })
      console.log(
        `Prefix ${newValue ? 'enabled' : 'disabled'} and saved to configuration`,
      )
    })

  program
    .command('config')
    .description('Show current configuration')
    .action(() => {
      console.log(
        `  prefix: ${prefixState.isEnabled() ? 'enabled' : 'disabled'}`,
      )
      console.log(`   model: ${model}`)
      console.log(`    lang: ${language}`)
      console.log(`    path: ${CONFIG_FILE}`)
    })

  // Handle invalid commands
  program.on('command:*', () => {
    console.error('Invalid command: %s\n', program.args.join(' '))
    program.help()
  })
  program.parse(process.argv)
}

gitExtension(process.argv.slice(2))

export default gitExtension
