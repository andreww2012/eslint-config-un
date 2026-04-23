import type {ConsolaInstance} from 'consola';
import type {FlatGitignoreOptions} from 'eslint-config-flat-gitignore';
import type {Debugger} from 'obug';
import type {detect as detectPackageManager} from 'package-manager-detector/detect';
import type {UnConfigs} from '../configs';
import type {FastImportPluginSettings} from '../configs/fast-import';
import type {RulesDisabledInEmbeddedCodeBlocksByDefault} from '../configs/shared';
import {DISABLE_AUTOFIX_WITH_SLASH, OFF, type PACKAGES_TO_GET_INFO_FOR} from '../constants';
import type {
  EslintFlatConfigEntry,
  EslintPlugin,
  EslintRuleEntry,
  EslintSeverity,
  EslintTypedRulesConfig,
  UnAllRuleNames,
  UnExtraPluginsRules,
  UnExtraPluginsRulesConfig,
  UnFixableRuleNames,
  UnFlatConfigEntryFilesAndIgnores,
  UnFlatConfigEntryOverridesEntry,
  UnFlatConfigEntryOverridesType,
  UnRulesConfig,
} from '../eslint/eslint-types';
import {eslintToUnRuleSeverity, getRuleNameAndPluginPrefixByFullName} from '../eslint/eslint-utils';
import type {
  LoadablePackagePrefix,
  LoadablePluginPrefix,
  PackageToLoadInfo,
  ParserPrefix,
  PluginPrefix,
  pluginsLoaders,
} from '../loaders';
import type {MaybePromise, OmitStrict, Prettify, SetRequired} from '../types';
import {type MaybeArray, type MaybeFn, type fetchPackageInfo, maybeCall} from '../utils';
import type {createConfigBuilder} from './config';
import type {ConfigEntryBuilder} from './config-entry-builder';
import type {ImportPluginReplaceableRules} from './fast-import';

export type ExtraPluginsType = Record<string, MaybeFn<MaybePromise<EslintPlugin>>>;

type UnFlagConfigEntry<ExtraPlugins extends ExtraPluginsType = never> = OmitStrict<
  EslintFlatConfigEntry,
  'rules'
> & {
  rules?: UnFlatConfigEntryOverridesType<UnRulesConfig> & UnExtraPluginsRulesConfig<ExtraPlugins>;
};

type ValueOrEslintConfigWithValue<T> =
  | T
  | MaybeArray<Prettify<UnFlatConfigEntryFilesAndIgnores & {value?: T}>>;

// ⚠️ IMPORTANT: please don't forget to sync this list with `autofixDisabledGloballyFor` option docs (below)
export const RULES_TO_DISABLE_AUTOFIX_GLOBALLY_BY_DEFAULT: (EslintConfigUnOptions['autofixDisabledGloballyFor'] &
  object)['rules'] = {
  // TODO add missing reasons for disabling autofixes
  'case-police/string-check': true, // May alter JS strings, object properties, etc

  'ts/method-signature-style': true,
  'ts/no-unnecessary-type-arguments': true, // Could remove type aliases

  'unicorn/catch-error-name': true,
  'unicorn/consistent-existence-index-check': true,
  'unicorn/explicit-length-check': true, // Wrong auto-fixes
  'unicorn/no-useless-undefined': true,
  'unicorn/prefer-spread': true,
  'unicorn/prefer-string-raw': true, // Transforms strings to `String.raw` expressions, which may cause type errors

  'vitest/prefer-lowercase-title': true, // Strings/symbols shouldn't be changed by autofix

  'github-actions/action-name-casing': true, // May break the name

  'markdown-preferences/heading-casing': true, // Both *-casing rules may change the meaning of the text
  'markdown-preferences/table-header-casing': true,
};

type UnConfigsSupportingArrays = keyof Pick<UnConfigs, 'format' | 'packageJson'>;

export interface EslintConfigUnOptions<ExtraPlugins extends ExtraPluginsType = never> {
  // #region 🟠 FREQUENTLY USED OPTIONS

  configs?: {
    [Key in keyof UnConfigs<ExtraPlugins>]?:
      | boolean
      | UnConfigs<ExtraPlugins>[Key]
      | (Key extends UnConfigsSupportingArrays
          ? [UnConfigs<ExtraPlugins>[Key], ...UnConfigs<ExtraPlugins>[Key][]]
          : never);
  };

