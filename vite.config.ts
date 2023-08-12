import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      all: true,
      reporter: ['text', 'json', 'html'],
      thresholdAutoUpdate: true,
      lines: 0,
      functions: 0,
      branches: 0,
      statements: 0,
    },
  },
})
