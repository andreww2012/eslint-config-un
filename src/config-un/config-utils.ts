import * as findUp from 'empathic/find';
import {satisfies} from 'verkit';
import type {UnConfigs} from '../configs';
import {MISC_GROUP_CONFIGS} from '../configs/manifests.gen';
import type {PACKAGES_TO_GET_INFO_FOR} from '../constants';
import type {EslintFlatConfigEntry} from '../eslint/eslint-types';
import {
  type LoadablePluginPrefix,
  type PackageToLoadInfo,
  type PluginPrefix,
  packageToLoadSymbol,
  packagesLoaders,
  parsersLoaders,
  pluginsLoaders,
} from '../loaders';
import type {NonEmptyTuple} from '../types';
import {
  type MaybeArray,
  arrayify,
  styleConfigName,
  stylePackageName,
  styleText,
  traverseForEach,
} from '../utils';
import type {ConfigEnabledBy, ConfigManifest, PackageToCheck} from './define-config';
import type {PackageRequester, UnConfigContext} from './shared';

const MISC_GROUP_CONFIGS_SET = new Set<keyof UnConfigs>(MISC_GROUP_CONFIGS);

const CONFIGS_TO_NOT_REPORT_IF_UNNECESSARILY_ENABLED_OR_DISABLED = new Set<keyof UnConfigs>([
  'fileProgress',
]);

const parsePackageToCheck = (packageNameAndMaybeVersionRange: PackageToCheck) => {
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
};

const getIsPackageInstalled = (
  context: UnConfigContext,
  {packageName, versionRangeToSatisfy}: ReturnType<typeof parsePackageToCheck>,
) => {
  const packageInfo = context.packagesInfo[packageName];
  return (
    packageInfo != null &&
    (!versionRangeToSatisfy || satisfies(packageInfo.info.version || '', versionRangeToSatisfy))
  );
};

