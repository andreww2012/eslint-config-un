import path from 'node:path';
import {type UserConfig, defineConfig} from 'tsdown';

// Their own dependencies get inlined as well, unless we also declare them in `dependencies`
export const ALWAYS_BUNDLED_DEPENDENCIES: string[] = [
  'import-meta-resolve', // Patched
  'remeda', // Inlined to avoid always considered installed
  'eslint-plugin-no-type-assertion', // Inlined to avoid installation warnings about incompatibility with ESLint 9/10
  '@eslint/compat', // Patched
  'eslint-plugin-prettier', // Patched
  'eslint-plugin-html', // Patched
  'eslint-plugin-arrow-return-style-x', // Its `@typescript-eslint/utils` dependency is overridden to work with ESLint 10 by the one we declare, so it's not loaded twice with typescript-eslint's
  '@eslint-community/eslint-plugin-eslint-comments', // Inlined code gets a `require` with `cache`, which Yarn PnP doesn't provide: https://github.com/eslint-community/eslint-plugin-eslint-comments/issues/322
];

// Inlined plugins spawn these by file path, so they're never part of the main module graph
const INLINED_PLUGIN_WORKERS = [
  'eslint-plugin-prettier/worker.mjs',
  'eslint-plugin-arrow-return-style-x/dist/workers/prettier-worker.mjs',
];

const MJS_EXTENSION_REGEXP = /\.mjs$/;

export default defineConfig([
  {
    entry: ['src/index.ts', 'src/snippets.ts', 'src/globs.ts'],
    format: 'esm',
    unbundle: true,
    // Inlined `eslint-plugin-prettier` locates its worker through `__dirname`
    shims: true,
    deps: {
      neverBundle: ['nuxt/kit'],
      alwaysBundle: [
        new RegExp(String.raw`^(?:${ALWAYS_BUNDLED_DEPENDENCIES.join('|')})(?:\/.+)?$`),
      ],
      // Types of packages we don't declare get inlined, except CommonJS ones, which is why `browserslist` and `@sveltejs/kit` (through `postcss`) are optional peer dependencies
      dts: {
        // `is-immutable-type` imports `typescript` types, which
        // `rolldown-plugin-dts` cannot bundle as `typescript` ships CJS .d.ts.
        // But types we actually consume don't reference `typescript`, so keeping
        // it external drops the warning without leaking the import into our output
        neverBundle: ['typescript'],
      },
    },
    checks: {
      pluginTimings: false,
    },
  },
  // Built one by one, so each worker is a single file with its dependencies inlined
  ...INLINED_PLUGIN_WORKERS.map((workerPath): UserConfig => ({
    entry: {
      [path.join('node_modules', workerPath.replace(MJS_EXTENSION_REGEXP, ''))]: path.join(
        'node_modules',
        workerPath,
      ),
    },
    format: 'esm',
    dts: false,
    deps: {
      // Formatting uses the user's Prettier
      neverBundle: ['prettier'],
    },
    checks: {
      pluginTimings: false,
    },
  })),
]);
