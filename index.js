#!/usr/bin/env node
import OpenAI from 'openai'
import { promisify } from 'util'
import path from 'path'
import process from 'process'
import { exec as originalExec, execSync } from 'child_process'
import prompts from 'prompts'
import { program } from 'commander'
import fs from 'fs'
import os from 'os'

let openai
let model = 'gpt-4o' // Default model
const CONFIG_FILE = path.join(os.homedir(), '.git-gpt-commit-config.json')

// Function to save config to file
function saveConfig(config) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2))
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
    { role: 'system', content: 'You are a helpful assistant.' },
    {
      role: 'user',
      content: `Generate a Git commit message based on the following summary: ${gitSummary}\n\nCommit message: `,
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

  const message = response.choices[0].message.content
    .replace(/[^\w\s.:@<>/-]/gi, '')
    .trim()

  const confirm = await prompts({
    type: 'confirm',
    name: 'value',
    message: `${message}.`,
    initial: true,
  })

  if (confirm.value) {
    execSync(`git commit -m "${message}"`) // escape double quart
    console.log('Committed with the suggested message.')
  } else {
    console.log('Commit canceled.')
  }
}

const gitExtension = (args) => {
  // Load configuration at startup
  loadConfig()

  // Extract the command and arguments from the command line
  const [command, ...rest] = args

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
    .command('config')
    .description('Show current configuration')
    .action(() => {
      console.log(`Current model: ${model}`)
    })

  // Handle invalid commands
  program.on('command:*', () => {
    console.error('Invalid command: %s\n', program.args.join(' '))
    program.help()
    process.exit(1)
  })
  program.parse(process.argv)
}

gitExtension(process.argv.slice(2))

export default gitExtension
