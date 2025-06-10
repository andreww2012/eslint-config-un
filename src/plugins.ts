// eslint-disable-next-line node/no-unsupported-features/node-builtins
import {styleText} from 'node:util';
import {fixupPluginRules} from '@eslint/compat';
import stylistic from '@stylistic/eslint-plugin';
import type Eslint from 'eslint';
import ourPackageJson from '../package.json' with {type: 'json'};
import type {EslintPlugin} from './eslint';
import type {Promisable} from './types';
import {type MaybeArray, arraify, interopDefault, objectKeysUnsafe, omit} from './utils';

const OPTIONAL_PLUGINS_PACKAGE_NAMES = omit(ourPackageJson.peerDependencies, ['eslint']);

const MODULE_NOT_FOUND_ERROR_CODES = ['ERR_MODULE_NOT_FOUND', 'MODULE_NOT_FOUND'];

export function loadPlugin<T>(
  packageName: string,
  module: Promisable<T | {default: T}>,
): Promise<T>;
export function loadPlugin<T>(
  packageName: string,
  module: Promisable<T | {default: T}>,
  ignoreErrors: MaybeArray<string>,
): Promise<T | null>;
export async function loadPlugin<T>(
  packageName: string,
  module: Promisable<T | {default: T}>,
  ignoreErrors?: MaybeArray<string>,
): Promise<T | null> {
  const canIgnoreModuleNotFoundError = packageName in OPTIONAL_PLUGINS_PACKAGE_NAMES;
  try {
    return await interopDefault(module);
  } catch (error: unknown) {
    const ignoredErrors: string[] = [
      ...arraify(ignoreErrors),
      ...(canIgnoreModuleNotFoundError ? MODULE_NOT_FOUND_ERROR_CODES : []),
    ];
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      typeof error.code === 'string' &&
      ignoredErrors.includes(error.code)
    ) {
      if (canIgnoreModuleNotFoundError) {
        throw new Error(
          `[eslint-config-un] A plugin that listed in optional peer dependencies were used. Please install ${styleText('yellow', packageName)} package by yourself in order for this error to disappear. Its version must satisfy the following semver range: ${styleText('green', OPTIONAL_PLUGINS_PACKAGE_NAMES[packageName as keyof typeof OPTIONAL_PLUGINS_PACKAGE_NAMES])}`,
        );
      }
      return null;
    }
    throw error;
  }
}

