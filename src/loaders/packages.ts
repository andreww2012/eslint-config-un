import type {EslintPlugin} from '../eslint/eslint-types';
import type {OmitStrict} from '../types';
import {type MaybeArray, cloneDeep, interopDefault} from '../utils';
import {type EslintParser, type EslintProcessor, genModuleLoader} from './shared';

export const packagesLoaders = {
  _utils: genModuleLoader('_utils', '_utils', () => interopDefault(import('../utils'))),

  angularExtractInlineHtmlProcessor: genModuleLoader(
    'angularExtractInlineHtmlProcessor',
    '@angular-eslint/eslint-plugin-template',
    () =>
      interopDefault(import('@angular-eslint/eslint-plugin-template')).then((module) => {
        const fixedProcessor = cloneDeep(
          module.processors['extract-inline-html'] as EslintProcessor,
        );
        fixedProcessor.meta ||= {name: 'extract-inline-html'};
        return fixedProcessor;
      }),
  ),
  astroClientSideTsProcessor: genModuleLoader(
    'astroClientSideTsProcessor',
    'eslint-plugin-astro',
    () =>
      interopDefault(import('eslint-plugin-astro')).then(
        (module) => module.processors['client-side-ts'] as EslintProcessor,
      ),
  ),
  checkFileProcessor: genModuleLoader('checkFileProcessor', 'eslint-plugin-check-file', () =>
    interopDefault(import('eslint-plugin-check-file')).then(
      (m) => m.processors['eslint-processor-check-file'],
    ),
  ),
  eslintCssTreeSyntax: genModuleLoader('eslintCssTree', '@eslint/css-tree', () =>
    interopDefault(import('@eslint/css-tree/definition-syntax-data')),
  ),
  eslintMergeProcessors: genModuleLoader('eslintMergeProcessors', 'eslint-merge-processors', () =>
    interopDefault(import('eslint-merge-processors')),
  ),
  eslintPluginGraphql: genModuleLoader(
    'eslintPluginGraphql',
    '@graphql-eslint/eslint-plugin',
    () =>
      interopDefault(import('@graphql-eslint/eslint-plugin')) as Promise<
        EslintPlugin & {
          processor: EslintProcessor;
          parser: EslintParser;
        }
      >,
  ),
  eslintPluginImportX: genModuleLoader(
    'eslintPluginImportX',
    'eslint-plugin-import-x',
    () =>
      interopDefault(import('eslint-plugin-import-x')) as Promise<
        Pick<typeof import('eslint-plugin-import-x'), 'createNodeResolver'>
      >,
  ),
  eslintPluginMarkdown: genModuleLoader('eslintPluginMarkdown', '@eslint/markdown', () =>
    interopDefault(import('@eslint/markdown')),
  ),
  eslintPluginMdx: genModuleLoader('eslintPluginMdx', 'eslint-plugin-mdx', () =>
    interopDefault(import('eslint-plugin-mdx')),
  ),
  importResolverTypescript: genModuleLoader(
    'importResolverTypescript',
    'eslint-import-resolver-typescript',
    () => interopDefault(import('eslint-import-resolver-typescript')),
  ),
  mergeProcessors: genModuleLoader('mergeProcessors', 'eslint-merge-processors', () =>
    interopDefault(import('eslint-merge-processors')),
  ),
  svelteProcessor: genModuleLoader('svelteProcessor', 'eslint-plugin-svelte', () =>
    interopDefault(import('eslint-plugin-svelte')).then((m) => m.processors.svelte),
  ),
  tailwindCsstree: genModuleLoader('tailwindCsstree', 'tailwind-csstree', () =>
    interopDefault(import('tailwind-csstree')),
  ),
  typescriptEslintParser: genModuleLoader('typescriptEslintParser', 'typescript-eslint', () =>
    interopDefault(import('typescript-eslint')).then(
      (m) => m.parser as {parseForESLint: (...args: unknown[]) => unknown},
    ),
  ),
  vueBlocksProcessor: genModuleLoader('vueBlocksProcessor', 'eslint-processor-vue-blocks', () =>
    interopDefault(import('eslint-processor-vue-blocks')),
  ),
  vueProcessor: genModuleLoader('vueProcessor', 'eslint-plugin-vue', () =>
    interopDefault(import('eslint-plugin-vue')).then(
      (module) => module.processors['.vue'] as EslintProcessor,
    ),
  ),
};

export type LoadablePackagePrefix = keyof typeof packagesLoaders;

export const packageToLoadSymbol = Symbol('eslint-config-un packageToLoad');
export interface PackageToLoadInfo<
  Packages extends LoadablePackagePrefix = LoadablePackagePrefix,
  ValueTransformFnContext = unknown,
> {
  package: MaybeArray<Packages>;
  property: string;
  valueTransformFn?: {
    fn: (
      this: ValueTransformFnContext,
      modules: {
        [Package in Packages]: Awaited<
          ReturnType<(typeof packagesLoaders)[Package & LoadablePackagePrefix]>
        >['module'] & {};
      },
      existingPropertyValue: unknown,
    ) => unknown;
    scope?: ValueTransformFnContext;
  };
}
export const generatePackageToLoadProperty = <
  const Packages extends LoadablePackagePrefix,
  ValueTransformFnContext,
>(
  property: string,
  packageIds: MaybeArray<Packages>,
  options: OmitStrict<
    PackageToLoadInfo<Packages, ValueTransformFnContext>,
    'package' | 'property'
  > = {},
) => ({
  [packageToLoadSymbol]: {
    package: packageIds,
    property,
    ...options,
  } satisfies PackageToLoadInfo<Packages, ValueTransformFnContext>,
});
