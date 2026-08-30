import {
  DISABLE_AUTOFIX_WITH_SLASH,
  ERROR,
  GLOB_CSS,
  GLOB_HTM_HTML,
  GLOB_JSON,
  GLOB_JSON5,
  GLOB_JSONC,
  GLOB_MARKDOWN,
  GLOB_MDX,
  GLOB_MD_X_CODE_BLOCKS,
  GLOB_SCSS,
  GLOB_TOML,
  GLOB_TS_X,
  GLOB_YML_YAML,
  OFF,
  type RuleSeverity,
  WARNING,
} from '../constants';
import {eslintPluginVanillaRules} from '../eslint/eslint-shared';
import type {
  EslintFlatConfigEntry,
  EslintRuleEntry,
  GetRuleNamesInPlugin,
  GetRuleOptions,
  UnAllRuleNames,
  UnFlatConfigEntryBase,
  UnFlatConfigEntryFilesAndIgnores,
  UnRulesConfig,
} from '../eslint/eslint-types';
import {
  eslintToUnRuleSeverity,
  genFlatConfigEntryName,
  getRuleNameAndPluginPrefixByFullName,
  resolveFullRuleName,
} from '../eslint/eslint-utils';
import type {PluginPrefix} from '../loaders';
import {RULES_REQUIRING_TYPE_INFORMATION} from '../type-aware-rules';
import type {
  EmptyObject,
  Falsy,
  NonEmptyString,
  NonEmptyTuple,
  Nullable,
  OmitStrict,
  Prettify,
  SetRequired,
} from '../types';
import {
  arrayMap,
  arrayPartition,
  findArrayInversions,
  objectEntriesUnsafe,
  styleConfigName,
  styleRuleName,
  styleText,
} from '../utils';
import {configRequestsTypeInformation, savePackagesToLoadFromConfig} from './config-utils';
import {
  type ImplicitlyIgnoredFileTypeUnlessParsed,
  PARSING_LANGUAGES,
  type ParsingLanguageDefinition,
  type ParsingLanguages,
  type ParsingLanguagesWithDialects,
} from './parsing';
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

const FILE_EXTENSIONS_IMPLICITLY_IGNORED_BY_DEFAULT_IN_UN_CONFIGS_GLOBS = {
  css: [GLOB_CSS],
  scss: [GLOB_SCSS],
  json: [GLOB_JSON],
  jsonc: [GLOB_JSONC],
  json5: [GLOB_JSON5],
  md: [GLOB_MARKDOWN],
  mdx: [GLOB_MDX],
  html: [GLOB_HTM_HTML],
  toml: [GLOB_TOML],
  yaml: [GLOB_YML_YAML],
} as const satisfies Record<ImplicitlyIgnoredFileTypeUnlessParsed, [string, ...string[]]>;

type AddRuleInternalOptions = EmptyObject;

const styleRuleNames = (ruleNames: string[]) => ruleNames.map(styleRuleName).join(', ');

export const configIndexProperty = Symbol('ConfigIndex');

interface FlatConfigMetadata {
  /**
   * Keys are full resolved rule names (i.e. with possible plugin prefix and rename).
   */
  rulesRequiringTypeInfo?: Map<string, {plugin: PluginPrefix; ruleName: string}>;

  /**
   * When `true`, this config opts out of the type-information split: its typed rules are left in
   * place (treated as `asIs`) regardless of the global `standalone`/`splitOnly` mode.
   * The `disabled` mode still turns off throwing rules here.
   */
  skipTypeInfoSplit?: boolean;
}

export class ConfigEntryBuilder<
  ExtraPlugins extends ExtraPluginsType = never,
  // eslint-disable-next-line ts/no-explicit-any
  DefaultPrefix extends PluginPrefix | null = any,
