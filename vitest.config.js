import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: [path.join(__dirname, 'tests', 'setup-mocks.js')],
    mockReset: true,
  },
})