export const pluginsLoaders = {
  '@eslint-community/eslint-comments': () =>
    loadPlugin(
      '@eslint-community/eslint-plugin-eslint-comments',
      import('@eslint-community/eslint-plugin-eslint-comments'),
    ),
  '@eslint-react': () =>
    loadPlugin('@eslint-react/eslint-plugin', import('@eslint-react/eslint-plugin')).then(
      (m) => m.configs.all.plugins['@eslint-react'] as unknown as EslintPlugin,
    ),
  '@eslint-react/debug': () =>
    loadPlugin('@eslint-react/eslint-plugin', import('@eslint-react/eslint-plugin')).then(
      (m) => m.configs.all.plugins['@eslint-react/debug'] as unknown as EslintPlugin,
    ),
  '@eslint-react/dom': () =>
    loadPlugin('@eslint-react/eslint-plugin', import('@eslint-react/eslint-plugin')).then(
      (m) => m.configs.all.plugins['@eslint-react/dom'] as unknown as EslintPlugin,
    ),
  '@eslint-react/hooks-extra': () =>
    loadPlugin('@eslint-react/eslint-plugin', import('@eslint-react/eslint-plugin')).then(
      (m) => m.configs.all.plugins['@eslint-react/hooks-extra'] as unknown as EslintPlugin,
    ),
  '@eslint-react/naming-convention': () =>
    loadPlugin('@eslint-react/eslint-plugin', import('@eslint-react/eslint-plugin')).then(
      (m) => m.configs.all.plugins['@eslint-react/naming-convention'] as unknown as EslintPlugin,
    ),
  '@eslint-react/web-api': () =>
    loadPlugin('@eslint-react/eslint-plugin', import('@eslint-react/eslint-plugin')).then(
      (m) => m.configs.all.plugins['@eslint-react/web-api'] as unknown as EslintPlugin,
    ),
  '@html-eslint': () =>
    // @ts-expect-error types mismatch
    loadPlugin('@html-eslint/eslint-plugin', import('@html-eslint/eslint-plugin')),
  '@next/next': () => loadPlugin('@next/eslint-plugin-next', import('@next/eslint-plugin-next')),
  // We can't `import()` `@stylistic/eslint-plugin` because it's `require()`d by eslint-plugin-vue: https://github.com/vuejs/eslint-plugin-vue/blob/1b634549a9e91231e5ea79313763c69f93e678c1/lib/utils/index.js#L113 and `import()`ing after `require()`ing causes `ERR_INTERNAL_ASSERTION` error, see https://github.com/nodejs/node/issues/54577
  '@stylistic': () => Promise.resolve(stylistic),
  '@tanstack/query': () =>
    // @ts-expect-error types mismatch
    loadPlugin('@tanstack/eslint-plugin-query', import('@tanstack/eslint-plugin-query')),
  astro: () => loadPlugin('eslint-plugin-astro', import('eslint-plugin-astro')),
  ava: () => loadPlugin('eslint-plugin-ava', import('eslint-plugin-ava')),
  'case-police': () =>
    // @ts-expect-error types mismatch
    loadPlugin<EslintPlugin>('eslint-plugin-case-police', import('eslint-plugin-case-police')),
  css: () => loadPlugin('@eslint/css', import('@eslint/css')),
  'css-in-js': () =>
    // @ts-expect-error types mismatch
    loadPlugin('eslint-plugin-css', import('eslint-plugin-css')),
  'de-morgan': () =>
    loadPlugin<EslintPlugin>('eslint-plugin-de-morgan', import('eslint-plugin-de-morgan')),
  depend: () => loadPlugin('eslint-plugin-depend', import('eslint-plugin-depend')),
  'erasable-syntax-only': () =>
    // @ts-expect-error types mismatch
    loadPlugin('eslint-plugin-erasable-syntax-only', import('eslint-plugin-erasable-syntax-only')),
  es: () => loadPlugin('eslint-plugin-es-x', import('eslint-plugin-es-x')),
  graphql: () =>
    loadPlugin(
      '@graphql-eslint/eslint-plugin',
      import('@graphql-eslint/eslint-plugin') as Promise<{
        default: EslintPlugin & {
          processor: Eslint.Linter.Processor;
          parser: Eslint.Linter.Parser;
        };
      }>,
    ),
  html: () => loadPlugin('eslint-plugin-html', import('eslint-plugin-html')),
  import: () =>
    // @ts-expect-error types mismatch
    loadPlugin<EslintPlugin>('eslint-plugin-import-x', import('eslint-plugin-import-x')),
  jest: () => loadPlugin('eslint-plugin-jest', import('eslint-plugin-jest')),
  'jest-extended': () =>
    loadPlugin('eslint-plugin-jest-extended', import('eslint-plugin-jest-extended')),
  jsdoc: () => loadPlugin('eslint-plugin-jsdoc', import('eslint-plugin-jsdoc')),
  'json-schema-validator': () =>
    // @ts-expect-error types mismatch
    loadPlugin(
      'eslint-plugin-json-schema-validator',
      import('eslint-plugin-json-schema-validator'),
    ),
  jsonc: () =>
    // @ts-expect-error types mismatch
    loadPlugin('eslint-plugin-jsonc', import('eslint-plugin-jsonc')),
  'jsx-a11y': () => loadPlugin('eslint-plugin-jsx-a11y', import('eslint-plugin-jsx-a11y')),
  markdown: () => loadPlugin('@eslint/markdown', import('@eslint/markdown')),
  math: () =>
    // @ts-expect-error types mismatch
    loadPlugin<EslintPlugin>('eslint-plugin-math', import('eslint-plugin-math')),
  'no-type-assertion': () =>
    loadPlugin('eslint-plugin-no-type-assertion', import('eslint-plugin-no-type-assertion')),
  node: () => loadPlugin('eslint-plugin-n', import('eslint-plugin-n')),
  'node-dependencies': () =>
    // @ts-expect-error types mismatch
    loadPlugin('eslint-plugin-node-dependencies', import('eslint-plugin-node-dependencies')),
  'package-json': () =>
    // @ts-expect-error types mismatch
    loadPlugin('eslint-plugin-package-json', import('eslint-plugin-package-json')),
  perfectionist: () =>
    loadPlugin<EslintPlugin>('eslint-plugin-perfectionist', import('eslint-plugin-perfectionist')),
  pinia: () =>
    // @ts-expect-error types mismatch
    loadPlugin('eslint-plugin-pinia', import('eslint-plugin-pinia')),
  pnpm: () => loadPlugin('eslint-plugin-pnpm', import('eslint-plugin-pnpm')),
  'prefer-arrow-functions': () =>
    // @ts-expect-error types mismatch
    loadPlugin(
      'eslint-plugin-prefer-arrow-functions',
      import('eslint-plugin-prefer-arrow-functions'),
    ),
  prettier: () => loadPlugin('eslint-plugin-prettier', import('eslint-plugin-prettier')),
  promise: () => loadPlugin('eslint-plugin-promise', import('eslint-plugin-promise')),
  qwik: () =>
    loadPlugin('eslint-plugin-qwik', import('eslint-plugin-qwik')).then((m) => fixupPluginRules(m)),
  react: () => loadPlugin('eslint-plugin-react', import('eslint-plugin-react')),
  'react-compiler': () =>
    loadPlugin('eslint-plugin-react-compiler', import('eslint-plugin-react-compiler')),
  'react-hooks': () => loadPlugin('eslint-plugin-react-hooks', import('eslint-plugin-react-hooks')),
  'react-refresh': () =>
    loadPlugin('eslint-plugin-react-refresh', import('eslint-plugin-react-refresh')),
  regexp: () => loadPlugin('eslint-plugin-regexp', import('eslint-plugin-regexp')),
  security: () => loadPlugin('eslint-plugin-security', import('eslint-plugin-security')),
  solid: () =>
    // @ts-expect-error types mismatch
    loadPlugin<EslintPlugin>('eslint-plugin-solid', import('eslint-plugin-solid')),
  sonarjs: () => loadPlugin('eslint-plugin-sonarjs', import('eslint-plugin-sonarjs')),
  storybook: () =>
    // @ts-expect-error types mismatch
    loadPlugin('eslint-plugin-storybook', import('eslint-plugin-storybook')),
  svelte: () =>
    loadPlugin(
      'eslint-plugin-svelte',
      import('eslint-plugin-svelte'),
      // Hard-depends on `svelte` package, uses it at least in `lib/utils/svelte-context.js`
      MODULE_NOT_FOUND_ERROR_CODES,
    ),
  tailwindcss: () =>
    loadPlugin(
      'eslint-plugin-tailwindcss',
      import('eslint-plugin-tailwindcss'),
      // Tries to import `tailwindcss/resolveConfig` which doesn't exist anymore in v4
      ['ERR_PACKAGE_PATH_NOT_EXPORTED', ...MODULE_NOT_FOUND_ERROR_CODES],
    ),
  'testing-library': () =>
    loadPlugin('eslint-plugin-testing-library', import('eslint-plugin-testing-library')),
  toml: () =>
    // @ts-expect-error types mismatch
    loadPlugin('eslint-plugin-toml', import('eslint-plugin-toml')),
  ts: () =>
    // @ts-expect-error types mismatch
    loadPlugin(
      'typescript-eslint',
      import('typescript-eslint').then((m) => m.plugin),
    ),
  unicorn: () => loadPlugin('eslint-plugin-unicorn', import('eslint-plugin-unicorn')),
  'unused-imports': () =>
    loadPlugin('eslint-plugin-unused-imports', import('eslint-plugin-unused-imports')),
  vitest: () => loadPlugin('@vitest/eslint-plugin', import('@vitest/eslint-plugin')),
  vue: () => loadPlugin('eslint-plugin-vue', import('eslint-plugin-vue')),
  'vuejs-accessibility': () =>
    loadPlugin('eslint-plugin-vuejs-accessibility', import('eslint-plugin-vuejs-accessibility')),
  yml: () =>
    // @ts-expect-error types mismatch
    loadPlugin('eslint-plugin-yml', import('eslint-plugin-yml')),
} satisfies Record<string, () => Promise<EslintPlugin | null>>;

export type LoadablePluginPrefix = keyof typeof pluginsLoaders;
export const LOADABLE_PLUGIN_PREFIXES_LIST = objectKeysUnsafe(pluginsLoaders);

export type PluginPrefix =
  | LoadablePluginPrefix
  | ''
  | '@angular-eslint'
  | '@angular-eslint/template';

export const PLUGIN_PREFIXES_LIST: readonly PluginPrefix[] = [
  ...objectKeysUnsafe(pluginsLoaders),
  '@angular-eslint',
  '@angular-eslint/template',
];
