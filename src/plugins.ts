import {fixupPluginRules} from '@eslint/compat';
import stylistic from '@stylistic/eslint-plugin';
import type Eslint from 'eslint';
import ourPackageJson from '../package.json' with {type: 'json'};
import type {UnConfigContext} from './configs';
import type {EslintPlugin} from './eslint';
import type {Promisable} from './types';
import {type MaybeArray, arraify, interopDefault, objectKeysUnsafe, omit} from './utils';

export const OPTIONAL_PLUGINS_PACKAGE_NAMES = omit(ourPackageJson.peerDependencies, ['eslint']);

const MODULE_NOT_FOUND_ERROR_CODES = ['ERR_MODULE_NOT_FOUND', 'MODULE_NOT_FOUND'];

interface LoadPluginOptions {
  throwIfNotFound?: boolean;
}

export function genPluginLoader<T, N extends string>(
  packageName: N,
  module: () => Promisable<T | {default: T}>,
  ignoreErrors?: undefined,
): (
  context: UnConfigContext,
  options?: LoadPluginOptions,
) => Promise<{
  packageName: N;
  contents: T | (N extends keyof typeof OPTIONAL_PLUGINS_PACKAGE_NAMES ? null : never);
}>;
export function genPluginLoader<T, N extends string>(
  packageName: N,
  module: () => Promisable<T | {default: T}>,
  ignoreErrors: MaybeArray<string>,
): (
  context: UnConfigContext,
  options?: LoadPluginOptions,
) => Promise<{packageName: N; contents: T | null}>;
export function genPluginLoader<T, N extends string>(
  packageName: N,
  module: () => Promisable<T | {default: T}>,
  ignoreErrors?: MaybeArray<string>,
): (
  context: UnConfigContext,
  options?: LoadPluginOptions,
) => Promise<{packageName: N; contents: T | null}> {
  return async (context, options) => {
    const isPluginOptionalPeerDependency = packageName in OPTIONAL_PLUGINS_PACKAGE_NAMES;
    try {
      return {contents: await interopDefault(module()), packageName};
    } catch (error: unknown) {
      const ignoredErrors: string[] = [
        ...arraify(ignoreErrors),
        ...(isPluginOptionalPeerDependency ? MODULE_NOT_FOUND_ERROR_CODES : []),
      ];
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        typeof error.code === 'string' &&
        ignoredErrors.includes(error.code) &&
        !options?.throwIfNotFound
      ) {
        return {contents: null, packageName};
      }
      throw error;
    }
  };
}

