import {
  DISABLE_AUTOFIX_WITH_SLASH,
  GLOB_CSS,
  GLOB_HTM_HTML,
  GLOB_MARKDOWN,
  GLOB_MDX,
  GLOB_MD_X_CODE_BLOCKS,
  GLOB_TOML,
  GLOB_TS_X,
  GLOB_YML_YAML,
  OFF,
  RULES_REQUIRING_TYPE_INFORMATION,
  type RuleSeverity,
} from '../constants';
import {eslintPluginVanillaRules} from '../eslint/eslint-shared';
import type {
  EslintFlatConfigEntry,
  EslintRuleEntry,
  EslintTypedRulesConfig,
  GetRuleNamesInPlugin,
  GetRuleOptions,
  UnAllRuleNames,
  UnFlatConfigEntryBase,
  UnRulesConfig,
} from '../eslint/eslint-types';
import {genFlatConfigEntryName, resolveFullRuleName} from '../eslint/eslint-utils';
import {
  type PackageToLoadInfo,
  type ParserPrefix,
  type PluginPrefix,
  packageToLoadSymbol,
} from '../loaders';
import type {
  EmptyObject,
  FalsyValue,
  NonEmptyString,
  NonEmptyTuple,
  Nullable,
  ObjectValues,
  OmitStrict,
  Prettify,
  SetRequired,
} from '../types';
import {
  arraify,
  arrayMap,
  createTraverser,
  findArrayInversions,
  groupBy,
  objectEntriesUnsafe,
  partition,
  styleConfigName,
  styleRuleName,
  styleText,
} from '../utils';
import {
  type ExtraPluginsType,
  type UnConfigContext,
  intersectParentConfigFilesWithProvidedFiles,
  processUnOrFlatConfig,
} from './shared';

export type FlatConfigEntryForBuilder = OmitStrict<
  EslintFlatConfigEntry,
  'name' | 'rules' | 'language' | 'settings'
>;

// eslint-disable-next-line ts/no-unused-vars -- come up with sth better
const PLUGINS_PROVIDING_LANGUAGES = {
  css: ['css'],
  jsonc: ['x', 'json', 'jsonc', 'json5'],
  'markdown-preferences': ['extended-syntax'],
  markdown: ['gfm', 'commonmark'],
  toml: ['toml'],
  yaml: ['yaml'],
} as const satisfies Partial<Record<PluginPrefix, [string, ...string[]]>>;

export type SupportedEslintPluginLanguages = ObjectValues<{
  [PluginKey in keyof typeof PLUGINS_PROVIDING_LANGUAGES]: [
    PluginKey,
    (typeof PLUGINS_PROVIDING_LANGUAGES)[PluginKey][number],
  ];
}>;

const FILE_EXTENSIONS_IMPLICITLY_IGNORED_BY_DEFAULT_IN_UN_CONFIGS_GLOBS = {
  css: [GLOB_CSS],
  md: [GLOB_MARKDOWN],
  mdx: [GLOB_MDX],
  html: [GLOB_HTM_HTML],
  toml: [GLOB_TOML],
  yaml: [GLOB_YML_YAML],
} as const satisfies Record<string, [string, ...string[]]>;

const PLUGIN_LANGUAGES_TO_NOT_IGNORED_FILES: {
  [PluginKey in keyof typeof PLUGINS_PROVIDING_LANGUAGES]?: Partial<
    Record<
      (typeof PLUGINS_PROVIDING_LANGUAGES)[PluginKey][number],
      keyof typeof FILE_EXTENSIONS_IMPLICITLY_IGNORED_BY_DEFAULT_IN_UN_CONFIGS_GLOBS
    >
  >;
} = {
  css: {css: 'css'},
  'markdown-preferences': {'extended-syntax': 'md'},
  markdown: {gfm: 'md', commonmark: 'md'},
  toml: {toml: 'toml'},
  yaml: {yaml: 'yaml'},
};

type AddRuleInternalOptions = EmptyObject;

const styleRuleNames = (ruleNames: string[]) => ruleNames.map(styleRuleName).join(', ');

export const configIndexProperty = Symbol('ConfigIndex');

