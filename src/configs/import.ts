import type {TypeScriptResolverOptions} from 'eslint-import-resolver-typescript';
import type {
  NewResolver as ImportPluginNewResolver,
  ImportSettings as PluginSettings,
  PluginSettings as PluginSettingsWithPrefixes,
} from 'eslint-plugin-import-x';
import {ERROR, GLOB_MARKDOWN_ALL_CODE_BLOCKS, OFF, WARNING} from '../constants';
import {generatePackageToLoadProperty} from '../loaders';
import {arraify, isNonEmptyArray, kebabCase, objectEntriesUnsafe} from '../utils';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

export interface ImportEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'import'> {
  /**
   * [`eslint-plugin-import-x`](https://npmx.dev/eslint-plugin-import-x) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned directly to `settings` flat config option with keys transformed to
   * `import-x/<original property name in kebab case>`
   * and applied to the resolved `files` and `ignores` of this config.
   *
   * Some settings are set by our config, and the settings you provide here will be merged with ours.
   * @see https://github.com/un-ts/eslint-plugin-import-x/tree/HEAD?tab=readme-ov-file#settings
   */
  settings?: PluginSettings;

  /**
   * Whether the use of dependencies from `devDependencies` is not going to be reported by
   * the [`no-extraneous-dependencies`](https://github.com/un-ts/eslint-plugin-import-x/blob/HEAD/docs/rules/no-extraneous-dependencies.md) rule. You can specify glob patterns or allow
   * universally by setting this option to `true`.
   * @default false <=> `mode` root option is set to `lib`
   */
  allowDevDependencies?: string[] | boolean;

  /**
   * Package names that will be not be reported by [`no-extraneous-dependencies`](https://github.com/un-ts/eslint-plugin-import-x/blob/HEAD/docs/rules/no-extraneous-dependencies.md) rule.
   *
   * Use case: you're linting library code and some packages are bundled.
   */
  extraneousDependenciesWhitelist?: string[];

