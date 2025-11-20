import type {EslintPlugin} from '../eslint';
import type {OmitStrict} from '../types';
import {type MaybeArray, cloneDeep, interopDefault} from '../utils';
import {type EslintParser, type EslintProcessor, genModuleLoader} from './shared';

export const packagesLoaders = {
  ...genModuleLoader(
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
  ...genModuleLoader('astroClientSideTsProcessor', 'eslint-plugin-astro', () =>
    interopDefault(import('eslint-plugin-astro')).then(
      (module) => module.processors['client-side-ts'] as EslintProcessor,
    ),
  ),
  ...genModuleLoader('checkFileProcessor', 'eslint-plugin-check-file', () =>
    interopDefault(import('eslint-plugin-check-file')).then(
      (m) => m.processors['eslint-processor-check-file'],
    ),
  ),
  ...genModuleLoader('eslintMergeProcessors', 'eslint-merge-processors', () =>
    interopDefault(import('eslint-merge-processors')),
  ),
  ...genModuleLoader(
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
  ...genModuleLoader('eslintPluginImportX', 'eslint-plugin-import-x', () =>
    interopDefault(import('eslint-plugin-import-x')),
  ),
  ...genModuleLoader('eslintPluginMarkdown', '@eslint/markdown', () =>
    interopDefault(import('@eslint/markdown')),
  ),
  ...genModuleLoader('eslintPluginMdx', 'eslint-plugin-mdx', () =>
    interopDefault(import('eslint-plugin-mdx')),
  ),
  ...genModuleLoader('importResolverTypescript', 'eslint-import-resolver-typescript', () =>
    interopDefault(import('eslint-import-resolver-typescript')),
  ),
  ...genModuleLoader('mergeProcessors', 'eslint-merge-processors', () =>
    interopDefault(import('eslint-merge-processors')),
  ),
  ...genModuleLoader('svelteProcessor', 'eslint-plugin-svelte', () =>
    interopDefault(import('eslint-plugin-svelte')).then((m) => m.processors.svelte),
  ),
  ...genModuleLoader('tailwindCsstree', 'tailwind-csstree', () =>
    interopDefault(import('tailwind-csstree')),
  ),
  ...genModuleLoader('typescriptEslintParser', 'typescript-eslint', () =>
    interopDefault(import('typescript-eslint')).then(
      (m) => m.parser as {parseForESLint: (...args: unknown[]) => unknown},
    ),
  ),
  ...genModuleLoader('vueBlocksProcessor', 'eslint-processor-vue-blocks', () =>
    interopDefault(import('eslint-processor-vue-blocks')),
  ),
  ...genModuleLoader('vueProcessor', 'eslint-plugin-vue', () =>
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