interface FlatConfigMetadata {
  /**
   * Should include full resolved rule names (i.e. with possible plugin prefix and rename)
   */
  rulesRequiringTypeInfo?: Map<string, PluginPrefix>;

  /**
   * If `noParser`, the config *will still be created* without a parser and parser settings.
   * Only if set to true, the config won't be created altogether.
   */
  preventCreationOfConfigForRulesWithTypeInformation?: boolean | 'noParser';
}

export class ConfigEntryBuilder<
  ExtraPlugins extends ExtraPluginsType = never,
  // eslint-disable-next-line ts/no-explicit-any
  DefaultPrefix extends PluginPrefix | null = any,
> {
  private readonly pluginPrefix: DefaultPrefix;
  private readonly options: UnFlatConfigEntryBase<
    ExtraPlugins,
    DefaultPrefix extends null ? EslintTypedRulesConfig : DefaultPrefix
  > & {[configIndexProperty]?: number};
  private readonly context: UnConfigContext;

  constructor(
    rulesPrefix: DefaultPrefix,
    options: UnFlatConfigEntryBase<
      ExtraPlugins,
      DefaultPrefix extends null ? EslintTypedRulesConfig : DefaultPrefix
    >,
    context: UnConfigContext,
  ) {
    this.pluginPrefix = rulesPrefix;
    this.options = options;
    this.context = context;
  }

  private readonly configs = new Map<
    string,
    [config: EslintFlatConfigEntry, metadata: FlatConfigMetadata]
  >();

  addFlatConfig(config: SetRequired<EslintFlatConfigEntry, 'name'>) {
    /* v8 ignore start */
    if (this.configs.has(config.name)) {
      throw new Error(`Config with name '${config.name}' already exists`);
    }
    /* v8 ignore stop */
    const metadata: FlatConfigMetadata = {};
    this.configs.set(config.name, [config, metadata]);
    return metadata;
  }

  setConfigMetadataForRule(
    configNameOrMetadata: string | FlatConfigMetadata,
    {
      plugin,
      ruleName,
      ruleEntryName,
      severity,
      hasEnabledDisableAutofixCounterpart,
    }: {
      plugin: PluginPrefix;
      ruleName: string;
      ruleEntryName: string;
      severity: RuleSeverity;
      hasEnabledDisableAutofixCounterpart?: boolean;
    },
  ) {
    const configMetadata =
      typeof configNameOrMetadata === 'string'
        ? this.configs.get(configNameOrMetadata)?.[1]
        : configNameOrMetadata;
    if (!configMetadata) {
      return;
    }

    if (severity === OFF) {
      if (!hasEnabledDisableAutofixCounterpart) {
        configMetadata.rulesRequiringTypeInfo?.delete(ruleEntryName);
      }
    } else if (RULES_REQUIRING_TYPE_INFORMATION[plugin]?.rules[ruleName]) {
      (configMetadata.rulesRequiringTypeInfo ||= new Map()).set(ruleEntryName, plugin);
    }
  }

  /**
   * Note: `rules` will **always** be added to the resulting config, meaning that this method
   * is not able to create a ["global ignores" config](https://eslint.org/docs/latest/use/configure/configuration-files#globally-ignoring-files-with-ignores).
   *
   * `rules` and `name` keys cannot be overridden.
   */
  addConfig<PluginPrefixWithLanguage extends keyof typeof PLUGINS_PROVIDING_LANGUAGES>(
    nameAndMaybeOptions:
      | string
      | [
          name: string,
          options: {
            includeDefaultFilesAndIgnores?: boolean;

            filesDefault?: string[];
            filesDefaultMergedWithUserFiles?: boolean;

            /**
             * Files to add to the resolved files list (user files + default files)
             * IF that list is not empty
             */
            filesMerged?: string[];

            /**
             * Will be merged with the internal `ignores`, and,
             * if `ignoresDefaultMergedWithUserIgnores` set to `true`, with the user provided ones.
             */
            ignoresDefault?: string[];
            ignoresDefaultMergedWithUserIgnores?: boolean;

            parser?: ParserPrefix;

            /**
             * Some rules crash or behave unexpectedly when linting foreign file types.
             * This usually happens on unexpected for the rule file types when
             * `files` are not restricted. For example:
             * - [`no-irregular-whitespace`](https://eslint.org/docs/latest/rules/no-irregular-whitespace)
             * crashes on `.css` files
             * - [`regexp/no-legacy-features`](https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-legacy-features.html)
             * crashes on `.md` files (only if `language` option is specified
             * in the markdown config)
             * - [`strict`](https://eslint.org/docs/latest/rules/strict)
             * crashes on `.html` files
             * - [`sonarjs/assertions-in-tests`](https://sonarsource.github.io/rspec/#/rspec/S2699/javascript)
             * or [`node/no-unsupported-features/node-builtins`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unsupported-features/node-builtins.md)
             * crash on `.toml` files
             * - `.yaml` files are excluded because when no config specifies the language
             * or a parser for YAML files, embedded code blocks might get linted by
             * other rules and produce weird errors. For example,
             * [`no-labels`](https://eslint.org/docs/latest/rules/no-labels)
             * gets triggered on YAML maps (`a: b`).
             *
             * That's why globs corresponding to such files are implicitly/internally added
             * to the final `ignores` array.
             *
             * Use this option if you don't want implicitly ignore certain file types
             * (set the file type you wish not to be ignored to `false`).
             * You can also set the whole option to `false` to not add anything to `ignores`.
             * @default true
             */
            ignoresInternal?:
              | boolean
              | Partial<
                  Record<
                    keyof typeof FILE_EXTENSIONS_IMPLICITLY_IGNORED_BY_DEFAULT_IN_UN_CONFIGS_GLOBS,
                    boolean
                  >
                >;

            /**
             * Type-safe version of `language` config property, also handling plugin prefix renames.
             */
            language?: [
              PluginPrefixWithLanguage,
              (typeof PLUGINS_PROVIDING_LANGUAGES)[PluginPrefixWithLanguage][number],
            ];

            /**
             * Specifies plugin shared settings on the specified property.
             *
             * To assign settings directly to the `settings` object,
             * use an empty string as a property name.
             */
            settings?: Record<string, Nullable<Record<string, unknown>>>;

            preventCreationOfConfigForRulesWithTypeInformation?: boolean;
          },
        ],
    config?: FlatConfigEntryForBuilder,
  ) {
    const [configName, internalOptions] =
      typeof nameAndMaybeOptions === 'string' ? [nameAndMaybeOptions, {}] : nameAndMaybeOptions;
    const {options: configOptions} = this;

    const filesFromUser = configOptions.files || [];
    const filesDefault = internalOptions.filesDefault || [];
    const files =
      filesFromUser.length > 0 && internalOptions.includeDefaultFilesAndIgnores
        ? internalOptions.filesDefaultMergedWithUserFiles
          ? [...filesDefault, ...filesFromUser]
          : filesFromUser
        : filesDefault;
    if (internalOptions.filesMerged?.length && files.length > 0) {
      files.push(...internalOptions.filesMerged);
    }

    const ignoresFromUser = configOptions.ignores;
    const ignoresInternal = objectEntriesUnsafe(
      FILE_EXTENSIONS_IMPLICITLY_IGNORED_BY_DEFAULT_IN_UN_CONFIGS_GLOBS,
    ).flatMap(([fileType, globs]) =>
      internalOptions.ignoresInternal === false ||
      (internalOptions.ignoresInternal !== true &&
        (internalOptions.ignoresInternal?.[fileType] === false ||
          (internalOptions.language &&
            PLUGIN_LANGUAGES_TO_NOT_IGNORED_FILES[internalOptions.language[0]]?.[
              internalOptions.language[1]
            ] === fileType)))
        ? []
        : globs,
    );
    const ignoresDefault = internalOptions.ignoresDefault || [];
    const ignores = [
      ...ignoresInternal,
      ...(internalOptions.includeDefaultFilesAndIgnores
        ? [
            ...(internalOptions.ignoresDefaultMergedWithUserIgnores || !ignoresFromUser
              ? ignoresDefault
              : []),
            ...(ignoresFromUser || []),
          ]
        : ignoresDefault),
    ];

    // We require the presence of `rules`:
    // - to avoid likely adding it anyway later on
    // - to avoid (mostly likely accidental) "global ignores" configs (https://eslint.org/docs/latest/use/configure/configuration-files#globally-ignoring-files-with-ignores)
    const configFinal: SetRequired<EslintFlatConfigEntry, 'rules' | 'name'> = {
      ...(files.length > 0 && {files}),
      ...(ignores.length > 0 && {ignores}),
      ...config,
      name: genFlatConfigEntryName(
        `${configName}${configIndexProperty in this.options ? `#${this.options[configIndexProperty]}` : ''}`,
      ),
      rules: {},
      ...(internalOptions.language && {
        language: `${this.context.rootOptions.pluginRenames?.[internalOptions.language[0]] ?? internalOptions.language[0]}/${internalOptions.language[1]}`,
      }),
      ...(() => {
        const {settings: settingsRaw} = internalOptions;
        if (!settingsRaw) {
          return null;
        }

        const settings = {...settingsRaw};
        const directlyMappedSettings = settings[''];
        delete settings[''];
        if (directlyMappedSettings) {
          Object.assign(
            settings,
            Object.fromEntries(
              Reflect.ownKeys(directlyMappedSettings).map((settingKey) => [
                settingKey,
                directlyMappedSettings[settingKey as keyof typeof directlyMappedSettings],
              ]),
            ),
          );
        }
        Reflect.ownKeys(settings).forEach((settingKey) => {
          const value = settings[settingKey as keyof typeof settings];
          if (value == null || (typeof value === 'object' && Reflect.ownKeys(value).length === 0)) {
            Reflect.deleteProperty(settings, settingKey);
          }
        });

        if (Reflect.ownKeys(settings).length === 0) {
          return null;
        }

        return {
          settings,
        };
      })(),
    };

    const configMetadata = this.addFlatConfig(configFinal);

    if (
      internalOptions.preventCreationOfConfigForRulesWithTypeInformation ||
      this.context.rootOptions.preventCreationOfConfigForRulesWithTypeInformation === 'full' ||
      this.context.internalOptions.preventCreationOfConfigForRulesWithTypeInformation
    ) {
      configMetadata.preventCreationOfConfigForRulesWithTypeInformation = true;
    } else if (this.context.rootOptions.preventCreationOfConfigForRulesWithTypeInformation) {
      configMetadata.preventCreationOfConfigForRulesWithTypeInformation = 'noParser';
    }

    processUnOrFlatConfig(this.context, configFinal, undefined);

    const {parser} = internalOptions;
    if (parser != null) {
      this.context.usedParsers.set(parser, [
        ...(this.context.usedParsers.get(parser) || []),
        configFinal,
      ]);
    }

    const configTraverser = createTraverser(configFinal, {includeSymbols: true});
    configTraverser.forEach((traverseContext, value) => {
      if (traverseContext.key !== packageToLoadSymbol) {
        return;
      }

      const info = value as PackageToLoadInfo;
      arraify(info.package).forEach((packageId) => {
        this.context.usedPackages.set(packageId, [
          ...(this.context.usedPackages.get(packageId) || []),
          {
            config: configFinal,
            path: traverseContext.path.slice(0, -1).join('.'),
            info,
          },
        ]);
      });
    });

    /* v8 ignore start */
    let currentCategory = '';
    const addedRules: Partial<Record<PluginPrefix, Record<string, string /* Category */>>> | null =
      this.context.isTestMode ? {} : null;
    const duplicateRules: Partial<Record<PluginPrefix, Set<string>>> | null = this.context
      .isTestMode
      ? {}
      : null;
    /* v8 ignore stop */

    const addRule = <P extends PluginPrefix, N extends GetRuleNamesInPlugin<P>>(
      plugin: P,
      ruleNameUnprefixed: N,
      severity: RuleSeverity | null,
      ruleOptions?: GetRuleOptions<P, N, 'all'>,
      // eslint-disable-next-line ts/no-unused-vars
      options?: AddRuleInternalOptions,
    ) => {
      if (severity == null) {
        // eslint-disable-next-line ts/no-use-before-define
        return result;
      }

      const severityResolved: RuleSeverity =
        ((configOptions.forceSeverity ?? this.context.rootOptions.forceSeverity) as
          | RuleSeverity
          | undefined) ?? severity;
      const ruleNameResolved = resolveFullRuleName(this.context, plugin, ruleNameUnprefixed);

      configFinal.rules[ruleNameResolved] = ruleOptions?.length
        ? [severityResolved, ...ruleOptions]
        : severityResolved;

      /* v8 ignore start */
      if (addedRules && duplicateRules) {
        if (addedRules[plugin] && ruleNameUnprefixed in addedRules[plugin]) {
          (duplicateRules[plugin] ||= new Set()).add(ruleNameUnprefixed);
        }
        addedRules[plugin] = {
          ...addedRules[plugin],
          [ruleNameUnprefixed]: currentCategory,
        };
      }
      /* v8 ignore stop */

      if (severityResolved === OFF) {
        // TODO is it possible to encounter disable-autofix rule here?
        // If the rule is disabled, disable its autofix counterpart rule as well
        if (!ruleNameResolved.startsWith(DISABLE_AUTOFIX_WITH_SLASH)) {
          configFinal.rules[`${DISABLE_AUTOFIX_WITH_SLASH}${ruleNameResolved}`] = OFF;
        }
      } else {
        this.context.usedPlugins.add(plugin);
      }

      this.setConfigMetadataForRule(configMetadata, {
        plugin,
        ruleName: ruleNameUnprefixed,
        ruleEntryName: ruleNameResolved,
        severity: severityResolved,
      });

      // eslint-disable-next-line ts/no-use-before-define
      return result;
    };

    const result = {
      config: configFinal,

      addRule: <N extends GetRuleNamesInPlugin<DefaultPrefix>, Severity extends RuleSeverity>(
        ruleName: N,
        severity: Severity | null,
        ruleOptions?: NoInfer<GetRuleOptions<DefaultPrefix & PluginPrefix, N, 'all'>>,
        options?: AddRuleInternalOptions,
      ) => {
        /* v8 ignore start */
        if (this.pluginPrefix == null) {
          throw new Error('Cannot use `addRule` when `pluginPrefix` is `null`');
        }
        /* v8 ignore end */
        return addRule(this.pluginPrefix, ruleName, severity, ruleOptions, options);
      },

      addAnyRule: <
        P extends PluginPrefix,
        N extends GetRuleNamesInPlugin<P>,
        Severity extends RuleSeverity,
      >(
        prefix: P,
        ruleName: N,
        severity: Severity,
        ruleOptions?: NoInfer<GetRuleOptions<P, N, 'all'>>,
        options?: AddRuleInternalOptions,
      ) => addRule(prefix, ruleName, severity, ruleOptions, options),

      disableAnyRule: <P extends PluginPrefix>(
        plugin: P,
        ruleNameUnprefixed: GetRuleNamesInPlugin<P>,
      ) => {
        const ruleNameResolved = resolveFullRuleName(this.context, plugin, ruleNameUnprefixed);

        Object.assign(configFinal.rules, {
          [ruleNameResolved]: 0,
          [`${DISABLE_AUTOFIX_WITH_SLASH}${ruleNameResolved}`]: 0,
        });

        return result;
      },

      addOverrides: ({onlyAny = false}: {onlyAny?: boolean} = {}) => {
        processUnOrFlatConfig(
          this.context,
          configFinal,
          onlyAny ? {} : this.options.overrides,
          this,
        );
        processUnOrFlatConfig(this.context, configFinal, this.options.overridesAny, this);
        return result;
      },

      addBulkRules: (rules: Prettify<UnRulesConfig> | FalsyValue) => {
        processUnOrFlatConfig(this.context, configFinal, rules || {}, this);
        return result;
      },

      disableBulkRules: (rules: (UnAllRuleNames | (string & {}))[] | FalsyValue) => {
        processUnOrFlatConfig(
          this.context,
          configFinal,
          Object.fromEntries(
            (rules || []).flatMap(
              (ruleName) =>
                [
                  [ruleName, OFF],
                  [`${DISABLE_AUTOFIX_WITH_SLASH}${ruleName}`, OFF],
                ] as const,
            ),
          ),
          this,
        );
        return result;
      },

      markCategory: <const CategoryName extends string>(name: NonEmptyString<CategoryName>) => {
        currentCategory = name;
        return result;
      },

      enableConfigTesterForPlugin: (
        pluginPrefixToTest: DefaultPrefix & {},
        {
          includeDeprecated = false,
          allowUnsorted,
          rulesToSkipInConfig,
        }: {
          includeDeprecated?: boolean | 'allow';
          allowUnsorted?: boolean;
          rulesToSkipInConfig?: string[] | ((ruleName: string) => boolean);
        } = {},
      ) => {
        /* v8 ignore start */
        if (this.context.isTestMode) {
          this.context.tests.push(({plugins}) => {
            const commonErrorMessagePrefix = `[config:${styleConfigName(configName)}] [plugin:${styleText('blue', pluginPrefixToTest)}]`;

            const plugin =
              plugins[pluginPrefixToTest] ||
              (pluginPrefixToTest === '' && eslintPluginVanillaRules);
            if (!plugin) {
              return `${commonErrorMessagePrefix} Plugin not loaded`;
            }

            const addedRulesForPlugin = Object.entries(
              // eslint-disable-next-line ts/no-non-null-assertion, ts/no-unnecessary-condition
              addedRules![pluginPrefixToTest]! || {},
            );
            const addedRulesForPluginNamesSet = new Set(
              addedRulesForPlugin.map(([ruleName]) => ruleName),
            );

            const [activePluginRules, deprecatedPluginRules] = arrayMap(
              partition(Object.entries(plugin.rules || {}), ([, {meta}]) => !meta?.deprecated),
              (rules) => new Set(rules.map(([ruleName]) => ruleName)),
            );

            const errorMessages: Exclude<
              (typeof this.context.tests)[number],
              (...args: unknown[]) => unknown
            > &
              unknown[] = [];

            if (includeDeprecated === false) {
              const includedDeprecatedRules = addedRulesForPlugin.filter(([addedRuleName]) =>
                deprecatedPluginRules.has(addedRuleName),
              );
              if (includedDeprecatedRules.length > 0) {
                errorMessages.push(
                  `⛔ Deprecated rules must not be added: ${styleRuleNames(includedDeprecatedRules.map(([ruleName]) => ruleName))}`,
                );
              }
            }

            if (includeDeprecated === 'allow' && deprecatedPluginRules.size === 0) {
              errorMessages.push({
                message: 'Deprecated rules were allowed, but there are no any in the plugin',
                severity: 'warn',
              });
            }

            const notIncludedRules = (
              includeDeprecated === true
                ? [...activePluginRules, ...deprecatedPluginRules]
                : [...activePluginRules]
            ).filter(
              (ruleName) =>
                !addedRulesForPluginNamesSet.has(ruleName) &&
                !(
                  rulesToSkipInConfig &&
                  (typeof rulesToSkipInConfig === 'function'
                    ? rulesToSkipInConfig(ruleName)
                    : rulesToSkipInConfig.includes(ruleName))
                ),
            );
            if (notIncludedRules.length > 0) {
              errorMessages.push(
                `➕ Rules to add to the config: ${styleRuleNames(notIncludedRules)}`,
              );
            }

            // eslint-disable-next-line ts/no-non-null-assertion
            const duplicateRulesForPlugin = duplicateRules![pluginPrefixToTest] || new Set();
            if (duplicateRulesForPlugin.size > 0) {
              errorMessages.push(
                `⚠️ Duplicate rules: ${styleRuleNames([...duplicateRulesForPlugin])}`,
              );
            }

            const extraneousRules = addedRulesForPlugin
              .filter(([addedRuleName]) => plugin.rules && !(addedRuleName in plugin.rules))
              .map(([ruleName]) => ruleName);
            if (extraneousRules.length > 0) {
              errorMessages.push(
                `🔴 Rules not found in the plugin: ${styleRuleNames(extraneousRules)}`,
              );
            }

            if (!allowUnsorted) {
              Object.entries(
                groupBy(addedRulesForPlugin, ([, categoryName]) => categoryName),
              ).forEach(([groupName, rulesGroup]) => {
                const rulesToSwapPositionsOf = findArrayInversions(
                  rulesGroup.map(([ruleName]) => ruleName),
                  (a, b) => a.localeCompare(b),
                  true,
                );
                if (rulesToSwapPositionsOf.size === 0) {
                  return;
                }
                const rulesToSwapNormalized = Object.entries(
                  groupBy(
                    Array.from(rulesToSwapPositionsOf, ([left, right]) => ({
                      left,
                      right: right.at(-1) || '',
                    })),
                    (v) => v.right,
                  ),
                ).map(
                  ([right, rules]) =>
                    [rules.at(-1)?.left || '', right] satisfies NonEmptyTuple<string>,
                );
                errorMessages.push(
                  `↔️ Rules out of order${groupName ? ` in group ${styleText('cyan', groupName)}` : ''}:\n${rulesToSwapNormalized
                    .map(([a, b]) => `${styleRuleName(a)} <-> ${styleRuleName(b)}`)
                    .join('\n')}`,
                );
              });
            }

            return errorMessages.map(
              (errorMessage) =>
                `${commonErrorMessagePrefix} ${typeof errorMessage === 'string' ? errorMessage : errorMessage.message}`,
            );
          });
        }
        /* v8 ignore stop */
        return result;
      },
    };

    return result;
  }

  getConfig(name: string) {
    return this.configs.get(name);
  }

  getAllConfigs() {
    return Array.from(this.configs.values(), ([config]) => config);
  }

  resolveAllConfigs() {
    return [...this.configs.values()].flatMap(([config, metadata]) => {
      const {rulesRequiringTypeInfo, preventCreationOfConfigForRulesWithTypeInformation} = metadata;

      if (
        rulesRequiringTypeInfo &&
        rulesRequiringTypeInfo.size > 0 &&
        preventCreationOfConfigForRulesWithTypeInformation !== true
      ) {
        const possibleFiles = new Set<string>([GLOB_TS_X]);
        let extraFileExtensions: Set<string> | undefined;
        const rulesEntries = Array.from(
          rulesRequiringTypeInfo.entries(),
          ([ruleEntryName, plugin]) => {
            const entry = config.rules?.[ruleEntryName];
            Reflect.deleteProperty(config.rules || {}, ruleEntryName);

            const pluginInfo = RULES_REQUIRING_TYPE_INFORMATION[plugin];
            pluginInfo?.extraPatterns?.forEach((pattern) => {
              possibleFiles.add(pattern);
            });
            pluginInfo?.extraFileExtensions?.forEach((extraExtension) => {
              (extraFileExtensions ||= new Set()).add(extraExtension);
            });

            return [ruleEntryName, entry];
          },
        );

        const originalParserOptions = config.languageOptions?.['parserOptions'];
        const configForTypeInformation: SetRequired<EslintFlatConfigEntry, 'name'> = {
          ...config,
          name: `${config.name}/@type-information`,
          files: config.files?.length
            ? intersectParentConfigFilesWithProvidedFiles(config.files, [...possibleFiles])
            : [...possibleFiles],
          ignores: [...(config.ignores || []), GLOB_MD_X_CODE_BLOCKS],
          languageOptions: {
            ...config.languageOptions,
            parserOptions: {
              ...(typeof originalParserOptions === 'object' &&
                originalParserOptions !== null &&
                originalParserOptions),
              ...(preventCreationOfConfigForRulesWithTypeInformation !== 'noParser' && {
                ...(extraFileExtensions?.size && {extraFileExtensions: [...extraFileExtensions]}),
                projectService: true,
              }),
            },
          },
          rules: Object.fromEntries(rulesEntries) as Record<string, EslintRuleEntry>,
        };

        this.addFlatConfig(configForTypeInformation);

        if (preventCreationOfConfigForRulesWithTypeInformation !== 'noParser') {
          this.context.usedPackages.set('typescriptEslintParser', [
            ...(this.context.usedPackages.get('typescriptEslintParser') || []),
            {
              config: configForTypeInformation,
              path: 'languageOptions',
              info: {package: 'typescriptEslintParser', property: 'parser'},
            },
          ]);
        }

        return [config, configForTypeInformation];
      }

      return config;
    });
  }
}
