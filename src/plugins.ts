import {fixupPluginRules} from '@eslint/compat';
import stylistic from '@stylistic/eslint-plugin';
import type Eslint from 'eslint';
import ourPackageJson from '../package.json' with {type: 'json'};
import type {UnConfigContext} from './configs';
import type {EslintPlugin} from './eslint';
import type {ObjectValues, Promisable} from './types';
import {type MaybeArray, arraify, interopDefault, isIn, objectKeysUnsafe, omit} from './utils';

export const OPTIONAL_PEER_DEPENDENCIES = omit(ourPackageJson.peerDependencies, ['eslint']);

const MODULE_NOT_FOUND_ERROR_CODES = ['ERR_MODULE_NOT_FOUND', 'MODULE_NOT_FOUND'];

interface LoadModuleOptions {
  throwIfNotFound?: boolean;
}

export type ModuleLoader<
  T,
  Property extends string = string,
  N extends string = string,
  PackageNullable extends boolean = true,
> = Record<
  Property,
  (
    context: UnConfigContext,
    options?: LoadModuleOptions,
  ) => Promise<{
    packageName: N;
    module: T | (PackageNullable extends true ? null : never);
  }>
>;

export function genModuleLoader<T, Property extends string, N extends string>(
  property: Property,
  packageName: N,
  module: () => Promisable<T | {default: T}>,
  ignoreErrors?: undefined,
): ModuleLoader<T, Property, N, N extends keyof typeof OPTIONAL_PEER_DEPENDENCIES ? true : false>;
export function genModuleLoader<T, Property extends string, N extends string>(
  property: Property,
  packageName: N,
  module: () => Promisable<T | {default: T}>,
  ignoreErrors: MaybeArray<string>,
): ModuleLoader<T, Property, N>;
export function genModuleLoader<T, Property extends string, N extends string>(
  property: Property,
  packageName: N,
  module: () => Promisable<T | {default: T}>,
  ignoreErrors?: MaybeArray<string>,
): ModuleLoader<T, Property, N> {
  const loader: ModuleLoader<T, Property, N>[Property] = async (context, options) => {
    const isPluginOptionalPeerDependency = packageName in OPTIONAL_PEER_DEPENDENCIES;
    try {
      const {pluginsOverrides} = context.rootOptions;
      const providedPlugin =
        pluginsOverrides && isIn(property, pluginsOverrides)
          ? (pluginsOverrides[property] as T)
          : null;
      return {module: providedPlugin || (await interopDefault(module())), packageName};
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
        return {module: null, packageName};
      }
      throw error;
    }
  };
  return {
    [property]: loader,
  } as ModuleLoader<T, Property, N>;
}

