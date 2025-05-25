import type {TypeScriptResolverOptions} from 'eslint-import-resolver-typescript';
import type {PluginSettings} from 'eslint-plugin-import-x';
import {ERROR, OFF, WARNING} from '../constants';
import {type GetRuleOptions, type UnConfigOptions, createConfigBuilder} from '../eslint';
import {pluginsLoaders} from '../plugins';
import {arraify, assignDefaults, interopDefault, isNonEmptyArray} from '../utils';
import type {UnConfigFn} from './index';

export interface ImportEslintConfigOptions extends UnConfigOptions<'import'> {
  /**
   * [`eslint-plugin-import-x`](https://npmjs.com/eslint-plugin-import-x) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `settings` object as-is and applied to the specified `files` and `ignores`.
   *
   * Some settings are set by our config, and the settings you provide here will be merged with ours.
   * @see https://github.com/un-ts/eslint-plugin-import-x/tree/HEAD?tab=readme-ov-file#settings
   */
  settings?: PluginSettings;

  /**
   * Recognized automatically and normally should not be set manually.
   *
   * When enabled, creates a [`eslint-import-resolver-typescript`](https://npmjs.com/eslint-import-resolver-typescript) resolver, which settings can be overridden
   * using `tsResolverOptions` option.
   */
  isTypescriptEnabled?: boolean;

  /**
   * Will be merged with the default TypeScript resolver options, if it is enabled.
   */
  tsResolverOptions?: TypeScriptResolverOptions;

  /**
   * @see https://github.com/un-ts/eslint-plugin-import-x/blob/HEAD/docs/rules/no-unresolved.md#ignore
   */
  importPatternsToIgnoreWhenTryingToResolve?: string | string[];

  /**
   * - `false` - never require extensions
   * - `true` - require extensions for JS/TS-like files
   * - `object` - granular settings for specific packages, use `*` key for setting the default for all extensions
   * @default false
   */
  requireModuleExtensions?: boolean | Record<string, 'always' | 'never' | 'ignorePackages'>;

  /**
   * Will be merged with the default value. By default, type-only imports (`import type ...` from 'module') will be merged with the regular imports from the same module (`import ... from 'module'`)
   * @default {'prefer-inline': true}
   * @see https://github.com/un-ts/eslint-plugin-import-x/blob/HEAD/docs/rules/no-duplicates.md
   */
  noDuplicatesOptions?: GetRuleOptions<'import', 'no-duplicates'>[0];
}

