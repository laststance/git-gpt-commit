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

// index.jsモジュール全体をモック
vi.mock('../index.js', () => {
  return {
    getGitSummary: vi.fn((options) => {
      try {
        // 実際のdiffコマンドを実行せず、ファイルの変更があるかチェック
        const gitStatus = require('child_process')
          .execSync('git status --porcelain')
          .toString()

        if (!gitStatus.trim()) {
          throw new Error('No changes to commit')
        }

        // モックされたdiffの内容を返す
        return `diff --git a/file1.js b/file1.js\nindex 123456..789012 100644\n--- a/file1.js\n+++ b/file1.js\n@@ -1,5 +1,8 @@\nfunction greet(name) {\n-  return \`Hello, \${name}!\`;\n+  // 名前が空の場合のデフォルト値を追加\n+  const userName = name || 'Guest';\n+  return \`Hello, \${userName}!\`;\n }`
      } catch (error) {
        throw new Error('Failed to get git summary')
      }
    }),
    gptCommit: vi.fn(async (options = {}) => {
      return 'Mock commit message'
    }),
    gitExtension: vi.fn(),
    // その他必要な関数やオブジェクト
  }
})

// fs モジュールをモック
vi.mock('fs', async () => {
  const actual = await vi.importActual('fs')

  return {
    ...actual,
    existsSync: vi.fn((path) => {
      // 特定のパスのみモックレスポンスを返す
      if (path.includes('.git-gpt-commit-config.json')) {
        return true
      }
      // それ以外は実際の実装を使用
      return actual.existsSync(path)
    }),
    readFileSync: vi.fn((path, options) => {
      // コンフィグファイルの場合、モックデータを返す
      if (path.includes('.git-gpt-commit-config.json')) {
        return JSON.stringify({
          model: 'gpt-4o',
          language: 'English',
        })
      }
      // それ以外は実際の実装を使用
      return actual.readFileSync(path, options)
    }),
    writeFileSync: vi.fn(),
  }
})

// commanderをモック
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

// child_processをモック
vi.mock('child_process', async () => {
  const actual = await vi.importActual('child_process')

  return {
    ...actual,
    execSync: vi.fn((command) => {
      if (typeof command === 'string') {
        // git statusコマンドの場合は変更があるとみなす
        if (command.includes('git status')) {
          return Buffer.from('M file1.js')
        }

        // git commitコマンドの場合はモック応答
        if (command.includes('git commit')) {
          return Buffer.from('Commit successful')
        }
      }

      // その他のコマンドは実際に実行
      return actual.execSync(command)
    }),
    exec: vi.fn((command, callback) => {
      if (command.includes('git diff')) {
        const stdout =
          "diff --git a/file1.js b/file1.js\nindex 123456..789012 100644\n--- a/file1.js\n+++ b/file1.js\n@@ -1,5 +1,8 @@\nfunction greet(name) {\n-  return `Hello, ${name}!`;\n+  // 名前が空の場合のデフォルト値を追加\n+  const userName = name || 'Guest';\n+  return `Hello, ${userName}!`;\n }"
        callback(null, { stdout })
      } else {
        callback(null, { stdout: '' })
      }
    }),
  }
})

// promptsモジュールをモック
vi.mock('prompts', () => ({
  default: vi.fn().mockResolvedValue({ value: true }),
}))

// process.exitをモック
vi.stubGlobal('process', {
  ...process,
  exit: vi.fn((code) => {
    throw new Error(`Process exited with code ${code}`)
  }),
})
