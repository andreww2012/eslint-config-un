import {type EslintParser, type ModuleLoader, genModuleLoader} from './shared';

export const parsersLoaders = {
  '@angular-eslint/template-parser': genModuleLoader(
    '@angular-eslint/template-parser',
    '@angular-eslint/template-parser',
    () => import('@angular-eslint/template-parser'),
  ),
  'astro-eslint-parser': genModuleLoader(
    'astro-eslint-parser',
    'astro-eslint-parser',
    () => import('astro-eslint-parser'),
  ),
  'ember-eslint-parser': genModuleLoader(
    'ember-eslint-parser',
    'ember-eslint-parser',
    () => import('ember-eslint-parser'),
  ),
  'eslint-parser-plain': genModuleLoader(
    'eslint-parser-plain',
    'eslint-parser-plain',
    () => import('eslint-parser-plain'),
  ),
  'graphql-eslint-parser': genModuleLoader(
    'graphql-eslint-parser',
    '@graphql-eslint/eslint-plugin',
    () =>
      // TODO cannot infer type when building declaration files for some reason unless something like `any` is used
      // eslint-disable-next-line ts/no-unsafe-return, ts/no-explicit-any
      import('@graphql-eslint/eslint-plugin').then((m) => m.parser as any),
  ),
  'jsonc-eslint-parser': genModuleLoader(
    'jsonc-eslint-parser',
    'jsonc-eslint-parser',
    () => import('jsonc-eslint-parser'),
  ),
  'mdx-eslint-parser': genModuleLoader(
    'mdx-eslint-parser',
    'eslint-mdx',
    () => import('eslint-mdx'),
  ),
  'svelte-eslint-parser': genModuleLoader(
    'svelte-eslint-parser',
    'svelte-eslint-parser',
    () => import('svelte-eslint-parser'),
  ),
  'vue-eslint-parser': genModuleLoader(
    'vue-eslint-parser',
    'vue-eslint-parser',
    () => import('vue-eslint-parser'),
  ),
} satisfies Record<string, ModuleLoader<EslintParser, string, boolean>>;

export type ParserPrefix = keyof typeof parsersLoaders;
