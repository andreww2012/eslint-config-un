import {
  DISABLE_AUTOFIX_WITH_SLASH,
  GLOB_CSS,
  GLOB_HTM_HTML,
  GLOB_MARKDOWN,
  GLOB_MDX,
  GLOB_TOML,
  GLOB_YAML,
  OFF,
  type RuleSeverity,
} from '../constants';
import {eslintPluginVanillaRules} from '../eslint/eslint-shared';
import type {
  EslintFlatConfigEntry,
  EslintTypedRulesConfig,
  GetRuleNamesInPlugin,
  GetRuleOptions,
  UnAllRuleNames,
  UnFlatConfigEntryBase,
  UnRulesConfig,
} from '../eslint/eslint-types';
import {genFlatConfigEntryName, getRuleNameAndPluginPrefixByFullName} from '../eslint/eslint-utils';
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
  type MaybeArray,
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
import {type ExtraPluginsType, type UnConfigContext, processUnOrFlatConfig} from './shared';

export type FlatConfigEntryForBuilder = OmitStrict<
  EslintFlatConfigEntry,
  'name' | 'rules' | 'language' | 'settings'
>;

// eslint-disable-next-line ts/no-unused-vars -- come up with sth better
const PLUGINS_PROVIDING_LANGUAGES = {
  css: ['css'],
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
  yaml: [GLOB_YAML],
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

  private readonly configs: EslintFlatConfigEntry[] = [];
  private readonly configsDict = new Map<string, EslintFlatConfigEntry>();

  private addFlatConfig(configs: MaybeArray<SetRequired<EslintFlatConfigEntry, 'name'>>) {
    arraify(configs).forEach((config) => {
      this.configs.push(config);
      this.configsDict.set(config.name, config);
    });
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

        const settings = Object.fromEntries(
          Object.entries(settingsRaw)
            .flatMap(([property, value]) => {
              if (!value || Object.keys(value).length === 0) {
                return null;
              }
              if (!property) {
                return Object.entries(value);
              }
              return [[property, value]] satisfies NonEmptyTuple[];
            })
            .filter((v) => v != null),
        );
        if (Object.keys(settings).length === 0) {
          return null;
        }

        return {
          settings,
        };
      })(),
    };

    this.addFlatConfig(configFinal);

    // TODO copy-pasted from `processUnOrFlatConfig`
    if (configFinal.language) {
      this.context.usedPlugins.add(
        getRuleNameAndPluginPrefixByFullName(this.context, configFinal.language)
          .pluginPrefixCanonical,
      );
    }

    const {parser} = internalOptions;
    if (parser != null) {
      this.context.usedParsers.set(parser, [
        ...(this.context.usedParsers.get(parser) || []),
        configFinal,
      ]);
    }

    const configTraverser = createTraverser(
      config /* We only need to traverse the passed config, not the final */,
      {includeSymbols: true},
    );
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

    let currentCategory = '';
    const addedRules: Partial<Record<PluginPrefix, Record<string, string /* Category */>>> = {};
    const duplicateRules: Partial<Record<PluginPrefix, Set<string>>> = {};

    const addRule = <P extends PluginPrefix, N extends GetRuleNamesInPlugin<P>>(
      prefix: P,
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

      const severityFinal: RuleSeverity =
        ((configOptions.forceSeverity ?? this.context.rootOptions.forceSeverity) as
          | RuleSeverity
          | undefined) ?? severity;

      // eslint-disable-next-line ts/no-unnecessary-type-assertion
      const ruleNameWithResolvedPrefix = `${prefix === '' ? '' : `${(prefix === '' ? '' : this.context.rootOptions.pluginRenames?.[prefix as Exclude<PluginPrefix, ''>] || null) || prefix}/`}${ruleNameUnprefixed}`;
      const ruleNameFinal = ruleNameWithResolvedPrefix;
      configFinal.rules[ruleNameFinal] = [severityFinal, ...(ruleOptions || [])];

      if (addedRules[prefix] && ruleNameUnprefixed in addedRules[prefix]) {
        (duplicateRules[prefix] ||= new Set()).add(ruleNameUnprefixed);
      }
      addedRules[prefix] = {
        ...addedRules[prefix],
        [ruleNameUnprefixed]: currentCategory,
      };

      // If the rule is disabled, disable its autofix counterpart rule as well
      if (severityFinal === OFF && !ruleNameFinal.startsWith(DISABLE_AUTOFIX_WITH_SLASH)) {
        configFinal.rules[`${DISABLE_AUTOFIX_WITH_SLASH}${ruleNameFinal}`] = OFF;
      }

      if (severityFinal !== OFF) {
        this.context.usedPlugins.add(prefix);
      }

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
        if (this.pluginPrefix == null) {
          throw new Error('Cannot use `addRule` when `pluginPrefix` is `null`');
        }
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

      disableAnyRule: <P extends PluginPrefix>(prefix: P, ruleName: GetRuleNamesInPlugin<P>) => {
        const prefixFinal =
          prefix === ''
            ? ''
            : // eslint-disable-next-line ts/no-unnecessary-type-assertion
              this.context.rootOptions.pluginRenames?.[prefix as Exclude<PluginPrefix, ''>] ||
              prefix;
        const ruleNameFinal = prefixFinal ? `${prefixFinal}/${ruleName}` : ruleName;
        Object.assign(configFinal.rules, {
          [ruleNameFinal]: 0,
          [`${DISABLE_AUTOFIX_WITH_SLASH}${ruleNameFinal}`]: 0,
        });
        return result;
      },

      addOverrides: () => {
        const ourRules = configFinal.rules;

        const overridesResolveResult = processUnOrFlatConfig(
          this.context,
          configFinal,
          this.options.overrides,
          ourRules,
        );
        const overridesAnyResolveResult = processUnOrFlatConfig(
          this.context,
          configFinal,
          this.options.overridesAny,
          ourRules,
        );

        Object.assign(ourRules, overridesResolveResult.rules, overridesAnyResolveResult.rules);
        this.addFlatConfig([
          ...overridesResolveResult.extraConfigs,
          ...overridesAnyResolveResult.extraConfigs,
        ]);
        [...overridesResolveResult.removedRules, ...overridesAnyResolveResult.removedRules].forEach(
          (ruleName) => {
            Reflect.deleteProperty(ourRules, ruleName);
          },
        );

        return result;
      },

      addBulkRules: (rules: Prettify<UnRulesConfig> | FalsyValue) => {
        const configResolveResult = processUnOrFlatConfig(this.context, configFinal, rules || {});

        Object.assign(configFinal.rules, configResolveResult.rules);
        this.addFlatConfig(configResolveResult.extraConfigs);
        [...configResolveResult.removedRules].forEach((ruleName) => {
          Reflect.deleteProperty(configFinal.rules, ruleName);
        });

        return result;
      },

      disableBulkRules: (rules: (UnAllRuleNames | (string & {}))[] | FalsyValue) => {
        const configResolveResult = processUnOrFlatConfig(
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
        );

        Object.assign(configFinal.rules, configResolveResult.rules);
        this.addFlatConfig(configResolveResult.extraConfigs);
        [...configResolveResult.removedRules].forEach((ruleName) => {
          Reflect.deleteProperty(configFinal.rules, ruleName);
        });

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
              addedRules[pluginPrefixToTest]! || {},
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

            const duplicateRulesForPlugin = duplicateRules[pluginPrefixToTest] || new Set();
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
        return result;
      },
    };

    return result;
  }

  getConfig(name: string) {
    return this.configsDict.get(name);
  }

  getAllConfigs() {
    return this.configs;
  }
}