  /**
   * **Global** ignore patterns. By default will be merged with our ignore patterns, unless the object notation is used and `override` option is set to `true`
   */
  ignores?:
    | EslintFlatConfigEntry['ignores']
    | {
        files: string[];
        override?: boolean;
      };

  /**
   * Allows to provide additional ESLint plugins. Their prefixes and possibly rule names
   * will appear in configs' `rules` property type. They will be lazy-loaded only if used.
   *
   * Note that their prefixes must not match the built-it/known ones (like `ts` or `unicorn`)
   * or even prefixes you've renamed via `pluginRenames`.
   */
  extraPlugins?: ExtraPlugins;

  // #endregion

  // #region 🟠 ESLINT FLAT CONFIG OPTIONS

  /**
   * Sets [`linterOptions.noInlineConfig`](https://eslint.org/docs/latest/use/configure/configuration-files#configuration-objects:~:text=noInlineConfig) globally or more granularly.
   * @default false
   */
  linterOptionsNoInlineConfig?: ValueOrEslintConfigWithValue<boolean>;

  /**
   * Sets [`linterOptions.reportUnusedDisableDirectives`](https://eslint.org/docs/latest/use/configure/configuration-files#configuration-objects:~:text=reportUnusedDisableDirectives) globally or more granularly.
   * @default 'warn'
   */
  linterOptionsReportUnusedDisableDirectives?: ValueOrEslintConfigWithValue<EslintSeverity>;

  /**
   * Sets [`linterOptions.reportUnusedInlineConfigs`](https://eslint.org/docs/latest/use/configure/configuration-files#configuration-objects:~:text=reportUnusedInlineConfigs) globally or more granularly.
   * @default 'off'
   */
  linterOptionsReportUnusedInlineConfigs?: ValueOrEslintConfigWithValue<EslintSeverity>;

  // #endregion

  // #region 🟠 CONFIGS RELATED OPTIONS

  /**
   * User provided flat configs. They still support plugin renaming, but besides that,
   * will be put as-is after all the eslint-config-un's configs,
   * and before the config which disables Prettier incompatible rules for all files.
   */
  extraConfigs?: UnFlagConfigEntry<ExtraPlugins>[];

  /**
   * This option overrides if certain configs are enabled or disabled by default.
   * - `all-disabled`: consider all top level configs disabled unless explicitly enabled.
   * - `misc-enabled`: consider some configs disabled by default, conversely enabled:
   *   - `e18e`
   *   - `json`
   *   - `jsonSchemaValidator`
   *   - `lockfile`
   *   - `nodeDependencies`
   *   - `security`
   *   - `toml`
   *   - `yaml`
   */
  defaultConfigsStatus?: 'all-disabled' | 'misc-enabled';

  /**
   * Type of your project. Depending on the value, will affect the following rules:
   * - [`import/no-extraneous-dependencies`](https://github.com/un-ts/eslint-plugin-import-x/blob/HEAD/docs/rules/no-extraneous-dependencies.md): importing from `devDependencies` will be forbidden in `lib` mode.
   * @default 'app'
   */
  mode?: 'app' | 'lib';

  /**
   * Force non-zero severity of all the rules to be `error` or `warning`.
   * This can also be configured per-config.
   */
  forceSeverity?: Exclude<EslintSeverity, 0 | 'off'>;

  // #endregion

  // #region 🟠 PLUGINS RELATED OPTIONS

  /**
   * Allows to change a plugin prefix. Keys are the default prefixes, value cannot be empty
   * string (or it will be ignored anyway).
   *
   * You have to still use **OLD** prefixes in `overrides`, and they will be automatically renamed.
   * @example
   * To make all the rules from `@eslint-react` plugin have `react-x` prefix:
   * ```ts
   * {'@eslint-react': 'react-x'}
   * ```
   */
  pluginRenames?: Partial<Record<Exclude<PluginPrefix, ''>, string>>;

  /**
   * This option allows you to override any of the used plugins. This can be useful
   * when this config is used to lint a repository of one of the built-in plugins
   * to provide development version of that plugin.
   */
  pluginOverrides?: {
    [Plugin in Exclude<PluginPrefix, ''>]?: MaybeFn<
      MaybePromise<
        Plugin extends keyof typeof pluginsLoaders
          ? Awaited<ReturnType<(typeof pluginsLoaders)[Plugin]>>['module'] & {}
          : EslintPlugin
      >
    >;
  };

