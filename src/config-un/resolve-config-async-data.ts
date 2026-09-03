import {renderTable} from 'console-table-printer';
import {satisfies} from 'verkit';
import {type DisableAutofixPrefix, OPTIONAL_PEER_DEPENDENCIES} from '../constants';
import {eslintPluginVanillaRules} from '../eslint/eslint-shared';
import type {EslintFlatConfigEntry, EslintPlugin} from '../eslint/eslint-types';
import {
  disableAutofixForAllRulesInPlugin,
  getRuleNameAndPluginPrefixByFullName,
  removeRuleLanguagesFromPlugin,
  resolvePluginPrefix,
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
  objectKeysUnsafe,
  setByPath,
  styleConfigName,
  stylePackageName,
  stylePluginPrefix,
  styleRuleName,
  styleText,
} from '../utils';
import type {CacheDataInFs} from './cache';
import {replaceImportRulesImplementationWithIntegrityPlugin} from './import-integrity';
import {
  type EslintConfigUnOptions,
  type PackageRequester,
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
    if (!plugin || (installedPluginVersion && !satisfies(installedPluginVersion, versionRange))) {
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

const PACKAGE_REQUESTER_RENDERERS = {
  config: (configKeys) =>
    `${configKeys.map(styleConfigName).join(', ')} config${configKeys.length === 1 ? '' : 's'}`,
  option: (optionNames) =>
    `${optionNames.map((optionName) => styleText('cyan', optionName)).join(', ')} option${optionNames.length === 1 ? '' : 's'}`,
  package: (packageNames) => `a dependency of ${packageNames.map(stylePackageName).join(', ')}`,
} satisfies Record<string, (names: string[]) => string>;

/**
 * Turns the requesters of a single package into the reason it is needed, such as
 * "vue, svelte configs"
 */
const renderPackageRequesters = (
  requesters: ReadonlySet<PackageRequester> | undefined,
  collator: Intl.Collator,
) => {
  const requestersByType = Object.groupBy(requesters || [], (requester) =>
    requester.slice(0, requester.indexOf(':')),
  );

  const reasons = objectKeysUnsafe(PACKAGE_REQUESTER_RENDERERS).flatMap((requesterType) => {
    const names = (requestersByType[requesterType] || [])
      .map((requester) => requester.slice(requesterType.length + 1))
      .toSorted((nameA, nameB) => collator.compare(nameA, nameB));
    return names.length > 0 ? PACKAGE_REQUESTER_RENDERERS[requesterType](names) : [];
  });

  /* v8 ignore next - Everything requested is requested by someone */
  return reasons.length > 0 ? reasons.join(', ') : styleText('gray', 'Unknown');
};

interface ResolveConfigAsyncDataOptions {
  usedPluginPrefixes: string[];
  usedParserPrefixes: ParserPrefix[];
  usedPackagesPrefixes: LoadablePackagePrefix[];
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

  const {usedPluginPrefixes, usedParserPrefixes, usedPackagesPrefixes} =
    'cachedData' in options
      ? ({
          usedPluginPrefixes: options.cachedData.usedPlugins,
          usedParserPrefixes: Object.keys(
            options.cachedData.usedParsers,
          ) as ResolveConfigAsyncDataOptions['usedParserPrefixes'],
          usedPackagesPrefixes: Object.keys(
            options.cachedData.usedPackages,
          ) as ResolveConfigAsyncDataOptions['usedPackagesPrefixes'],
        } satisfies ResolveConfigAsyncDataOptions)
      : options;

  const cacheData = 'cachedData' in options ? options.cachedData : null;
  const cachedConfigsByName = Object.fromEntries(
    (cacheData?.configs || [])
      .map((config) =>
        config.name
          ? ([config.name, config] satisfies NonEmptyTuple)
          : // Every cached config is named
            /* v8 ignore next */ null,
      )
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
  const packagesBackingPlugins = new Set<string>();

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
            packagesBackingPlugins.add(packageToInstall.name);
          }
        }
        if (pluginPrefix) {
          const isProvided =
            rootOptions.plugins?.[pluginPrefix as Exclude<PluginPrefix, ''>]?.plugin != null;
          debug(
            `Plugin \`${stylePluginPrefix(pluginPrefix)}\` loaded${isProvided ? styleText('red', ' from the `plugins` option') : ''}, reason: ${loadPluginsOnDemand ? 'used in configs' : '`loadPluginsOnDemand` is set to `false`'}`,
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

  const packageRequesters = new Map<string, Set<PackageRequester>>(
    cacheData
      ? Object.entries(cacheData.packageRequesters).map(([packageName, requesters]) => [
          packageName,
          new Set(requesters),
        ])
      : Array.from(context.packageRequesters, ([packageName, requesters]) => [
          packageName,
          new Set(requesters),
        ]),
  );

  // Must be read only after the modules above were loaded: any of them might have failed to
  // resolve a dependency of its own. Nothing is cached when missing packages are found
  (cacheData ? new Map<string, Set<string>>() : context.missingPackages).forEach(
    (packagesFailedToLoadIt, missingPackage) => {
      if (!packagesToManuallyInstallOrUpdate.has(missingPackage)) {
        packagesToManuallyInstallOrUpdate.set(missingPackage, {
          versionRange: '',
        });
      }
      packageRequesters.set(
        missingPackage,
        new Set([
          ...(packageRequesters.get(missingPackage) || []),
          ...Array.from(packagesFailedToLoadIt, (packageName) => `package:${packageName}` as const),
        ]),
      );
    },
  );

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
      const packageTypes = arrayPartition(packages, (item) => packagesBackingPlugins.has(item.name))
        .map(
          (packagesOfType, i) =>
            packagesOfType.length > 0 &&
            `${i === 0 ? 'plugin' : 'package'}${packagesOfType.length === 1 ? '' : 's'}`,
        )
        .filter(Boolean)
        .join(' and ');

      const generateInstallationCommand = (names: string[], isExactly = false): string =>
        `${context.meta.usedPackageManager?.name || '<your package manager>'} i --save-dev${isExactly ? ' --save-exact' : ''} ${names.join(' ')}`;

      context.logger[isUpdates ? 'warn' : 'fatal'](
        `${capitalize(packageTypes)} that listed in optional peer dependencies ${packages.length === 1 ? 'was' : 'were'} used, but ${isUpdates ? 'does not satisfy the supported version range' : 'not installed'}. Please ${isUpdates ? 'update' : 'install'} ${packages.length === 1 ? 'it' : 'them'} by yourself or disable corresponding config${packages.length === 1 ? '' : 's'} in order for this error to disappear:
${renderTable(
  packages
    .toSorted((a, b) => collator.compare(a.name, b.name))
    .map(({name, versionRange}) => ({
      Name: stylePackageName(name),
      'Required version range': versionRange
        ? styleText('green', versionRange)
        : styleText('gray', 'Unknown'),
      'Required by': renderPackageRequesters(packageRequesters.get(name), collator),
    })),
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
... or guaranteed without them:
${styleText(
  'cyan',
  generateInstallationCommand(
    packages.map(({name}) => name),
    true,
  ),
)}
... with explicit minimal satisfying versions:
${styleText(
  'cyan',
  generateInstallationCommand(
    packages.map(({name, versionRange}) =>
      versionRange
        ? `${name}@${versionRange.replace(VERSION_IN_OUR_PEER_DEPENDENCIES_PREFIX_REGEX, '')}`
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
    /* v8 ignore next - The rules listed in the option are always prefixed */
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
        const pluginPrefix = resolvePluginPrefix(context, pluginPrefixCanonical);
        debug(
          `Created a copy of \`${stylePluginPrefix(pluginPrefix || '<builtin>')}\` plugin's rules with \`disable-autofix\` prefix`,
        );
        return Object.assign(res, disableAutofixForAllRulesInPlugin(pluginPrefix, plugin));
      }
      return res;
    }, {}),
  };

  const plugins = internalOptions.disableAutofixForAllFixableRulesOnly
    ? /* v8 ignore next - `disableAutofixForAllFixableRulesOnly` is not passed anywhere yet */ {}
    : Object.fromEntries(
        objectEntriesUnsafe(loadedPlugins).map(([pluginPrefixCanonical, plugin]) => {
          /* v8 ignore next - The vanilla rules are not registered as a plugin */
          const pluginPrefix = resolvePluginPrefix(context, pluginPrefixCanonical);
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

          const fixablePluginRules = Object.entries(
            /* v8 ignore next - A plugin whose autofixes are disabled always has rules */
            plugin.rules || {},
          )
            .filter(([, {meta: ruleMeta}]) => ruleMeta?.fixable)
            .map(([ruleName]) => ruleName);

          const isAutofixDisabledForAllPluginRulesByDefault =
            autofixDisabledGloballyFor === true ||
            (typeof autofixDisabledGloballyFor === 'object' &&
              autofixDisabledGloballyFor.plugins?.[pluginPrefixCanonical]) ||
            false;
          const rulesToDisableAutofixFor = fixablePluginRules.filter(
            (ruleName) =>
              pluginRulesAutofixDisabledStatuses[ruleName] ??
              isAutofixDisabledForAllPluginRulesByDefault,
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
              : /* v8 ignore next - No config loads several packages without a transform */ loadedPackagesForConfig,
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
