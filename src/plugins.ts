import {fixupPluginRules} from '@eslint/compat';
import stylistic from '@stylistic/eslint-plugin';
import type {EslintPlugin} from './eslint';
import {interopDefault, objectKeysUnsafe} from './utils';

export const pluginsLoaders = {
  '@eslint-community/eslint-comments': () =>
    interopDefault(import('@eslint-community/eslint-plugin-eslint-comments')),
  '@eslint-react': () =>
    interopDefault(import('@eslint-react/eslint-plugin')).then(
      (m) => m.configs.all.plugins['@eslint-react'] as unknown as EslintPlugin,
    ),
  '@eslint-react/debug': () =>
    interopDefault(import('@eslint-react/eslint-plugin')).then(
      (m) => m.configs.all.plugins['@eslint-react/debug'] as unknown as EslintPlugin,
    ),
  '@eslint-react/dom': () =>
    interopDefault(import('@eslint-react/eslint-plugin')).then(
      (m) => m.configs.all.plugins['@eslint-react/dom'] as unknown as EslintPlugin,
    ),
  '@eslint-react/hooks-extra': () =>
    interopDefault(import('@eslint-react/eslint-plugin')).then(
      (m) => m.configs.all.plugins['@eslint-react/hooks-extra'] as unknown as EslintPlugin,
    ),
  '@eslint-react/naming-convention': () =>
    interopDefault(import('@eslint-react/eslint-plugin')).then(
      (m) => m.configs.all.plugins['@eslint-react/naming-convention'] as unknown as EslintPlugin,
    ),
  '@eslint-react/web-api': () =>
    interopDefault(import('@eslint-react/eslint-plugin')).then(
      (m) => m.configs.all.plugins['@eslint-react/web-api'] as unknown as EslintPlugin,
    ),
  '@html-eslint': () =>
    // @ts-expect-error types mismatch
    interopDefault(import('@html-eslint/eslint-plugin')),
  '@next/next': () => interopDefault(import('@next/eslint-plugin-next')),
  // We can't `import()` `@stylistic/eslint-plugin` because it's `require()`d by eslint-plugin-vue: https://github.com/vuejs/eslint-plugin-vue/blob/1b634549a9e91231e5ea79313763c69f93e678c1/lib/utils/index.js#L113 and `import()`ing after `require()`ing causes `ERR_INTERNAL_ASSERTION` error, see https://github.com/nodejs/node/issues/54577
  '@stylistic': () => Promise.resolve(stylistic),
  astro: () => interopDefault(import('eslint-plugin-astro')),
  'case-police': () =>
    // @ts-expect-error types mismatch
    interopDefault<EslintPlugin>(import('eslint-plugin-case-police')),
  css: () => interopDefault(import('@eslint/css')),
  'css-in-js': () =>
    // @ts-expect-error types mismatch
    interopDefault(import('eslint-plugin-css')),
  'de-morgan': () => interopDefault<EslintPlugin>(import('eslint-plugin-de-morgan')),
  depend: () => interopDefault(import('eslint-plugin-depend')),
  es: () => interopDefault(import('eslint-plugin-es-x')),
  html: () => interopDefault(import('eslint-plugin-html')),
  import: () =>
    // @ts-expect-error types mismatch
    interopDefault<EslintPlugin>(import('eslint-plugin-import-x')),
  jest: () => interopDefault(import('eslint-plugin-jest')),
  'jest-extended': () => interopDefault(import('eslint-plugin-jest-extended')),
  jsdoc: () => interopDefault(import('eslint-plugin-jsdoc')),
  'json-schema-validator': () =>
    // @ts-expect-error types mismatch
    interopDefault(import('eslint-plugin-json-schema-validator')),
  jsonc: () =>
    // @ts-expect-error types mismatch
    interopDefault(import('eslint-plugin-jsonc')),
  'jsx-a11y': () =>
    // @ts-expect-error types mismatch
    interopDefault(import('eslint-plugin-jsx-a11y')),
  markdown: () => interopDefault(import('@eslint/markdown')),
  math: () =>
    // @ts-expect-error types mismatch
    interopDefault<EslintPlugin>(import('eslint-plugin-math')),
  'no-type-assertion': () => interopDefault(import('eslint-plugin-no-type-assertion')),
  node: () => interopDefault(import('eslint-plugin-n')),
  'node-dependencies': () =>
    // @ts-expect-error types mismatch
    interopDefault(import('eslint-plugin-node-dependencies')),
  'package-json': () =>
    // @ts-expect-error types mismatch
    interopDefault(import('eslint-plugin-package-json')),
  perfectionist: () => interopDefault<EslintPlugin>(import('eslint-plugin-perfectionist')),
  pinia: () =>
    // @ts-expect-error types mismatch
    interopDefault(import('eslint-plugin-pinia')),
  pnpm: () => interopDefault(import('eslint-plugin-pnpm')),
  'prefer-arrow-functions': () =>
    // @ts-expect-error types mismatch
    interopDefault(import('eslint-plugin-prefer-arrow-functions')),
  promise: () => interopDefault(import('eslint-plugin-promise')),
  qwik: () => interopDefault(import('eslint-plugin-qwik')).then((m) => fixupPluginRules(m)),
  react: () => interopDefault(import('eslint-plugin-react')),
  'react-compiler': () => interopDefault(import('eslint-plugin-react-compiler')),
  'react-hooks': () => interopDefault(import('eslint-plugin-react-hooks')),
  'react-refresh': () => interopDefault(import('eslint-plugin-react-refresh')),
  regexp: () => interopDefault(import('eslint-plugin-regexp')),
  security: () =>
    // @ts-expect-error types mismatch
    interopDefault(import('eslint-plugin-security')),
  solid: () =>
    // @ts-expect-error types mismatch
    interopDefault<EslintPlugin>(import('eslint-plugin-solid')),
  sonarjs: () => interopDefault(import('eslint-plugin-sonarjs')),
  svelte: () =>
    interopDefault(
      import('eslint-plugin-svelte'),
      // Hard-depends on `svelte` package, uses it at least in `lib/utils/svelte-context.js`
      ['ERR_MODULE_NOT_FOUND', 'MODULE_NOT_FOUND'],
    ),
  tailwindcss: () =>
    // @ts-expect-error types mismatch
    interopDefault(
      import('eslint-plugin-tailwindcss'),
      // Tries to import `tailwindcss/resolveConfig` which doesn't exist anymore in v4
      'ERR_PACKAGE_PATH_NOT_EXPORTED',
    ),
  toml: () =>
    // @ts-expect-error types mismatch
    interopDefault(import('eslint-plugin-toml')),
  ts: () =>
    // @ts-expect-error types mismatch
    interopDefault(import('typescript-eslint').then((m) => m.plugin)),
  unicorn: () => interopDefault(import('eslint-plugin-unicorn')),
  'unused-imports': () => interopDefault(import('eslint-plugin-unused-imports')),
  vitest: () => interopDefault(import('@vitest/eslint-plugin')),
  vue: () => interopDefault(import('eslint-plugin-vue')),
  'vuejs-accessibility': () => interopDefault(import('eslint-plugin-vuejs-accessibility')),
  yml: () =>
    // @ts-expect-error types mismatch
    interopDefault(import('eslint-plugin-yml')),
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