export const pluginsLoaders = {
  '@cspell': genPluginLoader('@cspell/eslint-plugin', () => import('@cspell/eslint-plugin')),
  '@eslint-community/eslint-comments': genPluginLoader(
    '@eslint-community/eslint-plugin-eslint-comments',
    () => import('@eslint-community/eslint-plugin-eslint-comments'),
  ),
  '@eslint-react': genPluginLoader('@eslint-react/eslint-plugin', () =>
    interopDefault(import('@eslint-react/eslint-plugin')).then(
      (m) => m.configs.all.plugins['@eslint-react'] as unknown as EslintPlugin,
    ),
  ),
  '@eslint-react/debug': genPluginLoader('@eslint-react/eslint-plugin', () =>
    interopDefault(import('@eslint-react/eslint-plugin')).then(
      (m) => m.configs.all.plugins['@eslint-react/debug'] as unknown as EslintPlugin,
    ),
  ),
  '@eslint-react/dom': genPluginLoader('@eslint-react/eslint-plugin', () =>
    interopDefault(import('@eslint-react/eslint-plugin')).then(
      (m) => m.configs.all.plugins['@eslint-react/dom'] as unknown as EslintPlugin,
    ),
  ),
  '@eslint-react/hooks-extra': genPluginLoader('@eslint-react/eslint-plugin', () =>
    interopDefault(import('@eslint-react/eslint-plugin')).then(
      (m) => m.configs.all.plugins['@eslint-react/hooks-extra'] as unknown as EslintPlugin,
    ),
  ),
  '@eslint-react/naming-convention': genPluginLoader('@eslint-react/eslint-plugin', () =>
    interopDefault(import('@eslint-react/eslint-plugin')).then(
      (m) => m.configs.all.plugins['@eslint-react/naming-convention'] as unknown as EslintPlugin,
    ),
  ),
  '@eslint-react/web-api': genPluginLoader('@eslint-react/eslint-plugin', () =>
    interopDefault(import('@eslint-react/eslint-plugin')).then(
      (m) => m.configs.all.plugins['@eslint-react/web-api'] as unknown as EslintPlugin,
    ),
  ),
  '@html-eslint': genPluginLoader(
    '@html-eslint/eslint-plugin',
    () => import('@html-eslint/eslint-plugin'),
  ),
  '@next/next': genPluginLoader(
    '@next/eslint-plugin-next',
    () => import('@next/eslint-plugin-next'),
  ),
  // We can't `import()` `@stylistic/eslint-plugin` because it's `require()`d by eslint-plugin-vue: https://github.com/vuejs/eslint-plugin-vue/blob/1b634549a9e91231e5ea79313763c69f93e678c1/lib/utils/index.js#L113 and `import()`ing after `require()`ing causes `ERR_INTERNAL_ASSERTION` error, see https://github.com/nodejs/node/issues/54577
  '@stylistic': genPluginLoader('@stylistic', () => Promise.resolve(stylistic)),
  // @ts-expect-error types mismatch
  '@tanstack/query': genPluginLoader(
    '@tanstack/eslint-plugin-query',
    () => import('@tanstack/eslint-plugin-query'),
  ),
  astro: genPluginLoader('eslint-plugin-astro', () => import('eslint-plugin-astro')),
  ava: genPluginLoader('eslint-plugin-ava', () => import('eslint-plugin-ava')),
  'better-tailwindcss': genPluginLoader(
    'eslint-plugin-better-tailwindcss',
    () => import('eslint-plugin-better-tailwindcss'),
  ),
  'case-police': genPluginLoader(
    'eslint-plugin-case-police',
    () => import('eslint-plugin-case-police') as Promise<EslintPlugin>,
  ),
  css: genPluginLoader('@eslint/css', () => import('@eslint/css')),
  // @ts-expect-error types mismatch
  'css-in-js': genPluginLoader('eslint-plugin-css', () => import('eslint-plugin-css')),
  cypress: genPluginLoader('eslint-plugin-cypress', () => import('eslint-plugin-cypress')),
  'de-morgan': genPluginLoader(
    'eslint-plugin-de-morgan',
    () => import('eslint-plugin-de-morgan') as Promise<EslintPlugin>,
  ),
  depend: genPluginLoader('eslint-plugin-depend', () => import('eslint-plugin-depend')),
  ember: genPluginLoader('eslint-plugin-ember', () => import('eslint-plugin-ember')),
  // @ts-expect-error types mismatch
  'erasable-syntax-only': genPluginLoader(
    'eslint-plugin-erasable-syntax-only',
    () => import('eslint-plugin-erasable-syntax-only'),
  ),
  es: genPluginLoader('eslint-plugin-es-x', () => import('eslint-plugin-es-x')),
  'eslint-plugin': genPluginLoader(
    'eslint-plugin-eslint-plugin',
    () => import('eslint-plugin-eslint-plugin'),
  ),
  'file-progress': genPluginLoader(
    'eslint-plugin-file-progress',
    () => import('eslint-plugin-file-progress'),
  ),
  graphql: genPluginLoader(
    '@graphql-eslint/eslint-plugin',
    () =>
      import('@graphql-eslint/eslint-plugin') as Promise<{
        default: EslintPlugin & {
          processor: Eslint.Linter.Processor;
          parser: Eslint.Linter.Parser;
        };
      }>,
  ),
  html: genPluginLoader('eslint-plugin-html', () => import('eslint-plugin-html')),
  import: genPluginLoader(
    'eslint-plugin-import-x',
    () => import('eslint-plugin-import-x') as unknown as Promise<EslintPlugin>,
  ),
  jest: genPluginLoader('eslint-plugin-jest', () => import('eslint-plugin-jest')),
  'jest-extended': genPluginLoader(
    'eslint-plugin-jest-extended',
    () => import('eslint-plugin-jest-extended'),
  ),
  jsdoc: genPluginLoader('eslint-plugin-jsdoc', () => import('eslint-plugin-jsdoc')),
  // @ts-expect-error types mismatch
  'json-schema-validator': genPluginLoader(
    'eslint-plugin-json-schema-validator',
    () => import('eslint-plugin-json-schema-validator'),
  ),
  // @ts-expect-error types mismatch
  jsonc: genPluginLoader('eslint-plugin-jsonc', () => import('eslint-plugin-jsonc')),
  'jsx-a11y': genPluginLoader('eslint-plugin-jsx-a11y', () => import('eslint-plugin-jsx-a11y')),
  markdown: genPluginLoader('@eslint/markdown', () => import('@eslint/markdown')),
  // @ts-expect-error types mismatch
  math: genPluginLoader<EslintPlugin>('eslint-plugin-math', () => import('eslint-plugin-math')),
  mdx: genPluginLoader('eslint-plugin-mdx', () => import('eslint-plugin-mdx')),
  'no-type-assertion': genPluginLoader(
    'eslint-plugin-no-type-assertion',
    () => import('eslint-plugin-no-type-assertion'),
  ),
  'no-unsanitized': genPluginLoader(
    'eslint-plugin-no-unsanitized',
    () => import('eslint-plugin-no-unsanitized'),
  ),
  node: genPluginLoader('eslint-plugin-n', () => import('eslint-plugin-n')),
  // @ts-expect-error types mismatch
  'node-dependencies': genPluginLoader(
    'eslint-plugin-node-dependencies',
    () => import('eslint-plugin-node-dependencies'),
  ),
  // @ts-expect-error types mismatch
  'package-json': genPluginLoader(
    'eslint-plugin-package-json',
    () => import('eslint-plugin-package-json'),
  ),
  perfectionist: genPluginLoader(
    'eslint-plugin-perfectionist',
    () => import('eslint-plugin-perfectionist') as Promise<EslintPlugin>,
  ),
  // @ts-expect-error types mismatch
  pinia: genPluginLoader('eslint-plugin-pinia', () => import('eslint-plugin-pinia')),
  playwright: genPluginLoader('eslint-plugin-playwright', () => import('eslint-plugin-playwright')),
  pnpm: genPluginLoader('eslint-plugin-pnpm', () => import('eslint-plugin-pnpm')),
  // @ts-expect-error types mismatch
  'prefer-arrow-functions': genPluginLoader(
    'eslint-plugin-prefer-arrow-functions',
    () => import('eslint-plugin-prefer-arrow-functions'),
  ),
  prettier: genPluginLoader('eslint-plugin-prettier', () => import('eslint-plugin-prettier')),
  promise: genPluginLoader('eslint-plugin-promise', () => import('eslint-plugin-promise')),
  qwik: genPluginLoader('eslint-plugin-qwik', () =>
    interopDefault(import('eslint-plugin-qwik')).then((m) => fixupPluginRules(m)),
  ),
  react: genPluginLoader('eslint-plugin-react', () => import('eslint-plugin-react')),
  'react-compiler': genPluginLoader(
    'eslint-plugin-react-compiler',
    () => import('eslint-plugin-react-compiler'),
  ),
  'react-hooks': genPluginLoader(
    'eslint-plugin-react-hooks',
    () => import('eslint-plugin-react-hooks'),
  ),
  'react-refresh': genPluginLoader(
    'eslint-plugin-react-refresh',
    () => import('eslint-plugin-react-refresh'),
  ),
  regexp: genPluginLoader('eslint-plugin-regexp', () => import('eslint-plugin-regexp')),
  security: genPluginLoader('eslint-plugin-security', () => import('eslint-plugin-security')),
  solid: genPluginLoader(
    'eslint-plugin-solid',
    () => import('eslint-plugin-solid') as Promise<EslintPlugin>,
  ),
  sonarjs: genPluginLoader('eslint-plugin-sonarjs', () => import('eslint-plugin-sonarjs')),
  storybook: genPluginLoader(
    'eslint-plugin-storybook',
    () => import('eslint-plugin-storybook') as Promise<EslintPlugin>,
  ),
  svelte: genPluginLoader(
    'eslint-plugin-svelte',
    () => import('eslint-plugin-svelte'),
    // Hard-depends on `svelte` package, uses it at least in `lib/utils/svelte-context.js`
    MODULE_NOT_FOUND_ERROR_CODES,
  ),
  tailwindcss: genPluginLoader(
    'eslint-plugin-tailwindcss',
    () => import('eslint-plugin-tailwindcss'),
    // Tries to import `tailwindcss/resolveConfig` which doesn't exist anymore in v4
    ['ERR_PACKAGE_PATH_NOT_EXPORTED', ...MODULE_NOT_FOUND_ERROR_CODES],
  ),
  'testing-library': genPluginLoader(
    'eslint-plugin-testing-library',
    () => import('eslint-plugin-testing-library'),
  ),
  // @ts-expect-error types mismatch
  toml: genPluginLoader('eslint-plugin-toml', () => import('eslint-plugin-toml')),
  ts: genPluginLoader(
    'typescript-eslint',
    () => import('typescript-eslint').then((m) => m.plugin) as Promise<EslintPlugin>,
  ),
  turbo: genPluginLoader('eslint-plugin-turbo', () => import('eslint-plugin-turbo')),
  unicorn: genPluginLoader('eslint-plugin-unicorn', () => import('eslint-plugin-unicorn')),
  'unused-imports': genPluginLoader(
    'eslint-plugin-unused-imports',
    () => import('eslint-plugin-unused-imports'),
  ),
  vitest: genPluginLoader('@vitest/eslint-plugin', () => import('@vitest/eslint-plugin')),
  vue: genPluginLoader('eslint-plugin-vue', () => import('eslint-plugin-vue')),
  'vuejs-accessibility': genPluginLoader(
    'eslint-plugin-vuejs-accessibility',
    () => import('eslint-plugin-vuejs-accessibility'),
  ),
  // @ts-expect-error types mismatch
  yml: genPluginLoader('eslint-plugin-yml', () => import('eslint-plugin-yml')),
} satisfies Record<
  string,
  (
    context: UnConfigContext,
    options?: LoadPluginOptions,
  ) => Promise<{packageName: string; contents: EslintPlugin | null}>
>;

type LoadablePluginPrefix = keyof typeof pluginsLoaders;
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
