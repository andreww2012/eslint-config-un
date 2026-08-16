import type {PackageJsonPluginSettings} from 'eslint-plugin-package-json';
import {ERROR, GLOB_PACKAGE_JSON, OFF} from '../constants';
import {getKeysOfTruthyValues} from '../utils';
import {
  type ArrayOrBooleanRecord,
  type ExtraPluginsType,
  type GetRuleNamesInPlugin,
  type GetRuleOptions,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

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

const DEFAULT_PROPERTIES_ALLOWED_TO_BE_EMPTY = {
  browserslist: true,
} satisfies Partial<Record<string, boolean>>;

type IsRequireRule<RuleName extends string> = RuleName extends `require-${infer RequirableField}`
  ? RequirableField
  : never;
type PackageJsonRequirableFields = IsRequireRule<GetRuleNamesInPlugin<'package-json'>>;

interface RequireFieldsOption {
  /**
   * Require the specified fields to be present in the package.json file.
   */
  requireFields?: Partial<Record<PackageJsonRequirableFields, boolean>>;
}

const POPULAR_TOOLS_TOP_LEVEL_PACKAGE_JSON_PROPERTIES = {
  ava: 'AVA',
  babel: 'Babel',
  browserslist: 'Browserslist',
  c8: 'c8',
  commitlint: 'commitlint',
  eslintConfig: 'ESLint',
  jest: 'Jest',
  'lint-staged': 'lint-staged',
  mocha: 'Mocha',
  'nano-staged': 'nano-staged',
  nodemonConfig: 'nodemon',
  np: 'np',
  nyc: 'nyc',
  oclif: 'oclif',
  pnpm: 'pnpm',
  prettier: 'Prettier',
  release: 'semantic-release',
  'release-it': 'release-it',
  renovate: 'Renovate',
  'simple-git-hooks': 'simple-git-hooks',
  'size-limit': 'Size Limit',
  stylelint: 'Stylelint',
  tsd: 'tsd',
  typedoc: 'TypeDoc',
  volta: 'Volta',
  wireit: 'Wireit', // cspell:disable-line
  xo: 'XO',
};

/**
 * An ESLint plugin with rules for consistent, readable, and valid package.json files.
 *
 * 📁 Default `files`: <code>**&#47;package.json</code>
 *
 * If the `enforceAbsoluteVersion` option is used, also applies rules from
 * [`eslint-plugin-node-dependencies`](https://npmx.dev/eslint-plugin-node-dependencies)
 * ([docs](https://ota-meshi.github.io/eslint-plugin-node-dependencies)).
 *
 * 📚 Supports multiple configs (array notation)
 */
export interface PackageJsonEslintConfigOptions<ExtraPlugins extends ExtraPluginsType = never>
  extends UnFlatConfigEntryBase<ExtraPlugins, 'package-json'>, RequireFieldsOption {
  /**
   * [`eslint-plugin-package-json`](https://npmx.dev/eslint-plugin-package-json) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configure-shared-settings)
   * that will be assigned to `packageJson` property and applied to the resolved `files` and
   * `ignores` of this config.
   */
  settings?: PackageJsonPluginSettings;

  /**
   * The sorting order of package properties
   * @default 'sort-package-json'
   * @see https://github.com/michaelfaith/eslint-plugin-package-json/blob/HEAD/docs/rules/order-properties.md
   */
  order?: GetRuleOptions<'package-json', 'order-properties'>['order'];

  /**
   * Enforces that repository entries in a package.json use either object or shorthand notation to
   * refer to GitHub repositories when possible.
   * @default 'object'
   * @see https://github.com/michaelfaith/eslint-plugin-package-json/blob/HEAD/docs/rules/repository-shorthand.md
   */
  repositoryShorthand?: GetRuleOptions<'package-json', 'repository-shorthand'>['form'];

  /**
   * Sort lexically the properties of the specified package.json collections.
   *
   * NOTE: "our" default value is not the same as the actual default value of the rule.
   * Namely, we don't sort `scripts` and `configs` sections, but do sort `peerDependenciesMeta` and
   * `optionalDependencies`.
   *
   * The provided value will be **MERGED** with the default list.
   * @default {devDependencies: true, dependencies: true, peerDependencies: true, peerDependenciesMeta: true, optionalDependencies: true, overrides: true, resolutions: true, dependenciesMeta: true, 'pnpm.allowedDeprecatedVersions': true, 'pnpm.overrides': true, 'pnpm.packageExtensions': true, 'pnpm.patchedDependencies': true, 'pnpm.peerDependencyRules.allowedVersions': true}
   * @see https://github.com/michaelfaith/eslint-plugin-package-json/blob/HEAD/docs/rules/sort-collections.md
   * @see https://docs.npmjs.com/cli/v12/configuring-npm/package-json/
   */
  collectionsToSort?: PackageJsonCollectionsToSort;

  /**
   * The list of top-level properties that won't be reported by `package-json/no-empty-fields` rule
   * if empty.
   *
   * When provided as an array, it *replaces* the default list.
   * When provided as an object, it is *merged* with the default list, so you can disable a default
   * entry by setting it to `false` (e.g.
   * `{browserslist: false}`).
   *
   * Affected rule:
   * - [`package-json/no-empty-fields`](https://github.com/michaelfaith/eslint-plugin-package-json/blob/HEAD/docs/rules/no-empty-fields.md)
   * @default {browserslist: true}
   */
  propertiesAllowedToBeEmpty?: ArrayOrBooleanRecord;

  /**
   * Indicate that the linted files are for publishable packages.
   * This enables *at least* all rules enabled in the official
   * [`recommended-publishable` config](https://github.com/michaelfaith/eslint-plugin-package-json#supported-rules).
   *
   * If you want to have different configs for publishable and non-publishable `package.json`s,
   * create multiple `packageJson` configs using array notation.
   * @default false
   */
  publishable?: boolean;

  /**
   * Disallows unnecessary properties in private packages (marked as `"private": true`).
   *
   * Possible values:
   * - `true`: disallow some properties included by default (see the rule docs).
   * - `false`: do not disallow any properties.
   * - `string[]`: custom list of disallowed properties.
   *
   * Affected rule:
   * - [`package-json/restrict-private-properties`](https://github.com/michaelfaith/eslint-plugin-package-json/blob/HEAD/docs/rules/restrict-private-properties.md)
   * @default false
   */
  disallowUnnecessaryPropertiesInPrivatePackages?: boolean | string[];

  /**
   * Disallow certain top-level properties in package.json.
   * This is useful, for example, when you want to keep package.json minimal and enforce that
   * certain tool configurations live in their own dedicated files.
   *
   * You can set this to a special value `'popularTools'` to bulk disallow top-level properties for
   * popular tools (`prettier`, `eslintConfig`, `stylelint`, `pnpm`, `babel`, etc).
   *
   * Affected rule:
   * - [`package-json/restrict-top-level-properties`](https://github.com/michaelfaith/eslint-plugin-package-json/blob/HEAD/docs/rules/restrict-top-level-properties.md)
   */
  banTopLevelProperties?: ArrayOrBooleanRecord<string, 'booleanOrMessage'> | 'popularTools';
}

export default defineUnConfig<PackageJsonEslintConfigOptions>('packageJson', {
  supportsMultipleConfigs: true,
})((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    order: 'sort-package-json',
    repositoryShorthand: 'object',
    publishable: false,
  });

  const {
    settings: pluginSettings,
    order,
    repositoryShorthand,
    propertiesAllowedToBeEmpty,
    disallowUnnecessaryPropertiesInPrivatePackages,
    publishable,
    banTopLevelProperties: banTopLevelPropertiesRaw,
    requireFields,
  } = optionsResolved;

  const propertiesAllowedToBeEmptyList = getKeysOfTruthyValues(
    Array.isArray(propertiesAllowedToBeEmpty)
      ? propertiesAllowedToBeEmpty
      : {...DEFAULT_PROPERTIES_ALLOWED_TO_BE_EMPTY, ...propertiesAllowedToBeEmpty},
  );

  const banTopLevelProperties = banTopLevelPropertiesRaw
    ? banTopLevelPropertiesRaw === 'popularTools'
      ? Object.entries(POPULAR_TOOLS_TOP_LEVEL_PACKAGE_JSON_PROPERTIES).map(
          ([property, toolName]) => ({
            property,
            message: `Configure ${toolName} in a dedicated config file to avoid bloating package.json and mixing concerns.`,
          }),
        )
      : Object.entries(getKeysOfTruthyValues(banTopLevelPropertiesRaw, 'object')).map(
          ([property, maybeMessage]) => ({
            property,
            ...(typeof maybeMessage === 'string' && {message: maybeMessage}),
          }),
        )
    : [];
  const hasBannedTopLevelProperties = Object.keys(banTopLevelProperties).length > 0;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'package-json');

  // Legend:
  // 🟢 - in recommended and recommended-publishable
  // 📦 - in recommended-publishable, but not in recommended
  // 🎨 - in stylistic

  configBuilder
    ?.addConfig([
      'package-json',
      {
        filesDefault: [GLOB_PACKAGE_JSON],
        language: ['jsonc', 'json'],
        settings: {
          // @ts-expect-error TS is crazy - if an interface is inlined, it won't error
          packageJson: pluginSettings,
        },
      },
    ])
    .addRule('bin-name-casing', ERROR) /** @since 0.64.0 */ // 🎨
    .addRule('exports-subpaths-style', ERROR) /** @since 0.59.0 */ // 🎨
    .addRule(
      'no-empty-fields',
      ERROR,
      propertiesAllowedToBeEmptyList.length > 0
        ? [
            {
              ignoreProperties: propertiesAllowedToBeEmptyList /** @since 0.47.0 */,
            },
          ]
        : [],
    ) /** @since 0.21.0 */ // 🟢
    .addRule('no-local-dependencies', ERROR) /** @since 1.3.0 */
    .addRule('no-redundant-files', ERROR) /** @since 0.20.0 */ // 🟢
    .addRule('no-redundant-publishConfig', ERROR) /** @since 0.65.0 */ // 🟢
    .addRule('order-properties', ERROR, [{order}]) /** @since 0.1.0 */ // 🟢
    .addRule('repository-shorthand', ERROR, [
      {form: repositoryShorthand},
    ]) /** @since 0.5.0 */ /** @aka prefer-repository-shorthand */ // 🟢
    .addRule('require-attribution', publishable ? ERROR : OFF) /** @since 0.81.0 */ // 📦
    .addRule('require-author', OFF) /** @since 0.22.0 */
    .addRule('require-bin', OFF) /** @since 0.90.1 */
    .addRule('require-browser', OFF) /** @since 1.0.0 */
    .addRule('require-bugs', OFF) /** @since 0.50.0 */
    .addRule('require-bundleDependencies', OFF) /** @since 0.50.0 */
    .addRule('require-config', OFF) /** @since 1.0.0 */
    .addRule('require-contributors', OFF) /** @since 0.90.1 */
    .addRule('require-cpu', OFF) /** @since 0.90.0 */
    .addRule('require-dependencies', OFF) /** @since 0.50.0 */
    .addRule('require-description', publishable ? ERROR : OFF) /** @since 0.31.0 */ // 🟢
    .addRule('require-devDependencies', OFF) /** @since 0.50.0 */
    .addRule('require-devEngines', OFF) /** @since 0.90.1 */
    .addRule('require-directories', OFF) /** @since 0.90.1 */
    .addRule('require-engines', OFF) /** @since 0.28.0 */
    .addRule('require-exports', publishable ? ERROR : OFF) /** @since 0.80.0 */ // 📦
    .addRule('require-files', publishable ? ERROR : OFF) /** @since 0.26.0 */ // 📦
    .addRule('require-funding', OFF) /** @since 0.90.1 */
    .addRule('require-gypfile', OFF) /** @since 1.0.0 */
    .addRule('require-homepage', OFF) /** @since 0.87.1 */
    .addRule('require-keywords', OFF) /** @since 0.25.0 */
    .addRule('require-libc', OFF) /** @since 1.0.0 */
    .addRule('require-license', publishable ? ERROR : OFF) /** @since 0.57.0 */
    .addRule('require-main', OFF) /** @since 0.89.4 */
    .addRule('require-man', OFF) /** @since 0.90.1 */
    .addRule('require-module', OFF) /** @since 0.91.0 */
    .addRule('require-name', ERROR) /** @since 0.24.0 */ // 🟢
    .addRule('require-optionalDependencies', OFF) /** @since 0.50.0 */
    .addRule('require-os', OFF) /** @since 0.89.4 */
    .addRule('require-packageManager', OFF) /** @since 0.89.3 */
    .addRule('require-peerDependencies', OFF) /** @since 0.50.0 */
    .addRule('require-peerDependenciesMeta', OFF) /** @since 1.1.0 */
    .addRule('require-private', OFF) /** @since 0.89.4 */
    .addRule('require-publishConfig', OFF) /** @since 0.89.4 */
    .addRule('require-repository', publishable ? ERROR : OFF) /** @since 0.88.0 */ // 📦
    .addRule('require-scripts', OFF) /** @since 0.88.1 */
    .addRule('require-sideEffects', publishable ? ERROR : OFF) /** @since 0.82.0 */ // 📦
    .addRule('require-type', publishable ? ERROR : OFF) /** @since 0.33.0 */ // 🟢
    .addRule('require-types', OFF) /** @since 0.29.0 */
    .addRule('require-version', ERROR) /** @since 0.23.0 */ // 🟢
    .addRule('restrict-dependency-ranges', OFF) /** @since 0.30.0 */
    .addRule(
      'restrict-private-properties',
      disallowUnnecessaryPropertiesInPrivatePackages ? ERROR : OFF,
      Array.isArray(disallowUnnecessaryPropertiesInPrivatePackages)
        ? [{blockedProperties: disallowUnnecessaryPropertiesInPrivatePackages}]
        : [],
    ) /** @since 0.63.0 */
    .addRule(
      'restrict-top-level-properties',
      hasBannedTopLevelProperties ? ERROR : OFF,
      hasBannedTopLevelProperties ? [{ban: banTopLevelProperties}] : [],
    ) /** @since 0.91.2 */
    .addRule('scripts-name-casing', ERROR) /** @since 0.62.0 */ // 🎨
    .addRule('sort-collections', ERROR, [
      getKeysOfTruthyValues({
        ...DEFAULT_COLLECTIONS_TO_SORT,
        ...optionsResolved.collectionsToSort,
      }),
    ]) /** @since 0.1.0 */ /** @aka alphabetize-collections */ // 🟢
    .addRule('specify-peers-locally', ERROR) /** @since 0.83.0 */ // 🟢
    .addRule('unique-dependencies', ERROR) /** @since 0.8.0 */ // 🟢
    .addRule('valid-author', ERROR) /** @since 0.38.0 */ // 🟢
    .addRule('valid-bin', ERROR) /** @since 0.37.0 */ // 🟢
    .addRule('valid-browser', ERROR) /** @since 1.0.0-beta.6 */ // 🟢
    .addRule('valid-bugs', ERROR) /** @since 0.90.0 */ // 🟢
    .addRule('valid-bundleDependencies', ERROR) /** @since 0.44.0 */ // 🟢
    .addRule('valid-config', ERROR) /** @since 0.46.0 */ // 🟢
    .addRule('valid-contributors', ERROR) /** @since 0.72.0 */ // 🟢
    .addRule('valid-cpu', ERROR) /** @since 0.48.0 */ // 🟢
    .addRule('valid-dependencies', ERROR) /** @since 0.49.0 */ // 🟢
    .addRule('valid-description', ERROR) /** @since 0.52.0 */ // 🟢
    .addRule('valid-devDependencies', ERROR) /** @since 0.49.0 */ // 🟢
    .addRule('valid-devEngines', ERROR) /** @since 0.91.0 */ // 🟢
    .addRule('valid-directories', ERROR) /** @since 0.56.0 */ // 🟢
    .addRule('valid-engines', ERROR) /** @since 0.76.0 */ // 🟢
    .addRule('valid-exports', ERROR) /** @since 0.54.0 */ // 🟢
    .addRule('valid-files', ERROR) /** @since 0.67.0 */ // 🟢
    .addRule('valid-funding', ERROR) /** @since 0.90.0 */ // 🟢
    .addRule('valid-gypfile', ERROR) /** @since 1.0.0-beta.6 */ // 🟢
    .addRule('valid-homepage', ERROR) /** @since 0.66.0 */ // 🟢
    .addRule('valid-keywords', ERROR) /** @since 0.68.0 */ // 🟢
    .addRule('valid-libc', ERROR) /** @since 1.0.0-beta.6 */ // 🟢
    .addRule('valid-license', ERROR) /** @since 0.45.0 */ // 🟢
    .addRule('valid-main', ERROR) /** @since 0.69.0 */ // 🟢
    .addRule('valid-man', ERROR) /** @since 0.74.0 */ // 🟢
    .addRule('valid-module', ERROR) /** @since 0.86.0 */ // 🟢
    .addRule('valid-name', ERROR) /** @since 0.9.0 */ // 🟢
    .addRule('valid-optionalDependencies', ERROR) /** @since 0.49.0 */ // 🟢
    .addRule('valid-os', ERROR) /** @since 0.71.0 */ // 🟢
    .addRule('valid-packageManager', ERROR) /** @since 0.90.0 */ // 🟢
    .addRule('valid-peerDependencies', ERROR) /** @since 0.49.0 */ // 🟢
    .addRule('valid-peerDependenciesMeta', ERROR) /** @since 1.0.0-beta.6 */ // 🟢
    .addRule('valid-peerDependenciesMeta-relationship', ERROR) /** @since 1.0.0-beta.6 */ // 🟢
    .addRule('valid-private', ERROR) /** @since 0.70.0 */ // 🟢
    .addRule('valid-publishConfig', ERROR) /** @since 0.74.0 */ // 🟢
    .addRule('valid-repository', ERROR) /** @since 0.78.0 */ // 🟢
    .addRule('valid-repository-directory', ERROR) /** @since 0.7.0 */ // 🟢
    .addRule('valid-scripts', ERROR) /** @since 0.43.0 */ // 🟢
    .addRule('valid-sideEffects', ERROR) /** @since 0.85.0 */ // 🟢
    .addRule('valid-type', ERROR) /** @since 0.41.0 */ // 🟢
    .addRule('valid-version', ERROR) /** @since 0.10.0 */ // 🟢
    .addRule('valid-workspaces', ERROR) /** @since 0.75.0 */ // 🟢
    .enableConfigTesterForPlugin('package-json')
    .addBulkRules(
      requireFields &&
        Object.fromEntries(
          Object.entries(requireFields).map(([field, isRequired]) => [
            `package-json/require-${field}`,
            isRequired ? ERROR : OFF,
          ]),
        ),
    )
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
});
