import {configDefaults, defineConfig} from 'vitest/config';

const exclude = [...configDefaults.exclude, 'test/**/fixtures/**', '.claude/**'];

export default defineConfig({
  test: {
    exclude,
    globals: true,
    testTimeout: 60_000, // Generating ESLint config might not be very fast
    setupFiles: ['./test/setup.ts'],
    // Vitest passes `--conditions development` to workers, causing `@glimmer/syntax`,
    // which is a dependency of `ember-eslint-parser`, to resolve to its dev build,
    // which in turn tries to load `@glimmer/env` not listed in its dependencies.
    // So we need to mock it.
    // Node 22's require(esm) then triggers the full ESM import chain before Vite's pipeline
    // can intercept it, so a Node loader hook is the only way to provide the mock.
    execArgv: [
      '--import',
      import.meta.resolve('./test/__mocks__/loader/index.js', import.meta.url),
    ],
    snapshotFormat: {
      min: true,
      // `indent` is implicitly set to 2 by default, but `min` cannot be used together with non-falsy `indent` value
      indent: 0,
    },
    coverage: {
      include: ['src/**/*.ts'],
      reporter: ['html', 'json'],
      // Avoid "Error: ENOENT: no such file or directory, open 'coverage\.tmp\coverage-8.json'" in watch mode
      clean: false,
    },
    ui: true,
    open: false,
    typecheck: {
      enabled: true,
      tsconfig: './test/tsconfig.vitest.json',
      ignoreSourceErrors: false,
      exclude, // typecheck exclude are separate from the main exclude
    },
  },
});
