import semver from 'semver';
import type {UnConfigs} from '../configs';
import type {PACKAGES_TO_GET_INFO_FOR} from '../constants';
import {type MaybeArray, arraify, styleConfigName, stylePackageName, styleText} from '../utils';
import type {UnConfigContext} from './shared';

const CONFIGS_MISC_GROUP_DISABLED_BY_DEFAULT = new Set<keyof UnConfigs>([
  'security',
  'yaml',
  'toml',
  'json',
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
