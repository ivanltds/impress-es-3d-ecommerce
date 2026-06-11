import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    // Integration tests (API route handlers) need Node.js File/FormData semantics.
    // Unit tests have no DOM dependency. Default to 'node' for correctness.
    environment: 'node',
    environmentMatchGlobs: [
      // If any future test file needs jsdom (e.g. React component rendering),
      // add it here: ['tests/components/**', 'jsdom']
    ],
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    exclude: [
      'e2e/**',
      'node_modules/**',
      // Temporary debug files from FF08 investigation — safe to delete manually
      'tests/integration/ff08-debug*.test.ts',
      'tests/unit/size-test.test.ts',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
