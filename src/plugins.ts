import {fixupPluginRules} from '@eslint/compat';
import type {EslintPlugin} from './eslint';
import {interopDefault} from './utils';

export const pluginsLoaders = {
  '@eslint-community/eslint-comments': () =>
    interopDefault(import('@eslint-community/eslint-plugin-eslint-comments')),
  '@eslint-react': () =>
    // @ts-expect-error types mismatch
    interopDefault(import('@eslint-react/eslint-plugin')).then(
      (m) => m.configs.all.plugins['@eslint-react'],
    ),
  '@eslint-react/debug': () =>
    // @ts-expect-error types mismatch
    interopDefault(import('@eslint-react/eslint-plugin')).then(
      (m) => m.configs.all.plugins['@eslint-react/debug'],
    ),
  '@eslint-react/dom': () =>
    // @ts-expect-error types mismatch
    interopDefault(import('@eslint-react/eslint-plugin')).then(
      (m) => m.configs.all.plugins['@eslint-react/dom'],
    ),
  '@eslint-react/hooks-extra': () =>
    // @ts-expect-error types mismatch
    interopDefault(import('@eslint-react/eslint-plugin')).then(
      (m) => m.configs.all.plugins['@eslint-react/hooks-extra'],
    ),
  '@eslint-react/naming-convention': () =>
    // @ts-expect-error types mismatch
    interopDefault(import('@eslint-react/eslint-plugin')).then(
      (m) => m.configs.all.plugins['@eslint-react/naming-convention'],
    ),
  '@eslint-react/web-api': () =>
    // @ts-expect-error types mismatch
    interopDefault(import('@eslint-react/eslint-plugin')).then(
      (m) => m.configs.all.plugins['@eslint-react/web-api'],
    ),
  '@next/next': () => interopDefault(import('@next/eslint-plugin-next')),
  '@stylistic': () => interopDefault(import('@stylistic/eslint-plugin')),
  '@typescript-eslint': () =>
    // @ts-expect-error types mismatch
    interopDefault(import('typescript-eslint').then((m) => m.plugin)),
  astro: () => interopDefault(import('eslint-plugin-astro')),
  'case-police': () =>
    // @ts-expect-error types mismatch
    interopDefault(import('eslint-plugin-case-police')),
  css: () => interopDefault(import('@eslint/css')),
  'css-in-js': () =>
    // @ts-expect-error types mismatch
    interopDefault(import('eslint-plugin-css')),
  'de-morgan': () => interopDefault(import('eslint-plugin-de-morgan')),
  es: () => interopDefault(import('eslint-plugin-es-x')),
  import: () =>
    // @ts-expect-error types mismatch
    interopDefault(import('eslint-plugin-import-x')),
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
  'no-type-assertion': () => interopDefault(import('eslint-plugin-no-type-assertion')),
  node: () => interopDefault(import('eslint-plugin-n')),
  'package-json': () =>
    // @ts-expect-error types mismatch
    interopDefault(import('eslint-plugin-package-json')),
  perfectionist: () => interopDefault(import('eslint-plugin-perfectionist')),
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