function getIsConfigEnabled(
  this: UnConfigContext,
  configName: keyof UnConfigs,
  defaultConditionOrPackageInstalled:
    boolean | PackageToCheck | NonEmptyTuple<PackageToCheck> = true,
  {
    preCondition,
  }: {
    preCondition?: [condition: boolean, description: string];
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
  if (defaultConfigsStatus === 'misc-enabled' && MISC_GROUP_CONFIGS_SET.has(configName)) {
    enabledBySystem ??= true;
    reason ??=
      '`defaultConfigsStatus` is set to `misc-enabled` and the config is in the misc group';
  }
  if (typeof defaultConditionOrPackageInstalled === 'boolean') {
    enabledBySystem ??= defaultConditionOrPackageInstalled;
    reason ??= `config is ${defaultConditionOrPackageInstalled ? 'enabled' : 'disabled'} by default`;
  } else {
    const packagesList = arrayify(defaultConditionOrPackageInstalled).map(parsePackageToCheck);
    enabledBySystem ??= packagesList.some((packageToCheck) => {
      const isInstalled = getIsPackageInstalled(this, packageToCheck);
      if (isInstalled) {
        reason ??= `package ${stylePackageName(packageToCheck.packageName)} is installed`;
      }
      return isInstalled;
    });
    reason ??=
      packagesList.length > 1
        ? `neither of these packages are installed: ${packagesList.map(({packageName}) => stylePackageName(packageName)).join(', ')}`
        : `package ${stylePackageName(/* v8 ignore next - The list is never empty here */ packagesList[0]?.packageName || '')} is not installed`;
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

const resolveEnabledByCondition = (
  context: UnConfigContext,
  enabledBy: ConfigEnabledBy,
): boolean | PackageToCheck | NonEmptyTuple<PackageToCheck> => {
  if (typeof enabledBy === 'boolean') {
    return enabledBy;
  }
  if ('default' in enabledBy) {
    return enabledBy.default;
  }
  if ('package' in enabledBy) {
    return enabledBy.package;
  }
  if ('packages' in enabledBy) {
    return enabledBy.packages;
  }
  if ('packageAbsent' in enabledBy) {
    return !getIsPackageInstalled(context, parsePackageToCheck(enabledBy.packageAbsent));
  }
  if ('pathExists' in enabledBy) {
    return findUp.dir(enabledBy.pathExists) != null;
  }
  if ('packageManager' in enabledBy) {
    return context.meta.usedPackageManager?.name === enabledBy.packageManager;
  }
  if ('configDisabled' in enabledBy) {
    return !context.configsMeta[enabledBy.configDisabled].enabled;
  }
  if ('group' in enabledBy) {
    enabledBy.group satisfies 'misc';
    return false;
  }
  enabledBy satisfies never;
  return false;
};

/**
 * Same as {@link getIsConfigEnabled}, but the condition and the precondition come from the Config's
 * manifest instead of being spelled out at the call site
 */
export function getIsConfigEnabledByManifest(
  this: UnConfigContext,
  configName: keyof UnConfigs,
  {enabledBy = true, requires}: Pick<ConfigManifest, 'enabledBy' | 'requires'>,
  loadablePlugins: ReadonlyMap<LoadablePluginPrefix, {packageName: string; isLoadable: boolean}>,
) {
  const requiredPlugin = requires && loadablePlugins.get(requires.pluginLoadable);
  return getIsConfigEnabled.call(this, configName, resolveEnabledByCondition(this, enabledBy), {
    ...(requiredPlugin && {
      preCondition: [requiredPlugin.isLoadable, `\`${requiredPlugin.packageName}\` can be loaded`],
    }),
  });
}

type ModuleKind = 'package' | 'parser' | 'plugin';

const MODULE_LOADERS: Record<ModuleKind, Record<string, {packageName: string}>> = {
  package: packagesLoaders,
  parser: parsersLoaders,
  plugin: pluginsLoaders,
};

/**
 * Remembers why a module might need to be loaded, attributing it to the context it is called on
 * unless told otherwise.
 * A module no loader of ours stands behind, such as a plugin provided through `extraPlugins`, has
 * no package to report, and is therefore not recorded
 */
export function recordPackageRequester(
  this: UnConfigContext,
  moduleKind: ModuleKind,
  modulePrefix: string,
  requesters: MaybeArray<PackageRequester> | undefined = this.packageRequester,
) {
  const packageName = MODULE_LOADERS[moduleKind][modulePrefix]?.packageName;
  const requestersResolved = arrayify(requesters);
  if (!packageName || requestersResolved.length === 0) {
    return;
  }

  this.packageRequesters.set(
    packageName,
    new Set([...(this.packageRequesters.get(packageName) || []), ...requestersResolved]),
  );
}

export function registerUsedPlugin(
  this: UnConfigContext,
  pluginPrefix: PluginPrefix | (string & {}),
  requesters?: MaybeArray<PackageRequester>,
) {
  this.usedPlugins.add(pluginPrefix);
  this.recordPackageRequester('plugin', pluginPrefix, requesters);
}

/**
 * Records every package a config entry defers loading of for caching purposes
 */
export const savePackagesToLoadFromConfig = (
  context: UnConfigContext,
  config: EslintFlatConfigEntry,
  requesters?: MaybeArray<PackageRequester>,
) => {
  traverseForEach(
    config,
    (traverseContext, value) => {
      if (traverseContext.key !== packageToLoadSymbol) {
        return;
      }

      const info = value as PackageToLoadInfo;
      arrayify(info.package).forEach((packageId) => {
        context.usedPackages.set(packageId, [
          ...(context.usedPackages.get(packageId) || []),
          {
            config,
            path: traverseContext.path.slice(0, -1).join('.'),
            info,
          },
        ]);
        context.recordPackageRequester('package', packageId, requesters);
      });
    },
    {includeSymbols: true},
  );
};

export const configRequestsTypeInformation = (config: EslintFlatConfigEntry) => {
  const parserOptions = config.languageOptions?.['parserOptions'];
  return (
    typeof parserOptions === 'object' &&
    parserOptions != null &&
    ('projectService' in parserOptions || 'project' in parserOptions)
  );
};
