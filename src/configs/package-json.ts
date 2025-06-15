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

type PackageJsonRequirableFields =
  | 'author'
  | 'description'
  | 'engines'
  | 'files'
  | 'keywords'
  | 'name'
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
   * Specify which `package.json`s are published to a registry. `name` and `version` fields
   * will be required for all of them. If `true`, this will apply to all `package.json`s.
   * @default true
   */
  configPublishedPackageJson?: boolean | UnConfigOptions<'package-json', RequireFieldsOption>;

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
   * @default {devDependencies: true, dependencies: true, peerDependencies: true, peerDependenciesMeta: true, optionalDependencies: true}
   * @see https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/sort-collections.md
   * @see https://docs.npmjs.com/cli/configuring-npm/package-json
   */
  collectionsToSort?: PackageJsonCollectionsToSort;
}

export const packageJsonUnConfig: UnConfigFn<'packageJson'> = async (context) => {
  const jsoncEslintParser = await interopDefault(import('jsonc-eslint-parser'));

  const optionsRaw = context.rootOptions.configs?.packageJson;
  const optionsResolved = assignDefaults(optionsRaw, {
    configPublishedPackageJson: true,
    order: 'sort-package-json',
    repositoryShorthand: 'object',
  } satisfies PackageJsonEslintConfigOptions);

  const {configPublishedPackageJson, order, repositoryShorthand} = optionsResolved;

  const optionsPublishedPackageJsonResolved = assignDefaults(
    configPublishedPackageJson,
    {} satisfies PackageJsonEslintConfigOptions['configPublishedPackageJson'] & object,
  );

  const getRequiredFields = (isPublishedPackageJson = false) => ({
    ...(isPublishedPackageJson && {
      name: true,
      version: true,
    }),
    ...(isPublishedPackageJson
      ? optionsPublishedPackageJsonResolved.requireFields
      : optionsResolved.requireFields),
  });

  const requiredFields = getRequiredFields();
  const requiredFieldsRootPackageJson = getRequiredFields(true);

  const getRequireFieldSeverity = (
    field: PackageJsonRequirableFields,
    isPublishedPackageJson = false,
  ) =>
    (isPublishedPackageJson ? requiredFieldsRootPackageJson : requiredFields)[field] ? ERROR : OFF;

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
      },
    )
    .addRule('no-empty-fields', ERROR) // 🟢 >=0.21.0
    .addRule('no-redundant-files', ERROR) // >=0.20.0
    .addRule('order-properties', ERROR, [{order}]) // 🟢
    .addRule('repository-shorthand', ERROR, [{form: repositoryShorthand}]) // 🟢
    .addRule('require-author', getRequireFieldSeverity('author')) // >=0.22.0
    .addRule('require-description', getRequireFieldSeverity('description')) // 🟢 >=0.31.0
    .addRule('require-engines', getRequireFieldSeverity('engines')) // >=0.28.0
    .addRule('require-files', getRequireFieldSeverity('files')) // >=0.26.0
    .addRule('require-keywords', getRequireFieldSeverity('keywords')) // >=0.25.0
    .addRule('require-name', getRequireFieldSeverity('name')) // 🟢 >=0.24.0
    .addRule('require-type', getRequireFieldSeverity('type')) // 🟢 >=0.33.0
    .addRule('require-types', getRequireFieldSeverity('types')) // >=0.29.0
    .addRule('require-version', getRequireFieldSeverity('version')) // 🟢 >=0.23.0
    .addRule('restrict-dependency-ranges', OFF) // >=0.30.0
    .addRule('sort-collections', ERROR, [
      getKeysOfTruthyValues({
        ...DEFAULT_COLLECTIONS_TO_SORT,
        ...optionsResolved.collectionsToSort,
      }),
    ]) // 🟢
    .addRule('unique-dependencies', ERROR) // 🟢
    .addRule('valid-author', ERROR) // 🟢 >=0.38.0
    .addRule('valid-bin', ERROR) // 🟢 >=0.37.0
    .addRule('valid-name', ERROR) // 🟢
    .addRule('valid-package-definition', ERROR) // 🟢
    .addRule('valid-repository-directory', ERROR) // 🟢
    .addRule('valid-version', ERROR) // 🟢
    .addOverrides();

  const configBuilderPublishedPackageJson = createConfigBuilder(
    context,
    configPublishedPackageJson,
    'package-json',
  );
  configBuilder
    ?.addConfig(
      [
        'package-json/published',
        {
          includeDefaultFilesAndIgnores: true,
          filesFallback: DEFAULT_FILES_PACKAGE_JSON,
        },
      ],
      {
        languageOptions: {
          parser: jsoncEslintParser,
        },
      },
    )
    .addRule('require-author', getRequireFieldSeverity('author', true))
    .addRule('require-description', getRequireFieldSeverity('description', true))
    .addRule('require-engines', getRequireFieldSeverity('engines', true))
    .addRule('require-files', getRequireFieldSeverity('files', true))
    .addRule('require-keywords', getRequireFieldSeverity('keywords', true))
    .addRule('require-name', getRequireFieldSeverity('name', true))
    .addRule('require-type', getRequireFieldSeverity('type', true))
    .addRule('require-types', getRequireFieldSeverity('types', true))
    .addRule('require-version', getRequireFieldSeverity('version', true))
    .addOverrides();

  return {
    configs: [configBuilder, configBuilderPublishedPackageJson],
    optionsResolved,
  };
};
