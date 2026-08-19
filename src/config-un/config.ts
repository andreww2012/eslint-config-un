import {isMainThread} from 'node:worker_threads';
import consola from 'consola';
import globals from 'globals';
import {createDebug} from 'obug';
import {detect as detectPackageManager} from 'package-manager-detector/detect';
import type {UnConfigs} from '../configs';
import type {ManifestConfigKey, UnConfigResults} from '../configs/index.gen';
import {CONFIG_MANIFESTS, CONFIG_ORDER} from '../configs/manifests.gen';
import {
  DEFAULT_GLOBAL_IGNORES,
  DISABLE_AUTOFIX,
  ERROR,
  GLOB_CONFIG_FILES,
  PACKAGES_TO_GET_INFO_FOR,
  WARNING,
} from '../constants';
import type {
  EslintFlatConfigEntry,
  UnAllRuleNames,
  UnFlatConfigEntryBase,
  UnRulesConfig,
} from '../eslint/eslint-types';
import {genFlatConfigEntryName, isUnFlatConfigEntry} from '../eslint/eslint-utils';
import {
  LOADABLE_PLUGIN_PREFIXES_LIST,
  PLUGIN_PREFIXES_LIST,
  type PluginPrefix,
  pluginsLoaders,
} from '../loaders';
import type {Falsy, MaybePromise, OmitIndexSignature, OmitStrict, PartialDeep} from '../types';
import {
  type MaybeArray,
  arrayIncludes,
  arrayify,
  assignDefaults,
  fetchPackageInfo,
  interopDefault,
  isInCi,
  isInEditor,
  maybeCall,
  objectEntriesUnsafe,
  objectKeysUnsafe,
  omit,
  readFileSafe,
  styleConfigName,
  stylePluginPrefix,
  styleRuleName,
  styleText,
} from '../utils';
import {
  restoreCacheFromFs,
  restoreCacheFromMemory,
  saveCacheToFs,
  saveCacheToMemory,
} from './cache';
import {ConfigEntryBuilder, configIndexProperty} from './config-entry-builder';
import {getIsConfigEnabledByManifest as getIsConfigEnabledByManifestContextless} from './config-utils';
import {CASCADE_ANCHORS, type CascadeAnchor} from './define-config';
import type {ImportIntegrityPluginSettings} from './import-integrity';
import {resolveConfigAsyncData} from './resolve-config-async-data';
import {
  ENVIRONMENTS,
  type Environment,
  type EslintConfigUnInternalOptions,
  type EslintConfigUnOptions,
  type ExtraPluginsType,
  type UnConfigContext,
  processUnOrFlatConfig,
} from './shared';

export function createConfigBuilder<
  ExtraPlugins extends ExtraPluginsType,
  P extends PluginPrefix | null,
>(
  this: UnConfigContext<ExtraPlugins>,
  options: NoInfer<
    | UnFlatConfigEntryBase<ExtraPlugins, P extends null ? OmitIndexSignature<UnRulesConfig> : P>
    | boolean
  >,
  rulesPrefix: P,
  disabledIfEmptyFiles = true,
) {
  const optionsResolved = typeof options === 'object' ? options : {};
  if (
    !options ||
    (disabledIfEmptyFiles &&
      Array.isArray(optionsResolved.files) &&
      optionsResolved.files.length === 0)
  ) {
    return null;
  }
  return new ConfigEntryBuilder<ExtraPlugins, P>(
    rulesPrefix,
    // eslint-disable-next-line ts/no-unnecessary-condition
    options && typeof options === 'object' ? options : {},
    this,
  );
}

const RULES_TO_DISABLE_IN_OFFLINE_MODE = [
  'markdown-links/no-dead-urls',
  'json-schema-validator/no-invalid',
  'node-dependencies/compat-engines',
  'node-dependencies/no-deprecated',
  'node-dependencies/no-restricted-deps',
  'node-dependencies/require-provenance-deps',
  'lockfile/binary-conflicts',
  'lockfile/integrity',
  'lockfile/minimum-release-age',
] satisfies UnAllRuleNames[];

const PLUGINS_CONFIG_NAME = genFlatConfigEntryName('global-setup/plugins');

interface TestError {
  message: MaybeArray<string>;
  severity: 'error' | 'warn';
}

