import {configDefaults, defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, 'test/*/**'],
    globals: true,
    testTimeout: 30000, // Generating ESLint config might not be very fast
    setupFiles: ['./test/setup.ts'],
  },
});