export const pluginsLoaders = {
  ...genModuleLoader(
    '@angular-eslint',
    '@angular-eslint/eslint-plugin',
    () =>
      import(
        '@angular-eslint/eslint-plugin'
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
  ),
  ...genModuleLoader(
    '@angular-eslint/template',
    '@angular-eslint/eslint-plugin-template',
    () =>
      import(
        '@angular-eslint/eslint-plugin-template'
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
  ),
  ...genModuleLoader('@cspell', '@cspell/eslint-plugin', () => import('@cspell/eslint-plugin')),
  ...genModuleLoader(
    '@eslint-community/eslint-comments',
    '@eslint-community/eslint-plugin-eslint-comments',
    () => import('@eslint-community/eslint-plugin-eslint-comments'),
  ),
  ...genModuleLoader('@eslint-react', '@eslint-react/eslint-plugin', () =>
    interopDefault(import('@eslint-react/eslint-plugin')).then(
      (m) => m.configs.all.plugins['@eslint-react'] as unknown as EslintPlugin,
    ),
  ),
  ...genModuleLoader('@eslint-react/debug', '@eslint-react/eslint-plugin', () =>
    interopDefault(import('@eslint-react/eslint-plugin')).then(
      (m) => m.configs.all.plugins['@eslint-react/debug'] as unknown as EslintPlugin,
    ),
  ),
  ...genModuleLoader('@eslint-react/dom', '@eslint-react/eslint-plugin', () =>
    interopDefault(import('@eslint-react/eslint-plugin')).then(
      (m) => m.configs.all.plugins['@eslint-react/dom'] as unknown as EslintPlugin,
    ),
  ),
  ...genModuleLoader('@eslint-react/hooks-extra', '@eslint-react/eslint-plugin', () =>
    interopDefault(import('@eslint-react/eslint-plugin')).then(
      (m) => m.configs.all.plugins['@eslint-react/hooks-extra'] as unknown as EslintPlugin,
    ),
  ),
  ...genModuleLoader('@eslint-react/naming-convention', '@eslint-react/eslint-plugin', () =>
    interopDefault(import('@eslint-react/eslint-plugin')).then(
      (m) => m.configs.all.plugins['@eslint-react/naming-convention'] as unknown as EslintPlugin,
    ),
  ),
  ...genModuleLoader('@eslint-react/web-api', '@eslint-react/eslint-plugin', () =>
    interopDefault(import('@eslint-react/eslint-plugin')).then(
      (m) => m.configs.all.plugins['@eslint-react/web-api'] as unknown as EslintPlugin,
    ),
  ),
  ...genModuleLoader(
    '@html-eslint',
    '@html-eslint/eslint-plugin',
    () => import('@html-eslint/eslint-plugin'),
  ),
  ...genModuleLoader(
    '@next/next',
    '@next/eslint-plugin-next',
    () => import('@next/eslint-plugin-next'),
  ),
  // We can't `import()` `@stylistic/eslint-plugin` because it's `require()`d by eslint-plugin-vue: https://github.com/vuejs/eslint-plugin-vue/blob/1b634549a9e91231e5ea79313763c69f93e678c1/lib/utils/index.js#L113 and `import()`ing after `require()`ing causes `ERR_INTERNAL_ASSERTION` error, see https://github.com/nodejs/node/issues/54577
  ...genModuleLoader('@stylistic', '@stylistic', () => Promise.resolve(stylistic)),
  ...genModuleLoader(
    '@tanstack/query',
    '@tanstack/eslint-plugin-query',
    () =>
      import(
        '@tanstack/eslint-plugin-query'
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  ...genModuleLoader('astro', 'eslint-plugin-astro', () => import('eslint-plugin-astro')),
  ...genModuleLoader('ava', 'eslint-plugin-ava', () => import('eslint-plugin-ava')),
  ...genModuleLoader(
    'better-tailwindcss',
    'eslint-plugin-better-tailwindcss',
    () => import('eslint-plugin-better-tailwindcss'),
  ),
  ...genModuleLoader(
    'case-police',
    'eslint-plugin-case-police',
    () => import('eslint-plugin-case-police') as Promise<EslintPlugin>,
  ),
  ...genModuleLoader('compat', 'eslint-plugin-compat', () => import('eslint-plugin-compat')),
  ...genModuleLoader('css', '@eslint/css', () => import('@eslint/css')),
  ...genModuleLoader(
    'css-in-js',
    'eslint-plugin-css',
    // @ts-expect-error types mismatch
    () => import('eslint-plugin-css') satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  ...genModuleLoader('cypress', 'eslint-plugin-cypress', () => import('eslint-plugin-cypress')),
  ...genModuleLoader(
    'de-morgan',
    'eslint-plugin-de-morgan',
    () => import('eslint-plugin-de-morgan') as Promise<EslintPlugin>,
  ),
  ...genModuleLoader('depend', 'eslint-plugin-depend', () => import('eslint-plugin-depend')),
  ...genModuleLoader('ember', 'eslint-plugin-ember', () => import('eslint-plugin-ember')),
  ...genModuleLoader(
    'erasable-syntax-only',
    'eslint-plugin-erasable-syntax-only',
    () =>
      import(
        'eslint-plugin-erasable-syntax-only'
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
  ),
  ...genModuleLoader('es', 'eslint-plugin-es-x', () => import('eslint-plugin-es-x')),
  ...genModuleLoader(
    'eslint-plugin',
    'eslint-plugin-eslint-plugin',
    () => import('eslint-plugin-eslint-plugin'),
  ),
  ...genModuleLoader(
    'file-progress',
    'eslint-plugin-file-progress',
    () => import('eslint-plugin-file-progress'),
  ),
  ...genModuleLoader(
    'graphql',
    '@graphql-eslint/eslint-plugin',
    () =>
      import('@graphql-eslint/eslint-plugin') as Promise<{
        default: EslintPlugin & {
          processor: Eslint.Linter.Processor;
          parser: Eslint.Linter.Parser;
        };
      }>,
  ),
  ...genModuleLoader('html', 'eslint-plugin-html', () => import('eslint-plugin-html')),
  ...genModuleLoader(
    'import',
    'eslint-plugin-import-x',
    () => import('eslint-plugin-import-x') as unknown as Promise<EslintPlugin>,
  ),
  ...genModuleLoader('jest', 'eslint-plugin-jest', () => import('eslint-plugin-jest')),
  ...genModuleLoader(
    'jest-extended',
    'eslint-plugin-jest-extended',
    () => import('eslint-plugin-jest-extended'),
  ),
  ...genModuleLoader('jsdoc', 'eslint-plugin-jsdoc', () => import('eslint-plugin-jsdoc')),
  ...genModuleLoader(
    'json-schema-validator',
    'eslint-plugin-json-schema-validator',
    () =>
      import(
        'eslint-plugin-json-schema-validator'
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  ...genModuleLoader(
    'jsonc',
    'eslint-plugin-jsonc',
    // @ts-expect-error types mismatch
    () => import('eslint-plugin-jsonc') satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  ...genModuleLoader('jsx-a11y', 'eslint-plugin-jsx-a11y', () => import('eslint-plugin-jsx-a11y')),
  ...genModuleLoader('markdown', '@eslint/markdown', () => import('@eslint/markdown')),
  ...genModuleLoader('mocha', 'eslint-plugin-mocha', () => import('eslint-plugin-mocha')),
  ...genModuleLoader(
    'no-only-tests',
    'eslint-plugin-no-only-tests',
    () => import('eslint-plugin-no-only-tests'),
  ),
  ...genModuleLoader('lit', 'eslint-plugin-lit', () => import('eslint-plugin-lit')),
  ...genModuleLoader('lit-a11y', 'eslint-plugin-lit-a11y', () => import('eslint-plugin-lit-a11y')),
  ...genModuleLoader(
    'math',
    'eslint-plugin-math',
    // @ts-expect-error types mismatch
    () => import('eslint-plugin-math') satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  ...genModuleLoader('mdx', 'eslint-plugin-mdx', () => import('eslint-plugin-mdx')),
  ...genModuleLoader(
    'no-type-assertion',
    'eslint-plugin-no-type-assertion',
    () => import('eslint-plugin-no-type-assertion'),
  ),
  ...genModuleLoader(
    'no-unsanitized',
    'eslint-plugin-no-unsanitized',
    () => import('eslint-plugin-no-unsanitized'),
  ),
  ...genModuleLoader('node', 'eslint-plugin-n', () => import('eslint-plugin-n')),
  ...genModuleLoader(
    'node-dependencies',
    'eslint-plugin-node-dependencies',
    () =>
      import(
        'eslint-plugin-node-dependencies'
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  ...genModuleLoader(
    'package-json',
    'eslint-plugin-package-json',
    () =>
      // @ts-expect-error types mismatch
      import('eslint-plugin-package-json') satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  ...genModuleLoader(
    'perfectionist',
    'eslint-plugin-perfectionist',
    () => import('eslint-plugin-perfectionist') as Promise<EslintPlugin>,
  ),
  ...genModuleLoader(
    'pinia',
    'eslint-plugin-pinia',
    // @ts-expect-error types mismatch
    () => import('eslint-plugin-pinia') satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  ...genModuleLoader(
    'playwright',
    'eslint-plugin-playwright',
    () => import('eslint-plugin-playwright'),
  ),
  ...genModuleLoader('pnpm', 'eslint-plugin-pnpm', () => import('eslint-plugin-pnpm')),
  ...genModuleLoader(
    'prefer-arrow-functions',
    'eslint-plugin-prefer-arrow-functions',
    () =>
      import(
        'eslint-plugin-prefer-arrow-functions'
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  ...genModuleLoader('prettier', 'eslint-plugin-prettier', () => import('eslint-plugin-prettier')),
  ...genModuleLoader('promise', 'eslint-plugin-promise', () => import('eslint-plugin-promise')),
  ...genModuleLoader('qunit', 'eslint-plugin-qunit', () => import('eslint-plugin-qunit')),
  ...genModuleLoader('qwik', 'eslint-plugin-qwik', () =>
    interopDefault(import('eslint-plugin-qwik')).then((m) => fixupPluginRules(m)),
  ),
  ...genModuleLoader('react', 'eslint-plugin-react', () => import('eslint-plugin-react')),
  ...genModuleLoader(
    'react-compiler',
    'eslint-plugin-react-compiler',
    () => import('eslint-plugin-react-compiler'),
  ),
  ...genModuleLoader(
    'react-hooks',
    'eslint-plugin-react-hooks',
    () => import('eslint-plugin-react-hooks'),
  ),
  ...genModuleLoader(
    'react-refresh',
    'eslint-plugin-react-refresh',
    () => import('eslint-plugin-react-refresh'),
  ),
  ...genModuleLoader(
    'react-you-might-not-need-an-effect',
    'eslint-plugin-react-you-might-not-need-an-effect',
    () => import('eslint-plugin-react-you-might-not-need-an-effect'),
  ),
  ...genModuleLoader('regexp', 'eslint-plugin-regexp', () => import('eslint-plugin-regexp')),
  ...genModuleLoader('security', 'eslint-plugin-security', () => import('eslint-plugin-security')),
  ...genModuleLoader(
    'solid',
    'eslint-plugin-solid',
    () => import('eslint-plugin-solid') as Promise<EslintPlugin>,
  ),
  ...genModuleLoader('sonarjs', 'eslint-plugin-sonarjs', () => import('eslint-plugin-sonarjs')),
  ...genModuleLoader(
    'storybook',
    'eslint-plugin-storybook',
    () => import('eslint-plugin-storybook') as Promise<EslintPlugin>,
  ),
  ...genModuleLoader(
    'svelte',
    'eslint-plugin-svelte',
    () => import('eslint-plugin-svelte'),
    // Hard-depends on `svelte` package, uses it at least in `lib/utils/svelte-context.js`
    MODULE_NOT_FOUND_ERROR_CODES,
  ),
  ...genModuleLoader(
    'tailwindcss',
    'eslint-plugin-tailwindcss',
    () => import('eslint-plugin-tailwindcss'),
    // Tries to import `tailwindcss/resolveConfig` which doesn't exist anymore in v4
    ['ERR_PACKAGE_PATH_NOT_EXPORTED', ...MODULE_NOT_FOUND_ERROR_CODES],
  ),
  ...genModuleLoader(
    'testing-library',
    'eslint-plugin-testing-library',
    () => import('eslint-plugin-testing-library'),
  ),
  ...genModuleLoader(
    'toml',
    'eslint-plugin-toml',
    // @ts-expect-error types mismatch
    () => import('eslint-plugin-toml') satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  ...genModuleLoader(
    'ts',
    'typescript-eslint',
    () => import('typescript-eslint').then((m) => m.plugin) as Promise<EslintPlugin>,
  ),
  ...genModuleLoader('turbo', 'eslint-plugin-turbo', () => import('eslint-plugin-turbo')),
  ...genModuleLoader('unicorn', 'eslint-plugin-unicorn', () => import('eslint-plugin-unicorn')),
  ...genModuleLoader(
    'unused-imports',
    'eslint-plugin-unused-imports',
    () => import('eslint-plugin-unused-imports'),
  ),
  ...genModuleLoader(
    'vitest',
    '@vitest/eslint-plugin',
    // @ts-expect-error types mismatch
    () => import('@vitest/eslint-plugin') satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  ...genModuleLoader('vue', 'eslint-plugin-vue', () => import('eslint-plugin-vue')),
  ...genModuleLoader(
    'vuejs-accessibility',
    'eslint-plugin-vuejs-accessibility',
    () => import('eslint-plugin-vuejs-accessibility'),
  ),
  ...genModuleLoader(
    'yml',
    'eslint-plugin-yml',
    // @ts-expect-error types mismatch
    () => import('eslint-plugin-yml') satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  ...genModuleLoader(
    'you-dont-need-lodash-underscore',
    'eslint-plugin-you-dont-need-lodash-underscore',
    () => import('eslint-plugin-you-dont-need-lodash-underscore'),
  ),
} satisfies Record<string, ObjectValues<ModuleLoader<EslintPlugin>>>;

type LoadablePluginPrefix = keyof typeof pluginsLoaders;
export const LOADABLE_PLUGIN_PREFIXES_LIST = objectKeysUnsafe(pluginsLoaders);

export type PluginPrefix = LoadablePluginPrefix | '';

export const PLUGIN_PREFIXES_LIST: readonly PluginPrefix[] = [...objectKeysUnsafe(pluginsLoaders)];

// Not included because they're often used:
// - jsonc-eslint-parser
// - typescript-eslint
export const parsersLoaders = {
  ...genModuleLoader(
    '@angular-eslint/template-parser',
    '@angular-eslint/template-parser',
    () => import('@angular-eslint/template-parser'),
  ),
  ...genModuleLoader(
    'astro-eslint-parser',
    'astro-eslint-parser',
    () => import('astro-eslint-parser'),
  ),
  ...genModuleLoader(
    'ember-eslint-parser',
    'ember-eslint-parser',
    () => import('ember-eslint-parser'),
  ),
  ...genModuleLoader(
    'svelte-eslint-parser',
    'svelte-eslint-parser',
    () => import('svelte-eslint-parser'),
  ),
  ...genModuleLoader(
    'toml-eslint-parser',
    'toml-eslint-parser',
    () => import('toml-eslint-parser'),
  ),
  ...genModuleLoader(
    'yaml-eslint-parser',
    'yaml-eslint-parser',
    () => import('yaml-eslint-parser'),
  ),
  ...genModuleLoader('vue-eslint-parser', 'vue-eslint-parser', () => import('vue-eslint-parser')),
} satisfies Record<string, ObjectValues<ModuleLoader<Eslint.Linter.Parser>>>;
export type ParserPrefix = keyof typeof parsersLoaders;