  /**
   * Whether ESLint plugins will be loaded if they are actually used.
   *
   * If an object is used, all plugins except the ones specified in `alwaysLoad`
   * will be lazy-loaded.
   * @default true
   */
  loadPluginsOnDemand?:
    | boolean
    | {
        /**
         * These plugins will always be loaded. This can be useful if you enable certain
         * plugin rules only be using
         * [configuration comments](https://eslint.org/docs/latest/use/configure/rules#using-configuration-comments).
         */
        alwaysLoad: LoadablePluginPrefix[];
      };

  // #endregion

  // #region 🟠 RULES RELATED OPTIONS

  /**
   * Defines for which rules and/or plugins autofix will be disabled globally.
   *
   * If you set `plugins.<pluginName>: false` (default), all the fixable plugin's rules will remain
   * being autofixable, expect for the ones set to `true` in `rules`.
   *
   * If you set `plugins.<pluginName>: true`, all the fixable plugin's rules will stop
   * being autofixable, expect for the ones set to `false` in `rules`.
   *
   * `rules` object will be merged with the following default value:
   * ```ts
   * {
   *   'case-police/string-check': true,
   *   'markdown-preferences/heading-casing': true,
   *   'markdown-preferences/table-header-casing': true,
   *   'ts/method-signature-style': true,
   *   'ts/no-unnecessary-type-arguments': true,
   *   'unicorn/catch-error-name': true,
   *   'unicorn/consistent-existence-index-check': true,
   *   'unicorn/explicit-length-check': true,
   *   'unicorn/no-useless-undefined': true,
   *   'unicorn/prefer-spread': true,
   *   'unicorn/prefer-string-raw': true,
   *   'vitest/require-import-vi-mock': true,
   *   'vitest/prefer-lowercase-title': true,
   *   'zod/require-schema-suffix': true,
   * }
   * ```
   *
   * Other special values:
   * - `true`: autofix will be disabled for all the fixable rules in all the plugins.
   * - `false`: no autofixes will be disabled.
   */
  autofixDisabledGloballyFor?:
    | boolean
    | {
        plugins?: Partial<Record<PluginPrefix, boolean>>;
        rules?: Partial<Record<UnFixableRuleNames, boolean>>;
      };

  /**
   * Enables `eslint-config-prettier` at the end of the ruleset.
   * @default true <=> `prettier` package is installed
   * @see https://github.com/prettier/eslint-config-prettier
   */
  disablePrettierIncompatibleRules?: boolean;

  /**
   * Decide which rules should be disabled/enabled in Markdown and MDX "fenced code blocks"
   * (like \```lang ... ```).
   */
  markdownCodeBlocksRules?: {
    /**
     * Setting rule names to `true` in this object will disable them in all embedded code blocks.
     */
    additionalDisabledRules?: Partial<
      Record<
        Exclude<
          UnExtraPluginsRules<ExtraPlugins> | UnAllRuleNames,
          RulesDisabledInEmbeddedCodeBlocksByDefault
        >,
        boolean
      >
    >;

    /**
     * All rules available for this option are disabled by default by eslint-config-un
     * in embedded code blocks. Set necessary rules to `true` to avoid disabling them.
     *
     * ⚠️ Some rules are disabled in certain configs.
     */
    doNotDisable?: Partial<Record<RulesDisabledInEmbeddedCodeBlocksByDefault, boolean>>;
  };

  /**
   * Replaces the implementation of certain [`import`](https://npmjs.com/eslint-plugin-import-x) plugin rules with implementations from [`fast-import`](https://npmjs.com/eslint-plugin-fast-import).
   *
   * ⚠️ The latter plugin doesn't support the rule options from the former plugin.
   * It'll be made by us that they will be silently ignored.
   *
   * The replaced rules' list (their name will actually be preserved):
   * - `no-cycle`
   * - `no-named-as-default`
   * - `no-unresolved` (replaced with `no-unresolved-imports`)
   * @default false
   */
  useFastImport?:
    | boolean
    | {
        pluginSettings?: Partial<FastImportPluginSettings>;
        replaceRules?: Partial<Record<ImportPluginReplaceableRules, boolean>>;
      };

