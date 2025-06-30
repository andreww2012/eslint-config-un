import {fixupPluginRules} from '@eslint/compat';
import stylistic from '@stylistic/eslint-plugin';
import type Eslint from 'eslint';
import ourPackageJson from '../package.json' with {type: 'json'};
import type {UnConfigContext} from './configs';
import type {EslintPlugin} from './eslint';
import type {ObjectValues, Promisable} from './types';
import {type MaybeArray, arraify, interopDefault, isIn, objectKeysUnsafe, omit} from './utils';

export const OPTIONAL_PLUGINS_PACKAGE_NAMES = omit(ourPackageJson.peerDependencies, ['eslint']);

const MODULE_NOT_FOUND_ERROR_CODES = ['ERR_MODULE_NOT_FOUND', 'MODULE_NOT_FOUND'];

interface LoadPluginOptions {
  throwIfNotFound?: boolean;
}

type PluginLoader<
  T,
  Prefix extends string,
  N extends string,
  PackageNullable extends boolean = true,
> = Record<
  Prefix,
  (
    context: UnConfigContext,
    options?: LoadPluginOptions,
  ) => Promise<{
    packageName: N;
    module: T | (PackageNullable extends true ? null : never);
  }>
>;

export function genPluginLoader<T, Prefix extends string, N extends string>(
  prefix: Prefix,
  packageName: N,
  module: () => Promisable<T | {default: T}>,
  ignoreErrors?: undefined,
): PluginLoader<T, Prefix, N, N extends keyof typeof OPTIONAL_PLUGINS_PACKAGE_NAMES ? true : false>;
export function genPluginLoader<T, Prefix extends string, N extends string>(
  prefix: Prefix,
  packageName: N,
  module: () => Promisable<T | {default: T}>,
  ignoreErrors: MaybeArray<string>,
): PluginLoader<T, Prefix, N>;
export function genPluginLoader<T, Prefix extends string, N extends string>(
  prefix: Prefix,
  packageName: N,
  module: () => Promisable<T | {default: T}>,
  ignoreErrors?: MaybeArray<string>,
): PluginLoader<T, Prefix, N> {
  const loader: PluginLoader<T, Prefix, N>[Prefix] = async (context, options) => {
    const isPluginOptionalPeerDependency = packageName in OPTIONAL_PLUGINS_PACKAGE_NAMES;
    try {
      const {pluginsOverrides} = context.rootOptions;
      const providedPlugin =
        pluginsOverrides && isIn(prefix, pluginsOverrides) ? (pluginsOverrides[prefix] as T) : null;
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
    [prefix]: loader,
  } as PluginLoader<T, Prefix, N>;
}

export const pluginsLoaders = {
  ...genPluginLoader('@cspell', '@cspell/eslint-plugin', () => import('@cspell/eslint-plugin')),
  ...genPluginLoader(
    '@eslint-community/eslint-comments',
    '@eslint-community/eslint-plugin-eslint-comments',
    () => import('@eslint-community/eslint-plugin-eslint-comments'),
  ),
  ...genPluginLoader('@eslint-react', '@eslint-react/eslint-plugin', () =>
    interopDefault(import('@eslint-react/eslint-plugin')).then(
      (m) => m.configs.all.plugins['@eslint-react'] as unknown as EslintPlugin,
    ),
  ),
  ...genPluginLoader('@eslint-react/debug', '@eslint-react/eslint-plugin', () =>
    interopDefault(import('@eslint-react/eslint-plugin')).then(
      (m) => m.configs.all.plugins['@eslint-react/debug'] as unknown as EslintPlugin,
    ),
  ),
  ...genPluginLoader('@eslint-react/dom', '@eslint-react/eslint-plugin', () =>
    interopDefault(import('@eslint-react/eslint-plugin')).then(
      (m) => m.configs.all.plugins['@eslint-react/dom'] as unknown as EslintPlugin,
    ),
  ),
  ...genPluginLoader('@eslint-react/hooks-extra', '@eslint-react/eslint-plugin', () =>
    interopDefault(import('@eslint-react/eslint-plugin')).then(
      (m) => m.configs.all.plugins['@eslint-react/hooks-extra'] as unknown as EslintPlugin,
    ),
  ),
  ...genPluginLoader('@eslint-react/naming-convention', '@eslint-react/eslint-plugin', () =>
    interopDefault(import('@eslint-react/eslint-plugin')).then(
      (m) => m.configs.all.plugins['@eslint-react/naming-convention'] as unknown as EslintPlugin,
    ),
  ),
  ...genPluginLoader('@eslint-react/web-api', '@eslint-react/eslint-plugin', () =>
    interopDefault(import('@eslint-react/eslint-plugin')).then(
      (m) => m.configs.all.plugins['@eslint-react/web-api'] as unknown as EslintPlugin,
    ),
  ),
  ...genPluginLoader(
    '@html-eslint',
    '@html-eslint/eslint-plugin',
    () => import('@html-eslint/eslint-plugin'),
  ),
  ...genPluginLoader(
    '@next/next',
    '@next/eslint-plugin-next',
    () => import('@next/eslint-plugin-next'),
  ),
  // We can't `import()` `@stylistic/eslint-plugin` because it's `require()`d by eslint-plugin-vue: https://github.com/vuejs/eslint-plugin-vue/blob/1b634549a9e91231e5ea79313763c69f93e678c1/lib/utils/index.js#L113 and `import()`ing after `require()`ing causes `ERR_INTERNAL_ASSERTION` error, see https://github.com/nodejs/node/issues/54577
  ...genPluginLoader('@stylistic', '@stylistic', () => Promise.resolve(stylistic)),
  ...genPluginLoader(
    '@tanstack/query',
    '@tanstack/eslint-plugin-query',
    () =>
      import(
        '@tanstack/eslint-plugin-query'
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  ...genPluginLoader('astro', 'eslint-plugin-astro', () => import('eslint-plugin-astro')),
  ...genPluginLoader('ava', 'eslint-plugin-ava', () => import('eslint-plugin-ava')),
  ...genPluginLoader(
    'better-tailwindcss',
    'eslint-plugin-better-tailwindcss',
    () => import('eslint-plugin-better-tailwindcss'),
  ),
  ...genPluginLoader(
    'case-police',
    'eslint-plugin-case-police',
    () => import('eslint-plugin-case-police') as Promise<EslintPlugin>,
  ),
  ...genPluginLoader('css', '@eslint/css', () => import('@eslint/css')),
  ...genPluginLoader(
    'css-in-js',
    'eslint-plugin-css',
    // @ts-expect-error types mismatch
    () => import('eslint-plugin-css') satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  ...genPluginLoader('cypress', 'eslint-plugin-cypress', () => import('eslint-plugin-cypress')),
  ...genPluginLoader(
    'de-morgan',
    'eslint-plugin-de-morgan',
    () => import('eslint-plugin-de-morgan') as Promise<EslintPlugin>,
  ),
  ...genPluginLoader('depend', 'eslint-plugin-depend', () => import('eslint-plugin-depend')),
  ...genPluginLoader('ember', 'eslint-plugin-ember', () => import('eslint-plugin-ember')),
  ...genPluginLoader(
    'erasable-syntax-only',
    'eslint-plugin-erasable-syntax-only',
    () =>
      import(
        'eslint-plugin-erasable-syntax-only'
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>,
  ),
  ...genPluginLoader('es', 'eslint-plugin-es-x', () => import('eslint-plugin-es-x')),
  ...genPluginLoader(
    'eslint-plugin',
    'eslint-plugin-eslint-plugin',
    () => import('eslint-plugin-eslint-plugin'),
  ),
  ...genPluginLoader(
    'file-progress',
    'eslint-plugin-file-progress',
    () => import('eslint-plugin-file-progress'),
  ),
  ...genPluginLoader(
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
  ...genPluginLoader('html', 'eslint-plugin-html', () => import('eslint-plugin-html')),
  ...genPluginLoader(
    'import',
    'eslint-plugin-import-x',
    () => import('eslint-plugin-import-x') as unknown as Promise<EslintPlugin>,
  ),
  ...genPluginLoader('jest', 'eslint-plugin-jest', () => import('eslint-plugin-jest')),
  ...genPluginLoader(
    'jest-extended',
    'eslint-plugin-jest-extended',
    () => import('eslint-plugin-jest-extended'),
  ),
  ...genPluginLoader('jsdoc', 'eslint-plugin-jsdoc', () => import('eslint-plugin-jsdoc')),
  ...genPluginLoader(
    'json-schema-validator',
    'eslint-plugin-json-schema-validator',
    () =>
      import(
        'eslint-plugin-json-schema-validator'
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  ...genPluginLoader(
    'jsonc',
    'eslint-plugin-jsonc',
    // @ts-expect-error types mismatch
    () => import('eslint-plugin-jsonc') satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  ...genPluginLoader('jsx-a11y', 'eslint-plugin-jsx-a11y', () => import('eslint-plugin-jsx-a11y')),
  ...genPluginLoader('markdown', '@eslint/markdown', () => import('@eslint/markdown')),
  ...genPluginLoader(
    'math',
    'eslint-plugin-math',
    // @ts-expect-error types mismatch
    () => import('eslint-plugin-math') satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  ...genPluginLoader('mdx', 'eslint-plugin-mdx', () => import('eslint-plugin-mdx')),
  ...genPluginLoader(
    'no-type-assertion',
    'eslint-plugin-no-type-assertion',
    () => import('eslint-plugin-no-type-assertion'),
  ),
  ...genPluginLoader(
    'no-unsanitized',
    'eslint-plugin-no-unsanitized',
    () => import('eslint-plugin-no-unsanitized'),
  ),
  ...genPluginLoader('node', 'eslint-plugin-n', () => import('eslint-plugin-n')),
  ...genPluginLoader(
    'node-dependencies',
    'eslint-plugin-node-dependencies',
    () =>
      import(
        'eslint-plugin-node-dependencies'
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  ...genPluginLoader(
    'package-json',
    'eslint-plugin-package-json',
    () =>
      // @ts-expect-error types mismatch
      import('eslint-plugin-package-json') satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  ...genPluginLoader(
    'perfectionist',
    'eslint-plugin-perfectionist',
    () => import('eslint-plugin-perfectionist') as Promise<EslintPlugin>,
  ),
  ...genPluginLoader(
    'pinia',
    'eslint-plugin-pinia',
    // @ts-expect-error types mismatch
    () => import('eslint-plugin-pinia') satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  ...genPluginLoader(
    'playwright',
    'eslint-plugin-playwright',
    () => import('eslint-plugin-playwright'),
  ),
  ...genPluginLoader('pnpm', 'eslint-plugin-pnpm', () => import('eslint-plugin-pnpm')),
  ...genPluginLoader(
    'prefer-arrow-functions',
    'eslint-plugin-prefer-arrow-functions',
    () =>
      import(
        'eslint-plugin-prefer-arrow-functions'
        // @ts-expect-error types mismatch
      ) satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  ...genPluginLoader('prettier', 'eslint-plugin-prettier', () => import('eslint-plugin-prettier')),
  ...genPluginLoader('promise', 'eslint-plugin-promise', () => import('eslint-plugin-promise')),
  ...genPluginLoader('qwik', 'eslint-plugin-qwik', () =>
    interopDefault(import('eslint-plugin-qwik')).then((m) => fixupPluginRules(m)),
  ),
  ...genPluginLoader('react', 'eslint-plugin-react', () => import('eslint-plugin-react')),
  ...genPluginLoader(
    'react-compiler',
    'eslint-plugin-react-compiler',
    () => import('eslint-plugin-react-compiler'),
  ),
  ...genPluginLoader(
    'react-hooks',
    'eslint-plugin-react-hooks',
    () => import('eslint-plugin-react-hooks'),
  ),
  ...genPluginLoader(
    'react-refresh',
    'eslint-plugin-react-refresh',
    () => import('eslint-plugin-react-refresh'),
  ),
  ...genPluginLoader(
    'react-you-might-not-need-an-effect',
    'eslint-plugin-react-you-might-not-need-an-effect',
    () => import('eslint-plugin-react-you-might-not-need-an-effect'),
  ),
  ...genPluginLoader('regexp', 'eslint-plugin-regexp', () => import('eslint-plugin-regexp')),
  ...genPluginLoader('security', 'eslint-plugin-security', () => import('eslint-plugin-security')),
  ...genPluginLoader(
    'solid',
    'eslint-plugin-solid',
    () => import('eslint-plugin-solid') as Promise<EslintPlugin>,
  ),
  ...genPluginLoader('sonarjs', 'eslint-plugin-sonarjs', () => import('eslint-plugin-sonarjs')),
  ...genPluginLoader(
    'storybook',
    'eslint-plugin-storybook',
    () => import('eslint-plugin-storybook') as Promise<EslintPlugin>,
  ),
  ...genPluginLoader(
    'svelte',
    'eslint-plugin-svelte',
    () => import('eslint-plugin-svelte'),
    // Hard-depends on `svelte` package, uses it at least in `lib/utils/svelte-context.js`
    MODULE_NOT_FOUND_ERROR_CODES,
  ),
  ...genPluginLoader(
    'tailwindcss',
    'eslint-plugin-tailwindcss',
    () => import('eslint-plugin-tailwindcss'),
    // Tries to import `tailwindcss/resolveConfig` which doesn't exist anymore in v4
    ['ERR_PACKAGE_PATH_NOT_EXPORTED', ...MODULE_NOT_FOUND_ERROR_CODES],
  ),
  ...genPluginLoader(
    'testing-library',
    'eslint-plugin-testing-library',
    () => import('eslint-plugin-testing-library'),
  ),
  ...genPluginLoader(
    'toml',
    'eslint-plugin-toml',
    // @ts-expect-error types mismatch
    () => import('eslint-plugin-toml') satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  ...genPluginLoader(
    'ts',
    'typescript-eslint',
    () => import('typescript-eslint').then((m) => m.plugin) as Promise<EslintPlugin>,
  ),
  ...genPluginLoader('turbo', 'eslint-plugin-turbo', () => import('eslint-plugin-turbo')),
  ...genPluginLoader('unicorn', 'eslint-plugin-unicorn', () => import('eslint-plugin-unicorn')),
  ...genPluginLoader(
    'unused-imports',
    'eslint-plugin-unused-imports',
    () => import('eslint-plugin-unused-imports'),
  ),
  ...genPluginLoader('vitest', '@vitest/eslint-plugin', () => import('@vitest/eslint-plugin')),
  ...genPluginLoader('vue', 'eslint-plugin-vue', () => import('eslint-plugin-vue')),
  ...genPluginLoader(
    'vuejs-accessibility',
    'eslint-plugin-vuejs-accessibility',
    () => import('eslint-plugin-vuejs-accessibility'),
  ),
  ...genPluginLoader(
    'yml',
    'eslint-plugin-yml',
    // @ts-expect-error types mismatch
    () => import('eslint-plugin-yml') satisfies Promise<EslintPlugin> as Promise<EslintPlugin>,
  ),
  ...genPluginLoader(
    'you-dont-need-lodash-underscore',
    'eslint-plugin-you-dont-need-lodash-underscore',
    () => import('eslint-plugin-you-dont-need-lodash-underscore'),
  ),
} satisfies Record<string, ObjectValues<PluginLoader<EslintPlugin, string, string>>>;

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