export function eslintConfigInternal<const ExtraPlugins extends ExtraPluginsType>(
  options?: EslintConfigUnOptions<ExtraPlugins>,
  internalOptions?: EslintConfigUnInternalOptions & {testMode?: false},
): Promise<EslintFlatConfigEntry[]>;
export function eslintConfigInternal<const ExtraPlugins extends ExtraPluginsType>(
  options?: EslintConfigUnOptions<ExtraPlugins>,
  internalOptions?: EslintConfigUnInternalOptions & {testMode: true},
): Promise<{configs: EslintFlatConfigEntry[]; errors: TestError[]}>;
export async function eslintConfigInternal<const ExtraPlugins extends ExtraPluginsType>(
  options: EslintConfigUnOptions<ExtraPlugins> = {},
  internalOptions: EslintConfigUnInternalOptions = {},
): Promise<EslintFlatConfigEntry[] | {configs: EslintFlatConfigEntry[]; errors: TestError[]}> {
  const logger = consola.withTag('eslint-config-un');
  logger.addReporter({
    log(logObj) {
      if (logObj.type === 'fatal') {
        process.exit(1);
      }
    },
  });
  // TODO come up with better solution
  // Prevents logging the same messages when eslint is ran in the concurrent mode
  /* v8 ignore next -- tests never run the generator off the main thread */
  if (!isMainThread) {
    logger.pauseLogs();
  }

  const debug = createDebug('eslint-config-un');

  debug('Initialization');

  const isTestMode = internalOptions.testMode ?? Boolean(process.env['ESLINT_CONFIG_UN_TEST_MODE']);

  if (
    isTestMode ||
    (internalOptions.disableWarnings ?? Boolean(process.env['ESLINT_CONFIG_UN_DISABLE_WARNINGS']))
  ) {
    debug('Warnings will not be printed');
    logger.level = 0; // Fatal and Error only
  }

  const environmentDetected: Environment = isInCi ? 'ci' : isInEditor() ? 'editor' : 'default';

  const environmentFromEnvVar = process.env['ESLINT_CONFIG_UN_ENVIRONMENT'];
  const isEnvironmentFromEnvVarValid =
    environmentFromEnvVar != null && arrayIncludes(ENVIRONMENTS, environmentFromEnvVar);
  if (environmentFromEnvVar && !isEnvironmentFromEnvVarValid) {
    logger.warn(
      `Ignoring ESLINT_CONFIG_UN_ENVIRONMENT environment variable: "${environmentFromEnvVar}" is not one of ${ENVIRONMENTS.join(', ')}`,
    );
  }
  const environmentBeforeOption = isEnvironmentFromEnvVarValid
    ? environmentFromEnvVar
    : environmentDetected;

  const environmentFromOption = maybeCall(options.environment, environmentBeforeOption);
  const environment = environmentFromOption ?? environmentBeforeOption;
  const environmentSource =
    environmentFromOption == null
      ? isEnvironmentFromEnvVarValid
        ? 'via ESLINT_CONFIG_UN_ENVIRONMENT environment variable'
        : null
      : 'via the option';
  debug(
    `Resolved \`environment\`: \`${environment}\`${
      environmentSource
        ? ` (${environmentSource}), the detected environment: \`${environmentDetected}\``
        : ' (detected)'
    }`,
  );

  const optionsResolved = assignDefaults(options, {
    mode: 'app',
    extraConfigs: [],
    loadPluginsOnDemand: true,
    offlineMode: Boolean(process.env['ESLINT_CONFIG_UN_OFFLINE_MODE']),
  });

  optionsResolved.cacheConfigs =
    options.cacheConfigs ??
    (environment === 'editor' || Boolean(process.env['ESLINT_CONFIG_UN_CACHE_CONFIGS']));
  const {cacheConfigs} = optionsResolved;
  debug(`Is config caching enabled: ${cacheConfigs}`);

  const [usedPackageManager, fixableRulesPerPlugin] = await Promise.all([
    detectPackageManager(),
    // The file may be absent since it's generated, and its generator script
    // executes this code
    import('../eslint-types-fixable-only.gen')
      .then((module) => module.FIXABLE_RULES_PER_PLUGIN)
      .catch(() => ({})),
  ]);

  debug(`Detected package manager: ${usedPackageManager?.name ?? '<not detected>'}`);

  const typeInfoRulesRaw = optionsResolved.typeInfoRules;
  const typeInfoRulesObject = typeof typeInfoRulesRaw === 'object' ? typeInfoRulesRaw : undefined;
  const typeInfoRulesUserMode =
    typeof typeInfoRulesRaw === 'string' ? typeInfoRulesRaw : typeInfoRulesObject?.mode;
  const typeInfoRulesResolved: UnConfigContext['typeInfoRulesResolved'] = {
    // `mode` is finalized later, after the `ts` config is loaded (see below)
    mode: typeInfoRulesUserMode ?? 'standalone',
  };
  if (typeInfoRulesObject?.ignores?.length) {
    typeInfoRulesResolved.ignores = typeInfoRulesObject.ignores;
  }
  if (typeInfoRulesObject && 'allowDefaultProject' in typeInfoRulesObject) {
    if (typeInfoRulesObject.allowDefaultProject?.length) {
      typeInfoRulesResolved.parserOptions = {
        projectService: {
          allowDefaultProject: typeInfoRulesObject.allowDefaultProject,
        },
      };
    }
  } else if (typeInfoRulesObject && 'parserOptions' in typeInfoRulesObject) {
    typeInfoRulesResolved.parserOptions = typeInfoRulesObject.parserOptions;
  }

  const context = Object.freeze({
    packagesInfo: {},
    rootOptions: optionsResolved,
    internalOptions,
    configsMeta: {},
    typeInfoRulesResolved,
    disabledAutofixes: {},
    fixableRulesPerPlugin,
    usedPlugins: new Set(),
    usedParsers: new Map(),
    usedPackages: new Map(),
    missingPackages: new Set(),
    meta: {usedPackageManager, environment},
    logger,
    debug,
    isTestMode,
    tests: [],
    createConfigBuilder,
  } satisfies PartialDeep<Pick<UnConfigContext, 'packagesInfo' | 'configsMeta'>> &
    OmitStrict<
      UnConfigContext,
      'packagesInfo' | 'configsMeta'
    > as unknown as UnConfigContext<ExtraPlugins>);

  if (cacheConfigs) {
    debug('Attempting to restore configs from memory cache');

    const configFromMemoryCache = await restoreCacheFromMemory(context);
    if (configFromMemoryCache) {
      debug('Successfully restored configs from memory cache');
      return configFromMemoryCache.config;
    }

    debug('Attempting to restore configs from file system cache');

    const configFromFsCache = await restoreCacheFromFs(context);
    if (configFromFsCache) {
      debug('Successfully restored configs from file system cache');

      const {plugins, modifyConfigs} = await resolveConfigAsyncData(context, {
        cachedData: configFromFsCache,
      });
      modifyConfigs();

      const pluginConfig = configFromFsCache.configs.find(
        (config) => config.name === PLUGINS_CONFIG_NAME,
      );
      if (pluginConfig) {
        pluginConfig.plugins = plugins;
      }

      const finalConfig = configFromFsCache.configs;

      debug('Saving config restored from the file system cache to memory');
      await saveCacheToMemory(context, {config: finalConfig});

      return finalConfig;
    }

    debug("Could not restore configs from cache - it's either stale or an error occurred");
  }

  const requiredPluginPrefixes = [
    ...new Set(
      Object.values(CONFIG_MANIFESTS).flatMap(({requires}) =>
        requires ? [requires.pluginLoadable] : [],
      ),
    ),
  ];

  const [packagesInfoRaw, gitignoreFile, loadablePluginsRaw] = await Promise.all([
    Promise.all(
      PACKAGES_TO_GET_INFO_FOR.map(
        async (name) =>
          [name, await fetchPackageInfo(optionsResolved.packageAliases?.[name] || name)] as const,
      ),
    ),
    readFileSafe('.gitignore'),
    Promise.all(
      requiredPluginPrefixes.map(async (pluginPrefix) => {
        const {packageName, module} = await pluginsLoaders[pluginPrefix](context);
        return [pluginPrefix, {packageName, isLoadable: module != null}] as const;
      }),
    ),
  ]);

  const loadablePlugins = new Map(loadablePluginsRaw);

  const packagesInfo = Object.fromEntries(packagesInfoRaw) as UnConfigContext['packagesInfo'];
  Object.assign(context.packagesInfo, packagesInfo satisfies UnConfigContext['packagesInfo']);

  debug(`Found .gitignore file: ${gitignoreFile != null}`);

  const {
    extraConfigs,
    extraPlugins,
    ignores,
    files,
    gitignore,
    pluginRenames = {},
    loadPluginsOnDemand,
    offlineMode,
    useImportIntegrity,
    linterOptionsNoInlineConfig,
    linterOptionsReportUnusedDisableDirectives,
    linterOptionsReportUnusedInlineConfigs,
    noWarnings,
  } = optionsResolved;

  if (useImportIntegrity) {
    context.usedPlugins.add('import-integrity');
  }

  const renamedPlugins = objectKeysUnsafe(pluginRenames);
  const pluginRenamesList = Object.values(pluginRenames);
  const occupiedPluginPrefixes = new Set<string>(
    PLUGIN_PREFIXES_LIST.filter((prefix) => prefix === '' || !renamedPlugins.includes(prefix)),
  );
  const badPluginRenames = new Set<string>();
  for (const newName of pluginRenamesList) {
    if (newName === DISABLE_AUTOFIX || occupiedPluginPrefixes.has(newName)) {
      badPluginRenames.add(newName);
    }
    occupiedPluginPrefixes.add(newName);
  }
  if (badPluginRenames.size > 0) {
    logger.fatal(
      `Invalid plugin renames: ${Array.from(badPluginRenames, (name) => styleText('red', name || styleText('italic', '<empty string>'))).join(', ')}. New names must not clash with the default plugin prefixes, have duplicates, be empty, or equal the reserved ${stylePluginPrefix(DISABLE_AUTOFIX)} prefix. If you happen to have a duplicate new prefix, please choose a different name. If you happen to rename some plugin to one of the default prefixes, you must also rename the plugin corresponding to that prefix.`,
    );
  }

  if (
    Object.keys(extraPlugins || {}).some(
      (extraPluginPrefix) =>
        PLUGIN_PREFIXES_LIST.includes(extraPluginPrefix as PluginPrefix) ||
        pluginRenamesList.includes(extraPluginPrefix),
    )
  ) {
    logger.fatal(
      'Invalid extra plugin prefixes: using of built-in plugin prefixes or prefixes from `pluginRenames` is forbidden',
    );
  }

  const getIsConfigEnabledByManifest = getIsConfigEnabledByManifestContextless.bind(context);

  const resolveManifestConfigEnablement = (configKey: keyof UnConfigs) => {
    const manifest = CONFIG_MANIFESTS[configKey];
    if (!manifest || configKey in context.configsMeta) {
      return;
    }

    const {enabledBy} = manifest;
    if (typeof enabledBy === 'object' && 'configDisabled' in enabledBy) {
      resolveManifestConfigEnablement(enabledBy.configDisabled);
    }
    context.configsMeta[configKey] = {
      enabled: getIsConfigEnabledByManifest.call(context, configKey, manifest, loadablePlugins),
    };
  };

  objectEntriesUnsafe(CONFIG_MANIFESTS).forEach(([configKey]) => {
    resolveManifestConfigEnablement(configKey);
  });

  const configResults: UnConfigResults = {
    astro: null,
    css: null,
    js: null,
    markdownPreferences: null,
    svelte: null,
    ts: null,
    vue: null,
  };

  const setupManifestConfig = async (configKey: ManifestConfigKey) => {
    const manifest = CONFIG_MANIFESTS[configKey];
    /* v8 ignore next 3 -- every manifest key comes from the generated table */
    if (!manifest) {
      return null;
    }
    if (!context.configsMeta[configKey].enabled) {
      return null;
    }

    const {default: manifestWithSetup} = await manifest.load();
    const configOptions = context.rootOptions.configs?.[configKey];
    const result = Array.isArray(configOptions)
      ? await Promise.all(
          // eslint-disable-next-line ts/await-thenable -- a `setup` may well be synchronous
          configOptions.map((configOptionsItem, configIndex) =>
            manifestWithSetup.setup(
              context,
              {...configOptionsItem, [configIndexProperty]: configIndex},
              configResults,
            ),
          ),
        )
      : await manifestWithSetup.setup(context, configOptions, configResults);
    if (configKey in configResults && !Array.isArray(result)) {
      Object.assign(configResults, {[configKey]: result});
    }
    return result;
  };

  const configSetups = new Map<ManifestConfigKey, ReturnType<typeof setupManifestConfig>>();
  const loadManifestConfig = (configKey: ManifestConfigKey) => {
    const setup = configSetups.get(configKey) ?? setupManifestConfig(configKey);
    configSetups.set(configKey, setup);
    return setup;
  };

  await loadManifestConfig('js');
  await Promise.all([
    loadManifestConfig('astro'),
    loadManifestConfig('vue'),
    loadManifestConfig('svelte'),
    loadManifestConfig('css'),
    loadManifestConfig('markdownPreferences'),
  ]);
  await loadManifestConfig('ts');

  if (typeInfoRulesUserMode == null) {
    context.typeInfoRulesResolved.mode = configResults.ts?.setupTypeAwareConfigCreated
      ? 'splitOnly'
      : 'standalone';
  }

  const shouldMarkdownPreferencesConfigsGoAfterMarkdownConfigs =
    configResults.markdownPreferences?.optionsResolved.extendedMarkdownSyntax === true;

  const rootConfigBuilder = context.createConfigBuilder({}, '');
  rootConfigBuilder
    ?.addConfig(['config-files', {applyUserFilesAndIgnores: false}], {
      files: GLOB_CONFIG_FILES,
    })
    .disableAnyRule('node', 'no-unpublished-require');

  // According to ESLint docs: "If `ignores` is used without any other keys in the configuration object, then the patterns act as global ignores <...> Patterns are added after the default patterns, which are ["**/node_modules/", ".git/"]." - https://eslint.org/docs/latest/use/configure/configuration-files#globally-ignore-files-with-ignores
  const globalIgnores = [
    ...(!Array.isArray(ignores) && ignores?.override ? [] : DEFAULT_GLOBAL_IGNORES),
    ...(Array.isArray(ignores) ? ignores : ignores?.files || []),
  ];
  debug(`Globally ignored files: ${JSON.stringify(globalIgnores)}`);

  type UnresolvedConfigType =
    | MaybeArray<EslintFlatConfigEntry | ConfigEntryBuilder<ExtraPlugins> | Falsy>
    | MaybeArray<{configs: (ConfigEntryBuilder<ExtraPlugins> | null)[]} | null>;

  const cascadeAnchorEntries: Record<CascadeAnchor, MaybePromise<UnresolvedConfigType>[]> = {
    globalSetup: [
      (files?.length || 0) > 0 && {
        name: genFlatConfigEntryName('files/global'),
        files,
      },
      globalIgnores.length > 0 && {
        name: genFlatConfigEntryName('ignores/global'),
        ignores: globalIgnores,
      },
      gitignore !== false &&
        (typeof gitignore === 'object' || gitignoreFile) &&
        interopDefault(import('eslint-config-flat-gitignore')).then((eslintGitignore) => ({
          ...(typeof gitignore === 'object' ? eslintGitignore(gitignore) : eslintGitignore()),
          name: genFlatConfigEntryName('ignores/gitignore'),
        })),
      ...(
        [
          [linterOptionsNoInlineConfig, 'noInlineConfig'],
          // Override ESLint's default value of `warn`
          [
            linterOptionsReportUnusedDisableDirectives ?? (noWarnings ? ERROR : null),
            'reportUnusedDisableDirectives',
          ],
          [linterOptionsReportUnusedInlineConfigs, 'reportUnusedInlineConfigs'],
        ] as const
      ).flatMap(([linterOptionConfigs, linterOptionName]) =>
        (typeof linterOptionConfigs === 'object'
          ? arrayify(linterOptionConfigs)
          : linterOptionConfigs == null
            ? []
            : [{value: linterOptionConfigs}]
        ).map((linterOptionConfig, linterOptionConfigIndex, resolvedLinterOptionConfigs) => {
          const valueInitial = linterOptionConfig.value;
          const hasFiles = (linterOptionConfig.files?.length || 0) > 0;
          const hasIgnores = (linterOptionConfig.ignores?.length || 0) > 0;
          // An `ignores`-only entry reads as "turn this option off for these paths", so they should become `files`
          const disableForIgnoredPaths = !hasFiles && hasIgnores && valueInitial == null;

          const valueFinal = (() => {
            let result = valueInitial;
            if (disableForIgnoredPaths) {
              result = linterOptionName === 'noInlineConfig' ? false : 'off';
            }
            if (noWarnings && (result === 'warn' || result === WARNING)) {
              result = result === 'warn' ? 'error' : ERROR;
            }
            return result;
          })();
          const filesFinal = disableForIgnoredPaths
            ? linterOptionConfig.ignores
            : linterOptionConfig.files;

          return {
            name: genFlatConfigEntryName(
              `global-setup/linter-options/${linterOptionName}${resolvedLinterOptionConfigs.length > 1 ? `/${linterOptionConfigIndex}` : ''}`,
            ),
            ...(filesFinal?.length && {files: filesFinal}),
            ...(!disableForIgnoredPaths &&
              linterOptionConfig.ignores?.length && {ignores: linterOptionConfig.ignores}),
            // Always add `linterOptions` to avoid creating global ignore config
            linterOptions: {
              ...(valueFinal != null && {[linterOptionName]: valueFinal}),
            },
          };
        }),
      ),
      {
        name: genFlatConfigEntryName('global-setup/language-options'),
        languageOptions: {
          ecmaVersion: 'latest',
          sourceType: 'module',
          parserOptions: {
            ecmaVersion: 'latest',
            ecmaFeatures: {
              jsx: true,
            },
            sourceType: 'module',
          },
        } as const,
      },
      {
        name: genFlatConfigEntryName('global-setup/language-options/commonjs'),
        files: ['**/*.c[jt]s?(x)'],
        languageOptions: {
          globals: {
            ...globals.commonjs,
          },
        },
      },
      useImportIntegrity && {
        name: genFlatConfigEntryName('global-setup/import-integrity'),
        settings: {
          'import-integrity': {
            packageRootDir: import.meta.dirname,
            ...(typeof useImportIntegrity === 'object' && useImportIntegrity.pluginSettings),
          } satisfies ImportIntegrityPluginSettings,
        },
      },
    ],
    rootConfig: [rootConfigBuilder],
    userExtraConfigs: extraConfigs.flatMap((extraConfig, configIndex) => {
      const configName = genFlatConfigEntryName(
        `extra-config/${extraConfig.name || `unnamed${configIndex}`}`,
      );
      const configResolveResult = processUnOrFlatConfig(
        context,
        {...extraConfig, name: configName},
        extraConfig.rules,
      );
      const extraConfigFinal: EslintFlatConfigEntry = {
        ...omit(extraConfig, ['rules']),
        ...(extraConfig.rules && {rules: configResolveResult.rules}),
        name: configName,
      };
      configResolveResult.removedRules.forEach((ruleName) => {
        extraConfigFinal.rules && Reflect.deleteProperty(extraConfigFinal.rules, ruleName);
      });
      return [extraConfigFinal, ...configResolveResult.extraConfigs];
    }),
  };

  const cascadeOrder = shouldMarkdownPreferencesConfigsGoAfterMarkdownConfigs
    ? CONFIG_ORDER.flatMap((entry) =>
        entry === 'markdownPreferences'
          ? []
          : entry === 'markdown'
            ? ([entry, 'markdownPreferences'] as const)
            : entry,
      )
    : CONFIG_ORDER;

  const unresolvedConfigs: UnresolvedConfigType[] = await Promise.all(
    // eslint-disable-next-line ts/await-thenable -- most of the anchors contribute plain entries
    cascadeOrder.flatMap((entry) =>
      arrayIncludes(CASCADE_ANCHORS, entry)
        ? cascadeAnchorEntries[entry]
        : loadManifestConfig(entry),
    ),
  );

  const resolvedConfigs: EslintFlatConfigEntry[] = unresolvedConfigs
    .map((unConfigOrEntryBuilders) =>
      arrayify(unConfigOrEntryBuilders).map((configOrBuilder) =>
        configOrBuilder instanceof ConfigEntryBuilder
          ? configOrBuilder.resolveAllConfigs()
          : configOrBuilder && 'configs' in configOrBuilder
            ? configOrBuilder.configs.map((unConfig) => unConfig?.resolveAllConfigs())
            : configOrBuilder,
      ),
    )
    .flat(3)
    // eslint-disable-next-line no-implicit-coercion
    .filter((v) => !!v);

  const usedPluginPrefixes: string[] =
    loadPluginsOnDemand === false
      ? LOADABLE_PLUGIN_PREFIXES_LIST
      : // Sorting ensures that plugins will be present in the resulting config in the consistent order every time
        // eslint-disable-next-line unicorn/no-array-sort
        [...context.usedPlugins].sort();
  if (typeof loadPluginsOnDemand === 'object') {
    usedPluginPrefixes.push(...loadPluginsOnDemand.alwaysLoad);
  }
  const usedParserPrefixes = [...context.usedParsers.keys()];
  const usedPackagesPrefixes = [...context.usedPackages.keys()];

  const {plugins, loadedPlugins, modifyConfigs} = await resolveConfigAsyncData(context, {
    usedPluginPrefixes,
    usedParserPrefixes,
    usedPackagesPrefixes,
  });

  resolvedConfigs.unshift({
    name: PLUGINS_CONFIG_NAME,
    plugins,
  });

  /* Offline mode */

  if (offlineMode) {
    debug(
      `Offline mode is active, the following ${RULES_TO_DISABLE_IN_OFFLINE_MODE.length} rules were disabled: ${RULES_TO_DISABLE_IN_OFFLINE_MODE.map(styleRuleName).join(', ')}`,
    );

    resolvedConfigs.push({
      name: genFlatConfigEntryName('offline-mode'),
      rules: Object.fromEntries(
        // eslint-disable-next-line ts/ban-ts-comment -- error only in `tsc`, not in `tsgo`
        // @ts-ignore "TS2590: Expression produces a union type that is too complex to represent" for whatever reason
        RULES_TO_DISABLE_IN_OFFLINE_MODE.map((ruleName) => [ruleName, 0]),
      ),
    });
  }

  /* Testing */

  /* v8 ignore start */
  let testErrors: TestError[] | undefined;
  if (context.isTestMode) {
    const duplicateConfigNames: string[] = [];
    const uniqueConfigNames = new Set<string>();
    resolvedConfigs.forEach(({name: configName}) => {
      if (!configName) {
        return;
      }
      if (uniqueConfigNames.has(configName)) {
        duplicateConfigNames.push(configName);
      } else {
        uniqueConfigNames.add(configName);
      }
    });

    if (duplicateConfigNames.length > 0) {
      context.tests.push(
        `Duplicate config names found: ${duplicateConfigNames.map(styleConfigName).join(', ')}`,
      );
    }

    const errorMessages = context.tests
      .flatMap((testFn) => maybeCall(testFn, {plugins: loadedPlugins}))
      .filter((v) => v != null);

    errorMessages.forEach((errorMessage) => {
      if (typeof errorMessage === 'string') {
        (testErrors ||= []).push({message: errorMessage, severity: 'error'});
      } else {
        const {message, severity} = errorMessage;
        (testErrors ||= []).push({message, severity});
      }
    });
  }
  /* v8 ignore stop */

  debug(`Final config resolved: ${resolvedConfigs.length} flat config items`);

  if (cacheConfigs) {
    debug('Attempting to save resolved configs to memory and file system cache');

    await saveCacheToMemory(context, {
      config: resolvedConfigs,
    });

    const configsToCache = Array.from(resolvedConfigs, (configItem) => {
      /* v8 ignore next -- every generated config carries our name prefix */
      if (!isUnFlatConfigEntry(configItem)) {
        return configItem;
      }
      const result = {...configItem};
      if (result.name === PLUGINS_CONFIG_NAME) {
        delete result.plugins;
      }
      return result;
    });

    await saveCacheToFs(context, {
      configs: configsToCache,
      usedPlugins: usedPluginPrefixes,
      usedParsers: new Map(
        Array.from(context.usedParsers, ([parserPrefix, configs]) => [
          parserPrefix,
          configs.map((c) => c.name).filter((v) => typeof v === 'string'),
        ]),
      ),
      usedPackages: new Map(
        Array.from(context.usedPackages, ([packagePrefix, usedPackagesInfo]) => [
          packagePrefix,
          usedPackagesInfo
            .map(({config, path, info}) => {
              const configName = config.name;
              /* v8 ignore next -- every config using a package is named */
              if (!configName) {
                return null;
              }
              return {
                configName,
                path,
                ...info,
              };
            })
            .filter((v) => v != null),
        ]),
      ),
    });
  }

  // Must be called after cache is written
  modifyConfigs();

  if (internalOptions.testMode) {
    /* v8 ignore next - The config tester always finds something to report */
    return {
      configs: resolvedConfigs,
      errors: testErrors || [],
    };
  }

  return resolvedConfigs;
}
