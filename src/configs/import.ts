import type {TypeScriptResolverOptions} from 'eslint-import-resolver-typescript';
import type {
  NewResolver as ImportPluginNewResolver,
  PluginSettings as ImportPluginSettingsWithPrefixes,
} from 'eslint-plugin-import-x';
import {
  ERROR,
  GLOB_CONFIG_FILES,
  GLOB_JS_TS_X_EXTENSION,
  GLOB_MARKDOWN_ALL_CODE_BLOCKS,
  OFF,
  WARNING,
} from '../constants';
import {generatePackageToLoadProperty} from '../loaders';
import type {PickDistributed} from '../types';
import {
  type MaybeArray,
  type MaybeFn,
  arrayify,
  isNonEmptyArray,
  maybeCall,
  objectEntriesUnsafe,
  toKebabCase,
} from '../utils';
import {TESTS_CONFIG_DEFAULT_FILES, resolveFilesOption} from './shared';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnFlatConfigEntryBase,
  type UnRulesConfigPartial,
  assignDefaults,
  defineUnConfig,
} from './index';

interface ExtraneousDependenciesCheckOptions {
  /**
   * Whether the imports of the packages declared in `devDependencies` will be flagged.
   * Use the object notation to exempt the files matching the given glob patterns from this check.
   * These patterns are never merged with the default ones - use the function form of the parent
   * option to extend them.
   */
  checkDevDependencies?: boolean | {ignorePatterns: string[]};

  /**
   * Directories containing the `package.json` files the dependencies are looked up in.
   * Relative paths are resolved against
   * [the current working directory](https://nodejs.org/api/process.html#processcwd).
   *
   * By default, only the `package.json` closest to the linted file is consulted, which in a
   * monorepo means the root one is ignored for the files belonging to a workspace package.
   * Setting this option replaces that lookup: the dependencies of all the listed `package.json`
   * files are merged and applied to every linted file.
   */
  packageDir?: MaybeArray<string>;

  /**
   * Package names that are never reported.
   * Use case: you're linting a library code and some packages are bundled.
   */
  whitelist?: string[];
}

/**
 * [`eslint-plugin-import-x`](https://npmx.dev/eslint-plugin-import-x) plugin
 * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configure-shared-settings)
 * that will be assigned directly to the `settings` flat config option with keys transformed to
 * `import-x/<original property name in kebab case>`.
 *
 * Some settings are set by our config, and the settings you provide here will be merged with ours.
 * @see https://github.com/un-ts/eslint-plugin-import-x/blob/HEAD/README.md#settings
 */
export type {ImportSettings as ImportPluginSettings} from 'eslint-plugin-import-x';

/**
 * An ESLint plugin to lint `import`/`export` statements.
 *
 * 📁 Default `files`: all files
 */
export interface ImportEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'import'> {
  /**
   * Allows default exports in the files that are commonly expected to have them: config files,
   * dotfiles and Storybook stories.
   *
   * 📁 Default `files`:
   * - <code>**&#47;*.config.?([cm])[jt]s?(x)</code>
   * - <code>**&#47;.*rc.?([cm])[jt]s?(x)</code>
   * - <code>**&#47;.*.?([cm])[jt]s?(x)</code>
   * - <code>**&#47;*.stories.?([cm])[jt]s?(x)</code>
   * - <code>.storybook&#47;**&#47;*</code>
   *
   * Affected rule:
   * - [`import/no-default-export`](https://github.com/un-ts/eslint-plugin-import-x/blob/HEAD/docs/rules/no-default-export.md)
   * @default true
   */
  configAllowDefaultExport?:
    | boolean
    | UnFlatConfigEntryBase<
        ExtraPlugins,
        PickDistributed<UnRulesConfigPartial, 'import/no-default-export'>
      >;

