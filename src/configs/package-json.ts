import type {PackageJsonPluginSettings} from 'eslint-plugin-package-json';
import {ERROR, GLOB_PACKAGE_JSON, OFF} from '../constants';
import {type GetRuleOptions, type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults, getKeysOfTruthyValues, interopDefault} from '../utils';
import type {UnConfigFn} from './index';

export const DEFAULT_FILES_PACKAGE_JSON = [GLOB_PACKAGE_JSON];

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
  // yarn
  | 'resolutions'
  // pnpm
  | 'dependenciesMeta'
  | 'pnpm.allowedDeprecatedVersions'
  | 'pnpm.overrides'
  | 'pnpm.packageExtensions'
  | 'pnpm.patchedDependencies'
  | 'pnpm.peerDependencyRules.allowedVersions'
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
  resolutions: true,
  dependenciesMeta: true,
  'pnpm.allowedDeprecatedVersions': true,
  'pnpm.overrides': true,
  'pnpm.packageExtensions': true,
  'pnpm.patchedDependencies': true,
  'pnpm.peerDependencyRules.allowedVersions': true,
} satisfies PackageJsonCollectionsToSort;

type PackageJsonRequirableFields =
  | 'author'
  | 'bugs'
  | 'bundleDependencies'
  | 'dependencies'
  | 'description'
  | 'devDependencies'
  | 'engines'
  | 'files'
  | 'keywords'
  | 'name'
  | 'optionalDependencies'
  | 'peerDependencies'
  | 'type'
  | 'types'
  | 'version';

interface RequireFieldsOption {
  /**
   * Require the specified fields to be present in the package.json file.
   */
  requireFields?: Partial<Record<PackageJsonRequirableFields, boolean>>;
}

export interface PackageJsonEslintConfigOptions
  extends UnConfigOptions<'package-json'>,
    RequireFieldsOption {
  /**
   * [`eslint-plugin-package-json`](https://npmjs.com/eslint-plugin-package-json) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `packageJson` property and applied to the specified `files` and `ignores`.
   */
  settings?: PackageJsonPluginSettings;

  /**
   * The sorting order of package properties
   * @default 'sort-package-json'
   * @see https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/order-properties.md
   */
  order?: (GetRuleOptions<'package-json', 'order-properties'>[0] & {})['order'];

  /**
   * Enforces that repository entries in a package.json use either object or shorthand notation to refer to GitHub repositories when possible.
   * @default 'object'
   * @see https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/repository-shorthand.md
   */
  repositoryShorthand?: (GetRuleOptions<'package-json', 'repository-shorthand'>[0] & {})['form'];

  /**
   * Sort lexically the properties of the specified package.json collections.
   *
   * NOTE: "our" default value is not the same as the actual default value of the rule. Namely, we don't sort `scripts` and `configs` sections, but do sort `peerDependenciesMeta` and `optionalDependencies`.
   *
   * The provided value will be **MERGED** with the default list.
   * @default {devDependencies: true, dependencies: true, peerDependencies: true, peerDependenciesMeta: true, optionalDependencies: true, overrides: true, resolutions: true, dependenciesMeta: true, 'pnpm.allowedDeprecatedVersions': true, 'pnpm.overrides': true, 'pnpm.packageExtensions': true, 'pnpm.patchedDependencies': true, 'pnpm.peerDependencyRules.allowedVersions': true}
   * @see https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/sort-collections.md
   * @see https://docs.npmjs.com/cli/configuring-npm/package-json
   */
  collectionsToSort?: PackageJsonCollectionsToSort;

  /**
   * - `true`: enforces to use the absolute version only on `dependencies` and `devDependencies`.
   * - `'never'`: enforces not to use the absolute version.
   * - `false`: do not enforce anything.
   *
   * Affected rules:
   * - [`node-dependencies/absolute-version`](https://ota-meshi.github.io/eslint-plugin-node-dependencies/rules/absolute-version.html) (yes, it will use the rule from another plugin, [`eslint-plugin-node-dependencies`](https://npmjs.com/eslint-plugin-node-dependencies), for simplicity)
   * @default false
   */
  enforceAbsoluteVersion?:
    | boolean
    | 'never'
    | (GetRuleOptions<'node-dependencies', 'absolute-version'>[0] & object);

  /**
   * The list of top-level properties that won't be reported by `no-empty-fields` rule if empty.
   *
   * Affected rule:
   * - [`no-empty-fields`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/no-empty-fields.md)
   * @default `['browserslist']`
   */
  propertiesAllowedToBeEmpty?: string[];
}

