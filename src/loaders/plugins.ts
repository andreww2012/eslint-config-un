import {fixupPluginRules} from '@eslint/compat';
import stylistic from '@stylistic/eslint-plugin';
import type {EslintPlugin} from '../eslint';
import type {ObjectValues} from '../types';
import {interopDefault, objectKeysUnsafe} from '../utils';
import {
  type EslintParser,
  type EslintProcessor,
  MODULE_NOT_FOUND_ERROR_CODES,
  type ModuleLoader,
  genModuleLoader,
} from './shared';

const loadEslintReactPlugin = (pluginName: string) =>
  import('@eslint-react/eslint-plugin').then(
    (m) =>
      (
        m.default.configs.all as {
          plugins: Record<string, EslintPlugin>;
        }
      ).plugins[pluginName] || null,
  );

export const pluginsLoaders = {
  ...genModuleLoader(
    '@angular-eslint',
    '@angular-eslint/eslint-plugin',
    () =>
      interopDefault(
        import('@angular-eslint/eslint-plugin'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
  ),
  ...genModuleLoader(
    '@angular-eslint/template',
    '@angular-eslint/eslint-plugin-template',
    () =>
      interopDefault(
        import('@angular-eslint/eslint-plugin-template'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
  ),
  ...genModuleLoader(
    '@cspell',
    '@cspell/eslint-plugin',
    () => interopDefault(import('@cspell/eslint-plugin')) as Promise<EslintPlugin>,
  ),
  ...genModuleLoader(
    '@eslint-community/eslint-comments',
    '@eslint-community/eslint-plugin-eslint-comments',
    () => interopDefault(import('@eslint-community/eslint-plugin-eslint-comments')),
  ),
  ...genModuleLoader('@eslint-react', '@eslint-react/eslint-plugin', () =>
    loadEslintReactPlugin('@eslint-react'),
  ),
  ...genModuleLoader(
    '@eslint-react/debug',
    '@eslint-react/eslint-plugin',
    () => interopDefault(import('eslint-plugin-react-debug')) as Promise<EslintPlugin>,
  ),
  ...genModuleLoader('@eslint-react/dom', '@eslint-react/eslint-plugin', () =>
    loadEslintReactPlugin('@eslint-react/dom'),
  ),
  ...genModuleLoader('@eslint-react/hooks-extra', '@eslint-react/eslint-plugin', () =>
    loadEslintReactPlugin('@eslint-react/hooks-extra'),
  ),
  ...genModuleLoader('@eslint-react/naming-convention', '@eslint-react/eslint-plugin', () =>
    loadEslintReactPlugin('@eslint-react/naming-convention'),
  ),
  ...genModuleLoader('@eslint-react/web-api', '@eslint-react/eslint-plugin', () =>
    loadEslintReactPlugin('@eslint-react/web-api'),
  ),
  ...genModuleLoader(
    '@html-eslint',
    '@html-eslint/eslint-plugin',
    () => interopDefault(import('@html-eslint/eslint-plugin')) as Promise<EslintPlugin>,
  ),
  ...genModuleLoader(
    '@intlify/vue-i18n',
    '@intlify/eslint-plugin-vue-i18n',
    () =>
      interopDefault(
        import('@intlify/eslint-plugin-vue-i18n'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  ...genModuleLoader('@next/next', '@next/eslint-plugin-next', () =>
    interopDefault(import('@next/eslint-plugin-next')),
  ),
  // We can't `import()` `@stylistic/eslint-plugin` because it's `require()`d by eslint-plugin-vue: https://github.com/vuejs/eslint-plugin-vue/blob/1b634549a9e91231e5ea79313763c69f93e678c1/lib/utils/index.js#L113 and `import()`ing after `require()`ing causes `ERR_INTERNAL_ASSERTION` error, see https://github.com/nodejs/node/issues/54577
  ...genModuleLoader('@stylistic', '@stylistic', () => Promise.resolve(stylistic)),
  ...genModuleLoader(
    '@tanstack/query',
    '@tanstack/eslint-plugin-query',
    () =>
      interopDefault(
        import('@tanstack/eslint-plugin-query'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
  ),
  ...genModuleLoader(
    '@unocss',
    '@unocss/eslint-plugin',
    () =>
      interopDefault(
        import('@unocss/eslint-plugin'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
  ),
  ...genModuleLoader('astro', 'eslint-plugin-astro', () =>
    interopDefault(import('eslint-plugin-astro')),
  ),
  ...genModuleLoader('ava', 'eslint-plugin-ava', () => interopDefault(import('eslint-plugin-ava'))),
  ...genModuleLoader('better-tailwindcss', 'eslint-plugin-better-tailwindcss', () =>
    interopDefault(import('eslint-plugin-better-tailwindcss')),
  ),
  ...genModuleLoader(
    'case-police',
    'eslint-plugin-case-police',
    () => interopDefault(import('eslint-plugin-case-police')) as Promise<EslintPlugin>,
  ),
  ...genModuleLoader('check-file', 'eslint-plugin-check-file', () =>
    interopDefault(import('eslint-plugin-check-file')),
  ),
  ...genModuleLoader('compat', 'eslint-plugin-compat', () =>
    interopDefault(import('eslint-plugin-compat')),
  ),
  ...genModuleLoader('css', '@eslint/css', () => interopDefault(import('@eslint/css'))),
  ...genModuleLoader(
    'css-in-js',
    'eslint-plugin-css',
    () =>
      interopDefault(
        import('eslint-plugin-css'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  ...genModuleLoader('cypress', 'eslint-plugin-cypress', () =>
    interopDefault(import('eslint-plugin-cypress')),
  ),
  ...genModuleLoader(
    'de-morgan',
    'eslint-plugin-de-morgan',
    () => interopDefault(import('eslint-plugin-de-morgan')) as Promise<EslintPlugin>,
  ),
  ...genModuleLoader(
    'depend',
    'eslint-plugin-depend',
    () => interopDefault(import('eslint-plugin-depend')) as Promise<EslintPlugin>,
  ),
  ...genModuleLoader('ember', 'eslint-plugin-ember', () =>
    interopDefault(import('eslint-plugin-ember')),
  ),
  ...genModuleLoader(
    'erasable-syntax-only',
    'eslint-plugin-erasable-syntax-only',
    () =>
      interopDefault(
        import('eslint-plugin-erasable-syntax-only'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
  ),
  ...genModuleLoader('es', 'eslint-plugin-es-x', () =>
    interopDefault(import('eslint-plugin-es-x')),
  ),
  ...genModuleLoader('eslint-plugin', 'eslint-plugin-eslint-plugin', () =>
    interopDefault(import('eslint-plugin-eslint-plugin')),
  ),
  ...genModuleLoader(
    'fast-import',
    'eslint-plugin-fast-import',
    () =>
      interopDefault(
        import('eslint-plugin-fast-import'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
  ),
  ...genModuleLoader('file-progress', 'eslint-plugin-file-progress', () =>
    interopDefault(import('eslint-plugin-file-progress')),
  ),
  ...genModuleLoader('formatjs', 'eslint-plugin-formatjs', () =>
    interopDefault(import('eslint-plugin-formatjs')),
  ),
  ...genModuleLoader(
    'graphql',
    '@graphql-eslint/eslint-plugin',
    () =>
      interopDefault(import('@graphql-eslint/eslint-plugin')) as Promise<
        EslintPlugin & {
          processor: EslintProcessor;
          parser: EslintParser;
        }
      >,
  ),
  ...genModuleLoader('header', 'eslint-plugin-header', () =>
    interopDefault(import('eslint-plugin-header')).then(fixupPluginRules),
  ),
  ...genModuleLoader('headers', 'eslint-plugin-headers', () =>
    interopDefault(import('eslint-plugin-headers')),
  ),
  ...genModuleLoader('html', 'eslint-plugin-html', () =>
    interopDefault(import('eslint-plugin-html')),
  ),
  ...genModuleLoader(
    'import',
    'eslint-plugin-import-x',
    () => interopDefault(import('eslint-plugin-import-x')) as unknown as Promise<EslintPlugin>,
  ),
  ...genModuleLoader(
    'import-zod',
    'eslint-plugin-import-zod',
    () =>
      interopDefault(
        import('eslint-plugin-import-zod'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
  ),
  ...genModuleLoader('jest', 'eslint-plugin-jest', () =>
    interopDefault(import('eslint-plugin-jest')),
  ),
  ...genModuleLoader('jest-extended', 'eslint-plugin-jest-extended', () =>
    interopDefault(import('eslint-plugin-jest-extended')),
  ),
  ...genModuleLoader(
    'jsdoc',
    'eslint-plugin-jsdoc',
    () => interopDefault(import('eslint-plugin-jsdoc')) as Promise<EslintPlugin>,
  ),
  ...genModuleLoader(
    'json-schema-validator',
    'eslint-plugin-json-schema-validator',
    () =>
      interopDefault(
        import('eslint-plugin-json-schema-validator'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  ...genModuleLoader(
    'jsonc',
    'eslint-plugin-jsonc',
    () =>
      interopDefault(
        import('eslint-plugin-jsonc'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
  ),
  ...genModuleLoader('jsx-a11y', 'eslint-plugin-jsx-a11y-x', () =>
    interopDefault(import('eslint-plugin-jsx-a11y-x')),
  ),
  ...genModuleLoader('markdown', '@eslint/markdown', () =>
    interopDefault(import('@eslint/markdown')),
  ),
  ...genModuleLoader(
    'markdown-links',
    'eslint-plugin-markdown-links',
    () => interopDefault(import('eslint-plugin-markdown-links')) as Promise<EslintPlugin>,
  ),
  ...genModuleLoader(
    'markdown-preferences',
    'eslint-plugin-markdown-preferences',
    () =>
      interopDefault(import('eslint-plugin-markdown-preferences')) as Promise<
        EslintPlugin & Pick<typeof import('eslint-plugin-markdown-preferences'), 'resources'>
      >,
  ),
  ...genModuleLoader('mocha', 'eslint-plugin-mocha', () =>
    interopDefault(import('eslint-plugin-mocha')),
  ),
  ...genModuleLoader('no-only-tests', 'eslint-plugin-no-only-tests', () =>
    interopDefault(import('eslint-plugin-no-only-tests')),
  ),
  ...genModuleLoader(
    'lit',
    'eslint-plugin-lit',
    () => interopDefault(import('eslint-plugin-lit')) as Promise<EslintPlugin>,
  ),
  ...genModuleLoader('lit-a11y', 'eslint-plugin-lit-a11y', () =>
    interopDefault(import('eslint-plugin-lit-a11y')),
  ),
  ...genModuleLoader(
    'math',
    'eslint-plugin-math',
    () =>
      interopDefault(
        import('eslint-plugin-math'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  ...genModuleLoader('mdx', 'eslint-plugin-mdx', () => interopDefault(import('eslint-plugin-mdx'))),
  ...genModuleLoader('no-type-assertion', 'eslint-plugin-no-type-assertion', () =>
    interopDefault(import('eslint-plugin-no-type-assertion')),
  ),
  ...genModuleLoader('no-unsanitized', 'eslint-plugin-no-unsanitized', () =>
    interopDefault(import('eslint-plugin-no-unsanitized')),
  ),
  ...genModuleLoader(
    'node',
    'eslint-plugin-n',
    () => interopDefault(import('eslint-plugin-n')) as Promise<EslintPlugin>,
  ),
  ...genModuleLoader(
    'node-dependencies',
    'eslint-plugin-node-dependencies',
    () =>
      interopDefault(
        import('eslint-plugin-node-dependencies'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  ...genModuleLoader(
    'nx',
    '@nx/eslint-plugin',
    () =>
      interopDefault(
        import('@nx/eslint-plugin'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
  ),
  ...genModuleLoader(
    'package-json',
    'eslint-plugin-package-json',
    () => interopDefault(import('eslint-plugin-package-json')) as Promise<EslintPlugin>,
  ),
  ...genModuleLoader(
    'perfectionist',
    'eslint-plugin-perfectionist',
    () => interopDefault(import('eslint-plugin-perfectionist')) as Promise<EslintPlugin>,
  ),
  ...genModuleLoader(
    'pinia',
    'eslint-plugin-pinia',
    () =>
      interopDefault(
        import('eslint-plugin-pinia'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  ...genModuleLoader('playwright', 'eslint-plugin-playwright', () =>
    interopDefault(import('eslint-plugin-playwright')),
  ),
  ...genModuleLoader(
    'pnpm',
    'eslint-plugin-pnpm',
    () => interopDefault(import('eslint-plugin-pnpm')) as Promise<EslintPlugin>,
  ),
  ...genModuleLoader(
    'prefer-arrow-functions',
    'eslint-plugin-prefer-arrow-functions',
    () =>
      interopDefault(
        import('eslint-plugin-prefer-arrow-functions'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  ...genModuleLoader(
    'prettier',
    'eslint-plugin-prettier',
    () => interopDefault(import('eslint-plugin-prettier')) as Promise<EslintPlugin>,
  ),
  ...genModuleLoader('promise', 'eslint-plugin-promise', () =>
    interopDefault(import('eslint-plugin-promise')),
  ),
  ...genModuleLoader(
    'qunit',
    'eslint-plugin-qunit',
    () => interopDefault(import('eslint-plugin-qunit')) as Promise<EslintPlugin>,
  ),
  ...genModuleLoader('qwik', 'eslint-plugin-qwik', () =>
    interopDefault(import('eslint-plugin-qwik')).then(fixupPluginRules),
  ),
  ...genModuleLoader('react', 'eslint-plugin-react', () =>
    interopDefault(import('eslint-plugin-react')),
  ),
  ...genModuleLoader(
    'react-hooks',
    'eslint-plugin-react-hooks',
    () =>
      interopDefault(
        import('eslint-plugin-react-hooks'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
  ),
  ...genModuleLoader('react-refresh', 'eslint-plugin-react-refresh', () =>
    interopDefault(import('eslint-plugin-react-refresh')),
  ),
  ...genModuleLoader(
    'react-you-might-not-need-an-effect',
    'eslint-plugin-react-you-might-not-need-an-effect',
    () =>
      interopDefault(
        import('eslint-plugin-react-you-might-not-need-an-effect'),
      ) as Promise<EslintPlugin>,
  ),
  ...genModuleLoader('regexp', 'eslint-plugin-regexp', () =>
    interopDefault(import('eslint-plugin-regexp')),
  ),
  ...genModuleLoader(
    'rxjs',
    '@smarttools/eslint-plugin-rxjs',
    () =>
      interopDefault(
        import('@smarttools/eslint-plugin-rxjs'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
  ),
  ...genModuleLoader(
    'security',
    'eslint-plugin-security',
    () =>
      // @ts-expect-error types mismatch
      interopDefault(
        import('eslint-plugin-security'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  ...genModuleLoader(
    'solid',
    'eslint-plugin-solid',
    // @ts-expect-error types mismatch
    () => interopDefault(import('eslint-plugin-solid')) as Promise<EslintPlugin>,
  ),
  ...genModuleLoader('sonarjs', 'eslint-plugin-sonarjs', () =>
    interopDefault(import('eslint-plugin-sonarjs')),
  ),
  ...genModuleLoader(
    'storybook',
    'eslint-plugin-storybook',
    // @ts-expect-error types mismatch
    () => interopDefault(import('eslint-plugin-storybook')) as Promise<EslintPlugin>,
  ),
  ...genModuleLoader(
    'svelte',
    'eslint-plugin-svelte',
    () => interopDefault(import('eslint-plugin-svelte')),
    // Hard-depends on `svelte` package, uses it at least in `lib/utils/svelte-context.js`
    MODULE_NOT_FOUND_ERROR_CODES,
  ),
  ...genModuleLoader(
    'tailwindcss',
    'eslint-plugin-tailwindcss',
    () => interopDefault(import('eslint-plugin-tailwindcss')) as Promise<EslintPlugin>,
    // Tries to import `tailwindcss/resolveConfig` which doesn't exist anymore in v4
    ['ERR_PACKAGE_PATH_NOT_EXPORTED', ...MODULE_NOT_FOUND_ERROR_CODES],
  ),
  ...genModuleLoader('testing-library', 'eslint-plugin-testing-library', () =>
    interopDefault(import('eslint-plugin-testing-library')),
  ),
  ...genModuleLoader(
    'toml',
    'eslint-plugin-toml',
    () =>
      interopDefault(
        import('eslint-plugin-toml'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  ...genModuleLoader(
    'ts',
    'typescript-eslint',
    () =>
      interopDefault(import('typescript-eslint')).then((m) => m.plugin) as Promise<EslintPlugin>,
  ),
  ...genModuleLoader('turbo', 'eslint-plugin-turbo', () =>
    interopDefault(import('eslint-plugin-turbo')),
  ),
  ...genModuleLoader('un', '', () => interopDefault(import('../plugin-un'))),
  ...genModuleLoader(
    'unicorn',
    'eslint-plugin-unicorn',
    () => interopDefault(import('eslint-plugin-unicorn')) as Promise<EslintPlugin>,
  ),
  ...genModuleLoader('unnecessary-abstractions', 'eslint-plugin-unnecessary-abstractions', () =>
    interopDefault(import('eslint-plugin-unnecessary-abstractions')),
  ),
  ...genModuleLoader(
    'unused-imports',
    'eslint-plugin-unused-imports',
    () => interopDefault(import('eslint-plugin-unused-imports')) as Promise<EslintPlugin>,
  ),
  ...genModuleLoader('vitest', '@vitest/eslint-plugin', () =>
    interopDefault(import('@vitest/eslint-plugin')),
  ),
  ...genModuleLoader('vue', 'eslint-plugin-vue', () => interopDefault(import('eslint-plugin-vue'))),
  ...genModuleLoader(
    'vue-scoped-css',
    'eslint-plugin-vue-scoped-css',
    () =>
      interopDefault(
        import('eslint-plugin-vue-scoped-css'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
  ),
  ...genModuleLoader('vuejs-accessibility', 'eslint-plugin-vuejs-accessibility', () =>
    interopDefault(import('eslint-plugin-vuejs-accessibility')),
  ),
  ...genModuleLoader(
    'wc',
    'eslint-plugin-wc',
    () => interopDefault(import('eslint-plugin-wc')) as Promise<EslintPlugin>,
  ),
  ...genModuleLoader(
    'yml',
    'eslint-plugin-yml',
    () =>
      interopDefault(
        import('eslint-plugin-yml'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  ...genModuleLoader(
    'you-dont-need-lodash-underscore',
    'eslint-plugin-you-dont-need-lodash-underscore',
    () => interopDefault(import('eslint-plugin-you-dont-need-lodash-underscore')),
  ),
  ...genModuleLoader(
    'zod',
    'eslint-plugin-zod-x',
    () =>
      interopDefault(
        import('eslint-plugin-zod-x'),
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
} satisfies Record<string, ObjectValues<ModuleLoader<EslintPlugin>>>;

export type LoadablePluginPrefix = keyof typeof pluginsLoaders;
export const LOADABLE_PLUGIN_PREFIXES_LIST = objectKeysUnsafe(pluginsLoaders);

export type PluginPrefix = LoadablePluginPrefix | '';

export const PLUGIN_PREFIXES_LIST: readonly PluginPrefix[] = [
  '',
  ...objectKeysUnsafe(pluginsLoaders),
];
