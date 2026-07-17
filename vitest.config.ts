import { resolve } from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Tests import shared helpers from the root-level test/ dir.
      '@test': resolve(__dirname, 'test'),
      // Mirror the tsconfig `@/*` → ./src/* path for app imports.
      '@': resolve(__dirname, 'src'),
      // Velite-generated blog content layer (run `pnpm content` first).
      '#velite': resolve(__dirname, '.velite'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/**/*.d.ts'],
    },
  },
});