  /**
   * Recognized automatically and normally should not be set manually.
   *
   * When enabled, creates a [`eslint-import-resolver-typescript`](https://npmx.dev/eslint-import-resolver-typescript) resolver, which settings can be overridden
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
  noDuplicatesOptions?: GetRuleOptions<'import', 'no-duplicates'>;
}

export default (async (context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    isTypescriptEnabled: context.configsMeta.ts.enabled,
    allowDevDependencies: context.rootOptions.mode !== 'lib',
  });

  const {
    settings: pluginSettings,
    allowDevDependencies,
    extraneousDependenciesWhitelist,
    isTypescriptEnabled,
    noDuplicatesOptions,
    requireModuleExtensions,
    tsResolverOptions,
  } = optionsResolved;
  const noUnresolvedIgnores = arraify(optionsResolved.importPatternsToIgnoreWhenTryingToResolve);

  const configBuilder = context.createConfigBuilder(optionsResolved, 'import');

  // Legend:
  // 🟢 - in recommended
  // 🟡 - in recommended (warns)
  // 🔵 - in recommended/typescript
  // ✖️ - X only rule

  configBuilder
    ?.addConfig([
      'import',
      {
        includeDefaultFilesAndIgnores: true,
        // For some reason running this plugin on fenced code blocks takes a lot of memory
        // (+300-500 MB when running on our codebase w/o cache as of time of writing this)
        // TODO investigate that?
        ignoresDefault: [GLOB_MARKDOWN_ALL_CODE_BLOCKS],
        ignoresDefaultMergedWithUserIgnores: true,
        settings: {
          '': {
            ...(isTypescriptEnabled &&
              (await import('eslint-plugin-import-x')).configs.typescript.settings),
            ...generatePackageToLoadProperty(
              'import-x/resolver-next',
              ['importResolverTypescript', 'eslintPluginImportX'],
              {
                valueTransformFn: {
                  fn(
                    this: {
                      isTypescriptEnabled: typeof isTypescriptEnabled;
                      tsResolverOptions: typeof tsResolverOptions;
                    },
                    {importResolverTypescript, eslintPluginImportX},
                  ) {
                    return [
                      // If the TS resolver goes after the node resolver, `import/no-deprecated` doesn't work
                      // TODO should report?
                      this.isTypescriptEnabled &&
                        (importResolverTypescript.createTypeScriptImportResolver(
                          this.tsResolverOptions,
                        ) as ImportPluginNewResolver),
                      eslintPluginImportX.createNodeResolver(),
                    ].filter((v) => typeof v === 'object');
                  },
                  scope: {isTypescriptEnabled, tsResolverOptions},
                },
              },
            ),
            ...(isTypescriptEnabled && {
              'import-x/parsers': {
                '@typescript-eslint/parser': ['.ts', '.cts', '.mts', '.tsx', '.ctsx', '.mtsx'],
              },
            }),
            ...Object.fromEntries(
              objectEntriesUnsafe(pluginSettings || {}).map(([settingName, settingValue]) => [
                `import-x/${kebabCase(settingName)}` satisfies keyof PluginSettingsWithPrefixes,
                settingValue,
              ]),
            ),
          } satisfies PluginSettingsWithPrefixes,
        },
      },
    ])
    // Versions in @since tags are from `eslint-plugin-import` plugin, unless the rule doesn't exist in it
    .addRule('consistent-type-specifier-style', OFF) /** @since 2.27.0 */
    .addRule('default', ERROR) /** @since 0.3.0 */ // 🟢
    .addRule('dynamic-import-chunkname', OFF) /** @since 2.12.0 */
    .addRule('export', ERROR) /** @since 0.7.3 */ // 🟢
    .addRule('exports-last', OFF) /** @since 2.8.0 */
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
    ]) /** @since 1.6.0 */
    .addRule('first', ERROR) /** @since 2.0.0-beta.0 */
    .addRule('group-exports', OFF) /** @since 2.9.0 */
    .addRule('max-dependencies', OFF) /** @since 1.15.0 */
    .addRule('named', isTypescriptEnabled ? OFF : ERROR) /** @since 0.3.0 */ // 🔵(disabled)
    .addRule('namespace', ERROR) /** @since 0.3.4 */ // 🟢
    .addRule('newline-after-import', ERROR) /** @since 1.7.0 */
    .addRule('no-absolute-path', ERROR) /** @since 1.15.0 */
    .addRule('no-amd', OFF) /** @since 0.13.0 */
    .addRule('no-anonymous-default-export', OFF) /** @since 2.3.0 */
    .addRule('no-commonjs', OFF) /** @since 0.13.0 */
    .addRule('no-cycle', WARNING) /** @since 2.10.0 */
    .addRule('no-default-export', ERROR) /** @since 2.9.0 */
    // Disabled when `typescript` config is enabled because it has a similar rule which works better (for example, is not triggered on `rxjs` operators)
    .addRule('no-deprecated', isTypescriptEnabled ? OFF : WARNING) /** @since 1.0.0 */
    .addRule('no-duplicates', ERROR, [
      {'prefer-inline': true, ...noDuplicatesOptions},
    ]) /** @since 0.7.9 */ // 🟡
    .addRule('no-dynamic-require', OFF) /** @since 1.16.0 */
    .addRule('no-empty-named-blocks', ERROR) /** @since 2.27.0 */
    .addRule('no-extraneous-dependencies', ERROR, [
      {
        devDependencies: allowDevDependencies,
        ...(extraneousDependenciesWhitelist?.length && {
          whitelist: extraneousDependenciesWhitelist,
        }),
      },
    ]) /** @since 1.6.0 */
    .addRule('no-import-module-exports', OFF) /** @since 2.23.0 */ // TODO enable?
    .addRule('no-internal-modules', OFF) /** @since 1.16.0 */
    .addRule('no-mutable-exports', WARNING) /** @since 1.7.0 */
    // Not very useful + false positives for axios@1.6.7?
    .addRule('no-named-as-default', OFF) /** @since 0.4.2 */ // 🟡
    .addRule('no-named-as-default-member', OFF) /** @since 1.5.0 */ // 🟡
    .addRule('no-named-default', OFF) /** @since 2.1.0 */
    .addRule('no-named-export', OFF) /** @since 2.15.0 */
    .addRule('no-namespace', OFF) /** @since 1.5.0 */
    .addRule('no-nodejs-modules', OFF) /** @since 1.6.0 */ // TODO
    .addRule('no-relative-packages', OFF) /** @since 2.23.0 */
    .addRule('no-relative-parent-imports', OFF) /** @since 2.13.0 */
    .addRule('no-rename-default', OFF) /** @since 4.1.0 */ // ✖️
    .addRule('no-restricted-paths', OFF) /** @since 1.10.0 */
    .addRule('no-self-import', ERROR) /** @since 2.9.0 */
    .addRule('no-unassigned-import', OFF) /** @since 2.0.0 */
    .addRule('no-unresolved', ERROR, [
      {
        ...(isNonEmptyArray(noUnresolvedIgnores) && {
          ignore: noUnresolvedIgnores,
        }),
      },
    ]) /** @since 0.3.13 */ // 🟢
    .addRule('no-unused-modules', OFF) /** @since 2.17.0 */
    .addRule('no-useless-path-segments', WARNING) /** @since 2.9.0 */
    .addRule('no-webpack-loader-syntax', ERROR) /** @since 2.0.0-beta.0 */
    .addRule('order', ERROR, [
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        alphabetize: {order: 'asc'},
      },
    ]) /** @since 1.6.0 */
    .addRule('prefer-default-export', OFF) /** @since 1.8.0 */
    .addRule('prefer-namespace-import', OFF) /** @since 4.16.0 */ // ✖️
    .addRule('unambiguous', OFF) /** @since 2.0.0-beta.0 */
    .enableConfigTesterForPlugin('import')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'import'>;
