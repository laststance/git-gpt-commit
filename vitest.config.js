import path from 'path'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: [path.join(__dirname, 'tests', 'setup-mocks.js')],
    mockReset: true,
  },
})
