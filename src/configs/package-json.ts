import eslintPluginPackageJsonRecommendedConfig from 'eslint-plugin-package-json/configs/recommended';
import jsoncEslintParser from 'jsonc-eslint-parser';
import {ERROR, GLOB_PACKAGE_JSON} from '../constants';
import type {
  ConfigSharedOptions,
  FlatConfigEntry,
  GetRuleOptions,
  InternalConfigOptions,
} from '../types';
import {ConfigEntryBuilder} from '../utils';

const DEFAULT_FILES = [GLOB_PACKAGE_JSON];

type PackageJsonCollection =
  | 'scripts'
  | 'devDependencies'
  | 'dependencies'
  | 'peerDependencies'
  | 'peerDependenciesMeta'
  | 'optionalDependencies'
  | 'config'
  | (string & {});

type PackageJsonCollectionsToSort = Partial<Record<PackageJsonCollection, boolean>>;

const DEFAULT_COLLECTIONS_TO_SORT = {
  devDependencies: true,
  dependencies: true,
  peerDependencies: true,
  peerDependenciesMeta: true,
  optionalDependencies: true,
} satisfies PackageJsonCollectionsToSort;

export interface PackageJsonEslintConfigOptions extends ConfigSharedOptions<'package-json'> {
  /**
   * The sorting order of package properties
   * @see https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/order-properties.md
   * @default 'sort-package-json'
   */
  order?: (GetRuleOptions<'package-json/order-properties'>[0] & {})['order'];
  /**
   * Enforces that repository entries in a package.json use either object or shorthand notation to refer to GitHub repositories when possible.
   * @see https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/repository-shorthand.md
   * @default 'object'
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
        plugins: {
          // @ts-expect-error types mismatch
          'package-json': eslintPluginPackageJsonRecommendedConfig.plugins['package-json'],
        },
        languageOptions: {
          parser: jsoncEslintParser,
        },
      },
    )
    .addBulkRules(eslintPluginPackageJsonRecommendedConfig.rules)
    .addRule('package-json/order-properties', ERROR, [
      {order: options.order ?? 'sort-package-json'},
    ]) // 🟣
    .addRule('package-json/repository-shorthand', ERROR, [
      {form: options.repositoryShorthand ?? 'object'},
    ]) // 🟣
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
    // .addRule('package-json/valid-package-def', ERROR) // 🟣
    // .addRule('package-json/valid-repository-directory', ERROR) // 🟣
    // .addRule('package-json/valid-version', ERROR) // 🟣
    .addOverrides();

  return builder.getAllConfigs();
};