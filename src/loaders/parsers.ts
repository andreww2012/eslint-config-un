import {type EslintParser, type ModuleLoader, generateModuleLoader} from './shared';

export const parsersLoaders = {
  '@angular-eslint/template-parser': generateModuleLoader(
    '@angular-eslint/template-parser',
    '@angular-eslint/template-parser',
    () => import('@angular-eslint/template-parser'),
  ),
  '@html-eslint/parser': generateModuleLoader(
    '@html-eslint/parser',
    '@html-eslint/parser',
    () => import('@html-eslint/parser'),
  ),
  '@tsrx/eslint-parser': generateModuleLoader(
    '@tsrx/eslint-parser',
    '@tsrx/eslint-parser',
    () => import('@tsrx/eslint-parser'),
  ),
  'astro-eslint-parser': generateModuleLoader(
    'astro-eslint-parser',
    'astro-eslint-parser',
    () => import('astro-eslint-parser'),
  ),
  'ember-eslint-parser': generateModuleLoader(
    'ember-eslint-parser',
    'ember-eslint-parser',
    () => import('ember-eslint-parser'),
  ),
  'eslint-parser-plain': generateModuleLoader(
    'eslint-parser-plain',
    'eslint-parser-plain',
    () => import('eslint-parser-plain'),
  ),
  'graphql-eslint-parser': generateModuleLoader(
    'graphql-eslint-parser',
    '@graphql-eslint/eslint-plugin',
    () => import('@graphql-eslint/eslint-plugin').then((module) => module.parser),
  ),
  'mdx-eslint-parser': generateModuleLoader(
    'mdx-eslint-parser',
    'eslint-mdx',
    () => import('eslint-mdx'),
  ),
  'svelte-eslint-parser': generateModuleLoader(
    'svelte-eslint-parser',
    'svelte-eslint-parser',
    () => import('svelte-eslint-parser'),
  ),
  'vue-eslint-parser': generateModuleLoader(
    'vue-eslint-parser',
    'vue-eslint-parser',
    () => import('vue-eslint-parser'),
  ),
} satisfies Record<string, ModuleLoader<EslintParser, string, boolean>>;

export type ParserPrefix = keyof typeof parsersLoaders;
