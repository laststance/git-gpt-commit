import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import os from 'os'
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
  // Create a temporary directory
  const tempDir = path.join(os.tmpdir(), `git-gpt-commit-test-${Date.now()}`)
  fs.mkdirSync(tempDir, { recursive: true })

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
  // Find the project root by looking for package.json up the directory tree
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
  const destPath = path.join(process.cwd(), destName)

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
  // テスト後にディレクトリを削除
  fs.rmSync(tempDir, { recursive: true, force: true })
}
