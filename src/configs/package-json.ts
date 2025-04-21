import eslintPluginPackageJson from 'eslint-plugin-package-json';
import jsoncEslintParser from 'jsonc-eslint-parser';
import {ERROR, GLOB_PACKAGE_JSON} from '../constants';
import {
  ConfigEntryBuilder,
  type ConfigSharedOptions,
  type FlatConfigEntry,
  type GetRuleOptions,
} from '../eslint';
import {getKeysOfTruthyValues} from '../utils';
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
  options: PackageJsonEslintConfigOptions,
  internalOptions: InternalConfigOptions,
): FlatConfigEntry[] => {
  const builder = new ConfigEntryBuilder('package-json', options, internalOptions);

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    .addBulkRules((eslintPluginPackageJson as any).configs.recommended.rules)
    // .addRule('no-empty-fields', ERROR) // 🟣 >=0.21.0
    .addRule('no-redundant-files', ERROR) // >=0.20.0
    .addRule('order-properties', ERROR, [{order: options.order ?? 'sort-package-json'}]) // 🟣
    .addRule('repository-shorthand', ERROR, [{form: options.repositoryShorthand ?? 'object'}]) // 🟣
    // .addRule('require-author', OFF) // >=0.22.0
    // .addRule('require-engines', OFF) // >=0.28.0
    // .addRule('require-files', OFF) // >=0.26.0
    // .addRule('require-name', ERROR) // 🟣 >=0.24.0
    // .addRule('require-keywords', OFF) // >=0.25.0
    // .addRule('require-types', OFF) // >=0.29.0
    // .addRule('require-version', ERROR) // 🟣 >=0.23.0
    .addRule('sort-collections', ERROR, [
      getKeysOfTruthyValues({
        ...DEFAULT_COLLECTIONS_TO_SORT,
        ...options.collectionsToSort,
      }),
    ]) // 🟣
    // .addRule('unique-dependencies', ERROR) // 🟣
    // .addRule('valid-local-dependency', ERROR) // 🟣
    // .addRule('valid-name', ERROR) // 🟣
    // .addRule('valid-package-definition', ERROR) // 🟣
    // .addRule('valid-repository-directory', ERROR) // 🟣
    // .addRule('valid-version', ERROR) // 🟣
    .addOverrides();

  return builder.getAllConfigs();
};
