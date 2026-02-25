import {configDefaults, defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, 'test/temp/**'],
    globals: true,
    testTimeout: 30_000, // Generating ESLint config might not be very fast
    setupFiles: ['./test/setup.ts'],
    snapshotFormat: {
      min: true,
      // `indent` is implicitly set to 2 by default, but `min` cannot be used together with non-falsy `indent` value
      indent: 0,
    },
  },
});
