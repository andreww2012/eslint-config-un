import {renderTable} from 'console-table-printer';
import {
  type DisableAutofixPrefix,
  type EslintPlugin,
  type FlatConfigEntry,
  disableAutofixForAllRulesInPlugin,
  eslintPluginVanillaRules,
  getRuleNameAndPluginPrefixByFullName,
} from '../eslint';
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
  arraify,
  capitalize,
  getValueByPath,
  groupBy,
  isIn,
  objectEntriesUnsafe,
  partition,
  setValueByPath,
  stylePackageName,
  stylePluginPrefix,
  styleRuleName,
  styleText,
} from '../utils';
import type {CacheDataInFs} from './cache';
import {replaceImportRulesImplementationWithFastPlugin} from './fast-import';
import {checkIfModuleCorrectlyLoaded} from './is-module-loaded';
import type {EslintConfigUnOptions, UnConfigContext} from './shared';

// NOTE: please don't forget to sync this list with `autofixDisabledGloballyFor` option docs
const RULES_TO_DISABLE_AUTOFIX_GLOBALLY_BY_DEFAULT: (EslintConfigUnOptions['autofixDisabledGloballyFor'] &
  object)['rules'] = {
  // TODO add missing reasons for disabling autofixes
  'case-police/string-check': true,

  'ts/method-signature-style': true,
  'ts/no-unnecessary-type-arguments': true, // Could remove type aliases

  'unicorn/catch-error-name': true,
  'unicorn/consistent-existence-index-check': true,
  'unicorn/explicit-length-check': true, // Wrong auto-fixes
  'unicorn/no-useless-undefined': true,
  'unicorn/prefer-spread': true,
};

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
        const pluginResult = isIn(pluginPrefix, pluginsLoaders)
          ? await pluginsLoaders[pluginPrefix](context)
          : extraPlugins[pluginPrefix]
            ? await Promise.resolve(extraPlugins[pluginPrefix]()).then((module) => ({module}))
            : null;
        const plugin = pluginResult?.module;
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

        // eslint-disable-next-line ts/no-unsafe-assignment
        const parser = parserResult.module;
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
    partition(
      [...packagesToManuallyInstallOrUpdate.entries()].map(([name, item]) => ({...item, name})),
      (item) => item.installedVersion != null,
    ).forEach((packages, index) => {
      if (packages.length === 0) {
        return;
      }
      const isUpdates = index === 0;
      const packageTypes = partition(packages, (item) =>
        packagesToManuallyInstallPluginPrefixes.has(item.name),
      )
        .map(
          (packagesOfType, i) =>
            packagesOfType.length > 0 &&
            `${i === 0 ? 'plugin' : 'package'}${packagesOfType.length === 1 ? '' : 's'}`,
        )
        .filter(Boolean)
        .join(' and ');
      context.logger[isUpdates ? 'warn' : 'fatal'](
        `${capitalize(packageTypes)} that listed in optional peer dependencies ${packages.length === 1 ? 'was' : 'were'} used, but ${isUpdates ? 'does not satisfy the supported version range' : 'not installed'}. Please ${isUpdates ? 'update' : 'install'} ${packages.length === 1 ? 'it' : 'them'} by yourself or disable corresponding config${packages.length === 1 ? '' : 's'} in order for this error to disappear:
${renderTable(
  packages
    .toSorted((a, b) => a.name.localeCompare(b.name))
    .map(({name, versionRange}) => {
      const pluginPrefixes = packagesToManuallyInstallPluginPrefixes.get(name);
      return {
        Name: stylePackageName(name),
        'Required version range': versionRange
          ? styleText('green', versionRange)
          : styleText('gray', 'Unknown'),
        ...(pluginPrefixes?.size && {
          [`PLugin prefix${pluginPrefixes.size === 1 ? '' : 's'}`]: [...pluginPrefixes]
            .map(stylePluginPrefix)
            .join(', '),
        }),
      };
    }),
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

  const disableAutofixPluginsWithUnprefixedMethod = groupBy(
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

  const loadedPlugins = Object.fromEntries(loadedPluginsRaw.filter((v) => v != null)) as Partial<
    Record<PluginPrefix, EslintPlugin>
  >;
  replaceImportRulesImplementationWithFastPlugin(context, loadedPlugins);

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
              Object.keys(pluginRulesAutofixDisabledStatuses).length > 0 ||
              autofixDisabledGloballyFor === true
            )
          ) {
            return [pluginPrefix, plugin];
          }

          const fixablePluginRules = Object.entries(plugin.rules || {})
            .filter(([, {meta: ruleMeta}]) => ruleMeta?.fixable)
            .map(([ruleName]) => ruleName);

          const autofixDisabledForAllPluginRulesByDefault =
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
    ? Object.entries(cacheData.usedPackages).flatMap(([packagePrefix, packageUses]) =>
        packageUses
          .map(({configName, property, valueTransformFn}) => {
            const config = cachedConfigsByName[configName];
            if (!config) {
              return null;
            }

            type ValueTransformFn = PackageToLoadInfo['valueTransformFn'] & {};
            return {
              config,
              path: property, // serialized `property` contains the full path
              info: {
                package: packagePrefix as LoadablePackagePrefix,
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
                        // eslint-disable-next-line ts/no-implied-eval, no-new-func
                        fn: new Function('...args', functionBody) as ValueTransformFn['fn'],
                        ...('1' in valueTransformFn && {scope: valueTransformFn[1]}),
                      },
                    };
                  })()),
              } satisfies PackageToLoadInfo as PackageToLoadInfo,
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
  const packagesUsesGrouped = Object.entries(groupBy(allPackageUses, (v) => v.path)).map(
    ([fullPath, items]) => ({fullPath, items}),
  );

  configModifyFns.push(() => {
    packagesUsesGrouped.forEach(({fullPath, items}) => {
      const {
        config,
        info: {valueTransformFn},
        // eslint-disable-next-line ts/no-non-null-assertion
      } = items[0]!;
      const packageModules = Object.fromEntries(
        items.flatMap((item) =>
          arraify(item.info.package).map((packageId) => [packageId, loadedPackagesMap[packageId]]),
        ),
      );

      setValueByPath(
        config,
        fullPath,
        valueTransformFn
          ? valueTransformFn.fn.call(
              valueTransformFn.scope,
              // @ts-expect-error keys type is lost
              packageModules,
              getValueByPath(config, fullPath),
            )
          : Object.keys(packageModules).length === 1
            ? Object.values(packageModules)[0]
            : packageModules,
      );
    });
  });

  return {
    loadedPlugins,
    plugins: {
      ...plugins,
      ['disable-autofix' satisfies DisableAutofixPrefix]: disableAutofixPlugin,
    } satisfies FlatConfigEntry['plugins'] & {} as FlatConfigEntry['plugins'] & {},
    disableAutofixPlugin,
    modifyConfigs,
  };
};
