import {defineConfig} from 'vitest/config';

// Installs the packed package with real package managers, so it needs network access and is slow
export default defineConfig({
  test: {
    include: ['test/e2e/**/*.spec.ts'],
    globals: true,
    globalSetup: ['test/e2e/global-setup.ts'],
    testTimeout: 600_000,
  },
});
