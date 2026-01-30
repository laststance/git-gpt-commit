#!/usr/bin/env node
/**
 * git-gpt-commit - AI-powered Git commit message generator
 *
 * Entry point for the CLI. All logic is in src/
 */

import { runCli } from './src/cli/index.js'

// For backward compatibility, export these from the old location
export { getStagedDiff } from './src/services/git.js'

// Main CLI function (backward compatible export)
const gitExtension = (_args) => {
  runCli(process.argv)
}

// Run CLI
gitExtension(process.argv.slice(2))

export default gitExtension
