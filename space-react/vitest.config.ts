import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@core': path.resolve(__dirname, '../packages/core/src'),
    },
  },
  test: {
    include: ['src/**/*.test.ts', '../packages/core/src/**/*.test.ts'],
  },
})
