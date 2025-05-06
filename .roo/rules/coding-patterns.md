---
description:
globs:
alwaysApply: true
---

# Coding Patterns

## Command Line Interface

The application uses Commander.js for CLI functionality:

```javascript
program
  .command('command-name')
  .description('Description of the command')
  .action(async () => {
    // Command implementation
  })
```

## OpenAI API Integration

OpenAI API calls follow this pattern:

```javascript
// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Prepare messages
const messages = [
  { role: 'system', content: 'System instruction' },
  { role: 'user', content: 'User message' },
]

// Make API request
const response = await openai.chat.completions.create({
  model: 'model-name',
  messages,
  temperature: 0,
  max_tokens: 50,
})

// Extract response
const message = response.choices[0].message.content.trim()
```

## Configuration Management

Configuration is stored in the user's home directory:

```javascript
// Define config file path
const CONFIG_FILE = path.join(os.homedir(), '.git-gpt-commit-config.json')

// Load configuration
function loadConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'))
    // Use config values
  }
}

// Save configuration
function saveConfig(config) {
  // Load existing config first
  let existingConfig = {}
  if (fs.existsSync(CONFIG_FILE)) {
    existingConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'))
  }
  // Merge with new config
  const updatedConfig = { ...existingConfig, ...config }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(updatedConfig, null, 2))
}
```

## User Prompts

User interactions use the prompts library:

```javascript
const response = await prompts({
  type: 'confirm', // or 'select', etc.
  name: 'value',
  message: 'Message to display',
  initial: true, // Default value
})

// Access user response
if (response.value) {
  // User confirmed
}
```