export const packageJsonUnConfig: UnConfigFn<'packageJson'> = async (context) => {
  const jsoncEslintParser = await interopDefault(import('jsonc-eslint-parser'));

  const optionsRaw = context.rootOptions.configs?.packageJson;
  const optionsResolved = assignDefaults(optionsRaw, {
    enforceAbsoluteVersion: false,
    order: 'sort-package-json',
    repositoryShorthand: 'object',
    propertiesAllowedToBeEmpty: ['browserslist'],
  } satisfies PackageJsonEslintConfigOptions);

  const {
    settings: pluginSettings,
    enforceAbsoluteVersion,
    order,
    repositoryShorthand,
    propertiesAllowedToBeEmpty,
  } = optionsResolved;

  const configBuilder = createConfigBuilder(context, optionsResolved, 'package-json');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(
      [
        'package-json',
        {includeDefaultFilesAndIgnores: true, filesFallback: DEFAULT_FILES_PACKAGE_JSON},
      ],
      {
        languageOptions: {
          parser: jsoncEslintParser,
        },
        ...(pluginSettings && {
          settings: {
            packageJson: pluginSettings,
          },
        }),
      },
    )
    .addRule(
      'no-empty-fields',
      ERROR,
      propertiesAllowedToBeEmpty.length > 0
        ? [
            {
              ignoreProperties: propertiesAllowedToBeEmpty, // >=0.47.0
            },
          ]
        : [],
    ) // 🟢 >=0.21.0
    .addRule('no-redundant-files', ERROR) // 🟢 >=0.20.0
    .addRule('order-properties', ERROR, [{order}]) // 🟢
    .addRule('repository-shorthand', ERROR, [{form: repositoryShorthand}]) // 🟢
    .addRule('require-author', OFF) // >=0.22.0
    .addRule('require-bugs', OFF) // >=0.50.0
    .addRule('require-bundleDependencies', OFF) // >=0.50.0
    .addRule('require-dependencies', OFF) // >=0.50.0
    .addRule('require-description', OFF) // 🟢 >=0.31.0
    .addRule('require-devDependencies', OFF) // >=0.50.0
    .addRule('require-engines', OFF) // >=0.28.0
    .addRule('require-files', OFF) // >=0.26.0
    .addRule('require-keywords', OFF) // >=0.25.0
    .addRule('require-name', ERROR) // 🟢 >=0.24.0
    .addRule('require-optionalDependencies', OFF) // >=0.50.0
    .addRule('require-peerDependencies', OFF) // >=0.50.0
    .addRule('require-type', OFF) // 🟢 >=0.33.0
    .addRule('require-types', OFF) // >=0.29.0
    .addRule('require-version', ERROR) // 🟢 >=0.23.0
    .addRule('restrict-dependency-ranges', OFF) // >=0.30.0
    .addRule('sort-collections', ERROR, [
      getKeysOfTruthyValues({
        ...DEFAULT_COLLECTIONS_TO_SORT,
        ...optionsResolved.collectionsToSort,
      }),
    ]) // 🟢
    .addRule('unique-dependencies', ERROR) // 🟢
    .addRule('valid-author', ERROR) // 🟢 >=0.38.0
    .addRule('valid-bin', ERROR, [{enforceCase: true}]) // 🟢 >=0.37.0
    .addRule('valid-bundleDependencies', ERROR) // 🟢 >=0.44.0
    .addRule('valid-config', ERROR) // 🟢 >=0.46.0
    .addRule('valid-cpu', ERROR) // 🟢 >=0.48.0
    .addRule('valid-dependencies', ERROR) // 🟢 >=0.49.0
    .addRule('valid-description', ERROR) // 🟢 >=0.52.0
    .addRule('valid-devDependencies', ERROR) // 🟢 >=0.49.0
    .addRule('valid-directories', ERROR) // 🟢 >=0.56.0
    .addRule('valid-exports', ERROR) // 🟢 >=0.54.0
    .addRule('valid-license', ERROR) // 🟢 >=0.45.0
    .addRule('valid-name', ERROR) // 🟢
    .addRule('valid-optionalDependencies', ERROR) // 🟢 >=0.49.0
    .addRule('valid-peerDependencies', ERROR) // 🟢 >=0.49.0
    .addRule('valid-repository-directory', ERROR) // 🟢
    .addRule('valid-scripts', ERROR) // 🟢 >=0.43.0
    .addRule('valid-type', ERROR) // 🟢 >=0.41.0
    .addRule('valid-version', ERROR) // 🟢
    .addAnyRule(
      'node-dependencies',
      'absolute-version',
      enforceAbsoluteVersion ? ERROR : OFF,
      enforceAbsoluteVersion
        ? [
            enforceAbsoluteVersion === true
              ? {
                  optionalDependencies: 'ignore',
                  peerDependencies: 'ignore',
                }
              : enforceAbsoluteVersion,
          ]
        : [],
    ) // >=0.7.0
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};
