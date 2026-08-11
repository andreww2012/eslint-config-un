import {renderTable} from 'console-table-printer';
import semver from 'semver';
import {type DisableAutofixPrefix, OPTIONAL_PEER_DEPENDENCIES} from '../constants';
import {eslintPluginVanillaRules} from '../eslint/eslint-shared';
import type {EslintFlatConfigEntry, EslintPlugin} from '../eslint/eslint-types';
import {
  disableAutofixForAllRulesInPlugin,
  getRuleNameAndPluginPrefixByFullName,
  removeRuleLanguagesFromPlugin,
} from '../eslint/eslint-utils';
import {
  type LoadablePackagePrefix,
  type PackageToLoadInfo,
  type ParserPrefix,
  type PluginPrefix,
  packagesLoaders,
  parsersLoaders,
  pluginsLoaders,
} from '../loaders';
import type {NonEmptyTuple} from '../types';
import {
  arrayPartition,
  arrayify,
  capitalize,
  fetchPackageInfo,
  getByPath,
  isKeyIn,
  maybeCall,
  objectEntriesUnsafe,
  setByPath,
  stylePackageName,
  stylePluginPrefix,
  styleRuleName,
  styleText,
} from '../utils';
import type {CacheDataInFs} from './cache';
import {replaceImportRulesImplementationWithIntegrityPlugin} from './import-integrity';
import {
  type EslintConfigUnOptions,
  RULES_TO_DISABLE_AUTOFIX_GLOBALLY_BY_DEFAULT,
  type UnConfigContext,
} from './shared';