  // #endregion

  // #region 🟠 OTHER OPTIONS

  /**
   * Automatically add gitignore'd files to the global `ignores` array.
   * @default true <=> `.gitignore` exists in [the current working directory](https://nodejs.org/api/process.html#processcwd)
   */
  gitignore?: boolean | FlatGitignoreOptions;

  /**
   * Globally disables all the rules that may perform network requests for validation.
   * @default true <=> `ESLINT_CONFIG_UN_OFFLINE_MODE` environment variable is set to non-empty string
   */
  offlineMode?: boolean;

  /**
   * Attempt to cache the resolved flat config. This might fail if it contains
   * unserializable data, such as functions. Enabled by default when running in editor.
   *
   * It will be stored in `node_modules/.cache/eslint-config-un/config.json` and considered
   * fresh for 1 hour, unless one of the following is changed:
   * - Current git revision (`git rev-parse HEAD`) or root `.gitignore` contents
   * - `package.json`, lockfile contents or package manager
   * - ESLint config file contents
   * - Node.JS version
   * @default true <=> running in editor (detected by [`is-in-editor`](https://npmjs.com/is-in-editor))
   */
  cacheConfigs?: boolean;

  // #endregion
}

export interface EslintConfigUnInternalOptions {
  disableAutofixForAllFixableRulesOnly?: boolean;

  /**
   * - Enables configs testing
   * - Disables console warnings
   */
  testMode?: boolean;
}

export interface UnConfigContext<ExtraPlugins extends ExtraPluginsType = ExtraPluginsType> {
  rootOptions: EslintConfigUnOptions<ExtraPlugins>;
  internalOptions: EslintConfigUnInternalOptions;
  packagesInfo: Record<
    (typeof PACKAGES_TO_GET_INFO_FOR)[number],
    Awaited<ReturnType<typeof fetchPackageInfo>>
  >;
  configsMeta: Record<keyof UnConfigs<ExtraPlugins>, {enabled: boolean}>;
  resolvedConfigs?: Partial<UnConfigs<ExtraPlugins>>;

  /**
   * NOTE: mutable. Rule names must be UNprefixed
   */
  disabledAutofixes: Partial<Record<PluginPrefix, string[]>>;

  /**
   * NOTE: mutable
   */
  usedPlugins: Set<PluginPrefix | (string & {})>;

  /**
   * NOTE: mutable
   */
  usedParsers: Map<ParserPrefix, EslintFlatConfigEntry[]>;

  /**
   * NOTE: mutable
   */
  usedPackages: Map<
    LoadablePackagePrefix,
    {config: EslintFlatConfigEntry; path: string; info: PackageToLoadInfo}[]
  >;

  /**
   * NOTE: mutable
   */
  missingPackages: Set<string>;

  meta: {
    usedPackageManager: Awaited<ReturnType<typeof detectPackageManager>>;
  };

  logger: ConsolaInstance;
  debug: Debugger;
  isTestMode: boolean;
  tests: MaybeFn<
    MaybeArray<string | {message: string; severity: 'error' | 'warn'}> | null,
    [
      data: {
        plugins: Partial<Record<PluginPrefix, EslintPlugin>>;
      },
    ]
  >[];
  createConfigBuilder: typeof createConfigBuilder;
}

export type UnConfigFn<
  ConfigKey extends keyof UnConfigs,
  ExtraArgument = unknown,
  ExtraReturnedData = unknown,
> = <ExtraPlugins extends ExtraPluginsType>(
  context: Readonly<UnConfigContext<ExtraPlugins>>,
  configOptions:
    | boolean
    // eslint-disable-next-line ts/no-restricted-types -- some configs don't have the omitted properties
    | Omit<UnConfigs<ExtraPlugins>[ConfigKey], 'overrides' | 'overridesAny'>
    | undefined,
  extraArgument: ExtraArgument,
) => MaybePromise<
  | null
  | ({
      configs: (ConfigEntryBuilder<ExtraPlugins> | null)[];
      optionsResolved: Record<string, unknown>;
    } & ExtraReturnedData)
>;

