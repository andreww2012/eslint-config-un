import type {ObjectValues} from '../types';
import {type EslintParser, type ModuleLoader, genModuleLoader} from './shared';

export const parsersLoaders = {
  ...genModuleLoader(
    '@angular-eslint/template-parser',
    '@angular-eslint/template-parser',
    () => import('@angular-eslint/template-parser'),
  ),
  ...genModuleLoader(
    '@html-eslint/parser',
    '@html-eslint/parser',
    () => import('@html-eslint/parser'),
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
  ...genModuleLoader('graphql-eslint-parser', '@graphql-eslint/eslint-plugin', () =>
    // TODO cannot infer type when building declaration files for some reason unless something like `any` is used
    // eslint-disable-next-line ts/no-unsafe-return, ts/no-explicit-any
    import('@graphql-eslint/eslint-plugin').then((m) => m.parser as any),
  ),
  ...genModuleLoader(
    'jsonc-eslint-parser',
    'jsonc-eslint-parser',
    () => import('jsonc-eslint-parser'),
  ),
  ...genModuleLoader('mdx-eslint-parser', 'eslint-mdx', () => import('eslint-mdx')),
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
} satisfies Record<string, ObjectValues<ModuleLoader<EslintParser>>>;

export type ParserPrefix = keyof typeof parsersLoaders;
