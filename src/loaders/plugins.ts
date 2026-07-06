// cspell:ignore mathml
import {fixupPluginRules as fixupPluginRulesOriginal} from '@eslint/compat';
import stylistic from '@stylistic/eslint-plugin';
import type {EslintPlugin} from '../eslint/eslint-types';
import {interopDefault, objectKeysUnsafe} from '../utils';
import {
  type EslintParser,
  type EslintProcessor,
  MODULE_NOT_FOUND_ERROR_CODES,
  type ModuleLoader,
  genModuleLoader,
} from './shared';

// A tiny wrapper just to preserve the plugin type
const fixupPluginRules = <Plugin extends EslintPlugin>(plugin: Plugin) =>
  fixupPluginRulesOriginal(plugin) as Plugin;

const setPluginRuleSchemas = <Plugin extends EslintPlugin>(m: Plugin): Plugin => ({
  ...m,
  rules: Object.fromEntries(
    Object.entries(m.rules || {}).map(([name, rule]) => [
      name,
      {
        ...rule,
        meta: {
          ...rule.meta,
          // `false` means "you can pass whatever you want", `undefined` means "you cannot pass anything"
          schema: rule.meta?.schema ?? false,
        },
      },
    ]),
  ),
});

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
  angular: genModuleLoader(
    'angular',
    '@angular-eslint/eslint-plugin',
    () =>
      interopDefault(
        import('@angular-eslint/eslint-plugin'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
  ),
  'angular-template': genModuleLoader(
    'angular-template',
    '@angular-eslint/eslint-plugin-template',
    () =>
      interopDefault(
        import('@angular-eslint/eslint-plugin-template'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
  ),
  antfu: genModuleLoader('antfu', 'eslint-plugin-antfu', () =>
    interopDefault(import('eslint-plugin-antfu')),
  ),
  'arrow-return-style': genModuleLoader(
    'arrow-return-style',
    'eslint-plugin-arrow-return-style-x',
    () =>
      interopDefault(
        import('eslint-plugin-arrow-return-style-x'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
  ),
  astro: genModuleLoader('astro', 'eslint-plugin-astro', () =>
    interopDefault(import('eslint-plugin-astro')),
  ),
  ava: genModuleLoader(
    'ava',
    'eslint-plugin-ava',
    () => interopDefault(import('eslint-plugin-ava')) as Promise<EslintPlugin>,
  ),
  awscdk: genModuleLoader(
    'awscdk',
    'eslint-plugin-awscdk',
    () =>
      interopDefault(
        import('eslint-plugin-awscdk'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
  ),
  'barrel-files': genModuleLoader('barrel-files', 'eslint-plugin-barrel-files', () =>
    interopDefault(import('eslint-plugin-barrel-files')).then(fixupPluginRules),
  ),
  'better-tailwindcss': genModuleLoader(
    'better-tailwindcss',
    'eslint-plugin-better-tailwindcss',
    () => interopDefault(import('eslint-plugin-better-tailwindcss')) as Promise<EslintPlugin>,
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
  cspell: genModuleLoader(
    'cspell',
    '@cspell/eslint-plugin',
    () => interopDefault(import('@cspell/eslint-plugin')) as Promise<EslintPlugin>,
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
  drizzle: genModuleLoader('drizzle', 'eslint-plugin-drizzle', () =>
    interopDefault(import('eslint-plugin-drizzle')),
  ),
  e18e: genModuleLoader(
    'e18e',
    '@e18e/eslint-plugin',
    () => interopDefault(import('@e18e/eslint-plugin')) as Promise<EslintPlugin>,
  ),
  ember: genModuleLoader('ember', 'eslint-plugin-ember', async () => {
    // Pre-load `ember-eslint-parser` fully before loading `eslint-plugin-ember` (CJS)
    // to avoid a race condition:
    // - both packages share ESM dependencies (`noop.js`,
    // `eslint-scope`, `mathml-tag-names`, `html-tags`, `svg-tags`, etc.).
    // - `eslint-plugin-ember`'s CJS code uses `require()` on these ESM deps
    // - Node 22's `require(esm)` fails if those deps are concurrently being loaded via `import()`
    // (e.g. via the `ember-eslint-parser` parser loader).
    // Pre-loading `ember-eslint-parser` ensures all shared ESM deps are cached first.
    await import('ember-eslint-parser').catch(() => null);
    return await interopDefault(import('eslint-plugin-ember'));
  }),
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
  'eslint-plugin': genModuleLoader(
    'eslint-plugin',
    'eslint-plugin-eslint-plugin',
    () => interopDefault(import('eslint-plugin-eslint-plugin')) as Promise<EslintPlugin>,
  ),
  'eslint-react': genModuleLoader('eslint-react', '@eslint-react/eslint-plugin', () =>
    loadEslintReactPlugin('@eslint-react'),
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
  'file-progress': genModuleLoader('file-progress', 'eslint-plugin-file-progress', () =>
    interopDefault(import('eslint-plugin-file-progress')),
  ),
  format: genModuleLoader('format', 'eslint-plugin-format', () =>
    interopDefault(import('eslint-plugin-format')),
  ),
  formatjs: genModuleLoader('formatjs', 'eslint-plugin-formatjs', () =>
    interopDefault(import('eslint-plugin-formatjs')),
  ),
  functional: genModuleLoader(
    'functional',
    'eslint-plugin-functional',
    () => interopDefault(import('eslint-plugin-functional')) as Promise<EslintPlugin>,
  ),
  'github-actions': genModuleLoader(
    'github-actions',
    'eslint-plugin-github-action',
    () => interopDefault(import('eslint-plugin-github-action')) as Promise<EslintPlugin>,
  ),
  graphql: genModuleLoader('graphql', '@graphql-eslint/eslint-plugin', () =>
    (
      interopDefault(import('@graphql-eslint/eslint-plugin')) as Promise<
        EslintPlugin & {
          processor: EslintProcessor;
          parser: EslintParser;
        }
      >
    ).then(fixupPluginRules),
  ),
  header: genModuleLoader('header', 'eslint-plugin-header', () =>
    interopDefault(import('eslint-plugin-header'))
      .then(setPluginRuleSchemas)
      .then(fixupPluginRules),
  ),
  headers: genModuleLoader('headers', 'eslint-plugin-headers', () =>
    interopDefault(import('eslint-plugin-headers')),
  ),
  html: genModuleLoader(
    'html',
    '@html-eslint/eslint-plugin',
    () => interopDefault(import('@html-eslint/eslint-plugin')) as Promise<EslintPlugin>,
  ),
  'html-processor': genModuleLoader('html-processor', 'eslint-plugin-html', () =>
    interopDefault(import('eslint-plugin-html')),
  ),
  import: genModuleLoader(
    'import',
    'eslint-plugin-import-x',
    () => interopDefault(import('eslint-plugin-import-x')) as Promise<EslintPlugin>,
  ),
  'import-integrity': genModuleLoader(
    'import-integrity',
    'import-integrity-lint',
    () =>
      interopDefault(
        import('import-integrity-lint'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
  ),
  'import-zod': genModuleLoader('import-zod', 'eslint-plugin-import-zod', () =>
    interopDefault(import('eslint-plugin-import-zod')),
  ),
  jest: genModuleLoader('jest', 'eslint-plugin-jest', () =>
    interopDefault(import('eslint-plugin-jest')),
  ),
  'jest-dom': genModuleLoader('jest-dom', 'eslint-plugin-jest-dom', () =>
    interopDefault(import('eslint-plugin-jest-dom')).then(fixupPluginRules),
  ),
  'jest-extended': genModuleLoader('jest-extended', 'eslint-plugin-jest-extended', () =>
    interopDefault(import('eslint-plugin-jest-extended')),
  ),
  jsdoc: genModuleLoader(
    'jsdoc',
    'eslint-plugin-jsdoc',
    () => interopDefault(import('eslint-plugin-jsdoc')) as Promise<EslintPlugin>,
  ),
  json: genModuleLoader(
    'json',
    '@eslint/json',
    () =>
      interopDefault(
        import('@eslint/json'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
  ),
  'json-schema-validator': genModuleLoader(
    'json-schema-validator',
    'eslint-plugin-json-schema-validator',
    () => interopDefault(import('eslint-plugin-json-schema-validator')),
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
    () =>
      interopDefault(
        import('eslint-plugin-markdown-links'),
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
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
  mobx: genModuleLoader('mobx', 'eslint-plugin-mobx', () =>
    interopDefault(import('eslint-plugin-mobx')),
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
  nextjs: genModuleLoader('nextjs', '@next/eslint-plugin-next', () =>
    interopDefault(import('@next/eslint-plugin-next')),
  ),
  ngrx: genModuleLoader(
    'ngrx',
    '@ngrx/eslint-plugin',
    () =>
      interopDefault(
        import('@ngrx/eslint-plugin'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
  ),
  'no-only-tests': genModuleLoader('no-only-tests', 'eslint-plugin-no-only-tests', () =>
    interopDefault(import('eslint-plugin-no-only-tests')),
  ),
  'no-relative-import-paths': genModuleLoader(
    'no-relative-import-paths',
    'eslint-plugin-no-relative-import-paths',
    () => interopDefault(import('eslint-plugin-no-relative-import-paths')).then(fixupPluginRules),
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
  'node-dependencies': genModuleLoader('node-dependencies', 'eslint-plugin-node-dependencies', () =>
    interopDefault(import('eslint-plugin-node-dependencies')),
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
    () => interopDefault(import('eslint-plugin-prefer-arrow-functions')) as Promise<EslintPlugin>,
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
  qwik: genModuleLoader('qwik', 'eslint-plugin-qwik', () =>
    interopDefault(import('eslint-plugin-qwik')).then(fixupPluginRules),
  ),
  react: genModuleLoader('react', 'eslint-plugin-react', () =>
    interopDefault(import('eslint-plugin-react')).then(fixupPluginRules),
  ),
  'react-debug': genModuleLoader(
    'react-debug',
    'eslint-plugin-react-debug',
    () => interopDefault(import('eslint-plugin-react-debug')) as Promise<EslintPlugin>,
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
  regexp: genModuleLoader(
    'regexp',
    'eslint-plugin-regexp',
    () => interopDefault(import('eslint-plugin-regexp')) as Promise<EslintPlugin>,
  ),
  remeda: genModuleLoader(
    'remeda',
    'eslint-plugin-remeda',
    () =>
      interopDefault(
        import('eslint-plugin-remeda'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
  ),
  ripple: genModuleLoader('ripple', '@tsrx/eslint-plugin', () =>
    interopDefault(import('@tsrx/eslint-plugin')),
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
    () =>
      interopDefault(
        import('eslint-plugin-sentences-per-line'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
  ),
  solid: genModuleLoader(
    'solid',
    'eslint-plugin-solid',
    // @ts-expect-error types mismatch
    () => interopDefault(import('eslint-plugin-solid')) as Promise<EslintPlugin>,
  ),
  sonarjs: genModuleLoader(
    'sonarjs',
    'eslint-plugin-sonarjs',
    () => interopDefault(import('eslint-plugin-sonarjs')) as Promise<EslintPlugin>,
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
  // We can't `import()` `@stylistic/eslint-plugin` because it's `require()`d by eslint-plugin-vue: https://github.com/vuejs/eslint-plugin-vue/blob/1b634549a9e91231e5ea79313763c69f93e678c1/lib/utils/index.js#L113 and `import()`ing after `require()`ing causes `ERR_INTERNAL_ASSERTION` error, see https://github.com/nodejs/node/issues/54577
  stylistic: genModuleLoader('stylistic', '@stylistic/eslint-plugin', () =>
    Promise.resolve(stylistic),
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
    () =>
      interopDefault(
        import('eslint-plugin-tailwindcss'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
  ),
  'tanstack-query': genModuleLoader(
    'tanstack-query',
    '@tanstack/eslint-plugin-query',
    () =>
      interopDefault(
        import('@tanstack/eslint-plugin-query'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
  ),
  'tanstack-router': genModuleLoader(
    'tanstack-router',
    '@tanstack/eslint-plugin-router',
    () =>
      interopDefault(
        import('@tanstack/eslint-plugin-router'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
  ),
  'tanstack-start': genModuleLoader(
    'tanstack-start',
    '@tanstack/eslint-plugin-start',
    () =>
      interopDefault(
        import('@tanstack/eslint-plugin-start'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
  ),
  'testing-library': genModuleLoader('testing-library', 'eslint-plugin-testing-library', () =>
    interopDefault(import('eslint-plugin-testing-library')),
  ),
  toml: genModuleLoader(
    'toml',
    'eslint-plugin-toml',
    () => interopDefault(import('eslint-plugin-toml')) as Promise<EslintPlugin>,
  ),
  'tree-shaking': genModuleLoader('tree-shaking', 'eslint-plugin-tree-shaking', () =>
    interopDefault(import('eslint-plugin-tree-shaking')).then(fixupPluginRules),
  ),
  ts: genModuleLoader(
    'ts',
    'typescript-eslint',
    () =>
      interopDefault(import('typescript-eslint')).then((m) => m.plugin) as Promise<EslintPlugin>,
  ),
  tsdoc: genModuleLoader(
    'tsdoc',
    'eslint-plugin-tsdoc',
    () => interopDefault(import('eslint-plugin-tsdoc')) as Promise<EslintPlugin>,
  ),
  turbo: genModuleLoader(
    'turbo',
    'eslint-plugin-turbo',
    () => interopDefault(import('eslint-plugin-turbo')) as Promise<EslintPlugin>,
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
  unocss: genModuleLoader(
    'unocss',
    '@unocss/eslint-plugin',
    () =>
      interopDefault(
        import('@unocss/eslint-plugin'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
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
  'vue-i18n': genModuleLoader('vue-i18n', '@intlify/eslint-plugin-vue-i18n', async () => {
    // Pre-load `{jsonc,yaml}-eslint-parser` (ESM) before loading
    // `@intlify/eslint-plugin-vue-i18n` (CJS).
    // The CJS plugin uses `require()` on `jsonc-eslint-parser`;
    // on Node 24, `require(esm)` fails if that module is concurrently being loaded
    // via `import()` elsewhere (race condition).
    /* eslint-disable import/no-extraneous-dependencies */
    await import('jsonc-eslint-parser').catch(() => null);
    await import('yaml-eslint-parser').catch(() => null);
    /* eslint-enable import/no-extraneous-dependencies */
    return await (interopDefault(
      import('@intlify/eslint-plugin-vue-i18n'),
      // @ts-expect-error types mismatch
    ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>);
  }),
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
  yaml: genModuleLoader(
    'yaml',
    'eslint-plugin-yml',
    () => interopDefault(import('eslint-plugin-yml')) as Promise<EslintPlugin>,
  ),
  'you-dont-need-lodash-underscore': genModuleLoader(
    'you-dont-need-lodash-underscore',
    'eslint-plugin-you-dont-need-lodash-underscore',
    () => interopDefault(import('eslint-plugin-you-dont-need-lodash-underscore')),
  ),
  zod: genModuleLoader(
    'zod',
    'eslint-plugin-zod',
    () =>
      interopDefault(
        import('eslint-plugin-zod'),
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  'zod-core': genModuleLoader(
    'zod-core',
    'eslint-plugin-zod-core',
    () =>
      interopDefault(
        import('eslint-plugin-zod-core'),
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  'zod-mini': genModuleLoader(
    'zod-mini',
    'eslint-plugin-zod-mini',
    () =>
      interopDefault(
        import('eslint-plugin-zod-mini'),
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  'zod-openapi': genModuleLoader('zod-openapi', 'eslint-plugin-zod-openapi', () =>
    (
      interopDefault(
        import('eslint-plugin-zod-openapi'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>
    ).then(fixupPluginRules),
  ),
} satisfies Record<string, ModuleLoader<EslintPlugin | null, string, boolean>>;

export type LoadablePluginPrefix = keyof typeof pluginsLoaders;
export const LOADABLE_PLUGIN_PREFIXES_LIST = objectKeysUnsafe(pluginsLoaders);

export type PluginPrefix = LoadablePluginPrefix | '';

export const PLUGIN_PREFIXES_LIST: readonly PluginPrefix[] = [
  '',
  ...objectKeysUnsafe(pluginsLoaders),
];
