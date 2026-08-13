import semver from 'semver';
import type {UnConfigs} from '../configs';
import type {PACKAGES_TO_GET_INFO_FOR} from '../constants';
import type {NonEmptyTuple} from '../types';
import {arrayify, styleConfigName, stylePackageName, styleText} from '../utils';
import type {UnConfigContext} from './shared';

type PackageToCheck = `${(typeof PACKAGES_TO_GET_INFO_FOR)[number]}${'' | `@${string}`}`;

// NOTE: do not forget to sync this list with `defaultConfigsStatus` option JSDoc
export const CONFIGS_MISC_GROUP_DISABLED_BY_DEFAULT = new Set<keyof UnConfigs>([
  'e18e',
  'jsonc',
  'jsonSchemaValidator',
  'lockfile',
  'nodeDependencies',
  'security',
  'toml',
  'yaml',
]);

const CONFIGS_TO_NOT_REPORT_IF_UNNECESSARILY_ENABLED_OR_DISABLED = new Set<keyof UnConfigs>([
  'fileProgress',
]);

export function getIsConfigEnabled(
  this: UnConfigContext,
  configName: keyof UnConfigs,
  defaultConditionOrPackageInstalled:
    boolean | PackageToCheck | NonEmptyTuple<PackageToCheck> = true,
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
  /* v8 ignore start */
  if (this.isTestMode) {
    enabledBySystem ??= true;
    reason ??= 'all configs are enabled in the test mode';
  }
  /* v8 ignore stop */
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
  if (typeof defaultConditionOrPackageInstalled === 'boolean') {
    enabledBySystem ??= defaultConditionOrPackageInstalled;
    reason ??= `config is ${defaultConditionOrPackageInstalled ? 'enabled' : 'disabled'} by default`;
  } else {
    const packagesList = arrayify(defaultConditionOrPackageInstalled).map(
      (packageNameAndMaybeVersionRange) => {
        const versionDelimiterIndex = packageNameAndMaybeVersionRange.lastIndexOf('@');
        const hasVersionRange = versionDelimiterIndex > 0;

        return {
          packageName: (hasVersionRange
            ? packageNameAndMaybeVersionRange.slice(0, versionDelimiterIndex)
            : packageNameAndMaybeVersionRange) as (typeof PACKAGES_TO_GET_INFO_FOR)[number],
          versionRangeToSatisfy: hasVersionRange
            ? packageNameAndMaybeVersionRange.slice(versionDelimiterIndex + 1)
            : undefined,
        };
      },
    );
    /* v8 ignore start - No config passes `requireAllListedPackagesToBeInstalled` yet */
    if (requireAllListedPackagesToBeInstalled && packagesList.length > 1) {
      const notInstalledPackages = packagesList.filter(({packageName, versionRangeToSatisfy}) => {
        const packageInfo = this.packagesInfo[packageName];
        return (
          !packageInfo ||
          (versionRangeToSatisfy &&
            !semver.satisfies(packageInfo.info.version || '', versionRangeToSatisfy))
        );
      });
      enabledBySystem ??= notInstalledPackages.length === 0;
      reason ??= `${
        enabledBySystem
          ? 'all of these packages were installed'
          : `the following package${notInstalledPackages.length === 1 ? ' is' : 's are'} not installed`
      }: ${(enabledBySystem ? packagesList : notInstalledPackages).map(({packageName}) => stylePackageName(packageName)).join(', ')}`;
      /* v8 ignore stop */
    } else {
      enabledBySystem ??= packagesList.some(({packageName, versionRangeToSatisfy}) => {
        const packageInfo = this.packagesInfo[packageName];
        const isInstalled =
          packageInfo != null &&
          (!versionRangeToSatisfy ||
            semver.satisfies(packageInfo.info.version || '', versionRangeToSatisfy));
        if (isInstalled) {
          reason ??= `package ${stylePackageName(packageName)} is installed`;
        }
        return isInstalled;
      });
      reason ??=
        packagesList.length > 1
          ? `neither of these packages are installed: ${packagesList.map(({packageName}) => stylePackageName(packageName)).join(', ')}`
          : `package ${stylePackageName(/* v8 ignore next - The list is never empty here */ packagesList[0]?.packageName || '')} is not installed`;
    }
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
