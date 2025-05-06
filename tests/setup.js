import { execSync } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'

import dotenv from 'dotenv'

// Load environment variables for testing
const testEnvPath = path.join(process.cwd(), 'tests', '.env.test')
if (fs.existsSync(testEnvPath)) {
  dotenv.config({ path: testEnvPath })
} else {
  dotenv.config() // Use .env file in the project root
}

/**
 * Set up a temporary Git repository for testing
 * @returns {string} Path to the created temporary directory
 */
export function setupTestRepo() {
  // Find the project root to access fixtures
  let projectRoot = process.cwd()
  let currentPath = projectRoot
  while (!fs.existsSync(path.join(currentPath, 'package.json'))) {
    const parentPath = path.dirname(currentPath)
    if (parentPath === currentPath) break
    currentPath = parentPath
  }
  if (fs.existsSync(path.join(currentPath, 'package.json'))) {
    projectRoot = currentPath
  }

  // Create a temporary directory
  const tempDir = path.join(os.tmpdir(), `git-gpt-commit-test-${Date.now()}`)
  fs.mkdirSync(tempDir, { recursive: true })

  // Create fixtures directory in the temp directory
  const fixturesDir = path.join(tempDir, 'fixtures')
  fs.mkdirSync(fixturesDir, { recursive: true })

  // Copy fixture files from original project to test directory
  const sourceFixturesDir = path.join(projectRoot, 'fixtures')
  if (fs.existsSync(sourceFixturesDir)) {
    const files = fs.readdirSync(sourceFixturesDir)
    files.forEach((file) => {
      const sourcePath = path.join(sourceFixturesDir, file)
      const destPath = path.join(fixturesDir, file)

      if (fs.statSync(sourcePath).isFile()) {
        fs.copyFileSync(sourcePath, destPath)
      } else if (fs.statSync(sourcePath).isDirectory()) {
        // Handle subdirectories like 'expected'
        fs.mkdirSync(destPath, { recursive: true })
        const subFiles = fs.readdirSync(sourcePath)
        subFiles.forEach((subFile) => {
          const subSourcePath = path.join(sourcePath, subFile)
          const subDestPath = path.join(destPath, subFile)
          if (fs.statSync(subSourcePath).isFile()) {
            fs.copyFileSync(subSourcePath, subDestPath)
          }
        })
      }
    })
  }

  // Initialize Git repository
  process.chdir(tempDir)
  execSync('git init')
  execSync('git config user.name "Test User"')
  execSync('git config user.email "test@example.com"')

  // Create .env file (using actual API key)
  fs.writeFileSync('.env', `OPENAI_API_KEY=${process.env.OPENAI_API_KEY}`)

  return tempDir
}

/**
 * Copy a fixture file from the fixtures directory
 * @param {string} fixtureName Source fixture file name
 * @param {string} destName Destination file name
 * @returns {string} Path to the copied file
 */
export function copyFixture(fixtureName, destName = fixtureName) {
  // First check if fixture exists in the current working directory
  const localFixturePath = path.join(process.cwd(), 'fixtures', fixtureName)
  const destPath = path.join(process.cwd(), destName)

  // If fixture exists locally, use it
  if (fs.existsSync(localFixturePath)) {
    fs.copyFileSync(localFixturePath, destPath)
    return destPath
  }

  // Otherwise, look for it in the project root
  let projectRoot = process.cwd()
  let currentPath = projectRoot

  // Keep going up until we find package.json or hit the root
  while (!fs.existsSync(path.join(currentPath, 'package.json'))) {
    const parentPath = path.dirname(currentPath)
    if (parentPath === currentPath) {
      // We've reached the root and didn't find package.json
      break
    }
    currentPath = parentPath
  }

  if (fs.existsSync(path.join(currentPath, 'package.json'))) {
    projectRoot = currentPath
  }

  const fixturePath = path.join(projectRoot, 'fixtures', fixtureName)

  if (!fs.existsSync(fixturePath)) {
    // Create a mock file if the fixture directory doesn't exist
    console.warn(`Fixture file not found: ${fixturePath}`)
    console.warn('Creating mock fixture file instead')

    // Create a mock file
    fs.writeFileSync(
      destPath,
      `// Mock fixture file for ${fixtureName}\nconsole.log('This is a mock fixture');`,
    )
    return destPath
  }

  fs.copyFileSync(fixturePath, destPath)
  return destPath
}

/**
 * Modify a file and stage it in Git
 * @param {string} filePath Path to the file to modify
 * @param {string} content Content to write
 */
export function modifyAndStageFile(filePath, content) {
  fs.writeFileSync(filePath, content)
  execSync(`git add ${filePath}`)
}

/**
 * Clean up the test repository
 * @param {string} tempDir Path to the temporary directory to delete
 */
export function cleanupTestRepo(tempDir) {
  // Delete the directory after the test
  fs.rmSync(tempDir, { recursive: true, force: true })
}