> {
  private readonly pluginPrefix: DefaultPrefix;
  private readonly options: UnFlatConfigEntryBase<
    ExtraPlugins,
    DefaultPrefix extends null ? UnRulesConfig : DefaultPrefix
  > & {[configIndexProperty]?: number};
  private readonly context: UnConfigContext;

  constructor(
    rulesPrefix: DefaultPrefix,
    options: UnFlatConfigEntryBase<
      ExtraPlugins,
      DefaultPrefix extends null ? UnRulesConfig : DefaultPrefix
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
    /* v8 ignore next - The metadata of a config being modified is always present */
    if (!configMetadata) {
      return;
    }

    if (severity === OFF) {
      if (!hasEnabledDisableAutofixCounterpart) {
        configMetadata.rulesRequiringTypeInfo?.delete(ruleEntryName);
      }
    } else {
      const typeInfoRequirement = RULES_REQUIRING_TYPE_INFORMATION[plugin]?.rules[ruleName];
      if (typeInfoRequirement != null) {
        (configMetadata.rulesRequiringTypeInfo ||= new Map()).set(ruleEntryName, {
          plugin,
          ruleName,
        });
      }
    }
  }

  /**
   * Note: `rules` will **always** be added to the resulting config, meaning that this method is not
   * able to create a
   * ["global ignores" config](https://eslint.org/docs/latest/use/configure/configuration-files#globally-ignore-files-with-ignores).
   *
   * `rules` and `name` keys cannot be overridden.
   */
  addConfig(
    nameAndMaybeOptions:
      | string
      | [
          name: string,
          options: {
            /**
             * Whether the `files` and `ignores` provided by the user (or inherited via
             * `inheritFilesAndIgnoresFrom`) are applied to this config, replacing (or, if
             * `{files,ignores}Default*MergedWith*` options are set, merging with) `filesDefault`
             * and `ignoresDefault`.
             * @default true
             */
            applyUserFilesAndIgnores?: boolean;

            filesDefault?: string[];
            filesDefaultMergedWithUserFiles?: boolean;

            /**
             * Files to add to the resolved files list (user files + default files) IF that list is
             * not empty
             */
            filesMerged?: string[];

            /**
             * Will be merged with the internal `ignores`, and, if
             * `ignoresDefaultMergedWithUserIgnores` set to `true`, with the user provided ones.
             */
            ignoresDefault?: string[];
            ignoresDefaultMergedWithUserIgnores?: boolean;

            inheritFilesAndIgnoresFrom?: UnFlatConfigEntryFilesAndIgnores;

            /**
             * Some rules crash or behave unexpectedly when linting foreign file types.
             * This usually happens on unexpected for the rule file types when `files` are not
             * restricted.
             * For example:
             * - [`no-irregular-whitespace`](https://eslint.org/docs/latest/rules/no-irregular-whitespace)
             *   crashes on `.css` files or on `.json`, `.jsonc` and `.json5` files parsed by
             *   [`@eslint/json`](https://github.com/eslint/json)
             * - [`regexp/no-legacy-features`](https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-legacy-features.html)
             *   crashes on `.md` files (only if `language` option is specified in the markdown
             *   config)
             * - [`css-in-js/color-hex-style`](https://ota-meshi.github.io/eslint-plugin-css/rules/color-hex-style.html)
             *   crashes on `.scss` files, because it reads `sourceCode.parserServices`, which is
             *   absent under the `css/css` language
             * - [`strict`](https://eslint.org/docs/latest/rules/strict) crashes on `.html` files
             * - `sonarjs/assertions-in-tests` or
             *   [`node/no-unsupported-features/node-builtins`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unsupported-features/node-builtins.md)
             *   crash on `.toml` files
             * - `.yaml` files are excluded because when no config specifies the language or a
             *   parser for YAML files, embedded code blocks might get linted by other rules and
             *   produce weird errors.
             *   For example, [`no-labels`](https://eslint.org/docs/latest/rules/no-labels) gets
             *   triggered on YAML maps (`a: b`)
             * - On top of all of that, ESLint 10 refuses to lint a file at all if any enabled rule
             *   declares a [`meta.languages`](https://github.com/eslint/eslint/issues/20999) not
             *   matching the language the file is parsed with, which, for example, every
             *   `eslint-plugin-unicorn` rule does.
             *
             * That's why globs corresponding to such files are implicitly/internally added to the
             * final `ignores` array.
             *
             * Use this option if you don't want implicitly ignore certain file types (set the file
             * type you wish not to be ignored to `false`).
             * You can also set the whole option to `false` to not add anything to `ignores`.
             * @default true
             */
            ignoresInternal?:
              boolean | Partial<Record<ImplicitlyIgnoredFileTypeUnlessParsed, boolean>>;

            /**
             * The language this config's rules expect the target files to be written for.
             *
             * Setting this option contributes to the final list of files that will be parsed
             * by the same parser.
             */
            parseWith?: ParsingLanguagesWithDialects;

            /**
             * Specifies which `parsing` root option entries this config takes the `ignores` of.
             *
             * Primarily meant for configs running on files of a language their rules
             * were not written for (for example, `unicorn/{json,markdown}`).
             */
            parsingIgnoresInheritedFrom?: ParsingLanguages[];

            /**
             * Specifies plugin shared settings on the specified property.
             *
             * To assign settings directly to the `settings` object, use an empty string as a
             * property name.
             */
            settings?: Record<string, Nullable<Record<string, unknown>>>;

            skipTypeInfoSplit?: boolean;
          },
        ],
    config?: FlatConfigEntryForBuilder,
  ) {
    const [configName, internalOptions] =
      typeof nameAndMaybeOptions === 'string' ? [nameAndMaybeOptions, {}] : nameAndMaybeOptions;
    const configOptions = this.options;

    const {parseWith, parsingIgnoresInheritedFrom} = internalOptions;
    const parseWithInfo =
      parseWith == null
        ? null
        : typeof parseWith === 'string'
          ? {language: parseWith}
          : {language: parseWith[0], dialect: parseWith[1]};

    const [files, ignores, isConfigDisabled] = (() => {
      const applyUserFilesAndIgnores = internalOptions.applyUserFilesAndIgnores !== false;
      const configFilesAndIgnoresNotSpecified =
        configOptions.files == null && configOptions.ignores == null;

      const filesOption = applyUserFilesAndIgnores
        ? configOptions.files ||
          (configFilesAndIgnoresNotSpecified
            ? internalOptions.inheritFilesAndIgnoresFrom?.files
            : undefined)
        : undefined;

      const filesWhenArray = typeof filesOption === 'function' ? undefined : filesOption;
      const filesWhenArrayResolved = filesWhenArray?.length
        ? internalOptions.filesDefaultMergedWithUserFiles
          ? [...(internalOptions.filesDefault || []), ...filesWhenArray]
          : filesWhenArray
        : internalOptions.filesDefault || [];

      const filesDefault =
        internalOptions.filesMerged?.length && filesWhenArrayResolved.length > 0
          ? [...filesWhenArrayResolved, ...internalOptions.filesMerged]
          : filesWhenArrayResolved;
      const filesWhenFn =
        typeof filesOption === 'function'
          ? filesOption({filesDefault: [...filesDefault]})
          : undefined;

      const ignoresOption = applyUserFilesAndIgnores
        ? configOptions.ignores ||
          (configFilesAndIgnoresNotSpecified
            ? internalOptions.inheritFilesAndIgnoresFrom?.ignores
            : undefined)
        : undefined;
      const ignoresFromUser = typeof ignoresOption === 'function' ? undefined : ignoresOption;
      const ignoresExclusionsOfParsedLanguages = (() => {
        const fileTypes: ImplicitlyIgnoredFileTypeUnlessParsed[] = [];

        if (parseWithInfo != null) {
          const {language, dialect} = parseWithInfo;
          const {dialects, dialectDefault}: ParsingLanguageDefinition = PARSING_LANGUAGES[language];
          fileTypes.push(...(dialects[dialect || dialectDefault]?.ignoresExclusions || []));
        }

        parsingIgnoresInheritedFrom?.forEach((language) => {
          const {dialects}: ParsingLanguageDefinition = PARSING_LANGUAGES[language];
          // No dialect is set, so any of them may be the one that ends up set up
          Object.values(dialects).forEach(({ignoresExclusions}) => {
            fileTypes.push(...(ignoresExclusions || []));
          });
        });

        return fileTypes;
      })();
      const ignoresInternal = objectEntriesUnsafe(
        FILE_EXTENSIONS_IMPLICITLY_IGNORED_BY_DEFAULT_IN_UN_CONFIGS_GLOBS,
      ).flatMap(([fileType, globs]) =>
        internalOptions.ignoresInternal === false ||
        (internalOptions.ignoresInternal !== true &&
          (internalOptions.ignoresInternal?.[fileType] === false ||
            ignoresExclusionsOfParsedLanguages.includes(fileType)))
          ? []
          : globs,
      );
      const ignoresDefault = internalOptions.ignoresDefault || [];
      const ignoresBeforeUserFn = [
        ...ignoresInternal,
        ...(!ignoresFromUser || internalOptions.ignoresDefaultMergedWithUserIgnores
          ? ignoresDefault
          : []),
        ...(ignoresFromUser || []),
      ];

      return [
        filesWhenFn || filesDefault,
        (typeof ignoresOption === 'function'
          ? ignoresOption({ignoresDefault: [...ignoresDefault], ignoresImplicit: ignoresInternal})
          : undefined) || ignoresBeforeUserFn,
        filesWhenFn?.length === 0,
      ] as const;
    })();

    // We require the presence of `rules`:
    // - to avoid likely adding it anyway later on
    // - to avoid (mostly likely accidental) "global ignores" configs (https://eslint.org/docs/latest/use/configure/configuration-files#globally-ignore-files-with-ignores)
    const configFinal: SetRequired<EslintFlatConfigEntry, 'rules' | 'name'> = {
      ...(files.length > 0 && {files}),
      ...(ignores.length > 0 && {ignores}),
      ...config,
      name: genFlatConfigEntryName(
        `${configName}${configIndexProperty in this.options ? `#${this.options[configIndexProperty]}` : ''}`,
      ),
      rules: {},
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

    const configMetadata: FlatConfigMetadata = isConfigDisabled
      ? {}
      : this.addFlatConfig(configFinal);

    if (!isConfigDisabled) {
      if (internalOptions.skipTypeInfoSplit || this.context.internalOptions.skipTypeInfoSplit) {
        configMetadata.skipTypeInfoSplit = true;
      }

      processUnOrFlatConfig(this.context, configFinal, undefined);

      if (parseWithInfo != null) {
        const {language, dialect} = parseWithInfo;
        this.context.requestParsing(language, {config: configFinal, dialect, kind: 'writtenFor'});
      }

      internalOptions.parsingIgnoresInheritedFrom?.forEach((language) => {
        this.context.requestParsing(language, {config: configFinal, kind: 'runsOn'});
      });

      savePackagesToLoadFromConfig(this.context, configFinal);
    }

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
      if (severity == null || isConfigDisabled) {
        // eslint-disable-next-line ts/no-use-before-define
        return result;
      }

      const severityRaw =
        configOptions.forceSeverity ?? this.context.rootOptions.forceSeverity ?? severity;
      const severityResolved = this.context.rootOptions.noWarnings
        ? severityRaw === WARNING
          ? ERROR
          : severityRaw === 'warn'
            ? 'error'
            : severityRaw
        : severityRaw;
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
        // If the rule is disabled, disable its autofix counterpart rule as well
        if (
          // TODO is it even possible to encounter disable-autofix rule here?
          !ruleNameResolved.startsWith(DISABLE_AUTOFIX_WITH_SLASH) &&
          this.context.fixableRulesPerPlugin[plugin]?.[ruleNameUnprefixed]
        ) {
          configFinal.rules[`${DISABLE_AUTOFIX_WITH_SLASH}${ruleNameResolved}`] = OFF;
        }
      } else {
        this.context.registerUsedPlugin(plugin);
      }

      this.setConfigMetadataForRule(configMetadata, {
        plugin,
        ruleName: ruleNameUnprefixed,
        ruleEntryName: ruleNameResolved,
        severity: eslintToUnRuleSeverity(severityResolved),
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
        /* v8 ignore stop */
        return addRule(this.pluginPrefix, ruleName, severity, ruleOptions, options);
      },

      addAnyRule: <
        P extends PluginPrefix,
        N extends GetRuleNamesInPlugin<P>,
        Severity extends RuleSeverity,
      >(
        prefix: P,
        ruleName: N,
        severity: Severity | null,
        ruleOptions?: NoInfer<GetRuleOptions<P, N, 'all'>>,
        options?: AddRuleInternalOptions,
      ) => addRule(prefix, ruleName, severity, ruleOptions, options),

      disableAnyRule: <P extends PluginPrefix>(
        plugin: P,
        ruleNameUnprefixed: GetRuleNamesInPlugin<P>,
      ) => {
        if (isConfigDisabled) {
          return result;
        }

        const ruleNameResolved = resolveFullRuleName(this.context, plugin, ruleNameUnprefixed);

        configFinal.rules[ruleNameResolved] = OFF;
        if (this.context.fixableRulesPerPlugin[plugin]?.[ruleNameUnprefixed]) {
          configFinal.rules[`${DISABLE_AUTOFIX_WITH_SLASH}${ruleNameResolved}`] = OFF;
        }

        return result;
      },

      addOverrides: ({onlyAny = false}: {onlyAny?: boolean} = {}) => {
        if (isConfigDisabled) {
          return result;
        }

        processUnOrFlatConfig(
          this.context,
          configFinal,
          onlyAny ? {} : this.options.overrides,
          this,
        );
        processUnOrFlatConfig(this.context, configFinal, this.options.overridesAny, this);
        return result;
      },

      addBulkRules: (rules: Prettify<UnRulesConfig> | Falsy) => {
        if (isConfigDisabled) {
          return result;
        }

        processUnOrFlatConfig(this.context, configFinal, rules || {}, this);
        return result;
      },

      disableBulkRules: (rules: (UnAllRuleNames | (string & {}))[] | Falsy) => {
        if (!isConfigDisabled && rules && rules.length > 0) {
          const newRuleEntries = Object.fromEntries(
            rules.flatMap((ruleName) => {
              const {pluginPrefixCanonical, ruleNameUnprefixed} =
                getRuleNameAndPluginPrefixByFullName(this.context, ruleName);
              const entries: [string, typeof OFF][] = [[ruleName, OFF]];
              if (this.context.fixableRulesPerPlugin[pluginPrefixCanonical]?.[ruleNameUnprefixed]) {
                entries.push([`${DISABLE_AUTOFIX_WITH_SLASH}${ruleName}`, OFF]);
              }
              return entries;
            }),
          );

          processUnOrFlatConfig(this.context, configFinal, newRuleEntries, this);
        }

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
        if (!isConfigDisabled && this.context.isTestMode) {
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
              arrayPartition(Object.entries(plugin.rules || {}), ([, {meta}]) => !meta?.deprecated),
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
                Object.groupBy(addedRulesForPlugin, ([, categoryName]) => categoryName),
              ).forEach(([groupName, rulesGroup = []]) => {
                const rulesToSwapPositionsOf = findArrayInversions(
                  rulesGroup.map(([ruleName]) => ruleName),
                  (a, b) => a.localeCompare(b),
                  true,
                );
                if (rulesToSwapPositionsOf.size === 0) {
                  return;
                }
                const rulesToSwapNormalized = Object.entries(
                  Object.groupBy(
                    Array.from(rulesToSwapPositionsOf, ([left, right]) => ({
                      left,
                      right: right.at(-1) || '',
                    })),
                    (v) => v.right,
                  ),
                ).map(
                  ([right, rules = []]) =>
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
    const {
      mode: typeInfoMode,
      ignores: typeInfoIgnores,
      parserOptions: globalParserOptions,
    } = this.context.typeInfoRulesResolved;

    return [...this.configs.values()].flatMap(
      ([config, {rulesRequiringTypeInfo, skipTypeInfoSplit}]) => {
        if (
          typeInfoIgnores?.length &&
          ((skipTypeInfoSplit && rulesRequiringTypeInfo?.size) ||
            configRequestsTypeInformation(config))
        ) {
          config.ignores = [...(config.ignores || []), ...typeInfoIgnores];
        }

        if (!rulesRequiringTypeInfo?.size) {
          return config;
        }

        const typeInfoModeResolved =
          typeInfoMode === 'disabled' ? 'disabled' : skipTypeInfoSplit ? 'asIs' : typeInfoMode;

        if (typeInfoModeResolved === 'asIs') {
          return config;
        }

        if (typeInfoModeResolved === 'disabled') {
          rulesRequiringTypeInfo.forEach(({plugin, ruleName}, ruleEntryName) => {
            const throwsWithoutTypeInfo =
              RULES_REQUIRING_TYPE_INFORMATION[plugin]?.rules[ruleName] === true;
            if (throwsWithoutTypeInfo && config.rules) {
              config.rules[ruleEntryName] = OFF;
            }
          });

          return config;
        }

        const shouldConfigureParser = typeInfoModeResolved === 'standalone';

        const possibleFiles = new Set<string>([GLOB_TS_X]);
        let extraFileExtensions: Set<string> | undefined;
        const rulesEntries = Array.from(rulesRequiringTypeInfo, ([ruleEntryName, {plugin}]) => {
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
        });

        const originalParserOptions = config.languageOptions?.['parserOptions'];

        const splitExtraFileExtensions = [
          ...(globalParserOptions?.extraFileExtensions || []),
          ...(extraFileExtensions || []),
        ];
        const globalSetsUpProjectService =
          globalParserOptions?.projectService != null || globalParserOptions?.project != null;

        const configForTypeInformation: SetRequired<EslintFlatConfigEntry, 'name'> = {
          ...config,
          name: `${config.name}/@type-information`,
          files: config.files?.length
            ? intersectParentConfigFilesWithProvidedFiles(config.files, [...possibleFiles])
            : [...possibleFiles],
          ignores: [...(config.ignores || []), GLOB_MD_X_CODE_BLOCKS, ...(typeInfoIgnores || [])],
          languageOptions: {
            ...config.languageOptions,
            parserOptions: {
              ...(typeof originalParserOptions === 'object' &&
                originalParserOptions !== null &&
                originalParserOptions),
              ...(shouldConfigureParser && {
                ...globalParserOptions,
                ...(splitExtraFileExtensions.length > 0 && {
                  extraFileExtensions: [...new Set(splitExtraFileExtensions)],
                }),
                ...(!globalSetsUpProjectService && {projectService: true}),
              }),
            },
          },
          rules: Object.fromEntries(rulesEntries) as Record<string, EslintRuleEntry>,
        };

        this.addFlatConfig(configForTypeInformation);

        // The parent's `ignores` may still grow afterwards (for example, when `parsing.*.ignores`
        // is set), and the copied config should follow along - so we copy the parent's request too
        this.context.parsingRequests.forEach((requests, language) => {
          const parentRequest = requests.find(({config: registered}) => registered === config);
          if (parentRequest) {
            this.context.requestParsing(language, {
              ...parentRequest,
              config: configForTypeInformation,
              kind: 'splitOff',
            });
          }
        });

        if (shouldConfigureParser) {
          this.context.usedPackages.set('typescriptEslintParser', [
            ...(this.context.usedPackages.get('typescriptEslintParser') || []),
            {
              config: configForTypeInformation,
              path: 'languageOptions',
              info: {package: 'typescriptEslintParser', property: 'parser'},
            },
          ]);

          this.context.recordPackageRequester('package', 'typescriptEslintParser');
        }

        return [config, configForTypeInformation];
      },
    );
  }
}
