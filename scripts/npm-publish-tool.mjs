#!/usr/bin/env node

import fs from 'fs'
import { execSync } from 'child_process'
import { select } from '@inquirer/prompts'
import ora from 'ora'

/**
 * Script to create a release commit for npm-publish-tool
 * This script allows user to select Major, Minor, or Patch version increment,
 * updates package.json automatically, and creates a commit with the message "release v{version}"
 */

function incrementVersion(version, type) {
  const parts = version.split('.')
  if (parts.length !== 3) {
    throw new Error('Invalid version format. Expected MAJOR.MINOR.PATCH')
  }

  let [major, minor, patch] = parts.map((num) => parseInt(num, 10))

  switch (type) {
    case 'major':
      major += 1
      minor = 0
      patch = 0
      break
    case 'minor':
      major = major
      minor += 1
      patch = 0
      break
    case 'patch':
      major = major
      minor = minor
      patch += 1
      break
    default:
      throw new Error(
        'Invalid increment type. Use "major", "minor", or "patch"',
      )
  }

  return `${major}.${minor}.${patch}`
}

try {
  // Read package.json to get the current version
  const packageJsonPath = './package.json'
  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ Error: package.json not found in current directory')
    process.exit(1)
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  const currentVersion = packageJson.version

  if (!currentVersion) {
    console.error('❌ Error: No version found in package.json')
    process.exit(1)
  }

  console.log(`📋 Current version: ${currentVersion}`)

  // Split current version for highlighting
  const parts = currentVersion.split('.')

  // Get user choice for version increment using inquirer select
  const versionType = await select({
    message: '📦 Select version increment type:',
    choices: [
      {
        name: '🟢 Patch (bug fixes)',
        value: 'patch',
        description: `Backwards-compatible bug fixes (\x1b[37m${parts[0]}.${parts[1]}.\x1b[0m\x1b[1;32m${parseInt(parts[2]) + 1}\x1b[0m ← ${currentVersion})`,
      },
      {
        name: '🟡 Minor (new features)',
        value: 'minor',
        description: `Backwards-compatible functionality (\x1b[37m${parts[0]}.\x1b[0m\x1b[1;32m${parseInt(parts[1]) + 1}\x1b[0m\x1b[37m.0\x1b[0m ← ${currentVersion})`,
      },
      {
        name: '🔴 Major (breaking changes)',
        value: 'major',
        description: `Incompatible API changes (\x1b[1;32m${parseInt(parts[0]) + 1}\x1b[0m\x1b[37m.0.0\x1b[0m ← ${currentVersion})`,
      },
    ],
  })

  // Calculate new version
  const newVersion = incrementVersion(currentVersion, versionType)

  console.log(
    `🚀 Updating version from ${currentVersion} to ${newVersion} (${versionType} increment)`,
  )

  // Update package.json with new version
  packageJson.version = newVersion
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')

  console.log(`📦 Updated package.json with version ${newVersion}`)

  // Stage package.json changes with spinner
  const addSpinner = ora('package.json staged...').start()
  try {
    execSync('git add --all', { stdio: ['pipe', 'pipe', 'pipe'] })
    addSpinner.succeed('📁 package.json staged')
  } catch (error) {
    addSpinner.fail('Failed to stage files')
    throw error
  }

  // Create commit with spinner
  const commitMessage = `release v${newVersion}`
  const commitSpinner = ora(`Creating commit: ${commitMessage}...`).start()
  try {
    execSync(`git commit -m "${commitMessage}"`, {
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    commitSpinner.succeed(`✅ Release commit created: ${commitMessage}`)
  } catch (error) {
    commitSpinner.fail('Failed to create commit')
    throw error
  }

  // Push to remote with spinner
  const pushSpinner = ora('exec git push...').start()
  try {
    execSync('git push', { stdio: ['pipe', 'pipe', 'pipe'] })
    pushSpinner.succeed('🚀 Changes pushed to remote repository,')
    console.log()
    console.log(
      '🎉 If all CI checks pass, the package will be published to npm via GitHub Actions, and a GitHub Release page will be created automatically.',
    )
  } catch (error) {
    pushSpinner.fail('Failed to push to remote')
    throw error
  }
} catch (error) {
  console.error('❌ Error:', error.message)
  process.exit(1)
}
