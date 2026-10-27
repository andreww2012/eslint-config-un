import {fixupPluginRules} from '@eslint/compat';
import stylistic from '@stylistic/eslint-plugin';
import type {EslintPlugin, PluginTypedByEslintCoreOrTsEslint} from '../eslint/eslint-types';
import type {Prettify} from '../types';
import {interopDefault, mapValues, objectKeysUnsafe} from '../utils';
import {
  type EslintParser,
  type EslintProcessor,
  MODULE_NOT_FOUND_ERROR_CODES,
  type ModuleLoader,
  generateInferredModuleLoader,
  generateModuleLoader,
} from './shared';

const setPluginRuleSchemas = <Plugin extends EslintPlugin>(plugin: Plugin): Plugin => ({
  ...plugin,
  rules: mapValues(
    /* v8 ignore next -- every plugin passed here has rules */ plugin.rules || {},
    (rule) => ({
      ...rule,
      meta: {
        ...rule.meta,
        // `false` means "you can pass anything", `undefined` means "you cannot pass anything"
        schema: rule.meta?.schema ?? false,
      },
    }),
  ),
});

// The `typescript-eslint` typings of a plugin fail `@eslint/core`'s, but describe the same object
export const castTsEslintTypedPlugin = (plugin: PluginTypedByEslintCoreOrTsEslint) =>
  // eslint-disable-next-line un/no-type-assertion
  plugin as EslintPlugin;

/* v8 ignore next - The preset always contains the requested plugin */
const loadEslintReactPlugin = (pluginName: string) =>
  import('@eslint-react/eslint-plugin').then(
    (module) =>
      // eslint-disable-next-line un/no-type-assertion -- the preset declares the plugins it uses
      (module.default.configs.all as {plugins: Record<string, EslintPlugin>}).plugins[pluginName] ||
      null,
  );