const checkIfModuleCorrectlyLoaded = async (
  moduleResult: {packageName: string; module: unknown} | null,
) => {
  const plugin = moduleResult?.module;
  if (moduleResult && isKeyIn(moduleResult.packageName, OPTIONAL_PEER_DEPENDENCIES)) {
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

const VERSION_IN_OUR_PEER_DEPENDENCIES_PREFIX_REGEX = /^(?:\^|~)/;

interface ResolveConfigAsyncDataOptions {
  usedPluginPrefixes: string[];
  usedParserPrefixes: ParserPrefix[];
  usedPackagesPrefixes: LoadablePackagePrefix[];
  missingPackages: string[];
}

export const resolveConfigAsyncData = async (
  context: UnConfigContext,
  options: ResolveConfigAsyncDataOptions | {cachedData: CacheDataInFs},
) => {
  const {debug, internalOptions, rootOptions} = context;
  const {
    autofixDisabledGloballyFor: autofixDisabledGloballyForRaw,
    extraPlugins = {},
    loadPluginsOnDemand,
  } = rootOptions;

  const {usedPluginPrefixes, usedParserPrefixes, usedPackagesPrefixes, missingPackages} =
    'cachedData' in options
      ? ({
          usedPluginPrefixes: options.cachedData.usedPlugins,
          usedParserPrefixes: Object.keys(
            options.cachedData.usedParsers,
          ) as ResolveConfigAsyncDataOptions['usedParserPrefixes'],
          usedPackagesPrefixes: Object.keys(
            options.cachedData.usedPackages,
          ) as ResolveConfigAsyncDataOptions['usedPackagesPrefixes'],
          missingPackages: [], // We don't cache if missing packages are found
        } satisfies ResolveConfigAsyncDataOptions)
      : options;

  const cacheData = 'cachedData' in options ? options.cachedData : null;
  const cachedConfigsByName = Object.fromEntries(
    (cacheData?.configs || [])
      .map((config) => (config.name ? ([config.name, config] satisfies NonEmptyTuple) : null))
      .filter((v) => v != null),
  );

  const packagesToManuallyInstallOrUpdate = new Map<
    string,
    {
      /** Note: may be empty */
      versionRange: string;
      installedVersion?: string;
    }
  >();
  const packagesToManuallyInstallPluginPrefixes = new Map<string, Set<PluginPrefix>>();

  const configModifyFns: (() => void)[] = [];
  const modifyConfigs = () => {
    configModifyFns.forEach((fn) => {
      fn();
    });
  };

  const [loadedPluginsRaw, , loadedPackages] = await Promise.all([
    Promise.all(
      usedPluginPrefixes.map(async (pluginPrefix) => {
        const pluginResult = isKeyIn(pluginPrefix, pluginsLoaders)
          ? await pluginsLoaders[pluginPrefix](context)
          : extraPlugins[pluginPrefix]
            ? await Promise.resolve(maybeCall(extraPlugins[pluginPrefix])).then((module) => ({
                module,
              }))
            : null;
        if (pluginResult && 'packageName' in pluginResult) {
          const packageToInstall = await checkIfModuleCorrectlyLoaded(pluginResult);
          if (packageToInstall) {
            packagesToManuallyInstallOrUpdate.set(packageToInstall.name, packageToInstall);
            packagesToManuallyInstallPluginPrefixes.set(
              packageToInstall.name,
              new Set([
                ...(packagesToManuallyInstallPluginPrefixes.get(packageToInstall.name) || []),
                pluginPrefix as PluginPrefix,
              ]),
            );
          }
        }
        if (pluginPrefix) {
          const isProvided =
            rootOptions.pluginOverrides?.[pluginPrefix as Exclude<PluginPrefix, ''>] != null;
          debug(
            `Plugin \`${stylePluginPrefix(pluginPrefix)}\` loaded${isProvided ? styleText('red', ' from `pluginOverrides`') : ''}, reason: ${loadPluginsOnDemand ? 'used in configs' : '`loadPluginsOnDemand` is set to `false`'}`,
          );
        }
        const plugin = pluginResult?.module;
        return plugin ? ([pluginPrefix, plugin] as const) : null;
      }),
    ),

    Promise.all(
      usedParserPrefixes.map(async (parserPrefix) => {
        const parserResult = await parsersLoaders[parserPrefix](context);

        const packageToInstall = await checkIfModuleCorrectlyLoaded(parserResult);
        if (packageToInstall) {
          packagesToManuallyInstallOrUpdate.set(packageToInstall.name, packageToInstall);
        }

        const parser = parserResult.module as unknown;
        if (!parser) {
          return;
        }

        const configs = cacheData
          ? cacheData.usedParsers[parserPrefix]
              ?.map((configName) => cachedConfigsByName[configName])
              .filter((v) => v != null)
          : context.usedParsers.get(parserPrefix);
        configModifyFns.push(() => {
          configs?.forEach((config) => {
            config.languageOptions = {
              ...config.languageOptions,
              parser,
            };
          });
        });
      }),
    ),

    Promise.all(
      usedPackagesPrefixes.map(async (packagePrefix) => {
        const packageResult = await packagesLoaders[packagePrefix](context);

        const packageToInstall = await checkIfModuleCorrectlyLoaded(packageResult);
        if (packageToInstall) {
          packagesToManuallyInstallOrUpdate.set(packageToInstall.name, packageToInstall);
        }

        const packageModule = packageResult.module;
        if (!packageModule) {
          return null;
        }

        return {
          packagePrefix,
          packageModule,
        };
      }),
    ),
  ]);

  missingPackages.forEach((missingPackage) => {
    if (!packagesToManuallyInstallOrUpdate.has(missingPackage)) {
      packagesToManuallyInstallOrUpdate.set(missingPackage, {
        versionRange: '',
      });
    }
  });

  if (packagesToManuallyInstallOrUpdate.size > 0) {
    const collator = new Intl.Collator();
    arrayPartition(
      Array.from(packagesToManuallyInstallOrUpdate, ([name, item]) => ({...item, name})),
      (item) => item.installedVersion != null,
    ).forEach((packages, index) => {
      if (packages.length === 0) {
        return;
      }
      const isUpdates = index === 0;
      const packageTypes = arrayPartition(packages, (item) =>
        packagesToManuallyInstallPluginPrefixes.has(item.name),
      )
        .map(
          (packagesOfType, i) =>
            packagesOfType.length > 0 &&
            `${i === 0 ? 'plugin' : 'package'}${packagesOfType.length === 1 ? '' : 's'}`,
        )
        .filter(Boolean)
        .join(' and ');

      const generateInstallationCommand = (names: string[]): string =>
        `${context.meta.usedPackageManager?.name || '<your package manager>'} i --save-dev ${names.join(' ')}`;

      context.logger[isUpdates ? 'warn' : 'fatal'](
        `${capitalize(packageTypes)} that listed in optional peer dependencies ${packages.length === 1 ? 'was' : 'were'} used, but ${isUpdates ? 'does not satisfy the supported version range' : 'not installed'}. Please ${isUpdates ? 'update' : 'install'} ${packages.length === 1 ? 'it' : 'them'} by yourself or disable corresponding config${packages.length === 1 ? '' : 's'} in order for this error to disappear:
${renderTable(
  packages
    .toSorted((a, b) => collator.compare(a.name, b.name))
    .map(({name, versionRange}) => {
      const pluginPrefixes = packagesToManuallyInstallPluginPrefixes.get(name);
      return {
        Name: stylePackageName(name),
        'Required version range': versionRange
          ? styleText('green', versionRange)
          : styleText('gray', 'Unknown'),
        ...(pluginPrefixes?.size && {
          [`Plugin prefix${pluginPrefixes.size === 1 ? '' : 's'}`]: Array.from(
            pluginPrefixes,
            stylePluginPrefix,
          ).join(', '),
        }),
      };
    }),
)}
Install them with:
${styleText('cyan', generateInstallationCommand(packages.map(({name}) => name)))}
... with explicit version ranges:
${styleText(
  'cyan',
  generateInstallationCommand(
    packages.map(({name, versionRange}) => `${name}@${versionRange || 'latest'}`),
  ),
)}
... with explicit minimal satisfying versions:
${styleText(
  'cyan',
  generateInstallationCommand(
    packages.map(({name, versionRange}) =>
      versionRange
        ? `${name}@${versionRange ? versionRange.replace(VERSION_IN_OUR_PEER_DEPENDENCIES_PREFIX_REGEX, '') : 'latest'}`
        : name,
    ),
  ),
)}`,
      );
    });
  }

  const autofixDisabledGloballyFor: EslintConfigUnOptions['autofixDisabledGloballyFor'] =
    autofixDisabledGloballyForRaw === true
      ? true
      : autofixDisabledGloballyForRaw === false
        ? {}
        : {
            ...autofixDisabledGloballyForRaw,
            rules: {
              ...RULES_TO_DISABLE_AUTOFIX_GLOBALLY_BY_DEFAULT,
              ...autofixDisabledGloballyForRaw?.rules,
            },
          };

  const disableAutofixPluginsWithUnprefixedMethod = Object.groupBy(
    Object.entries(
      typeof autofixDisabledGloballyFor === 'object' ? autofixDisabledGloballyFor.rules || {} : {},
    ).map(([ruleName, isAutofixDisabled]) => ({
      ...getRuleNameAndPluginPrefixByFullName(context, ruleName),
      isAutofixDisabled,
    })),
    (item) => item.pluginPrefixCanonical || '',
  );

  const disableAutofixPluginsWithPrefixedMethod = objectEntriesUnsafe(
    context.disabledAutofixes,
  ).map(([pluginPrefix, ruleNames = []]) => ({
    pluginPrefix,
    ruleNames,
  }));

  const loadedPlugins = Object.fromEntries(
    loadedPluginsRaw
      .filter((v) => v != null)
      .map(([pluginPrefix, plugin]) => [
        pluginPrefix,
        internalOptions.keepRuleMetaLanguages ? plugin : removeRuleLanguagesFromPlugin(plugin),
      ]),
  ) as Partial<Record<PluginPrefix, EslintPlugin>>;
  replaceImportRulesImplementationWithIntegrityPlugin(context, loadedPlugins);

  const disableAutofixPlugin: EslintPlugin = {
    meta: {
      name: 'eslint-plugin-disable-autofix',
    },
    rules: objectEntriesUnsafe({
      ...loadedPlugins,
      '': eslintPluginVanillaRules,
    }).reduce<EslintPlugin['rules'] & {}>((res, [pluginPrefixCanonical, plugin]) => {
      if (
        plugin &&
        (disableAutofixPluginsWithPrefixedMethod.some(
          (v) => v.pluginPrefix === pluginPrefixCanonical,
        ) ||
          internalOptions.disableAutofixForAllFixableRulesOnly)
      ) {
        const pluginPrefix =
          pluginPrefixCanonical === ''
            ? ''
            : rootOptions.pluginRenames?.[pluginPrefixCanonical] || pluginPrefixCanonical;
        debug(
          `Created a copy of \`${stylePluginPrefix(pluginPrefix || '<builtin>')}\` plugin's rules with \`disable-autofix\` prefix`,
        );
        return Object.assign(res, disableAutofixForAllRulesInPlugin(pluginPrefix, plugin));
      }
      return res;
    }, {}),
  };

  const plugins = internalOptions.disableAutofixForAllFixableRulesOnly
    ? {}
    : Object.fromEntries(
        objectEntriesUnsafe(loadedPlugins).map(([pluginPrefixCanonical, plugin]) => {
          const pluginPrefix =
            pluginPrefixCanonical === ''
              ? ''
              : rootOptions.pluginRenames?.[pluginPrefixCanonical] || pluginPrefixCanonical;
          const pluginRulesAutofixDisabledStatuses = Object.fromEntries(
            (disableAutofixPluginsWithUnprefixedMethod[pluginPrefixCanonical] || []).map(
              ({ruleNameUnprefixed, isAutofixDisabled}) => [ruleNameUnprefixed, isAutofixDisabled],
            ),
          );

          if (
            !plugin ||
            !(
              autofixDisabledGloballyFor === true ||
              Object.keys(pluginRulesAutofixDisabledStatuses).length > 0
            )
          ) {
            return [pluginPrefix, plugin];
          }

          const fixablePluginRules = Object.entries(plugin.rules || {})
            .filter(([, {meta: ruleMeta}]) => ruleMeta?.fixable)
            .map(([ruleName]) => ruleName);

          const autofixDisabledForAllPluginRulesByDefault =
            autofixDisabledGloballyFor === true ||
            (typeof autofixDisabledGloballyFor === 'object' &&
              autofixDisabledGloballyFor.plugins?.[pluginPrefixCanonical]) ||
            false;
          const rulesToDisableAutofixFor = fixablePluginRules.filter(
            (ruleName) =>
              pluginRulesAutofixDisabledStatuses[ruleName] ??
              autofixDisabledForAllPluginRulesByDefault,
          );

          if (rulesToDisableAutofixFor.length === 0) {
            return [pluginPrefix, plugin];
          }

          const rulesCountWithAutofixNotDisabled =
            fixablePluginRules.length - rulesToDisableAutofixFor.length;
          if (rulesCountWithAutofixNotDisabled > 0) {
            const areMostAutofixesDisabled =
              rulesCountWithAutofixNotDisabled < fixablePluginRules.length / 2;
            debug(
              `Globally disabling autofix for ${areMostAutofixesDisabled ? `${styleText('red', 'all rules')} in ${stylePluginPrefix(pluginPrefix)} plugin except for` : `the following ${stylePluginPrefix(pluginPrefix)} plugin rules`}: ${(areMostAutofixesDisabled ? fixablePluginRules.filter((ruleName) => !rulesToDisableAutofixFor.includes(ruleName)) : rulesToDisableAutofixFor).map((ruleName) => styleRuleName(ruleName)).join(', ')}`,
            );
          } else {
            debug(
              `Globally disabling autofix for ${styleText('red', 'all rules')} in ${stylePluginPrefix(pluginPrefix)} plugin`,
            );
          }

          return [
            pluginPrefix,
            {
              ...plugin,
              rules: disableAutofixForAllRulesInPlugin('', plugin, {
                includeRulesWithoutAutofix: true,
                onlyRules: rulesToDisableAutofixFor,
              }),
            } satisfies typeof plugin,
          ];
        }),
      );

  const loadedPackagesMap = Object.fromEntries(
    loadedPackages.filter((v) => v != null).map((v) => [v.packagePrefix, v.packageModule]),
  );

  const allPackageUses = cacheData
    ? objectEntriesUnsafe(cacheData.usedPackages).flatMap(([, packageUses = []]) =>
        packageUses
          .map(({configName, package: packagesToLoad, property, valueTransformFn}) => {
            const config = cachedConfigsByName[configName];
            if (!config) {
              return null;
            }

            type ValueTransformFn = PackageToLoadInfo['valueTransformFn'] & {};
            return {
              config,
              path: property, // serialized `property` contains the full path
              info: {
                package: packagesToLoad,
                property,
                ...(valueTransformFn &&
                  (() => {
                    const functionBodyRaw = valueTransformFn[0];
                    const isStartsWithPropertyName = functionBodyRaw.startsWith(
                      `${'fn' satisfies keyof ValueTransformFn}(`,
                    );
                    const isRegularFunction =
                      isStartsWithPropertyName || functionBodyRaw.startsWith('function ');
                    const functionBody = `return (${isStartsWithPropertyName ? 'function ' : ''}${functionBodyRaw})${isRegularFunction ? '.call(this, ' : '('}...args)`;
                    return {
                      valueTransformFn: {
                        // eslint-disable-next-line no-new-func, ts/no-implied-eval
                        fn: new Function('...args', functionBody) as ValueTransformFn['fn'],
                        ...('1' in valueTransformFn && {scope: valueTransformFn[1]}),
                      },
                    };
                  })()),
              } satisfies PackageToLoadInfo,
            };
          })
          .filter((v) => v != null),
      )
    : [...context.usedPackages.values()].flatMap((packageUses) =>
        packageUses.map((packageUse) => ({
          ...packageUse,
          path: [packageUse.path, packageUse.info.property].filter(Boolean).join('.'),
        })),
      );

  configModifyFns.push(() => {
    allPackageUses.forEach(
      ({config, path: fullPath, info: {valueTransformFn, package: packagesToLoad}}) => {
        const loadedPackagesForConfig = Object.fromEntries(
          arrayify(packagesToLoad).map((packageId) => [packageId, loadedPackagesMap[packageId]]),
        );

        setByPath(
          config,
          fullPath,
          valueTransformFn
            ? valueTransformFn.fn.call(
                valueTransformFn.scope,
                // @ts-expect-error keys type is lost
                loadedPackagesForConfig,
                getByPath(config, fullPath),
              )
            : Object.keys(loadedPackagesForConfig).length === 1
              ? Object.values(loadedPackagesForConfig)[0]
              : loadedPackagesForConfig,
        );
      },
    );
  });

  return {
    loadedPlugins,
    plugins: {
      ...plugins,
      ['disable-autofix' satisfies DisableAutofixPrefix]: disableAutofixPlugin,
    } satisfies EslintFlatConfigEntry['plugins'] & {} as EslintFlatConfigEntry['plugins'] & {},
    disableAutofixPlugin,
    modifyConfigs,
  };
};
