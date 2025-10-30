import type {recommended as fastImportPluginConfigGenerator} from 'eslint-plugin-fast-import';
import semver from 'semver';
import type {UnConfigContext, UnConfigs} from './configs';
import type {PACKAGES_TO_GET_INFO_FOR} from './constants';
import type {EslintPlugin, RuleNamesForPlugin} from './eslint';
import {OPTIONAL_PEER_DEPENDENCIES, type PluginPrefix} from './plugins';
import type {NonEmptyTuple} from './types';
import {
  type MaybeArray,
  arraify,
  fetchPackageInfo,
  isIn,
  objectEntriesUnsafe,
  styleText,
} from './utils';

const generateStyleFn = (color: Parameters<typeof styleText>[0]) => (string: string) =>
  styleText(color, string);

export const styleConfigName = generateStyleFn('yellow');
export const stylePackageName = generateStyleFn('yellow');
export const stylePluginPrefix = generateStyleFn('blue');
export const styleRuleName = generateStyleFn('green');

const CONFIGS_MISC_GROUP_DISABLED_BY_DEFAULT = new Set<keyof UnConfigs>([
  'security',
  'yaml',
  'toml',
  'json',
  'packageJson',
  'jsonSchemaValidator',
  'nodeDependencies',
  'depend',
]);

const CONFIGS_TO_NOT_REPORT_IF_UNNECESSARILY_ENABLED_OR_DISABLED = new Set<keyof UnConfigs>([
  'fileProgress',
]);

export function getIsConfigEnabled(
  this: UnConfigContext,
  configName: keyof UnConfigs,
  defaultConditionOrPackageInstalled:
    | boolean
    | MaybeArray<`${(typeof PACKAGES_TO_GET_INFO_FOR)[number]}${'' | `|${string}`}`> = true,
  {
    preCondition,
    requireAllListedPackagesToBeInstalled,
  }: {
    preCondition?: [condition: boolean, description: string];
    requireAllListedPackagesToBeInstalled?: boolean;
  } = {},
): boolean {
  const {configs = {}, defaultConfigsStatus} = this.rootOptions;

  let enabledByUser: boolean | undefined;
  let enabledBySystem: boolean | undefined;
  let reason: string | undefined;

  const providedConfig = configs[configName];
  if (this.isTestMode) {
    enabledBySystem ??= true;
    reason ??= 'all configs are enabled in the test mode';
  }
  if (providedConfig != null) {
    enabledByUser ??= Boolean(providedConfig);
    reason ??= 'provided by the user';
  }
  if (defaultConfigsStatus === 'all-disabled') {
    enabledBySystem ??= false;
    reason ??= '`defaultConfigsStatus` is set to `all-disabled`';
  }
  if (
    defaultConfigsStatus === 'misc-enabled' &&
    CONFIGS_MISC_GROUP_DISABLED_BY_DEFAULT.has(configName)
  ) {
    enabledBySystem ??= true;
    reason ??=
      '`defaultConfigsStatus` is set to `misc-enabled` and the config is in the misc group';
  }
  if (
    typeof defaultConditionOrPackageInstalled === 'string' ||
    (Array.isArray(defaultConditionOrPackageInstalled) &&
      defaultConditionOrPackageInstalled.length > 0)
  ) {
    const packagesList = arraify(defaultConditionOrPackageInstalled).map(
      (packageNameAndMaybeVersionRange) => {
        const [packageName = '', versionRangeToSatisfy] =
          packageNameAndMaybeVersionRange.split('|');
        return {
          packageName: packageName as (typeof PACKAGES_TO_GET_INFO_FOR)[number],
          versionRangeToSatisfy,
        };
      },
    );
    if (requireAllListedPackagesToBeInstalled && packagesList.length > 1) {
      const notInstalledPackages = packagesList.filter(({packageName, versionRangeToSatisfy}) => {
        const packageInfo = this.packagesInfo[packageName];
        return (
          !packageInfo ||
          (versionRangeToSatisfy &&
            !semver.satisfies(packageInfo.info.version, versionRangeToSatisfy))
        );
      });
      enabledBySystem ??= notInstalledPackages.length === 0;
      reason ??= `${
        enabledBySystem
          ? 'all of these packages were installed'
          : `the following package${notInstalledPackages.length === 1 ? ' is' : 's are'} not installed`
      }: ${(enabledBySystem ? packagesList : notInstalledPackages).map(({packageName}) => stylePackageName(packageName)).join(', ')}`;
    } else {
      enabledBySystem ??= packagesList.some(({packageName}) => {
        const isInstalled = Boolean(this.packagesInfo[packageName]);
        if (isInstalled) {
          reason ??= `package ${stylePackageName(packageName)} is installed`;
        }
        return isInstalled;
      });
      reason ??=
        packagesList.length > 1
          ? `neither of these packages are installed: ${packagesList.map(({packageName}) => stylePackageName(packageName)).join(', ')}`
          : `package ${stylePackageName(packagesList[0]?.packageName || '')} is not installed`;
    }
  } else if (typeof defaultConditionOrPackageInstalled === 'boolean') {
    enabledBySystem ??= defaultConditionOrPackageInstalled;
    reason ??= `config is ${defaultConditionOrPackageInstalled ? 'enabled' : 'disabled'} by default`;
  }

  if (preCondition) {
    enabledBySystem &&= preCondition[0];
    reason = `${reason} and the following condition was${enabledBySystem ? '' : styleText('redBright', ' not')} met: ${preCondition[1]}`;
  }

  enabledBySystem ??= false;

  if (
    typeof enabledByUser === 'boolean' &&
    typeof providedConfig === 'boolean' &&
    enabledByUser === enabledBySystem &&
    !CONFIGS_TO_NOT_REPORT_IF_UNNECESSARILY_ENABLED_OR_DISABLED.has(configName)
  ) {
    this.logger.warn(
      `There is no need to ${enabledByUser ? 'enable' : 'disable'} \`${styleConfigName(configName)}\` config because this is the default`,
    );
  }

  const isEnabled = enabledByUser ?? enabledBySystem;

  this.debug(
    `Config \`${styleConfigName(configName)}\` is ${isEnabled ? styleText('green', 'enabled') : styleText('red', 'disabled')} because ${reason}`,
  );

  return isEnabled;
}

