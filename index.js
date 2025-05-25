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
let model = 'gpt-4o-mini' // Default model
let language = 'English' // Default language
let apiKey = null // Store API key from config
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
      if (config.apiKey) {
        apiKey = config.apiKey
      }
    }
  } catch (error) {
    console.error('Error loading configuration:', error)
    // Continue with default model if there's an error
  }
}

// Mask API key for display
function maskApiKey(key) {
  if (!key) return 'none'
  // Show only first 4 and last 4 characters
  return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`
}

export async function getGitSummary() {
  try {
    // If no API key in config, try to load from .env
    if (!apiKey) {
      const dotenv = await import('dotenv')
      const envPath = path.join(process.cwd(), '.env')
      dotenv.config({ path: envPath })
    }

    // Use API key from config if available, otherwise use from .env
    const openaiApiKey = apiKey || process.env.OPENAI_API_KEY

    if (!openaiApiKey) {
      console.error(
        'No OpenAI API key found. Please set it using "git gpt open-api-key add".',
      )
      process.exit(1)
    }

    openai = new OpenAI({ apiKey: openaiApiKey })

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
          { title: 'gpt-4o-mini (Recommended)', value: 'gpt-4o-mini' },
          { title: 'gpt-4o', value: 'gpt-4o' },
          { title: 'gpt-4.1-nano (Latest Fast)', value: 'gpt-4.1-nano' },
          { title: 'gpt-4.1-mini (Latest)', value: 'gpt-4.1-mini' },
          { title: 'gpt-3.5-turbo (Legacy)', value: 'gpt-3.5-turbo' },
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
    .command('open-api-key')
    .description('Manage your OpenAI API key')
    .action(async () => {
      // Show select menu for actions
      const actionResponse = await prompts({
        type: 'select',
        name: 'value',
        message: 'What would you like to do with your OpenAI API key?',
        choices: [
          { title: 'Add or update API key', value: 'add' },
          { title: 'Show API key (masked)', value: 'show' },
          { title: 'Delete API key', value: 'delete' },
        ],
        initial: 0,
      })

      // If user cancelled the selection
      if (!actionResponse.value) {
        console.log('Action cancelled.')
        return
      }

      const action = actionResponse.value

      switch (action) {
        case 'add':
          const response = await prompts({
            type: 'password',
            name: 'value',
            message: 'Enter your OpenAI API key',
          })

          if (response.value) {
            saveConfig({ apiKey: response.value })
            apiKey = response.value
            console.log('API key saved to configuration.')
          } else {
            console.log('Action cancelled.')
          }
          break

        case 'delete':
          const confirmDelete = await prompts({
            type: 'confirm',
            name: 'value',
            message: 'Are you sure you want to delete your stored API key?',
            initial: false,
          })

          if (confirmDelete.value) {
            // Load current config, delete apiKey, and save back
            let existingConfig = {}
            if (fs.existsSync(CONFIG_FILE)) {
              existingConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'))
              delete existingConfig.apiKey
              fs.writeFileSync(
                CONFIG_FILE,
                JSON.stringify(existingConfig, null, 2),
              )
              apiKey = null
              console.log('API key deleted from configuration.')
            }
          } else {
            console.log('Action cancelled.')
          }
          break

        case 'show':
          console.log(`OpenAI API key: ${maskApiKey(apiKey)}`)
          break
      }
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
      console.log(`  apikey: ${maskApiKey(apiKey)}`)
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
