import {fixupPluginRules} from '@eslint/compat';
import stylistic from '@stylistic/eslint-plugin';
import type {EslintPlugin} from '../eslint';
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
  '@angular-eslint': genModuleLoader(
    '@angular-eslint',
    '@angular-eslint/eslint-plugin',
    () =>
      interopDefault(
        import('@angular-eslint/eslint-plugin'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
  ),
  '@angular-eslint/template': genModuleLoader(
    '@angular-eslint/template',
    '@angular-eslint/eslint-plugin-template',
    () =>
      interopDefault(
        import('@angular-eslint/eslint-plugin-template'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
  ),
  '@cspell': genModuleLoader(
    '@cspell',
    '@cspell/eslint-plugin',
    () => interopDefault(import('@cspell/eslint-plugin')) as Promise<EslintPlugin>,
  ),
  '@eslint-react': genModuleLoader('@eslint-react', '@eslint-react/eslint-plugin', () =>
    loadEslintReactPlugin('@eslint-react'),
  ),
  '@eslint-react/debug': genModuleLoader(
    '@eslint-react/debug',
    '@eslint-react/eslint-plugin',
    () => interopDefault(import('eslint-plugin-react-debug')) as Promise<EslintPlugin>,
  ),
  '@eslint-react/dom': genModuleLoader('@eslint-react/dom', '@eslint-react/eslint-plugin', () =>
    loadEslintReactPlugin('@eslint-react/dom'),
  ),
  '@eslint-react/hooks-extra': genModuleLoader(
    '@eslint-react/hooks-extra',
    '@eslint-react/eslint-plugin',
    () => loadEslintReactPlugin('@eslint-react/hooks-extra'),
  ),
  '@eslint-react/naming-convention': genModuleLoader(
    '@eslint-react/naming-convention',
    '@eslint-react/eslint-plugin',
    () => loadEslintReactPlugin('@eslint-react/naming-convention'),
  ),
  '@eslint-react/web-api': genModuleLoader(
    '@eslint-react/web-api',
    '@eslint-react/eslint-plugin',
    () => loadEslintReactPlugin('@eslint-react/web-api'),
  ),
  '@html-eslint': genModuleLoader(
    '@html-eslint',
    '@html-eslint/eslint-plugin',
    () => interopDefault(import('@html-eslint/eslint-plugin')) as Promise<EslintPlugin>,
  ),
  '@intlify/vue-i18n': genModuleLoader(
    '@intlify/vue-i18n',
    '@intlify/eslint-plugin-vue-i18n',
    () =>
      interopDefault(
        import('@intlify/eslint-plugin-vue-i18n'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  '@next/next': genModuleLoader('@next/next', '@next/eslint-plugin-next', () =>
    interopDefault(import('@next/eslint-plugin-next')),
  ),
  // We can't `import()` `@stylistic/eslint-plugin` because it's `require()`d by eslint-plugin-vue: https://github.com/vuejs/eslint-plugin-vue/blob/1b634549a9e91231e5ea79313763c69f93e678c1/lib/utils/index.js#L113 and `import()`ing after `require()`ing causes `ERR_INTERNAL_ASSERTION` error, see https://github.com/nodejs/node/issues/54577
  '@stylistic': genModuleLoader('@stylistic', '@stylistic', () => Promise.resolve(stylistic)),
  '@tanstack/query': genModuleLoader(
    '@tanstack/query',
    '@tanstack/eslint-plugin-query',
    () =>
      interopDefault(
        import('@tanstack/eslint-plugin-query'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
  ),
  '@unocss': genModuleLoader(
    '@unocss',
    '@unocss/eslint-plugin',
    () =>
      interopDefault(
        import('@unocss/eslint-plugin'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
  ),
  antfu: genModuleLoader('antfu', 'eslint-plugin-antfu', () =>
    interopDefault(import('eslint-plugin-antfu')),
  ),
  astro: genModuleLoader('astro', 'eslint-plugin-astro', () =>
    interopDefault(import('eslint-plugin-astro')),
  ),
  ava: genModuleLoader('ava', 'eslint-plugin-ava', () =>
    interopDefault(import('eslint-plugin-ava')),
  ),
  'barrel-files': genModuleLoader('barrel-files', 'eslint-plugin-barrel-files', () =>
    interopDefault(import('eslint-plugin-barrel-files')),
  ),
  'better-tailwindcss': genModuleLoader(
    'better-tailwindcss',
    'eslint-plugin-better-tailwindcss',
    () => interopDefault(import('eslint-plugin-better-tailwindcss')),
  ),
  boundaries: genModuleLoader('boundaries', 'eslint-plugin-boundaries', () =>
    interopDefault(import('eslint-plugin-boundaries')),
  ),
  'case-police': genModuleLoader(
    'case-police',
    'eslint-plugin-case-police',
    () => interopDefault(import('eslint-plugin-case-police')) as Promise<EslintPlugin>,
  ),
  'check-file': genModuleLoader('check-file', 'eslint-plugin-check-file', () =>
    interopDefault(import('eslint-plugin-check-file')),
  ),
  clsx: genModuleLoader(
    'clsx',
    'eslint-plugin-clsx',
    () =>
      interopDefault(
        import('eslint-plugin-clsx'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
  ),
  command: genModuleLoader(
    'command',
    'eslint-plugin-command',
    () => interopDefault(import('eslint-plugin-command')) as Promise<EslintPlugin>,
  ),
  compat: genModuleLoader('compat', 'eslint-plugin-compat', () =>
    interopDefault(import('eslint-plugin-compat')),
  ),
  css: genModuleLoader('css', '@eslint/css', () => interopDefault(import('@eslint/css'))),
  'css-in-js': genModuleLoader(
    'css-in-js',
    'eslint-plugin-css',
    () =>
      interopDefault(
        import('eslint-plugin-css'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  cypress: genModuleLoader('cypress', 'eslint-plugin-cypress', () =>
    interopDefault(import('eslint-plugin-cypress')),
  ),
  'de-morgan': genModuleLoader(
    'de-morgan',
    'eslint-plugin-de-morgan',
    () => interopDefault(import('eslint-plugin-de-morgan')) as Promise<EslintPlugin>,
  ),
  depend: genModuleLoader(
    'depend',
    'eslint-plugin-depend',
    () => interopDefault(import('eslint-plugin-depend')) as Promise<EslintPlugin>,
  ),
  docusaurus: genModuleLoader(
    'docusaurus',
    '@docusaurus/eslint-plugin',
    () =>
      // @ts-expect-error types mismatch
      interopDefault(
        import('@docusaurus/eslint-plugin'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  e18e: genModuleLoader(
    'e18e',
    '@e18e/eslint-plugin',
    () => interopDefault(import('@e18e/eslint-plugin')) as Promise<EslintPlugin>,
  ),
  ember: genModuleLoader('ember', 'eslint-plugin-ember', () =>
    interopDefault(import('eslint-plugin-ember')),
  ),
  'erasable-syntax-only': genModuleLoader(
    'erasable-syntax-only',
    'eslint-plugin-erasable-syntax-only',
    () =>
      interopDefault(
        import('eslint-plugin-erasable-syntax-only'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
  ),
  es: genModuleLoader('es', 'eslint-plugin-es-x', () =>
    interopDefault(import('eslint-plugin-es-x')),
  ),
  'eslint-comments': genModuleLoader(
    'eslint-comments',
    '@eslint-community/eslint-plugin-eslint-comments',
    () => interopDefault(import('@eslint-community/eslint-plugin-eslint-comments')),
  ),
  'eslint-plugin': genModuleLoader('eslint-plugin', 'eslint-plugin-eslint-plugin', () =>
    interopDefault(import('eslint-plugin-eslint-plugin')),
  ),
  'expect-type': genModuleLoader(
    'expect-type',
    'eslint-plugin-expect-type',
    () =>
      interopDefault(
        import('eslint-plugin-expect-type'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
  ),
  'fast-import': genModuleLoader(
    'fast-import',
    'eslint-plugin-fast-import',
    () =>
      interopDefault(
        import('eslint-plugin-fast-import'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
  ),
  'file-progress': genModuleLoader('file-progress', 'eslint-plugin-file-progress', () =>
    interopDefault(import('eslint-plugin-file-progress')),
  ),
  format: genModuleLoader('format', 'eslint-plugin-format', () =>
    interopDefault(import('eslint-plugin-format')),
  ),
  formatjs: genModuleLoader('formatjs', 'eslint-plugin-formatjs', () =>
    interopDefault(import('eslint-plugin-formatjs')),
  ),
  'github-actions': genModuleLoader(
    'github-actions',
    'eslint-plugin-github-action',
    () =>
      // @ts-expect-error types mismatch
      interopDefault(
        import('eslint-plugin-github-action'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  graphql: genModuleLoader(
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
  header: genModuleLoader(
    'header',
    'eslint-plugin-header',
    () =>
      interopDefault(import('eslint-plugin-header')).then(
        fixupPluginRules,
      ) as Promise<EslintPlugin>,
  ),
  headers: genModuleLoader('headers', 'eslint-plugin-headers', () =>
    interopDefault(import('eslint-plugin-headers')),
  ),
  html: genModuleLoader('html', 'eslint-plugin-html', () =>
    interopDefault(import('eslint-plugin-html')),
  ),
  import: genModuleLoader(
    'import',
    'eslint-plugin-import-x',
    () => interopDefault(import('eslint-plugin-import-x')) as unknown as Promise<EslintPlugin>,
  ),
  'import-zod': genModuleLoader('import-zod', 'eslint-plugin-import-zod', () =>
    interopDefault(import('eslint-plugin-import-zod')),
  ),
  jest: genModuleLoader('jest', 'eslint-plugin-jest', () =>
    interopDefault(import('eslint-plugin-jest')),
  ),
  'jest-dom': genModuleLoader('jest-dom', 'eslint-plugin-jest-dom', () =>
    interopDefault(import('eslint-plugin-jest-dom')),
  ),
  'jest-extended': genModuleLoader('jest-extended', 'eslint-plugin-jest-extended', () =>
    interopDefault(import('eslint-plugin-jest-extended')),
  ),
  jsdoc: genModuleLoader(
    'jsdoc',
    'eslint-plugin-jsdoc',
    () => interopDefault(import('eslint-plugin-jsdoc')) as Promise<EslintPlugin>,
  ),
  'json-schema-validator': genModuleLoader(
    'json-schema-validator',
    'eslint-plugin-json-schema-validator',
    () =>
      interopDefault(
        import('eslint-plugin-json-schema-validator'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  jsonc: genModuleLoader(
    'jsonc',
    'eslint-plugin-jsonc',
    () =>
      interopDefault(
        import('eslint-plugin-jsonc'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
  ),
  'jsx-a11y': genModuleLoader('jsx-a11y', 'eslint-plugin-jsx-a11y-x', () =>
    interopDefault(import('eslint-plugin-jsx-a11y-x')),
  ),
  lit: genModuleLoader(
    'lit',
    'eslint-plugin-lit',
    () => interopDefault(import('eslint-plugin-lit')) as Promise<EslintPlugin>,
  ),
  'lit-a11y': genModuleLoader('lit-a11y', 'eslint-plugin-lit-a11y', () =>
    interopDefault(import('eslint-plugin-lit-a11y')),
  ),
  lockfile: genModuleLoader('lockfile', 'eslint-plugin-lockfile', () =>
    interopDefault(import('eslint-plugin-lockfile')),
  ),
  markdown: genModuleLoader('markdown', '@eslint/markdown', () =>
    interopDefault(import('@eslint/markdown')),
  ),
  'markdown-links': genModuleLoader(
    'markdown-links',
    'eslint-plugin-markdown-links',
    () => interopDefault(import('eslint-plugin-markdown-links')) as Promise<EslintPlugin>,
  ),
  'markdown-preferences': genModuleLoader(
    'markdown-preferences',
    'eslint-plugin-markdown-preferences',
    () =>
      interopDefault(import('eslint-plugin-markdown-preferences')) as Promise<
        EslintPlugin & Pick<typeof import('eslint-plugin-markdown-preferences'), 'resources'>
      >,
  ),
  math: genModuleLoader(
    'math',
    'eslint-plugin-math',
    () =>
      interopDefault(
        import('eslint-plugin-math'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  mdx: genModuleLoader('mdx', 'eslint-plugin-mdx', () =>
    interopDefault(import('eslint-plugin-mdx')),
  ),
  mocha: genModuleLoader('mocha', 'eslint-plugin-mocha', () =>
    interopDefault(import('eslint-plugin-mocha')),
  ),
  'module-interop': genModuleLoader(
    'moduleInterop',
    'eslint-plugin-module-interop',
    () => interopDefault(import('eslint-plugin-module-interop')) as Promise<EslintPlugin>,
  ),
  nestjs: genModuleLoader(
    'nestjs',
    '@darraghor/eslint-plugin-nestjs-typed',
    () =>
      interopDefault(import('@darraghor/eslint-plugin-nestjs-typed')).then(
        (m) => m.plugin,
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  'no-only-tests': genModuleLoader('no-only-tests', 'eslint-plugin-no-only-tests', () =>
    interopDefault(import('eslint-plugin-no-only-tests')),
  ),
  'no-secrets': genModuleLoader(
    'no-secrets',
    'eslint-plugin-no-secrets',
    () => interopDefault(import('eslint-plugin-no-secrets')) as Promise<EslintPlugin>,
  ),
  'no-type-assertion': genModuleLoader('no-type-assertion', 'eslint-plugin-no-type-assertion', () =>
    interopDefault(import('eslint-plugin-no-type-assertion')),
  ),
  'no-unsanitized': genModuleLoader('no-unsanitized', 'eslint-plugin-no-unsanitized', () =>
    interopDefault(import('eslint-plugin-no-unsanitized')),
  ),
  node: genModuleLoader(
    'node',
    'eslint-plugin-n',
    () => interopDefault(import('eslint-plugin-n')) as Promise<EslintPlugin>,
  ),
  'node-dependencies': genModuleLoader(
    'node-dependencies',
    'eslint-plugin-node-dependencies',
    () =>
      interopDefault(
        import('eslint-plugin-node-dependencies'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  nuxt: genModuleLoader('nuxt', '@nuxt/eslint-plugin', () =>
    interopDefault(import('@nuxt/eslint-plugin')),
  ),
  nx: genModuleLoader(
    'nx',
    '@nx/eslint-plugin',
    () =>
      interopDefault(
        import('@nx/eslint-plugin'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
  ),
  'package-json': genModuleLoader(
    'package-json',
    'eslint-plugin-package-json',
    () => interopDefault(import('eslint-plugin-package-json')) as Promise<EslintPlugin>,
  ),
  perfectionist: genModuleLoader(
    'perfectionist',
    'eslint-plugin-perfectionist',
    () => interopDefault(import('eslint-plugin-perfectionist')) as Promise<EslintPlugin>,
  ),
  pinia: genModuleLoader(
    'pinia',
    'eslint-plugin-pinia',
    () =>
      interopDefault(
        import('eslint-plugin-pinia'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  playwright: genModuleLoader('playwright', 'eslint-plugin-playwright', () =>
    interopDefault(import('eslint-plugin-playwright')),
  ),
  pnpm: genModuleLoader(
    'pnpm',
    'eslint-plugin-pnpm',
    () => interopDefault(import('eslint-plugin-pnpm')) as Promise<EslintPlugin>,
  ),
  'prefer-arrow-functions': genModuleLoader(
    'prefer-arrow-functions',
    'eslint-plugin-prefer-arrow-functions',
    () =>
      interopDefault(
        import('eslint-plugin-prefer-arrow-functions'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  prettier: genModuleLoader(
    'prettier',
    'eslint-plugin-prettier',
    () => interopDefault(import('eslint-plugin-prettier')) as Promise<EslintPlugin>,
  ),
  promise: genModuleLoader('promise', 'eslint-plugin-promise', () =>
    interopDefault(import('eslint-plugin-promise')),
  ),
  qunit: genModuleLoader(
    'qunit',
    'eslint-plugin-qunit',
    () => interopDefault(import('eslint-plugin-qunit')) as Promise<EslintPlugin>,
  ),
  qwik: genModuleLoader(
    'qwik',
    'eslint-plugin-qwik',
    () =>
      interopDefault(import('eslint-plugin-qwik')).then(fixupPluginRules) as Promise<EslintPlugin>,
  ),
  react: genModuleLoader('react', 'eslint-plugin-react', () =>
    interopDefault(import('eslint-plugin-react')),
  ),
  'react-hooks': genModuleLoader(
    'react-hooks',
    'eslint-plugin-react-hooks',
    () =>
      interopDefault(
        import('eslint-plugin-react-hooks'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
  ),
  'react-refresh': genModuleLoader('react-refresh', 'eslint-plugin-react-refresh', () =>
    interopDefault(import('eslint-plugin-react-refresh')),
  ),
  'react-you-might-not-need-an-effect': genModuleLoader(
    'react-you-might-not-need-an-effect',
    'eslint-plugin-react-you-might-not-need-an-effect',
    () =>
      interopDefault(
        import('eslint-plugin-react-you-might-not-need-an-effect'),
      ) as Promise<EslintPlugin>,
  ),
  regexp: genModuleLoader('regexp', 'eslint-plugin-regexp', () =>
    interopDefault(import('eslint-plugin-regexp')),
  ),
  rxjs: genModuleLoader(
    'rxjs',
    '@smarttools/eslint-plugin-rxjs',
    () =>
      interopDefault(
        import('@smarttools/eslint-plugin-rxjs'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
  ),
  security: genModuleLoader(
    'security',
    'eslint-plugin-security',
    () =>
      interopDefault(
        import('eslint-plugin-security'),
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  'sentences-per-line': genModuleLoader(
    'sentences-per-line',
    'eslint-plugin-sentences-per-line',
    () => interopDefault(import('eslint-plugin-sentences-per-line')),
  ),
  solid: genModuleLoader(
    'solid',
    'eslint-plugin-solid',
    // @ts-expect-error types mismatch
    () => interopDefault(import('eslint-plugin-solid')) as Promise<EslintPlugin>,
  ),
  sonarjs: genModuleLoader('sonarjs', 'eslint-plugin-sonarjs', () =>
    interopDefault(import('eslint-plugin-sonarjs')),
  ),
  sql: genModuleLoader(
    'sql',
    'eslint-plugin-sql',
    () =>
      // @ts-expect-error types mismatch
      interopDefault(
        import('eslint-plugin-sql'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  storybook: genModuleLoader(
    'storybook',
    'eslint-plugin-storybook',
    // @ts-expect-error types mismatch
    () => interopDefault(import('eslint-plugin-storybook')) as Promise<EslintPlugin>,
  ),
  svelte: genModuleLoader(
    'svelte',
    'eslint-plugin-svelte',
    () => interopDefault(import('eslint-plugin-svelte')),
    // Hard-depends on `svelte` package, uses it at least in `lib/utils/svelte-context.js`
    MODULE_NOT_FOUND_ERROR_CODES,
  ),
  tailwindcss: genModuleLoader(
    'tailwindcss',
    'eslint-plugin-tailwindcss',
    () => interopDefault(import('eslint-plugin-tailwindcss')) as Promise<EslintPlugin>,
    // Tries to import `tailwindcss/resolveConfig` which doesn't exist anymore in v4
    ['ERR_PACKAGE_PATH_NOT_EXPORTED', ...MODULE_NOT_FOUND_ERROR_CODES],
  ),
  'testing-library': genModuleLoader('testing-library', 'eslint-plugin-testing-library', () =>
    interopDefault(import('eslint-plugin-testing-library')),
  ),
  toml: genModuleLoader(
    'toml',
    'eslint-plugin-toml',
    () =>
      interopDefault(
        import('eslint-plugin-toml'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  'tree-shaking': genModuleLoader(
    'tree-shaking',
    'eslint-plugin-tree-shaking',
    () =>
      interopDefault(import('eslint-plugin-tree-shaking')).then(
        fixupPluginRules,
      ) as Promise<EslintPlugin>,
  ),
  ts: genModuleLoader(
    'ts',
    'typescript-eslint',
    () =>
      interopDefault(import('typescript-eslint')).then((m) => m.plugin) as Promise<EslintPlugin>,
  ),
  turbo: genModuleLoader('turbo', 'eslint-plugin-turbo', () =>
    interopDefault(import('eslint-plugin-turbo')),
  ),
  un: genModuleLoader('un', '', () => interopDefault(import('../plugin-un'))),
  unicorn: genModuleLoader(
    'unicorn',
    'eslint-plugin-unicorn',
    () => interopDefault(import('eslint-plugin-unicorn')) as Promise<EslintPlugin>,
  ),
  'unnecessary-abstractions': genModuleLoader(
    'unnecessary-abstractions',
    'eslint-plugin-unnecessary-abstractions',
    () => interopDefault(import('eslint-plugin-unnecessary-abstractions')),
  ),
  'unused-imports': genModuleLoader(
    'unused-imports',
    'eslint-plugin-unused-imports',
    () => interopDefault(import('eslint-plugin-unused-imports')) as Promise<EslintPlugin>,
  ),
  vitest: genModuleLoader('vitest', '@vitest/eslint-plugin', () =>
    interopDefault(import('@vitest/eslint-plugin')),
  ),
  vue: genModuleLoader('vue', 'eslint-plugin-vue', () =>
    interopDefault(import('eslint-plugin-vue')),
  ),
  'vue-scoped-css': genModuleLoader(
    'vue-scoped-css',
    'eslint-plugin-vue-scoped-css',
    () =>
      interopDefault(
        import('eslint-plugin-vue-scoped-css'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
  ),
  'vuejs-accessibility': genModuleLoader(
    'vuejs-accessibility',
    'eslint-plugin-vuejs-accessibility',
    () => interopDefault(import('eslint-plugin-vuejs-accessibility')),
  ),
  wc: genModuleLoader(
    'wc',
    'eslint-plugin-wc',
    () => interopDefault(import('eslint-plugin-wc')) as Promise<EslintPlugin>,
  ),
  yml: genModuleLoader(
    'yml',
    'eslint-plugin-yml',
    () =>
      interopDefault(
        import('eslint-plugin-yml'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  'you-dont-need-lodash-underscore': genModuleLoader(
    'you-dont-need-lodash-underscore',
    'eslint-plugin-you-dont-need-lodash-underscore',
    () => interopDefault(import('eslint-plugin-you-dont-need-lodash-underscore')),
  ),
  zod: genModuleLoader(
    'zod',
    'eslint-plugin-zod-x',
    () =>
      interopDefault(
        import('eslint-plugin-zod-x'),
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
} satisfies Record<string, ModuleLoader<EslintPlugin | null, string, boolean>>;

export type LoadablePluginPrefix = keyof typeof pluginsLoaders;
export const LOADABLE_PLUGIN_PREFIXES_LIST = objectKeysUnsafe(pluginsLoaders);

export type PluginPrefix = LoadablePluginPrefix | '';

export const PLUGIN_PREFIXES_LIST: readonly PluginPrefix[] = [
  '',
  ...objectKeysUnsafe(pluginsLoaders),
];
