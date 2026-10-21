import path from 'node:path';
import type {OmitStrict} from '../types';
import {type MaybeArray, cloneDeep, interopDefault} from '../utils';
import {type EslintProcessor, genInferredModuleLoader} from './shared';

const loadCivetProcessor = (outputExtension: '.jsx' | '.tsx') =>
  import('eslint-plugin-civet').then(({civet}): EslintProcessor => {
    const processor = civet({js: outputExtension === '.jsx', outputExtension}).processors.civet;
    return {
      ...processor,
      // The plugin names the compiled file after the absolute source path, so an ignored parent directory would exclude it
      preprocess: (text, filename) =>
        processor
          .preprocess(text, filename)
          .map((file) => ({...file, filename: path.basename(file.filename)})),
    };
  });

export const packagesLoaders = {
  _utils: genInferredModuleLoader('_utils', '_utils', () => interopDefault(import('../utils'))),

  angularExtractInlineHtmlProcessor: genInferredModuleLoader(
    'angularExtractInlineHtmlProcessor',
    '@angular-eslint/eslint-plugin-template',
    () =>
      interopDefault(import('@angular-eslint/eslint-plugin-template')).then((module) => {
        const fixedProcessor = cloneDeep(
          // eslint-disable-next-line un/no-type-assertion -- unlike its types say, older versions of the plugin have no `meta`
          module.processors['extract-inline-html'] as EslintProcessor,
        );
        fixedProcessor.meta ||= {name: 'extract-inline-html'};
        return fixedProcessor;
      }),
  ),
  astroClientSideTsProcessor: genInferredModuleLoader(
    'astroClientSideTsProcessor',
    'eslint-plugin-astro',
    () =>
      interopDefault(import('eslint-plugin-astro')).then(
        (module): EslintProcessor => module.processors['client-side-ts'],
      ),
  ),
  checkFileProcessor: genInferredModuleLoader(
    'checkFileProcessor',
    'eslint-plugin-check-file',
    () =>
      interopDefault(import('eslint-plugin-check-file')).then(
        (m) => m.processors['eslint-processor-check-file'],
      ),
  ),
  civetJsProcessor: genInferredModuleLoader('civetJsProcessor', 'eslint-plugin-civet', () =>
    loadCivetProcessor('.jsx'),
  ),
  civetTsProcessor: genInferredModuleLoader('civetTsProcessor', 'eslint-plugin-civet', () =>
    loadCivetProcessor('.tsx'),
  ),
  eslintCssTreeSyntax: genInferredModuleLoader('eslintCssTree', '@eslint/css-tree', () =>
    interopDefault(import('@eslint/css-tree/definition-syntax-data')),
  ),
  eslintMergeProcessors: genInferredModuleLoader(
    'eslintMergeProcessors',
    'eslint-merge-processors',
    () => interopDefault(import('eslint-merge-processors')),
  ),
  eslintPluginGraphql: genInferredModuleLoader(
    'eslintPluginGraphql',
    '@graphql-eslint/eslint-plugin',
    () => interopDefault(import('@graphql-eslint/eslint-plugin')),
  ),
  eslintPluginImportX: genInferredModuleLoader(
    'eslintPluginImportX',
    'eslint-plugin-import-x',
    (): Promise<Pick<typeof import('eslint-plugin-import-x'), 'createNodeResolver'>> =>
      interopDefault(import('eslint-plugin-import-x')),
  ),
  eslintPluginMarkdown: genInferredModuleLoader('eslintPluginMarkdown', '@eslint/markdown', () =>
    interopDefault(import('@eslint/markdown')),
  ),
  eslintPluginMdx: genInferredModuleLoader('eslintPluginMdx', 'eslint-plugin-mdx', () =>
    interopDefault(import('eslint-plugin-mdx')),
  ),
  htmlScriptsParser: genInferredModuleLoader('htmlScriptsParser', '', () =>
    import('../plugin-html-scripts').then(({parser}) => parser),
  ),
  htmlScriptsProcessorFactory: genInferredModuleLoader('htmlScriptsProcessorFactory', '', () =>
    import('../plugin-html-scripts').then(({createProcessor}) => createProcessor),
  ),
  importResolverTypescript: genInferredModuleLoader(
    'importResolverTypescript',
    'eslint-import-resolver-typescript',
    () => interopDefault(import('eslint-import-resolver-typescript')),
  ),
  mergeProcessors: genInferredModuleLoader('mergeProcessors', 'eslint-merge-processors', () =>
    interopDefault(import('eslint-merge-processors')),
  ),
  scsstree: genInferredModuleLoader('scsstree', '@humanwhocodes/scsstree', () =>
    interopDefault(import('@humanwhocodes/scsstree')),
  ),
  svelteProcessor: genInferredModuleLoader('svelteProcessor', 'eslint-plugin-svelte', () =>
    interopDefault(import('eslint-plugin-svelte')).then((m) => m.processors.svelte),
  ),
  tailwindCsstree: genInferredModuleLoader('tailwindCsstree', 'tailwind-csstree', () =>
    interopDefault(import('tailwind-csstree')),
  ),
  typescriptEslintParser: genInferredModuleLoader(
    'typescriptEslintParser',
    'typescript-eslint',
    () => interopDefault(import('typescript-eslint')).then((m) => m.parser),
  ),
  vueBlocksProcessor: genInferredModuleLoader(
    'vueBlocksProcessor',
    'eslint-processor-vue-blocks',
    () => interopDefault(import('eslint-processor-vue-blocks')),
  ),
  vueProcessor: genInferredModuleLoader('vueProcessor', 'eslint-plugin-vue', () =>
    interopDefault(import('eslint-plugin-vue')).then(
      // eslint-disable-next-line un/no-type-assertion -- the plugin types its processors as `any`
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