export const processUnOrFlatConfig = (
  context: UnConfigContext,
  config: EslintFlatConfigEntry | UnFlagConfigEntry,
  overrides: Record<string, UnFlatConfigEntryOverridesEntry | undefined> | undefined,
  existingRules?: Partial<EslintTypedRulesConfig>,
) => {
  const extraConfigs: SetRequired<EslintFlatConfigEntry, 'name'>[] = [];
  const removedRules: string[] = [];

  if (config.language) {
    context.usedPlugins.add(
      getRuleNameAndPluginPrefixByFullName(context, config.language).pluginPrefixCanonical,
    );
  }

  const rules: Record<string, EslintRuleEntry> = Object.fromEntries(
    Object.entries(overrides || {}).flatMap(([ruleNameRaw, ruleOptions]) => {
      if (ruleOptions == null) {
        return [];
      }

      const {
        pluginPrefixCanonical,
        ruleNameUnprefixed,
        fullRuleNameWithResolvedPrefix: ruleNameInitial,
      } = getRuleNameAndPluginPrefixByFullName(context, ruleNameRaw);

      let ruleName = ruleNameInitial;

      const existingRuleRecord = existingRules?.[ruleName];

      const rawSeverityInitial = Array.isArray(existingRuleRecord)
        ? existingRuleRecord[0]
        : existingRuleRecord;
      const severityInitial = eslintToUnRuleSeverity(rawSeverityInitial);

      const options = Array.isArray(existingRuleRecord) ? existingRuleRecord.slice(1) : undefined;
      const ruleEntryRaw = maybeCall(ruleOptions, severityInitial, options);
      const isRuleEntryRawObject =
        ruleEntryRaw &&
        typeof ruleEntryRaw === 'object' &&
        'severity' in ruleEntryRaw; /* `!Array.isArray(...)` doesn't work */

      const result: [ruleName: string, EslintRuleEntry][] = [];
      const ruleEntry: EslintRuleEntry = isRuleEntryRawObject
        ? ruleEntryRaw.options == null
          ? ruleEntryRaw.severity
          : [ruleEntryRaw.severity, ...ruleEntryRaw.options]
        : (ruleEntryRaw as EslintRuleEntry);
      let disableAutofix = false;

      if (isRuleEntryRawObject && ruleEntryRaw.disableAutofix != null) {
        disableAutofix = ruleEntryRaw.disableAutofix;
        const ruleNameWithDisableAutofixPrefix = `${DISABLE_AUTOFIX_WITH_SLASH}${ruleName}`;
        if (disableAutofix) {
          result.push([ruleName, OFF]);
          ruleName = ruleNameWithDisableAutofixPrefix;
        } else {
          result.push([ruleNameWithDisableAutofixPrefix, OFF]);
        }
      }

      result.push([ruleName, ruleEntry]);

      if (
        ruleEntry !== 0 &&
        ruleEntry !== 'off' &&
        !(Array.isArray(ruleEntry) && (ruleEntry[0] === 0 || ruleEntry[0] === 'off'))
      ) {
        context.usedPlugins.add(pluginPrefixCanonical);

        if (disableAutofix) {
          context.disabledAutofixes[pluginPrefixCanonical as PluginPrefix] = [
            ...(context.disabledAutofixes[pluginPrefixCanonical as PluginPrefix] || []),
            ruleNameUnprefixed,
          ];
        }
      }

      if (
        isRuleEntryRawObject &&
        (ruleEntryRaw.files?.length || ruleEntryRaw.ignores?.length) &&
        config.files?.length !== 0
      ) {
        extraConfigs.push({
          name: `${config.name || ''}/@rule/${ruleNameInitial}`,
          ...((ruleEntryRaw.files?.length || config.files?.length) && {
            files:
              ruleEntryRaw.files?.length && config.files?.length
                ? [ruleEntryRaw.files, config.files.flat()]
                : ruleEntryRaw.files || config.files,
          }),
          ...((ruleEntryRaw.ignores?.length || config.ignores?.length) && {
            ignores: ruleEntryRaw.ignores?.length ? ruleEntryRaw.ignores : config.ignores,
          }),
          rules: Object.fromEntries(result),
        });
        removedRules.push(...result.map(([ruleNameToRemove]) => ruleNameToRemove));
        return [];
      }

      return result;
    }),
  );

  return {
    rules,
    extraConfigs,
    removedRules,
  };
};
