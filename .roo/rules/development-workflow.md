---
description:
globs:
alwaysApply: true
---

# Development Workflow

## Getting Started

1. Clone the repository
2. Install dependencies with `pnpm install`
3. Create a `.env` file with your `OPENAI_API_KEY`

## Testing

Run tests using Vitest:

```bash
pnpm test
```

To open the Vitest UI:

```bash
pnpm exec vitest --ui
```

## Code Style

This project uses Prettier for code formatting:

- [.prettierrc](mdc:.prettierrc) - Prettier configuration
- [.prettierignore](mdc:.prettierignore) - Files to ignore for formatting

Run formatting:

```bash
pnpm prettier
```

## Git Hooks

Git hooks are managed using Husky:

- [.husky/\_/](mdc:.husky/_) - Husky configuration
- Lint-staged is configured to run Prettier on pre-commit

## Continuous Integration

GitHub Actions are used for CI:

- [.github/workflows/](mdc:.github/workflows) - GitHub Actions workflows