export const pluginsLoaders = {
  angular: generateModuleLoader('angular', '@angular-eslint/eslint-plugin', () =>
    interopDefault(import('@angular-eslint/eslint-plugin')).then(castTsEslintTypedPlugin),
  ),
  'angular-template': generateModuleLoader(
    'angular-template',
    '@angular-eslint/eslint-plugin-template',
    () =>
      interopDefault(import('@angular-eslint/eslint-plugin-template')).then(
        castTsEslintTypedPlugin,
      ),
  ),
  antfu: generateModuleLoader('antfu', 'eslint-plugin-antfu', () =>
    interopDefault(import('eslint-plugin-antfu')),
  ),
  'arrow-return-style': generateModuleLoader(
    'arrow-return-style',
    'eslint-plugin-arrow-return-style-x',
    () =>
      interopDefault(import('eslint-plugin-arrow-return-style-x')).then(castTsEslintTypedPlugin),
  ),
  astro: generateInferredModuleLoader('astro', 'eslint-plugin-astro', () =>
    interopDefault(import('eslint-plugin-astro')),
  ),
  ava: generateModuleLoader('ava', 'eslint-plugin-ava', () =>
    interopDefault(import('eslint-plugin-ava')),
  ),
  awscdk: generateModuleLoader(
    'awscdk',
    'eslint-plugin-awscdk',
    () =>
      interopDefault(
        import('eslint-plugin-awscdk'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  'barrel-files': generateModuleLoader('barrel-files', 'eslint-plugin-barrel-files', () =>
    interopDefault(import('eslint-plugin-barrel-files')).then(fixupPluginRules),
  ),
  'better-tailwindcss': generateModuleLoader(
    'better-tailwindcss',
    'eslint-plugin-better-tailwindcss',
    () => interopDefault(import('eslint-plugin-better-tailwindcss')),
  ),
  boundaries: generateModuleLoader('boundaries', 'eslint-plugin-boundaries', () =>
    interopDefault(import('eslint-plugin-boundaries')),
  ),
  'case-police': generateModuleLoader(
    'case-police',
    'eslint-plugin-case-police',
    () =>
      interopDefault(
        import('eslint-plugin-case-police'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  'check-file': generateModuleLoader('check-file', 'eslint-plugin-check-file', () =>
    interopDefault(import('eslint-plugin-check-file')),
  ),
  civet: generateModuleLoader('civet', 'eslint-plugin-civet', () =>
    interopDefault(import('eslint-plugin-civet')),
  ),
  clsx: generateModuleLoader(
    'clsx',
    'eslint-plugin-clsx',
    () =>
      interopDefault(
        import('eslint-plugin-clsx'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  command: generateModuleLoader('command', 'eslint-plugin-command', () =>
    interopDefault(import('eslint-plugin-command')),
  ),
  compat: generateModuleLoader('compat', 'eslint-plugin-compat', () =>
    interopDefault(import('eslint-plugin-compat')),
  ),
  cspell: generateModuleLoader('cspell', '@cspell/eslint-plugin', () =>
    interopDefault(import('@cspell/eslint-plugin')),
  ),
  css: generateModuleLoader('css', '@eslint/css', () => interopDefault(import('@eslint/css'))),
  'css-in-js': generateModuleLoader(
    'css-in-js',
    'eslint-plugin-css',
    () =>
      interopDefault(
        import('eslint-plugin-css'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  cssicorn: generateModuleLoader('cssicorn', 'eslint-cssicorn', () =>
    interopDefault(import('eslint-cssicorn')),
  ),
  cypress: generateInferredModuleLoader('cypress', 'eslint-plugin-cypress', () =>
    interopDefault(import('eslint-plugin-cypress')),
  ),
  'de-morgan': generateModuleLoader('de-morgan', 'eslint-plugin-de-morgan', () =>
    interopDefault(import('eslint-plugin-de-morgan')),
  ),
  depend: generateModuleLoader('depend', 'eslint-plugin-depend', () =>
    interopDefault(import('eslint-plugin-depend')),
  ),
  docusaurus: generateModuleLoader(
    'docusaurus',
    '@docusaurus/eslint-plugin',
    () =>
      // @ts-expect-error types mismatch
      interopDefault(
        import('@docusaurus/eslint-plugin'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  drizzle: generateModuleLoader('drizzle', 'eslint-plugin-drizzle', () =>
    interopDefault(import('eslint-plugin-drizzle')),
  ),
  e18e: generateModuleLoader('e18e', '@e18e/eslint-plugin', () =>
    interopDefault(import('@e18e/eslint-plugin')),
  ),
  ember: generateModuleLoader('ember', 'eslint-plugin-ember', () =>
    interopDefault(import('eslint-plugin-ember')),
  ),
  'erasable-syntax-only': generateModuleLoader(
    'erasable-syntax-only',
    'eslint-plugin-erasable-syntax-only',
    () =>
      // @ts-expect-error types mismatch
      interopDefault(
        import('eslint-plugin-erasable-syntax-only'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  es: generateModuleLoader('es', 'eslint-plugin-es-x', () =>
    interopDefault(import('eslint-plugin-es-x')),
  ),
  'eslint-comments': generateModuleLoader(
    'eslint-comments',
    '@eslint-community/eslint-plugin-eslint-comments',
    () => interopDefault(import('@eslint-community/eslint-plugin-eslint-comments')),
  ),
  'eslint-plugin': generateModuleLoader('eslint-plugin', 'eslint-plugin-eslint-plugin', () =>
    interopDefault(import('eslint-plugin-eslint-plugin')),
  ),
  'eslint-react': generateInferredModuleLoader('eslint-react', '@eslint-react/eslint-plugin', () =>
    loadEslintReactPlugin('@eslint-react'),
  ),
  'expect-type': generateModuleLoader(
    'expect-type',
    'eslint-plugin-expect-type',
    () =>
      // @ts-expect-error types mismatch
      interopDefault(
        import('eslint-plugin-expect-type'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  expo: generateModuleLoader('expo', 'eslint-plugin-expo', () =>
    interopDefault(import('eslint-plugin-expo')),
  ),
  'file-progress': generateModuleLoader('file-progress', 'eslint-plugin-file-progress', () =>
    interopDefault(import('eslint-plugin-file-progress')),
  ),
  format: generateModuleLoader('format', '', () => interopDefault(import('../plugin-format'))),
  formatjs: generateModuleLoader('formatjs', 'eslint-plugin-formatjs', () =>
    interopDefault(import('eslint-plugin-formatjs')),
  ),
  functional: generateModuleLoader('functional', 'eslint-plugin-functional', () =>
    interopDefault(import('eslint-plugin-functional')),
  ),
  'github-actions': generateModuleLoader('github-actions', 'eslint-plugin-github-action', () =>
    interopDefault(import('eslint-plugin-github-action')),
  ),
  graphql: generateModuleLoader<
    Prettify<
      EslintPlugin & {
        processor: EslintProcessor;
        parser: EslintParser;
      }
    >,
    '@graphql-eslint/eslint-plugin'
  >('graphql', '@graphql-eslint/eslint-plugin', () =>
    // @ts-expect-error types mismatch
    interopDefault(import('@graphql-eslint/eslint-plugin')),
  ),
  header: generateModuleLoader('header', 'eslint-plugin-header', () =>
    interopDefault(import('eslint-plugin-header'))
      .then(setPluginRuleSchemas)
      .then(fixupPluginRules),
  ),
  headers: generateModuleLoader('headers', 'eslint-plugin-headers', () =>
    interopDefault(import('eslint-plugin-headers')),
  ),
  html: generateModuleLoader('html', '@html-eslint/eslint-plugin', () =>
    interopDefault(import('@html-eslint/eslint-plugin')),
  ),
  'html-angular': generateModuleLoader(
    'html-angular',
    '@html-eslint/eslint-plugin-angular-template',
    () => interopDefault(import('@html-eslint/eslint-plugin-angular-template')),
  ),
  'html-react': generateModuleLoader('html-react', '@html-eslint/eslint-plugin-react', () =>
    interopDefault(import('@html-eslint/eslint-plugin-react')),
  ),
  'html-scripts': generateModuleLoader('html-scripts', '', () =>
    interopDefault(import('../plugin-html-scripts')),
  ),
  'html-svelte': generateModuleLoader('html-svelte', '@html-eslint/eslint-plugin-svelte', () =>
    interopDefault(import('@html-eslint/eslint-plugin-svelte')),
  ),
  i18next: generateModuleLoader('i18next', 'eslint-plugin-i18next', () =>
    interopDefault(import('eslint-plugin-i18next')),
  ),
  import: generateModuleLoader('import', 'eslint-plugin-import-x', () =>
    interopDefault(import('eslint-plugin-import-x')),
  ),
  'import-integrity': generateModuleLoader('import-integrity', 'import-integrity-lint', () =>
    interopDefault(import('import-integrity-lint')).then(castTsEslintTypedPlugin),
  ),
  'import-zod': generateModuleLoader('import-zod', 'eslint-plugin-import-zod', () =>
    interopDefault(import('eslint-plugin-import-zod')),
  ),
  jest: generateInferredModuleLoader('jest', 'eslint-plugin-jest', () =>
    interopDefault(import('eslint-plugin-jest')),
  ),
  'jest-dom': generateModuleLoader('jest-dom', 'eslint-plugin-jest-dom', () =>
    interopDefault(import('eslint-plugin-jest-dom')).then(fixupPluginRules),
  ),
  'jest-extended': generateModuleLoader('jest-extended', 'eslint-plugin-jest-extended', () =>
    interopDefault(import('eslint-plugin-jest-extended')),
  ),
  jsdoc: generateModuleLoader('jsdoc', 'eslint-plugin-jsdoc', () =>
    interopDefault(import('eslint-plugin-jsdoc')),
  ),
  json: generateModuleLoader('json', '@eslint/json', () => interopDefault(import('@eslint/json'))),
  'json-schema-validator': generateModuleLoader(
    'json-schema-validator',
    'eslint-plugin-json-schema-validator',
    () => interopDefault(import('eslint-plugin-json-schema-validator')),
  ),
  jsonc: generateModuleLoader('jsonc', 'eslint-plugin-jsonc', () =>
    interopDefault(import('eslint-plugin-jsonc')),
  ),
  'jsx-a11y': generateModuleLoader('jsx-a11y', 'eslint-plugin-jsx-a11y-x', () =>
    interopDefault(import('eslint-plugin-jsx-a11y-x')),
  ),
  lit: generateModuleLoader('lit', 'eslint-plugin-lit', () =>
    interopDefault(import('eslint-plugin-lit')),
  ),
  'lit-a11y': generateModuleLoader('lit-a11y', 'eslint-plugin-lit-a11y', () =>
    interopDefault(import('eslint-plugin-lit-a11y')),
  ),
  lockfile: generateModuleLoader('lockfile', 'eslint-plugin-lockfile', () =>
    interopDefault(import('eslint-plugin-lockfile')),
  ),
  markdown: generateModuleLoader('markdown', '@eslint/markdown', () =>
    interopDefault(import('@eslint/markdown')),
  ),
  'markdown-links': generateModuleLoader('markdown-links', 'eslint-plugin-markdown-links', () =>
    interopDefault(import('eslint-plugin-markdown-links')),
  ),
  'markdown-preferences': generateModuleLoader<
    Prettify<
      EslintPlugin & {
        resources: (typeof import('eslint-plugin-markdown-preferences'))['resources'];
      }
    >,
    'eslint-plugin-markdown-preferences'
  >('markdown-preferences', 'eslint-plugin-markdown-preferences', () =>
    interopDefault(import('eslint-plugin-markdown-preferences')),
  ),
  math: generateModuleLoader(
    'math',
    'eslint-plugin-math',
    () =>
      interopDefault(
        import('eslint-plugin-math'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  mdx: generateModuleLoader('mdx', 'eslint-plugin-mdx', () =>
    interopDefault(import('eslint-plugin-mdx')),
  ),
  mobx: generateModuleLoader('mobx', 'eslint-plugin-mobx', () =>
    interopDefault(import('eslint-plugin-mobx')),
  ),
  mocha: generateModuleLoader('mocha', 'eslint-plugin-mocha', () =>
    interopDefault(import('eslint-plugin-mocha')),
  ),
  'module-interop': generateModuleLoader('moduleInterop', 'eslint-plugin-module-interop', () =>
    interopDefault(import('eslint-plugin-module-interop')),
  ),
  nestjs: generateModuleLoader('nestjs', '@darraghor/eslint-plugin-nestjs-typed', () =>
    interopDefault(import('@darraghor/eslint-plugin-nestjs-typed')).then((module) =>
      castTsEslintTypedPlugin(module.plugin),
    ),
  ),
  nextjs: generateModuleLoader('nextjs', '@next/eslint-plugin-next', () =>
    interopDefault(import('@next/eslint-plugin-next')),
  ),
  ngrx: generateModuleLoader('ngrx', '@ngrx/eslint-plugin', () =>
    interopDefault(import('@ngrx/eslint-plugin')).then(castTsEslintTypedPlugin),
  ),
  'no-only-tests': generateModuleLoader('no-only-tests', 'eslint-plugin-no-only-tests', () =>
    interopDefault(import('eslint-plugin-no-only-tests')),
  ),
  'no-relative-import-paths': generateModuleLoader(
    'no-relative-import-paths',
    'eslint-plugin-no-relative-import-paths',
    () => interopDefault(import('eslint-plugin-no-relative-import-paths')).then(fixupPluginRules),
  ),
  'no-secrets': generateModuleLoader('no-secrets', 'eslint-plugin-no-secrets', () =>
    interopDefault(import('eslint-plugin-no-secrets')),
  ),
  'no-unsanitized': generateModuleLoader('no-unsanitized', 'eslint-plugin-no-unsanitized', () =>
    interopDefault(import('eslint-plugin-no-unsanitized')),
  ),
  node: generateModuleLoader('node', 'eslint-plugin-n', () =>
    interopDefault(import('eslint-plugin-n')),
  ),
  'node-dependencies': generateModuleLoader(
    'node-dependencies',
    'eslint-plugin-node-dependencies',
    () => interopDefault(import('eslint-plugin-node-dependencies')),
  ),
  nuxt: generateModuleLoader('nuxt', '@nuxt/eslint-plugin', () =>
    interopDefault(import('@nuxt/eslint-plugin')),
  ),
  nx: generateModuleLoader(
    'nx',
    '@nx/eslint-plugin',
    () =>
      // @ts-expect-error types mismatch
      interopDefault(
        import('@nx/eslint-plugin'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  'package-json': generateModuleLoader('package-json', 'eslint-plugin-package-json', () =>
    interopDefault(import('eslint-plugin-package-json')),
  ),
  perfectionist: generateModuleLoader('perfectionist', 'eslint-plugin-perfectionist', () =>
    interopDefault(import('eslint-plugin-perfectionist')),
  ),
  pinia: generateModuleLoader(
    'pinia',
    'eslint-plugin-pinia',
    () =>
      interopDefault(
        import('eslint-plugin-pinia'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  playwright: generateModuleLoader('playwright', 'eslint-plugin-playwright', () =>
    interopDefault(import('eslint-plugin-playwright')),
  ),
  pnpm: generateModuleLoader('pnpm', 'eslint-plugin-pnpm', () =>
    interopDefault(import('eslint-plugin-pnpm')),
  ),
  'prefer-arrow-functions': generateModuleLoader(
    'prefer-arrow-functions',
    'eslint-plugin-prefer-arrow-functions',
    () => interopDefault(import('eslint-plugin-prefer-arrow-functions')),
  ),
  promise: generateModuleLoader('promise', 'eslint-plugin-promise', () =>
    interopDefault(import('eslint-plugin-promise')),
  ),
  qunit: generateModuleLoader('qunit', 'eslint-plugin-qunit', () =>
    interopDefault(import('eslint-plugin-qunit')),
  ),
  qwik: generateModuleLoader('qwik', 'eslint-plugin-qwik', () =>
    interopDefault(import('eslint-plugin-qwik')).then(fixupPluginRules),
  ),
  react: generateModuleLoader('react', 'eslint-plugin-react', () =>
    interopDefault(import('eslint-plugin-react')).then(fixupPluginRules),
  ),
  'react-debug': generateModuleLoader('react-debug', 'eslint-plugin-react-debug', () =>
    interopDefault(import('eslint-plugin-react-debug')),
  ),
  'react-hooks': generateModuleLoader(
    'react-hooks',
    'eslint-plugin-react-hooks',
    () =>
      interopDefault(
        import('eslint-plugin-react-hooks'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  'react-refresh': generateModuleLoader('react-refresh', 'eslint-plugin-react-refresh', () =>
    interopDefault(import('eslint-plugin-react-refresh')),
  ),
  'react-you-might-not-need-an-effect': generateModuleLoader(
    'react-you-might-not-need-an-effect',
    'eslint-plugin-react-you-might-not-need-an-effect',
    () => interopDefault(import('eslint-plugin-react-you-might-not-need-an-effect')),
  ),
  regexp: generateModuleLoader('regexp', 'eslint-plugin-regexp', () =>
    interopDefault(import('eslint-plugin-regexp')),
  ),
  remeda: generateModuleLoader(
    'remeda',
    'eslint-plugin-remeda',
    () =>
      // @ts-expect-error types mismatch
      interopDefault(
        import('eslint-plugin-remeda'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  rxjs: generateModuleLoader('rxjs', '@smarttools/eslint-plugin-rxjs', () =>
    interopDefault(import('@smarttools/eslint-plugin-rxjs')).then(castTsEslintTypedPlugin),
  ),
  safeql: generateModuleLoader('safeql', '@ts-safeql/eslint-plugin', () =>
    import('@ts-safeql/eslint-plugin/config').then((module) =>
      castTsEslintTypedPlugin(module.default.configs.useConfigFile.plugins['@ts-safeql']),
    ),
  ),
  security: generateModuleLoader('security', 'eslint-plugin-security', () =>
    interopDefault(import('eslint-plugin-security')),
  ),
  'sentences-per-line': generateModuleLoader(
    'sentences-per-line',
    'eslint-plugin-sentences-per-line',
    () => interopDefault(import('eslint-plugin-sentences-per-line')),
  ),
  solid: generateModuleLoader('solid', 'eslint-plugin-solid', () =>
    interopDefault(import('eslint-plugin-solid')).then(castTsEslintTypedPlugin),
  ),
  soml: generateModuleLoader('soml', 'eslint-soml', () => interopDefault(import('eslint-soml'))),
  sonar: generateModuleLoader('sonar', 'eslint-plugin-sonarjs', () =>
    interopDefault(import('eslint-plugin-sonarjs')),
  ),
  sql: generateModuleLoader('sql', 'eslint-plugin-sql', () =>
    interopDefault(import('eslint-plugin-sql')).then(castTsEslintTypedPlugin),
  ),
  storybook: generateModuleLoader(
    'storybook',
    'eslint-plugin-storybook',
    () =>
      // @ts-expect-error types mismatch
      interopDefault(
        import('eslint-plugin-storybook'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  // We can't `import()` `@stylistic/eslint-plugin` because it's `require()`d by eslint-plugin-vue:
  // https://github.com/vuejs/eslint-plugin-vue/blob/1b634549a9e91231e5ea79313763c69f93e678c1/lib/utils/index.js#L113
  // and `import()`ing after `require()`ing causes `ERR_INTERNAL_ASSERTION` error, see
  // https://github.com/nodejs/node/issues/54577
  stylistic: generateInferredModuleLoader('stylistic', '@stylistic/eslint-plugin', () =>
    Promise.resolve(stylistic),
  ),
  svelte: generateModuleLoader(
    'svelte',
    'eslint-plugin-svelte',
    () => interopDefault(import('eslint-plugin-svelte')),
    // Hard-depends on `svelte` package, uses it at least in `lib/utils/svelte-context.js`
    MODULE_NOT_FOUND_ERROR_CODES,
  ),
  tailwindcss: generateModuleLoader('tailwindcss', 'eslint-plugin-tailwindcss', () =>
    interopDefault(import('eslint-plugin-tailwindcss')).then(castTsEslintTypedPlugin),
  ),
  'tanstack-query': generateModuleLoader(
    'tanstack-query',
    '@tanstack/eslint-plugin-query',
    () =>
      // @ts-expect-error types mismatch
      interopDefault(
        import('@tanstack/eslint-plugin-query'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  'tanstack-router': generateModuleLoader(
    'tanstack-router',
    '@tanstack/eslint-plugin-router',
    () =>
      // @ts-expect-error types mismatch
      interopDefault(
        import('@tanstack/eslint-plugin-router'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  'tanstack-start': generateModuleLoader(
    'tanstack-start',
    '@tanstack/eslint-plugin-start',
    () =>
      // @ts-expect-error types mismatch
      interopDefault(
        import('@tanstack/eslint-plugin-start'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  'testing-library': generateModuleLoader('testing-library', 'eslint-plugin-testing-library', () =>
    interopDefault(import('eslint-plugin-testing-library')),
  ),
  toml: generateModuleLoader('toml', 'eslint-plugin-toml', () =>
    interopDefault(import('eslint-plugin-toml')),
  ),
  'tree-shaking': generateModuleLoader('tree-shaking', 'eslint-plugin-tree-shaking', () =>
    interopDefault(import('eslint-plugin-tree-shaking')).then(fixupPluginRules),
  ),
  ts: generateModuleLoader('ts', 'typescript-eslint', () =>
    interopDefault(import('typescript-eslint')).then((module) => module.plugin),
  ),
  tsdoc: generateModuleLoader('tsdoc', 'eslint-plugin-tsdoc', () =>
    interopDefault(import('eslint-plugin-tsdoc')),
  ),
  tsrx: generateModuleLoader('tsrx', '@tsrx/eslint-plugin', () =>
    interopDefault(import('@tsrx/eslint-plugin')),
  ),
  turbo: generateModuleLoader('turbo', 'eslint-plugin-turbo', () =>
    interopDefault(import('eslint-plugin-turbo')),
  ),
  un: generateModuleLoader('un', '', () => interopDefault(import('../plugin-un'))),
  unhead: generateModuleLoader('unhead', '@unhead/eslint-plugin', () =>
    interopDefault(import('@unhead/eslint-plugin')),
  ),
  unicorn: generateModuleLoader('unicorn', 'eslint-plugin-unicorn', () =>
    interopDefault(import('eslint-plugin-unicorn')),
  ),
  'unnecessary-abstractions': generateModuleLoader(
    'unnecessary-abstractions',
    'eslint-plugin-unnecessary-abstractions',
    () => interopDefault(import('eslint-plugin-unnecessary-abstractions')),
  ),
  unocss: generateModuleLoader(
    'unocss',
    '@unocss/eslint-plugin',
    () =>
      // @ts-expect-error types mismatch
      interopDefault(
        import('@unocss/eslint-plugin'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  'unused-imports': generateModuleLoader('unused-imports', 'eslint-plugin-unused-imports', () =>
    interopDefault(import('eslint-plugin-unused-imports')),
  ),
  vitest: generateInferredModuleLoader('vitest', '@vitest/eslint-plugin', () =>
    interopDefault(import('@vitest/eslint-plugin')),
  ),
  vue: generateModuleLoader('vue', 'eslint-plugin-vue', () =>
    interopDefault(import('eslint-plugin-vue')),
  ),
  'vue-i18n': generateModuleLoader(
    'vue-i18n',
    '@intlify/eslint-plugin-vue-i18n',
    () =>
      // @ts-expect-error types mismatch
      interopDefault(
        import('@intlify/eslint-plugin-vue-i18n'),
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  'vue-scoped-css': generateModuleLoader('vue-scoped-css', 'eslint-plugin-vue-scoped-css', () =>
    interopDefault(import('eslint-plugin-vue-scoped-css')).then(castTsEslintTypedPlugin),
  ),
  'vuejs-accessibility': generateModuleLoader(
    'vuejs-accessibility',
    'eslint-plugin-vuejs-accessibility',
    () => interopDefault(import('eslint-plugin-vuejs-accessibility')),
  ),
  wc: generateModuleLoader('wc', 'eslint-plugin-wc', () =>
    interopDefault(import('eslint-plugin-wc')),
  ),
  yaml: generateModuleLoader('yaml', 'eslint-plugin-yml', () =>
    interopDefault(import('eslint-plugin-yml')),
  ),
  'you-dont-need-lodash-underscore': generateModuleLoader(
    'you-dont-need-lodash-underscore',
    'eslint-plugin-you-dont-need-lodash-underscore',
    () => interopDefault(import('eslint-plugin-you-dont-need-lodash-underscore')),
  ),
  zod: generateModuleLoader('zod', 'eslint-plugin-zod', () =>
    interopDefault(import('eslint-plugin-zod')),
  ),
  'zod-core': generateModuleLoader('zod-core', 'eslint-plugin-zod-core', () =>
    interopDefault(import('eslint-plugin-zod-core')),
  ),
  'zod-mini': generateModuleLoader('zod-mini', 'eslint-plugin-zod-mini', () =>
    interopDefault(import('eslint-plugin-zod-mini')),
  ),
  'zod-openapi': generateModuleLoader('zod-openapi', 'eslint-plugin-zod-openapi', () =>
    interopDefault(import('eslint-plugin-zod-openapi'))
      .then(castTsEslintTypedPlugin)
      .then(fixupPluginRules),
  ),
} satisfies Record<string, ModuleLoader<EslintPlugin, string, boolean>>;

export type LoadablePluginPrefix = keyof typeof pluginsLoaders;
export const LOADABLE_PLUGIN_PREFIXES_LIST = Object.freeze(objectKeysUnsafe(pluginsLoaders));

export type PluginPrefix = LoadablePluginPrefix | '';

export const PLUGIN_PREFIXES_LIST: readonly PluginPrefix[] = [
  '',
  ...objectKeysUnsafe(pluginsLoaders),
];
