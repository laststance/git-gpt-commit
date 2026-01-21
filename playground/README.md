# Git GPT Commit Playground

A development environment for testing `git-gpt` commands locally.

## Setup

1. Create a test git repository:

   ```bash
   ./setup.sh
   ```

2. Set your OpenAI API key (choose one):

   ```bash
   # Option A: Use the CLI
   cd test-repo && node ../../index.js open-api-key

   # Option B: Set environment variable
   export OPENAI_API_KEY=your-key-here
   ```

## Manual Testing Commands

```bash
cd test-repo

# Generate commit message
node ../../index.js commit

# Select model
node ../../index.js model

# Select language
node ../../index.js lang

# Toggle prefix (feat:, fix:, etc.)
node ../../index.js prefix

# Show current config
node ../../index.js config
```

## Cleanup

```bash
./cleanup.sh
```

## Notes

- The test repository is created in `playground/test-repo/`
- Changes in `test-repo` do not affect the main project
- API calls use your real OpenAI API key
