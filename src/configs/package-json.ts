import eslintPluginPackageJsonRecommendedConfig from 'eslint-plugin-package-json/configs/recommended';
import jsoncEslintParser from 'jsonc-eslint-parser';
import {ERROR, GLOB_PACKAGE_JSON} from '../constants';
import {
  ConfigEntryBuilder,
  type ConfigSharedOptions,
  type FlatConfigEntry,
  type GetRuleOptions,
} from '../eslint';
import type {InternalConfigOptions} from './index';

const DEFAULT_FILES = [GLOB_PACKAGE_JSON];

type PackageJsonCollection =
  | 'scripts'
  | 'devDependencies'
  | 'dependencies'
  | 'peerDependencies'
  | 'peerDependenciesMeta'
  | 'optionalDependencies'
  | 'config'
  | 'exports'
  | 'overrides'
  | (string & {});

type PackageJsonCollectionsToSort = Partial<Record<PackageJsonCollection, boolean>>;

// Note: unlike the rule's default, we don't sort `scripts`, `configs` and `exports` sections
const DEFAULT_COLLECTIONS_TO_SORT = {
  devDependencies: true,
  dependencies: true,
  peerDependencies: true,
  peerDependenciesMeta: true,
  optionalDependencies: true,
  overrides: true,
} satisfies PackageJsonCollectionsToSort;

export interface PackageJsonEslintConfigOptions extends ConfigSharedOptions<'package-json'> {
  /**
   * The sorting order of package properties
   * @default 'sort-package-json'
   * @see https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/order-properties.md
   */
  order?: (GetRuleOptions<'package-json/order-properties'>[0] & {})['order'];

  /**
   * Enforces that repository entries in a package.json use either object or shorthand notation to refer to GitHub repositories when possible.
   * @default 'object'
   * @see https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/repository-shorthand.md
   */
  repositoryShorthand?: (GetRuleOptions<'package-json/repository-shorthand'>[0] & {})['form'];

  /**
   * Sort lexically the properties of the specified package.json collections.
   *
   * NOTE: "our" default value is not the same as the actual default value of the rule. Namely, we don't sort `scripts` and `configs` sections, but do sort `peerDependenciesMeta` and `optionalDependencies`.
   *
   * The provided value will be **MERGED** with the default list.
   * @default {devDependencies: true, dependencies: true, peerDependencies: true, peerDependenciesMeta: true, optionalDependencies: true}
   * @see https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/sort-collections.md
   * @see https://docs.npmjs.com/cli/configuring-npm/package-json
   */
  collectionsToSort?: PackageJsonCollectionsToSort;
}

export const packageJsonEslintConfig = (
  options: PackageJsonEslintConfigOptions = {},
  internalOptions: InternalConfigOptions = {},
): FlatConfigEntry[] => {
  const builder = new ConfigEntryBuilder<'package-json'>(options, internalOptions);

  // Legend:
  // 🟣 - in recommended

  builder
    .addConfig(
      ['package-json', {includeDefaultFilesAndIgnores: true, filesFallback: DEFAULT_FILES}],
      {
        languageOptions: {
          parser: jsoncEslintParser,
        },
      },
    )
    .addBulkRules(eslintPluginPackageJsonRecommendedConfig.rules)
    // .addRule('package-json/no-empty-fields', ERROR) // 🟣 >=0.21.0
    .addRule('package-json/no-redundant-files', ERROR) // >=0.20.0
    .addRule('package-json/order-properties', ERROR, [
      {order: options.order ?? 'sort-package-json'},
    ]) // 🟣
    .addRule('package-json/repository-shorthand', ERROR, [
      {form: options.repositoryShorthand ?? 'object'},
    ]) // 🟣
    // .addRule('package-json/require-author', OFF) // >=0.22.0
    // .addRule('package-json/require-files', OFF) // >=0.26.0
    // .addRule('package-json/require-name', ERROR) // 🟣 >=0.24.0
    // .addRule('package-json/require-keywords', OFF) // >=0.25.0
    // .addRule('package-json/require-version', ERROR) // 🟣 >=0.23.0
    .addRule('package-json/sort-collections', ERROR, [
      Object.entries({
        ...DEFAULT_COLLECTIONS_TO_SORT,
        ...options.collectionsToSort,
      })
        .filter(([, v]) => v)
        .map(([k]) => k),
    ]) // 🟣
    // .addRule('package-json/unique-dependencies', ERROR) // 🟣
    // .addRule('package-json/valid-local-dependency', ERROR) // 🟣
    // .addRule('package-json/valid-name', ERROR) // 🟣
    // .addRule('package-json/valid-package-definition', ERROR) // 🟣
    // .addRule('package-json/valid-repository-directory', ERROR) // 🟣
    // .addRule('package-json/valid-version', ERROR) // 🟣
    .addOverrides();

  return builder.getAllConfigs();
};
