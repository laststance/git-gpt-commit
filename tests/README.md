# Git GPT Commit Test Environment

This folder contains the test environment for Git GPT Commit. This document explains the test environment configuration and how to use it.

## Test Environment Overview

The test environment consists of the following components:

- [Vitest](https://vitest.dev/) - Test framework
- Mocks and helper functions for testing
- Temporary Git repository environment

## Folder Structure

```
tests/
├── README.md              - This document
├── .env.test              - Environment variables for testing
├── .env.test.example      - Sample environment variables file
├── index.test.js          - Main functionality tests
├── setup.js               - Test environment setup helpers
├── setup-mocks.js         - Mocks setup
└── utils/
    └── mocks.js           - Mock utility functions
```

## How to Run Tests

To run tests, execute the following command in the project root directory:

```bash
npm test
```

Or to run a specific test file:

```bash
npx vitest run tests/index.test.js
```

## Test Environment Variables

The `.env.test` file defines environment variables loaded during test execution.
You can create it by copying `.env.test.example`:

```bash
cp tests/.env.test.example tests/.env.test
```

Set the following variables:

- `OPENAI_API_KEY` - OpenAI API key (required if using the actual API)

## Test Environment Setup

Tests use the functions in `setup.js` to create a temporary Git repository before each test.
This simulates an actual Git environment and tests the code in a state close to a real environment.

```javascript
import { setupTestRepo } from './setup.js'

beforeEach(() => {
  const tempDir = setupTestRepo()
  // Run tests against tempDir
})
```

## Using Mocks

### Mocking OpenAI API Responses

```javascript
import { mockOpenAIResponse } from './utils/mocks.js'

// Mock response from OpenAI API
const mockResponse = mockOpenAIResponse('Commit message', { model: 'gpt-4o' })
```

### Mocking User Input

```javascript
import { mockUserInput } from './utils/mocks.js'

// Mock scenario where user answers "yes"
const mockPrompt = mockUserInput([true])
```

### Mocking Git Operations

```javascript
import { mockGitDiff, mockExecSync } from './utils/mocks.js'

// Mock Git diff result
const mockDiff = mockGitDiff('diff --git a/file.js b/file.js\n...')

// Mock Git command execution
const mockExec = mockExecSync({
  'git commit': Buffer.from('Commit successful'),
  'git status': Buffer.from('M file.js'),
})
```

## Using Fixtures

Test fixtures are stored in the `fixtures/` directory.
To use fixtures in your tests:

```javascript
import { copyFixture } from './setup.js'

// Copy fixture file to test environment
const filePath = copyFixture('file1.js')
```

## Module Mocks

The `setup-mocks.js` file defines mocks for modules that the application depends on.
This allows running tests without external dependencies:

- OpenAI client
- Commander.js (CLI)
- fs module
- child_process module
- prompts module

## How to Add Tests

1. Create an appropriate test file (or add to an existing file)
2. Import necessary mocks and fixtures
3. Set up the test environment (beforeEach/afterEach)
4. Add test cases
5. Run tests with `npm test`