  /**
   * Finds the imports of packages that are not declared in the closest to the linted file
   * `package.json`'s `dependencies` or `{dev,optional,peer,bundle(d)}Dependencies`.
   *
   * Possible values:
   * - boolean: `true` uses the default value described below, `false` disables the check.
   * - object: whether dev dependency imports will be flagged too, which `package.json` files the
   *   dependencies are looked up in, plus the packages that are never reported.
   *   Shallow-merged with the default value, i.e. the properties you don't provide are taken
   *   from it.
   * - array: provide rule options as-is.
   * - function: all the above values may be returned; the first argument is the list of glob
   *   patterns that should likely be ignored when the dev dependencies check is enabled (see
   *   below).
   *   The returned value is treated exactly like the directly provided one, merging included.
   *
   * By default, the check is enabled and the imports of dev dependencies are allowed everywhere.
   * If `mode` root option is set to `lib`, the default value is
   * `{checkDevDependencies: {ignorePatterns: [...]}}`, where ignored patterns are composed
   * of the `tests` config resolved `files` and likely config files globs:
   * - <code>**&#47;*.config.?([cm])[jt]s?(x)</code>
   * - <code>**&#47;.*rc.?([cm])[jt]s?(x)</code>
   *
   * The same ignored patterns are passed as the first argument of this option's function form.
   *
   * Affected rule:
   * - [`import/no-extraneous-dependencies`](https://github.com/un-ts/eslint-plugin-import-x/blob/HEAD/docs/rules/no-extraneous-dependencies.md)
   */
  extraneousDependenciesCheck?: MaybeFn<
    | boolean
    | ExtraneousDependenciesCheckOptions
    | GetRuleOptions<'import', 'no-extraneous-dependencies', 'all'>,
    [defaultIgnorePatterns: string[]]
  >;

  /**
   * Recognized automatically and normally should not be set manually.
   *
   * When enabled, creates a
   * [`eslint-import-resolver-typescript`](https://npmx.dev/eslint-import-resolver-typescript)
   * resolver, which settings can be overridden using `tsResolverOptions` option.
   */
  isTypescriptEnabled?: boolean;

  /**
   * Will be merged with the default TypeScript resolver options, if it is enabled.
   */
  tsResolverOptions?: TypeScriptResolverOptions;

  /**
   * Regular expressions of the import paths that are never reported as unresolved
   *
   * Affected rule:
   * - [`import/no-unresolved`](https://github.com/un-ts/eslint-plugin-import-x/blob/HEAD/docs/rules/no-unresolved.md)
   */
  importPatternsToIgnoreWhenTryingToResolve?: string | string[];

  /**
   * - `false` - never require extensions
   * - `true` - require extensions for JS/TS-like files
   * - `object` - granular settings for specific packages, use `*` key for setting the default for
   *   all extensions
   * @default false
   */
  requireModuleExtensions?: boolean | Record<string, 'always' | 'never' | 'ignorePackages'>;

  /**
   * Will be merged with the default value.
   * By default, type-only imports (`import type ...` from 'module') will be merged with the regular
   * imports from the same module (`import ... from 'module'`)
   *
   * Affected rule:
   * - [`import/no-duplicates`](https://github.com/un-ts/eslint-plugin-import-x/blob/HEAD/docs/rules/no-duplicates.md)
   * @default {'prefer-inline': true}
   */
  noDuplicatesOptions?: GetRuleOptions<'import', 'no-duplicates'>;
}