export const importUnConfig: UnConfigFn<'import'> = async (context) => {
  const [eslintPluginImportX, {createTypeScriptImportResolver}] = await Promise.all([
    pluginsLoaders.import() as unknown as Promise<typeof import('eslint-plugin-import-x')>,
    interopDefault(import('eslint-import-resolver-typescript')),
  ]);

  const optionsRaw = context.rootOptions.configs?.import;
  const optionsResolved = assignDefaults(optionsRaw, {
    isTypescriptEnabled: context.configsMeta.ts.enabled,
  } satisfies ImportEslintConfigOptions);

  const {
    settings: pluginSettings,
    isTypescriptEnabled,
    tsResolverOptions,
    noDuplicatesOptions,
    requireModuleExtensions,
  } = optionsResolved;
  const noUnresolvedIgnores = arraify(optionsResolved.importPatternsToIgnoreWhenTryingToResolve);

  const configBuilder = createConfigBuilder(context, optionsResolved, 'import');

  // Legend:
  // 🟢 - in recommended
  // 🟡 - in recommended (warns)
  // 🔵 - in recommended/typescript

  configBuilder
    ?.addConfig(['import', {includeDefaultFilesAndIgnores: true}], {
      settings: {
        ...(isTypescriptEnabled && eslintPluginImportX.configs.typescript.settings),
        'import-x/resolver-next': [
          // If the TS resolver goes after the node resolver, `import/no-deprecated` doesn't work
          // TODO should report?
          isTypescriptEnabled && createTypeScriptImportResolver(tsResolverOptions),
          eslintPluginImportX.createNodeResolver(),
        ].filter((v) => typeof v === 'object'),
        ...(isTypescriptEnabled && {
          'import-x/parsers': {
            '@typescript-eslint/parser': ['.ts', '.cts', '.mts', '.tsx', '.ctsx', '.mtsx'],
          },
        }),
        ...pluginSettings,
      },
    })
    .addRule('consistent-type-specifier-style', OFF)
    .addRule('default', ERROR) // 🟢
    .addRule('dynamic-import-chunkname', OFF)
    .addRule('export', ERROR) // 🟢
    .addRule('exports-last', OFF)
    .addRule('extensions', requireModuleExtensions ? ERROR : OFF, [
      (typeof requireModuleExtensions === 'object' && requireModuleExtensions['*']) ||
        'ignorePackages',
      {
        checkTypeImports: true,
        ...(requireModuleExtensions === true &&
          Object.fromEntries(
            ['js', 'cjs', 'mjs', 'ts', 'cts', 'mts', 'jsx', 'tsx'].map((ext) => [ext, 'always']),
          )),
        ...(typeof requireModuleExtensions === 'object' && requireModuleExtensions),
      },
    ])
    .addRule('first', ERROR)
    .addRule('group-exports', OFF)
    .addRule('max-dependencies', OFF)
    .addRule('named', isTypescriptEnabled ? OFF : ERROR) // 🔵(disabled)
    .addRule('namespace', ERROR) // 🟢
    .addRule('newline-after-import', ERROR)
    .addRule('no-absolute-path', ERROR)
    .addRule('no-amd', OFF)
    .addRule('no-anonymous-default-export', OFF)
    .addRule('no-commonjs', OFF)
    .addRule('no-cycle', WARNING)
    .addRule('no-default-export', ERROR)
    // Disabled when `typescript` config is enabled because it has a similar rule which works better (for example, is not triggered on `rxjs` operators)
    .addRule('no-deprecated', isTypescriptEnabled ? OFF : WARNING)
    .addRule('no-duplicates', ERROR, [{'prefer-inline': true, ...noDuplicatesOptions}]) // 🟡
    .addRule('no-dynamic-require', OFF)
    .addRule('no-empty-named-blocks', ERROR)
    .addRule('no-extraneous-dependencies', ERROR, [
      {
        devDependencies: context.rootOptions.mode !== 'lib',
      },
    ])
    .addRule('no-import-module-exports', OFF) // TODO enable?
    .addRule('no-internal-modules', OFF)
    .addRule('no-mutable-exports', WARNING)
    .addRule('no-named-as-default-member', OFF) // 🟡
    // Not very useful + false positives for axios@1.6.7?
    .addRule('no-named-as-default', OFF) // 🟡
    .addRule('no-named-default', OFF)
    .addRule('no-named-export', OFF)
    .addRule('no-namespace', OFF)
    .addRule('no-nodejs-modules', OFF) // TODO
    .addRule('no-relative-packages', OFF)
    .addRule('no-relative-parent-imports', OFF)
    .addRule('no-restricted-paths', OFF)
    .addRule('no-self-import', ERROR)
    .addRule('no-unassigned-import', OFF)
    .addRule('no-unresolved', ERROR, [
      {
        ...(isNonEmptyArray(noUnresolvedIgnores) && {
          ignore: noUnresolvedIgnores,
        }),
      },
    ]) // 🟢
    .addRule('no-unused-modules', OFF)
    .addRule('no-useless-path-segments', WARNING)
    .addRule('no-webpack-loader-syntax', ERROR)
    .addRule('order', ERROR, [
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        alphabetize: {order: 'asc'},
      },
    ])
    .addRule('prefer-default-export', OFF)
    .addRule('unambiguous', OFF)
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};
