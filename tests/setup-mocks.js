import { vi } from 'vitest'

// Mock OpenAI
vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: 'Mock commit message',
                },
              },
            ],
          }),
        },
      },
    })),
  }
})

// Mock the entire index.js module
vi.mock('../index.js', () => {
  return {
    getGitSummary: vi.fn((_options) => {
      try {
        // Check if there are file changes without actually executing the diff command
        const gitStatus = require('child_process')
          .execSync('git status --porcelain')
          .toString()

        if (!gitStatus.trim()) {
          throw new Error('No changes to commit')
        }

        // Return mocked diff content
        return `diff --git a/file1.js b/file1.js\nindex 123456..789012 100644\n--- a/file1.js\n+++ b/file1.js\n@@ -1,5 +1,8 @@\nfunction greet(name) {\n-  return \`Hello, \${name}!\`;\n+  // Add default value when name is empty\n+  const userName = name || 'Guest';\n+  return \`Hello, \${userName}!\`;\n }`
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_e) {
        throw new Error('Failed to get git summary')
      }
    }),
    gptCommit: vi.fn(async (_options = {}) => {
      return 'Mock commit message'
    }),
    gitExtension: vi.fn(),
    // Other necessary functions or objects
  }
})

// Mock fs module
vi.mock('fs', async () => {
  const actual = await vi.importActual('fs')

  return {
    ...actual,
    existsSync: vi.fn((path) => {
      // Return mock response only for specific paths
      if (path.includes('.git-gpt-commit-config.json')) {
        return true
      }
      // Use actual implementation for others
      return actual.existsSync(path)
    }),
    readFileSync: vi.fn((path, options) => {
      // Return mock data for config file
      if (path.includes('.git-gpt-commit-config.json')) {
        return JSON.stringify({
          model: 'gpt-4o',
          language: 'English',
        })
      }
      // Use actual implementation for others
      return actual.readFileSync(path, options)
    }),
    writeFileSync: vi.fn(),
  }
})

// Mock commander
vi.mock('commander', () => {
  const mockProgram = {
    command: vi.fn().mockReturnThis(),
    description: vi.fn().mockReturnThis(),
    action: vi.fn().mockReturnThis(),
    option: vi.fn().mockReturnThis(),
    parse: vi.fn(),
    help: vi.fn(),
    on: vi.fn().mockReturnThis(),
  }

  return {
    program: mockProgram,
  }
})

// Mock child_process
vi.mock('child_process', async () => {
  const actual = await vi.importActual('child_process')

  return {
    ...actual,
    execSync: vi.fn((command) => {
      if (typeof command === 'string') {
        // Treat as having changes for git status commands
        if (command.includes('git status')) {
          return Buffer.from('M file1.js')
        }

        // Mock response for git commit commands
        if (command.includes('git commit')) {
          return Buffer.from('Commit successful')
        }
      }

      // Actually execute other commands
      return actual.execSync(command)
    }),
    exec: vi.fn((command, callback) => {
      if (command.includes('git diff')) {
        const stdout =
          "diff --git a/file1.js b/file1.js\nindex 123456..789012 100644\n--- a/file1.js\n+++ b/file1.js\n@@ -1,5 +1,8 @@\nfunction greet(name) {\n-  return \`Hello, \${name}!\`;\n+  // Add default value when name is empty\n+  const userName = name || 'Guest';\n+  return \`Hello, \${userName}!\`;\n }"
        callback(null, { stdout })
      } else {
        callback(null, { stdout: '' })
      }
    }),
  }
})

// Mock prompts module
vi.mock('prompts', () => ({
  default: vi.fn().mockResolvedValue({ value: true }),
}))

// Mock process.exit
vi.stubGlobal('process', {
  ...process,
  exit: vi.fn((code) => {
    throw new Error(`Process exited with code ${code}`)
  }),
})