export default defineUnConfig<ImportEslintConfigOptions>(
  'import',
  true,
)(async (context, optionsRaw) => {
  const testsConfigOptions = context.rootOptions.configs?.tests;
  const extraneousDependenciesDefaultIgnorePatterns = [
    ...resolveFilesOption(
      typeof testsConfigOptions === 'object' ? testsConfigOptions.files : undefined,
      TESTS_CONFIG_DEFAULT_FILES,
    ),
    ...GLOB_CONFIG_FILES,
  ];

  const extraneousDependenciesCheckDefault: ExtraneousDependenciesCheckOptions = {
    ...(context.rootOptions.mode === 'lib' && {
      checkDevDependencies: {ignorePatterns: extraneousDependenciesDefaultIgnorePatterns},
    }),
  };

  const optionsResolved = assignDefaults(optionsRaw, {
    configAllowDefaultExport: true,
    isTypescriptEnabled: context.configsMeta.ts.enabled,
    extraneousDependenciesCheck: extraneousDependenciesCheckDefault,
  });

  const {
    configAllowDefaultExport,
    isTypescriptEnabled,
    noDuplicatesOptions,
    requireModuleExtensions,
    tsResolverOptions,
  } = optionsResolved;

  const pluginSettings = context.getPluginSettings('import');

  const noUnresolvedIgnores = arrayify(optionsResolved.importPatternsToIgnoreWhenTryingToResolve);

  const extraneousDependenciesCheckRaw = maybeCall(
    optionsResolved.extraneousDependenciesCheck,
    extraneousDependenciesDefaultIgnorePatterns,
  );
  const extraneousDependenciesCheck =
    extraneousDependenciesCheckRaw === true ? {} : extraneousDependenciesCheckRaw;
  const extraneousDependenciesCheckObject =
    typeof extraneousDependenciesCheck === 'object' && !Array.isArray(extraneousDependenciesCheck)
      ? {...extraneousDependenciesCheckDefault, ...extraneousDependenciesCheck}
      : undefined;
  const devDependenciesCheck = extraneousDependenciesCheckObject?.checkDevDependencies;
  const packageDir = arrayify(extraneousDependenciesCheckObject?.packageDir);

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
                `import-x/${toKebabCase(settingName)}` satisfies keyof ImportPluginSettingsWithPrefixes,
                settingValue,
              ]),
            ),
          } satisfies ImportPluginSettingsWithPrefixes,
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
    .addRule('no-cycle', OFF) /** @since 2.10.0 */
    .addRule('no-default-export', ERROR) /** @since 2.9.0 */
    // Disabled when `typescript` config is enabled because it has a similar rule which works better (for example, is not triggered on `rxjs` operators)
    .addRule('no-deprecated', isTypescriptEnabled ? OFF : WARNING) /** @since 1.0.0 */
    .addRule('no-duplicates', ERROR, [
      {'prefer-inline': true, ...noDuplicatesOptions},
    ]) /** @since 0.7.9 */ // 🟡
    .addRule('no-dynamic-require', OFF) /** @since 1.16.0 */
    .addRule('no-empty-named-blocks', ERROR) /** @since 2.27.0 */
    .addRule(
      'no-extraneous-dependencies',
      extraneousDependenciesCheck === false ? OFF : ERROR,
      Array.isArray(extraneousDependenciesCheck)
        ? extraneousDependenciesCheck
        : [
            {
              devDependencies:
                typeof devDependenciesCheck === 'object'
                  ? devDependenciesCheck.ignorePatterns
                  : !devDependenciesCheck,
              ...(isNonEmptyArray(packageDir) && {packageDir}),
              ...(isNonEmptyArray(extraneousDependenciesCheckObject?.whitelist) && {
                whitelist: extraneousDependenciesCheckObject.whitelist,
              }),
            },
          ],
    ) /** @since 1.6.0 */
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

  const configBuilderAllowDefaultExport = context.createConfigBuilder(
    configAllowDefaultExport,
    null,
  );
  configBuilderAllowDefaultExport
    ?.addConfig([
      'import/allow-default-export',
      {
        filesDefault: [
          ...GLOB_CONFIG_FILES,

          // Files starting with a dot
          `**/.*.${GLOB_JS_TS_X_EXTENSION}`,

          // Storybook
          `**/*.stories.${GLOB_JS_TS_X_EXTENSION}`,
          '.storybook/**/*',
        ],
      },
    ])
    .disableAnyRule('import', 'no-default-export')
    .addOverrides();
});
