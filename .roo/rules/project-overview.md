---
description:
globs:
alwaysApply: true
---

# Git GPT Commit - Project Overview

Git GPT Commit is an AI-powered Git extension that generates commit messages using OpenAI's GPT models, streamlining the commit process and improving developer productivity.

## Key Files

- [index.js](mdc:index.js) - Main entry point of the application
- [utils/sanitizeCommitMessage.js](mdc:utils/sanitizeCommitMessage.js) - Utility to sanitize generated commit messages
- [package.json](mdc:package.json) - Project configuration and dependencies

## Main Features

- Generates commit messages based on staged changes
- Supports multiple GPT models (gpt-3.5-turbo-instruct, gpt-4-turbo, gpt-4)
- Supports multiple languages for commit messages
- Configuration saved to user's home directory

## Usage

```bash
# Stage changes
git add .

# Generate commit message
git gpt commit

# Configure model
git gpt model

# Configure language
git gpt lang

# Show current configuration
git gpt config
```
