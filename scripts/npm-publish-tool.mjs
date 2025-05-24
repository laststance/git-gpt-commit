#!/usr/bin/env node

import { execSync } from 'child_process'
import fs from 'fs'

/**
 * Script to create a release commit for npm-publish-tool
 * This script reads the version from package.json and creates a commit with the message "release v{version}"
 */

try {
  // Read package.json to get the current version
  const packageJsonPath = './package.json'
  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ Error: package.json not found in current directory')
    process.exit(1)
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  const version = packageJson.version

  if (!version) {
    console.error('❌ Error: No version found in package.json')
    process.exit(1)
  }

  console.log(`📦 Creating release commit for version ${version}...`)

  // Add all changes
  execSync('git add --all', { stdio: 'inherit' })

  // Commit with release message
  const commitMessage = `release v${version}`
  execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' })

  console.log(`✅ Release commit created: ${commitMessage}`)

  // Push to remote
  execSync('git push', { stdio: 'inherit' })

  console.log('🚀 Changes pushed to remote repository')
} catch (error) {
  console.error('❌ Error:', error.message)
  process.exit(1)
}
