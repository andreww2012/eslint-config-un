import consola from 'consola';
import ourPackageJson from '../package.json' with {type: 'json'};
import {eslintConfigInternal} from '../src/config-un/config';
import {CONFIG_MANIFESTS, MISC_GROUP_CONFIGS} from '../src/configs/manifests.gen';
import {arrayify, styleConfigName, stylePackageName} from '../src/utils';
import {generateAngularPluginsWithOldRules} from './shared';
import {CONFIGS_META, PACKAGES_META} from './shared/packages-meta';

const {plugin: pluginAngular, pluginTemplate: pluginAngularTemplate} =
  await generateAngularPluginsWithOldRules();

const {errors} = await eslintConfigInternal(
  {
    loadPluginsOnDemand: false,
    plugins: {
      angular: {plugin: pluginAngular},
      'angular-template': {plugin: pluginAngularTemplate},
    },
    configs: {
      // Ensure all rules are enabled
      es: {
        ecmaVersion: 5,
        ecmaFeatures: {5: {default: false}},
      },
    },
  },
  {testMode: true},
);

const packagesToMoveToDirectDependencies = Array.from(
  Map.groupBy(
    MISC_GROUP_CONFIGS.flatMap((config) => {
      const configPackages = CONFIGS_META[config]?.packages || [];
      return configPackages
        .map((packageName) =>
          packageName in ourPackageJson.dependencies ||
          PACKAGES_META[packageName]?.optionalPeerDependencyReason != null
            ? null
            : {config, packageName},
        )
        .filter((v) => v != null);
    }),
    (item) => item.packageName,
  ),
  ([packageName, configsInfo]) => ({packageName, configs: configsInfo.map(({config}) => config)}),
);

if (packagesToMoveToDirectDependencies.length > 0) {
  errors.push({
    severity: 'error',
    message: [
      'The following packages should be moved to direct dependencies because they are used in configs from the `misc-enabled` group, or their plugin metadata should explain why they stay optional peer dependencies:',
      ...packagesToMoveToDirectDependencies.map(
        ({packageName, configs}) =>
          `\n- ${stylePackageName(packageName)} (used in config${configs.length > 1 ? 's' : ''}: ${configs.map((config) => styleConfigName(config)).join(', ')})`,
      ),
    ],
  });
}

const packagesWithNeedlessOptionalPeerDependencyReason = Object.keys(PACKAGES_META).filter(
  (packageName) =>
    PACKAGES_META[packageName]?.optionalPeerDependencyReason != null &&
    packageName in ourPackageJson.dependencies,
);

if (packagesWithNeedlessOptionalPeerDependencyReason.length > 0) {
  errors.push({
    severity: 'error',
    message: [
      'The following packages needlessly explain why they are optional peer dependencies as they are direct dependencies:',
      ...packagesWithNeedlessOptionalPeerDependencyReason.map(
        (packageName) => `\n- ${stylePackageName(packageName)}`,
      ),
    ],
  });
}

const directDependenciesServingOnlyDisabledConfigs = Object.entries(PACKAGES_META).flatMap(
  ([packageName, {configs, directDependencyReason}]) => {
    if (!(packageName in ourPackageJson.dependencies) || configs.length === 0) {
      return [];
    }

    const doesServeOnlyDisabledConfigs = configs.every(
      (config) => CONFIG_MANIFESTS[config]?.enabledBy === false,
    );
    if (doesServeOnlyDisabledConfigs === (directDependencyReason != null)) {
      return [];
    }

    return [{packageName, configs, isReasonNeedless: !doesServeOnlyDisabledConfigs}];
  },
);

const packagesToMoveToOptionalPeerDependencies =
  directDependenciesServingOnlyDisabledConfigs.filter(({isReasonNeedless}) => !isReasonNeedless);
if (packagesToMoveToOptionalPeerDependencies.length > 0) {
  errors.push({
    severity: 'error',
    message: [
      'The following packages should be moved to optional peer dependencies because every config they serve is disabled by default, or their plugin metadata should explain why they stay direct dependencies:',
      ...packagesToMoveToOptionalPeerDependencies.map(
        ({packageName, configs}) =>
          `\n- ${stylePackageName(packageName)} (used in config${configs.length > 1 ? 's' : ''}: ${configs.map((config) => styleConfigName(config)).join(', ')})`,
      ),
    ],
  });
}

const packagesWithNeedlessDirectDependencyReason =
  directDependenciesServingOnlyDisabledConfigs.filter(({isReasonNeedless}) => isReasonNeedless);
if (packagesWithNeedlessDirectDependencyReason.length > 0) {
  errors.push({
    severity: 'error',
    message: [
      'The following packages needlessly explain why they stay direct dependencies as some config they serve is enabled by default:',
      ...packagesWithNeedlessDirectDependencyReason.map(
        ({packageName, configs}) =>
          `\n- ${stylePackageName(packageName)} (used in config${configs.length > 1 ? 's' : ''}: ${configs.map((config) => styleConfigName(config)).join(', ')})`,
      ),
    ],
  });
}

const logger = consola.withTag('config-checker');

let errorsCount = 0;
let warningsCount = 0;
errors.forEach(({severity, message}) => {
  const isError = severity === 'error';
  isError ? (errorsCount += 1) : (warningsCount += 1);
  logger[isError ? 'error' : 'warn'](
    // @ts-expect-error This will work
    ...arrayify(message),
  );
});

if (errorsCount + warningsCount > 0) {
  logger[errorsCount > 0 ? 'fatal' : 'error'](
    `Test failed with ${[errorsCount > 0 && `${errorsCount} error${errorsCount === 1 ? '' : 's'}`, warningsCount > 0 && `${warningsCount} warning${warningsCount === 1 ? '' : 's'}`].filter(Boolean).join(' and ')}`,
  );
}

process.exit(errorsCount > 0 ? 1 : 0);
