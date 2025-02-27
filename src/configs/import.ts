import {createTypeScriptImportResolver} from 'eslint-import-resolver-typescript';
import eslintPluginImportX from 'eslint-plugin-import-x';
import {ERROR, OFF, WARNING} from '../constants';
import {
  ConfigEntryBuilder,
  type ConfigSharedOptions,
  type FlatConfigEntry,
  type GetRuleOptions,
  createPluginObjectRenamer,
} from '../eslint';
import {arraify, isNonEmptyArray} from '../utils';
import type {InternalConfigOptions} from './index';

export interface ImportEslintConfigOptions extends ConfigSharedOptions<'import'> {
  /**
   * Recognized automatically and normally should not be set manually
   */
  isTypescriptEnabled?: boolean;

  /**
   * @see https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-unresolved.md#ignore
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
   * @see https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-duplicates.md
   */
  noDuplicatesOptions?: GetRuleOptions<'import/no-duplicates'>[0];
}

const pluginRenamer = createPluginObjectRenamer('import-x', 'import');

export const importEslintConfig = (
  options: ImportEslintConfigOptions = {},
  internalOptions: InternalConfigOptions = {},
): FlatConfigEntry[] => {
  const {isTypescriptEnabled, noDuplicatesOptions} = options;

  const noUnresolvedIgnores = arraify(options.importPatternsToIgnoreWhenTryingToResolve);

  const builder = new ConfigEntryBuilder<'import'>(options, internalOptions);

  builder
    .addConfig(['import', {includeDefaultFilesAndIgnores: true}], {
      settings: {
        ...(isTypescriptEnabled && eslintPluginImportX.configs.typescript.settings),
        'import-x/resolver-next': [
          // If the TS resolver goes after the node resolver, `import/no-deprecated` doesn't work
          // TODO should report?
          isTypescriptEnabled &&
            createTypeScriptImportResolver({
              alwaysTryTypes: true,
            }),
          eslintPluginImportX.createNodeResolver(),
        ].filter((v) => typeof v === 'object'),
        ...(isTypescriptEnabled && {
          'import-x/parsers': {
            '@typescript-eslint/parser': ['.ts', '.cts', '.mts', '.tsx', '.ctsx', '.mtsx'],
          },
        }),
      },
    })
    .addBulkRules(pluginRenamer(eslintPluginImportX.configs.recommended.rules))
    .addBulkRules(
      isTypescriptEnabled && pluginRenamer(eslintPluginImportX.configs.typescript.rules),
    )
    // .addRule('import/consistent-type-specifier-style', OFF)
    // .addRule('import/default', ERROR)
    // .addRule('import/dynamic-import-chunkname', OFF)
    // .addRule('import/export', ERROR)
    // .addRule('import/exports-last', OFF)
    .addRule('import/extensions', options.requireModuleExtensions ? ERROR : OFF, [
      (typeof options.requireModuleExtensions === 'object' &&
        options.requireModuleExtensions['*']) ||
        'ignorePackages',
      {
        checkTypeImports: true,
        ...(options.requireModuleExtensions === true &&
          Object.fromEntries(
            ['js', 'cjs', 'mjs', 'ts', 'cts', 'mts', 'jsx', 'tsx'].map((ext) => [ext, 'always']),
          )),
        ...(typeof options.requireModuleExtensions === 'object' && options.requireModuleExtensions),
      },
    ])
    .addRule('import/first', ERROR)
    // .addRule('import/group-exports', OFF)
    // .addRule('import/max-dependencies', OFF)
    // .addRule('import/named', ERROR | OFF) // disabled in TS config
    // .addRule('import/namespace', ERROR)
    .addRule('import/newline-after-import', ERROR)
    .addRule('import/no-absolute-path', ERROR)
    // .addRule('import/no-amd', OFF)
    // .addRule('import/no-anonymous-default-export', OFF)
    // .addRule('import/no-commonjs', OFF)
    .addRule('import/no-cycle', WARNING)
    .addRule('import/no-default-export', ERROR)
    .addRule('import/no-deprecated', WARNING)
    .addRule('import/no-duplicates', ERROR, [{'prefer-inline': true, ...noDuplicatesOptions}]) // Default: warn
    // .addRule('import/no-dynamic-require', OFF)
    .addRule('import/no-empty-named-blocks', ERROR)
    .addRule('import/no-extraneous-dependencies', ERROR, [{peerDependencies: false}])
    // .addRule('import/no-import-module-exports', OFF) // TODO enable?
    // .addRule('import/no-internal-modules', OFF)
    .addRule('import/no-mutable-exports', WARNING)
    .addRule('import/no-named-as-default-member', OFF)
    .addRule('import/no-named-as-default', OFF) // Not very useful + false positives for axios@1.6.7?
    // .addRule('import/no-named-default', OFF)
    // .addRule('import/no-named-export', OFF)
    // .addRule('import/no-namespace', OFF)
    // .addRule('import/no-nodejs-modules', OFF) // TODO
    // .addRule('import/no-relative-packages', OFF)
    // .addRule('import/no-relative-parent-imports', OFF)
    // .addRule('import/no-restricted-paths', OFF)
    .addRule('import/no-self-import', ERROR)
    // .addRule('import/no-unassigned-import', OFF)
    .addRule('import/no-unresolved', ERROR, [
      {
        ...(isNonEmptyArray(noUnresolvedIgnores) && {
          ignore: noUnresolvedIgnores,
        }),
      },
    ])
    // .addRule('import/no-unused-modules', OFF)
    .addRule('import/no-useless-path-segments', WARNING)
    .addRule('import/no-webpack-loader-syntax', ERROR)
    .addRule('import/order', ERROR, [
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        alphabetize: {order: 'asc'},
      },
    ])
    // .addRule('import/prefer-default-export', OFF)
    // .addRule('import/unambiguous', OFF)
    .addOverrides();

  return builder.getAllConfigs();
};