export const checkIfModuleCorrectlyLoaded = async (
  moduleResult: {packageName: string; module: unknown} | null,
) => {
  const plugin = moduleResult?.module;
  if (moduleResult && isIn(moduleResult.packageName, OPTIONAL_PEER_DEPENDENCIES)) {
    const installedPluginVersion = plugin
      ? (await fetchPackageInfo(moduleResult.packageName))?.versions.full
      : null;
    const versionRange = OPTIONAL_PEER_DEPENDENCIES[moduleResult.packageName];
    if (
      !plugin ||
      (installedPluginVersion && !semver.satisfies(installedPluginVersion, versionRange))
    ) {
      return {
        name: moduleResult.packageName,
        versionRange,
        ...(installedPluginVersion && {installedVersion: installedPluginVersion}),
      };
    }
  }
  return null;
};

// TODO: move to configs/fast-import
export type FastImportPluginSettings = Parameters<typeof fastImportPluginConfigGenerator>[0];

const IMPORT_RULES_TO_REPLACE = {
  'no-cycle': 'no-cycle',
  'no-named-as-default': 'no-named-as-default',
  'no-unresolved': 'no-unresolved-imports',
} satisfies Partial<Record<RuleNamesForPlugin<'import'>, RuleNamesForPlugin<'fast-import'>>>;

export type ImportPluginReplaceableRules = keyof typeof IMPORT_RULES_TO_REPLACE;

export const replaceImportRulesImplementationWithFastPlugin = (
  context: UnConfigContext,
  loadedPlugins: Partial<Record<PluginPrefix, EslintPlugin>>,
): void => {
  const {useFastImport} = context.rootOptions;
  const {import: originalPlugin, 'fast-import': fastPlugin} = loadedPlugins;
  if (!useFastImport || !originalPlugin || !fastPlugin) {
    return;
  }

  const {replaceRules} = typeof useFastImport === 'object' ? useFastImport : {};

  const originalPluginPatched: EslintPlugin = {
    ...originalPlugin,
    rules: {
      ...originalPlugin.rules,
      ...Object.fromEntries(
        objectEntriesUnsafe(IMPORT_RULES_TO_REPLACE)
          .map(([originalRuleName, fastRuleName]) => {
            const fastRuleImplementation = fastPlugin.rules?.[fastRuleName];
            if (!fastRuleImplementation || replaceRules?.[originalRuleName] === false) {
              return null;
            }

            const fastRuleSchema = fastRuleImplementation.meta?.schema;
            return [
              originalRuleName,
              {
                ...fastRuleImplementation,
                meta: {
                  ...fastRuleImplementation.meta,
                  schema:
                    fastRuleSchema &&
                    // eslint-disable-next-line de-morgan/no-negated-conjunction
                    !(Array.isArray(fastRuleSchema) && fastRuleSchema.length === 0)
                      ? fastRuleSchema
                      : [{type: 'object'}], // Allows any properties
                },
              },
            ] satisfies NonEmptyTuple;
          })
          .filter((v) => v != null),
      ),
    },
  };

  loadedPlugins.import = originalPluginPatched;
};
