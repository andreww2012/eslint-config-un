import type {ParserOptions as TsEslintParserOptions} from '@typescript-eslint/parser';
import type {ConsolaInstance} from 'consola';
import type {FlatGitignoreOptions} from 'eslint-config-flat-gitignore';
import type {Debugger} from 'obug';
import type {detect as detectPackageManager} from 'package-manager-detector/detect';
import type {UnConfigs} from '../configs';
import type {ImportIntegrityPluginSettings} from '../configs/import-integrity';
import type {RulesDisabledInEmbeddedCodeBlocksByDefault} from '../configs/shared';
import {DISABLE_AUTOFIX_WITH_SLASH, OFF, type PACKAGES_TO_GET_INFO_FOR} from '../constants';
import type {
  EslintFlatConfigEntry,
  EslintPlugin,
  EslintRuleEntry,
  EslintSeverity,
  UnAllRuleNames,
  UnExtraPluginsRules,
  UnExtraPluginsRulesConfig,
  UnFixableRuleNames,
  UnFlatConfigEntryFilesAndIgnores,
  UnFlatConfigEntryOverridesEntry,
  UnFlatConfigEntryOverridesType,
  UnRulesConfig,
} from '../eslint/eslint-types';
import {
  eslintToUnRuleSeverity,
  getRuleNameAndPluginPrefixByFullName,
  getRuleSeverityFromEslintRuleEntry,
} from '../eslint/eslint-utils';
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
import type {ImportPluginReplaceableRules} from './import-integrity';

export type ExtraPluginsType = Record<string, MaybeFn<MaybePromise<EslintPlugin>>>;

/**
 * A bag of options whose values influence the *types* of other options (currently only
 * `noWarnings`). Passed as the second type parameter of `EslintConfigUnOptions` so the
 * severity-typed surfaces can react to them.
 */
interface TypeAffectingOptionsType {
  noWarnings?: boolean;
}

// `StripWarnFromConfig` removes the `warning` (`1`/`'warn'`) severity from every severity-typed
// surface of a config option object: `forceSeverity`, `overrides`/`overridesAny` entries and the
// `rules` of raw flat configs (`extraConfigs`). Severity surfaces only live at the top level of a
// config and inside nested sub-configs (which all follow the `config*` key naming convention), so
// recursion is restricted to those keys — descending into every property (huge rule-option/settings
// objects) would be prohibitively expensive for the type checker.
type EslintSeverityNoWarn = Exclude<EslintSeverity, 1 | 'warn'>;

type StripWarnSeverity<Severity> = Exclude<Severity, 1 | 'warn'>;

type StripWarnRuleEntry<Entry> = Entry extends readonly [infer Severity, ...infer Rest]
  ? [StripWarnSeverity<Severity>, ...Rest]
  : StripWarnSeverity<Entry>;

type StripWarnOverrideEntryValue<Value> = Value extends {severity: EslintSeverity}
  ? OmitStrict<Value, 'severity'> & {severity: StripWarnSeverity<Value['severity']>}
  : StripWarnRuleEntry<Value>;

type StripWarnOverrideEntry<Entry> = Entry extends (...args: infer Args) => infer Return
  ? (...args: StripWarnRuleEntry<Args>) => StripWarnOverrideEntryValue<Return>
  : StripWarnOverrideEntryValue<Entry>;

type StripWarnRulesRecord<RulesRecord> = RulesRecord extends object
  ? {[RuleName in keyof RulesRecord]: StripWarnOverrideEntry<RulesRecord[RuleName]>}
  : RulesRecord;

type StripWarnConfigDepth = [never, 0, 1, 2, 3, 4];

type StripWarnFromConfig<Config, Depth extends number = 4> = Config extends (
  ...args: never[]
) => unknown
  ? Config
  : Config extends object
    ? {
        [Key in keyof Config]: Key extends 'forceSeverity'
          ? StripWarnSeverity<Config[Key]>
          : Key extends 'overrides' | 'overridesAny' | 'rules'
            ? StripWarnRulesRecord<Config[Key]>
            : Key extends `config${string}`
              ? Depth extends 0
                ? Config[Key]
                : StripWarnFromConfig<Config[Key], StripWarnConfigDepth[Depth]>
              : Config[Key];
      }
    : Config;

type NoWarningsEnabled<TypeAffectingOptions extends TypeAffectingOptionsType> =
  TypeAffectingOptions extends {
    noWarnings: true;
  }
    ? true
    : false;

type EslintSeverityWithTypeAffectingOptions<TypeAffectingOptions extends TypeAffectingOptionsType> =
  NoWarningsEnabled<TypeAffectingOptions> extends true ? EslintSeverityNoWarn : EslintSeverity;

type MaybeStripWarningSeverity<Config, TypeAffectingOptions extends TypeAffectingOptionsType> =
  NoWarningsEnabled<TypeAffectingOptions> extends true ? StripWarnFromConfig<Config> : Config;

type UnFlagConfigEntry<ExtraPlugins extends ExtraPluginsType = never> = OmitStrict<
  EslintFlatConfigEntry,
  'rules'
> & {
  rules?: UnFlatConfigEntryOverridesType<UnRulesConfig> & UnExtraPluginsRulesConfig<ExtraPlugins>;
};

type ValueOrEslintConfigWithValue<T> =
  T | MaybeArray<Prettify<UnFlatConfigEntryFilesAndIgnores & {value?: T}>>;

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
  'unicorn/prefer-private-class-fields': true, // As per the rule description itself, it skips some patterns that could be used to access autofixed non-private fields

  'vitest/prefer-lowercase-title': true, // Strings/symbols shouldn't be changed by autofix

  'github-actions/action-name-casing': true, // May break the name

  'markdown-preferences/heading-casing': true, // Both *-casing rules may change the meaning of the text
  'markdown-preferences/table-header-casing': true,
};

type UnConfigsSupportingArrays = keyof Pick<UnConfigs, 'format' | 'packageJson'>;

type TypeInfoMode = 'standalone' | 'splitOnly' | 'asIs' | 'disabled';

export interface EslintConfigUnOptions<
  ExtraPlugins extends ExtraPluginsType = never,
  TypeAffectingOptions extends TypeAffectingOptionsType = TypeAffectingOptionsType,
> {
  // #region 🟠 FREQUENTLY USED OPTIONS

  configs?: {
    [Key in keyof UnConfigs<ExtraPlugins>]?:
      | boolean
      | MaybeStripWarningSeverity<UnConfigs<ExtraPlugins>[Key], TypeAffectingOptions>
      | (Key extends UnConfigsSupportingArrays
          ? [
              MaybeStripWarningSeverity<UnConfigs<ExtraPlugins>[Key], TypeAffectingOptions>,
              ...MaybeStripWarningSeverity<UnConfigs<ExtraPlugins>[Key], TypeAffectingOptions>[],
            ]
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
   * **Global** files patterns. When non-empty, a dedicated flat config entry is created with
   * only these `files` (no rules, no other keys), which tells ESLint that the matched files are
   * meant to be linted. This is useful to prevent the
   * `File ignored because no matching configuration was supplied` error for files with extensions
   * that none of the enabled configs target.
   */
  files?: EslintFlatConfigEntry['files'];

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
   * Sets
   * [`linterOptions.noInlineConfig`](https://eslint.org/docs/latest/use/configure/configuration-files#configuration-objects:~:text=noInlineConfig)
   * globally or more granularly.
   *
   * ⚠️ Special case:
   * If only non-empty `ignores` is specified, the option will be set to `false` *for the ignored
   * paths*, i.e. `{ignores: [...]}` is actually a shorthand for `{files: [...], value: false}`.
   */
  linterOptionsNoInlineConfig?: ValueOrEslintConfigWithValue<boolean>;

  /**
   * Sets
   * [`linterOptions.reportUnusedDisableDirectives`](https://eslint.org/docs/latest/use/configure/configuration-files#configuration-objects:~:text=reportUnusedDisableDirectives)
   * globally or more granularly.
   *
   * ⚠️ Special case:
   * If only non-empty `ignores` is specified, the option will be set to `off` *for the ignored
   * paths*, i.e. `{ignores: [...]}` is actually a shorthand for `{files: [...], value: 'off}`.
   * @default 'warn'; 'error' when `noWarnings` is `true`
   */
  linterOptionsReportUnusedDisableDirectives?: ValueOrEslintConfigWithValue<
    EslintSeverityWithTypeAffectingOptions<TypeAffectingOptions>
  >;

  /**
   * Sets
   * [`linterOptions.reportUnusedInlineConfigs`](https://eslint.org/docs/latest/use/configure/configuration-files#configuration-objects:~:text=reportUnusedInlineConfigs)
   * globally or more granularly.
   *
   * ⚠️ Special case:
   * If only non-empty `ignores` is specified, the option will be set to `off` *for the ignored
   * paths*, i.e. `{ignores: [...]}` is actually a shorthand for `{files: [...], value: 'off}`.
   */
  linterOptionsReportUnusedInlineConfigs?: ValueOrEslintConfigWithValue<
    EslintSeverityWithTypeAffectingOptions<TypeAffectingOptions>
  >;

  // #endregion

  // #region 🟠 CONFIGS RELATED OPTIONS

  /**
   * User provided flat configs. They still support plugin renaming, but besides that,
   * will be put as-is after all the eslint-config-un's configs,
   * and before the config which disables Prettier incompatible rules for all files.
   */
  extraConfigs?: MaybeStripWarningSeverity<UnFlagConfigEntry<ExtraPlugins>, TypeAffectingOptions>[];

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
   *
   * When `noWarnings` is enabled, `warning` is no longer accepted here.
   */
  forceSeverity?: Exclude<EslintSeverityWithTypeAffectingOptions<TypeAffectingOptions>, 0 | 'off'>;

  /**
   * "Zero warnings tolerance" mode. When enabled:
   * - the `warning` (`1`/`'warn'`) severity becomes unexpressible at the type level across all
   *   severity-typed options (`forceSeverity`, `overrides`/`overridesAny`, `extraConfigs` rules and
   *   the `linterOptions*` options);
   * - every `warning` severity `eslint-config-un` would otherwise set by default is rewritten to
   *   `error` at runtime (including the implicit `linterOptions.reportUnusedDisableDirectives`
   *   default).
   *
   * Note that rules that are turned `off` stay `off` —
   * this only promotes warnings to errors.
   * @default false
   */
  noWarnings?: boolean;

  // #endregion

  // #region 🟠 PLUGINS RELATED OPTIONS

  /**
   * Allows to change a plugin prefix. Keys are the default prefixes, value cannot be empty
   * string (or it will be ignored anyway).
   *
   * You have to still use **OLD** prefixes in `overrides`, and they will be automatically renamed.
   * @example
   * To make all the rules from `eslint-react` plugin have `react-x` prefix:
   * ```ts
   * {'eslint-react': 'react-x'}
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
         * [configuration comments](https://eslint.org/docs/latest/use/configure/rules#use-configuration-comments).
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
   *   'unicorn/prefer-private-class-fields': true,
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
   * Replaces the implementation of certain [`import`](https://npmx.dev/eslint-plugin-import-x)
   * plugin rules with implementations from
   * [`import-integrity-lint`](https://npmx.dev/import-integrity-lint).
   *
   * ⚠️ The latter plugin doesn't support the rule options from the former plugin.
   * It'll be made by us that they will be silently ignored.
   *
   * The replaced rules' list (their name will actually be preserved):
   * - `import/no-cycle`
   * - `import/no-named-as-default`
   * - `import/no-unresolved` (replaced with `import-integrity/no-unresolved-imports`)
   * @default false
   */
  useImportIntegrity?:
    | boolean
    | {
        pluginSettings?: Partial<ImportIntegrityPluginSettings>;
        replaceRules?: Partial<Record<ImportPluginReplaceableRules, boolean>>;
      };

  /**
   * Controls how rules that require type information are handled.
   *
   * `eslint-config-un` knows which rules from all the plugins require type information
   * (most come from `typescript-eslint`, but a good portion come from other plugins,
   * like `eslint-plugin-vitest`). Such rules fall into two groups:
   * - those that **throw** when type information is not available;
   * - those that silently do nothing (or only partially work) without it.
   *
   * To minimize the chance of crashes due to missing type information, by default we move
   * every such rule into a separate ESLint config restricted to TypeScript files, and set up
   * the `typescript-eslint` parser there for typed linting. The generated config inherits all
   * properties from the original one, except:
   * - `files` is set to <code>**&#47;*.?([cm])[jt]s?(x)</code>
   * [intersected](https://eslint.org/docs/latest/use/configure/configuration-files#specify-files-with-an-and-operation)
   * with the original config's `files`;
   * - all `.md(x)` code block patterns are appended to `ignores`;
   * - [`languageOptions.parserOptions.projectService`](https://typescript-eslint.io/packages/parser/#projectservice)
   * is set to `true` (only in `standalone` mode);
   * - any custom file extensions required by the moved rules (like `.svelte`) are added to
   * [`extraFileExtensions`](https://typescript-eslint.io/packages/parser/#extrafileextensions);
   * - `rules` consists solely of the moved entries.
   *
   * The string value (or the `mode` property) chooses the strategy:
   * - `standalone`: the split happens and the `typescript-eslint` parser, including
   * `projectService`, is configured in the generated config. This is the default when the
   * `ts/setupTypeAware` config is **disabled**.
   * - `splitOnly`: the split happens, but no parser is configured — the project service is
   * expected to be set up by the `ts/setupTypeAware` config. This is the default when that
   * config is **enabled**, and is the most commonly used mode.
   * - `asIs`: no split happens; rules are left untouched in their original configs. You are
   * responsible for making type information available to them.
   * - `disabled`: no split happens, and every rule that *throws* without type information is
   * turned off everywhere. Rules that merely degrade without type information are left enabled.
   *
   * ⚠️ The following configs are never split (they manage type-aware linting themselves), so for
   * them every mode except `disabled` behaves like `asIs`:
   * - `ts/type-aware/*`;
   * - `vitest/ts`;
   * - `jest/ts`.
   *
   * The object notation additionally accepts:
   * - `ignores`: glob patterns excluded from type-aware linting. They are appended to the
   * `ignores` of every generated config, as well as of the never-split configs listed above.
   * Useful for TypeScript files that are not part of any `tsconfig.json` (which would otherwise
   * make `projectService` throw).
   * - `allowDefaultProject` / `parserOptions` (mutually exclusive): the default parser options for
   * the type-aware linting `eslint-config-un` sets up — the `standalone` split configs and, as a
   * default, the `ts` type-aware config. `allowDefaultProject` is a shortcut for
   * `parserOptions.projectService.allowDefaultProject` (the most common need, e.g. test files not
   * part of any `tsconfig.json`); `parserOptions` is the full escape hatch. These mirror the
   * same-named `ts` config options, which take precedence over them for the `ts` type-aware config.
   *
   * NOTE: these are accepted regardless of `mode` (they are orthogonal to it), but they only take
   * effect where a type-aware parser is actually set up:
   * - the `standalone` split configs (i.e. only when the resolved `mode` is `standalone`);
   * - the `ts` type-aware config's parser, whenever that config is enabled — independently of `mode`.
   *
   * Consequently, in `asIs`/`disabled` modes they have an effect only if the `ts` type-aware config
   * is enabled (and in `disabled` mode that combination is contradictory, since it both turns off
   * throwing rules and configures type information).
   * @default 'splitOnly' if `ts/setupTypeAware` config is enabled, otherwise 'standalone'
   */
  typeInfoRules?:
    | TypeInfoMode
    | ({mode?: TypeInfoMode; ignores?: string[]} & (
        {allowDefaultProject?: string[]} | {parserOptions?: TsEslintParserOptions}
      ));

  // #endregion

  // #region 🟠 OTHER OPTIONS

  /**
   * `eslint-config-un` checks the presence and versions of certain packages (like `vue`,
   * `typescript` or `prettier`) to decide whether certain configs, sub-configs or rules
   * should be enabled by default.
   *
   * By default, the packages are looked up by their canonical npm names. If you install
   * some of them under a different name using
   * [npm aliases](https://docs.npmjs.com/cli/v11/using-npm/package-spec#aliases),
   * for example `"vue3": "npm:vue@^3.5.0"`, use this option to specify the names to look
   * for instead of the canonical ones.
   *
   * Note that this option is not applicable to ESLint plugins: they are loaded by their
   * canonical names; use `pluginOverrides` to provide a plugin installed under an alias.
   * @example {vue: 'vue3'}
   */
  packageAliases?: Partial<Record<(typeof PACKAGES_TO_GET_INFO_FOR)[number], string>>;

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
   * @default true <=> running in editor (detected by [`is-in-editor`](https://npmx.dev/is-in-editor))
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

  /**
   * Disables console warnings without enabling the rest of {@link testMode}.
   */
  disableWarnings?: boolean;

  /**
   * Forces every config to skip the type-information split (as if it had `skipTypeInfoSplit`),
   * keeping generated configs stable in tests. Does not prevent `disabled` mode from acting.
   */
  skipTypeInfoSplit?: boolean;

  /**
   * Keeps `meta.languages` on the registered plugins' rules, which is otherwise removed
   * (see `removeRuleLanguagesFromPlugin`). Only meant for tooling that needs to read the
   * property, such as the rule categories generation in the typegen script.
   */
  keepRuleMetaLanguages?: boolean;
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
   * Resolved form of the `typeInfoRules` option. `mode` is finalized after the `ts` config is
   * loaded (it may depend on whether the `ts/setupTypeAware` config was created). NOTE: mutable.
   */
  typeInfoRulesResolved: {
    mode: TypeInfoMode;
    ignores?: string[];

    /**
     * Normalized global parser options (the `allowDefaultProject` shortcut is folded into
     * `projectService.allowDefaultProject`). Used for `standalone` split configs and as the
     * default for the `ts` type-aware config.
     */
    parserOptions?: TsEslintParserOptions;
  };

  /**
   * NOTE: mutable. Rule names must be UNprefixed
   */
  disabledAutofixes: Partial<Record<PluginPrefix, string[]>>;

  /**
   * Maps canonical plugin prefix → unprefixed rule name → whether the rule supports autofix.
   * Used to decide whether a disabled rule has a `disable-autofix/...` counterpart to disable
   * too (the counterpart only exists for fixable rules).
   *
   * Loaded from the generated `eslint-types-fixable-only.gen` file via a dynamic import to avoid
   * a static import cycle: that file is produced by the typegen script, which itself loads the
   * core config functionality that consumes this data.
   */
  fixableRulesPerPlugin: Partial<Record<string, Partial<Record<string, boolean>>>>;

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

export const intersectParentConfigFilesWithProvidedFiles = (
  parentConfigFiles: EslintFlatConfigEntry['files'] & {},
  files: string[],
) =>
  parentConfigFiles.flatMap((configFilesEntry) =>
    Array.from(files, (ourFileEntry) =>
      typeof configFilesEntry === 'string'
        ? [configFilesEntry, ourFileEntry]
        : [...configFilesEntry, ourFileEntry],
    ),
  );

export const processUnOrFlatConfig = (
  context: UnConfigContext,
  config: SetRequired<EslintFlatConfigEntry | UnFlagConfigEntry, 'name'>,
  overrides: Record<string, UnFlatConfigEntryOverridesEntry | undefined> | undefined,
  configBuilderToModify?: ConfigEntryBuilder,
) => {
  const extraConfigs: SetRequired<EslintFlatConfigEntry, 'name'>[] = [];
  const removedRules: string[] = [];

  if (config.language) {
    context.usedPlugins.add(
      getRuleNameAndPluginPrefixByFullName(context, config.language).pluginPrefixCanonical,
    );
  }

  const overridesResolved: Record<string, EslintRuleEntry> = Object.fromEntries(
    Object.entries(overrides || {}).flatMap(([ruleNameRaw, ruleOptions]) => {
      if (ruleOptions == null) {
        return [];
      }

      const {
        pluginPrefixCanonical,
        ruleNameUnprefixed: ruleName,
        fullRuleNameWithResolvedPrefix: ruleEntryName,
      } = getRuleNameAndPluginPrefixByFullName(context, ruleNameRaw);

      const existingRuleRecord = (config as EslintFlatConfigEntry).rules?.[ruleEntryName];

      const rawSeverityInitial = Array.isArray(existingRuleRecord)
        ? existingRuleRecord[0]
        : typeof existingRuleRecord === 'string' || typeof existingRuleRecord === 'number'
          ? existingRuleRecord
          : undefined;
      const severityInitial = eslintToUnRuleSeverity(rawSeverityInitial);

      const options = Array.isArray(existingRuleRecord) ? existingRuleRecord.slice(1) : undefined;
      const ruleEntryRaw = maybeCall(ruleOptions, severityInitial, options);
      const isRuleEntryRawObject =
        ruleEntryRaw &&
        typeof ruleEntryRaw === 'object' &&
        'severity' in ruleEntryRaw; /* `!Array.isArray(...)` doesn't work */

      const newRuleEntries: [ruleEntryName: string, ruleEntry: EslintRuleEntry][] = [];

      const ruleEntryPrimary: EslintRuleEntry = isRuleEntryRawObject
        ? ruleEntryRaw.options == null
          ? ruleEntryRaw.severity
          : [ruleEntryRaw.severity, ...ruleEntryRaw.options]
        : (ruleEntryRaw as EslintRuleEntry);
      const ruleSeverity = getRuleSeverityFromEslintRuleEntry(ruleEntryPrimary);

      const disableAutofix = isRuleEntryRawObject ? ruleEntryRaw.disableAutofix : null;

      let configNameToInsertMetadataTo = config.name;
      const insertMetadataFns: (() => void)[] = [];

      // The rule itself is only turned off when its autofix-disabled counterpart takes over
      newRuleEntries.push([ruleEntryName, disableAutofix ? OFF : ruleEntryPrimary]);

      insertMetadataFns.push(() => {
        configBuilderToModify?.setConfigMetadataForRule(configNameToInsertMetadataTo, {
          plugin: pluginPrefixCanonical as PluginPrefix,
          ruleName,
          ruleEntryName,
          severity: disableAutofix ? OFF : ruleSeverity,
          hasEnabledDisableAutofixCounterpart: disableAutofix === true && ruleSeverity !== OFF,
        });
      });

      if (disableAutofix != null) {
        const ruleNameWithDisableAutofixPrefix =
          `${DISABLE_AUTOFIX_WITH_SLASH}${ruleEntryName}` as const;

        newRuleEntries.push([
          ruleNameWithDisableAutofixPrefix,
          disableAutofix ? ruleEntryPrimary : OFF,
        ]);

        insertMetadataFns.push(() => {
          configBuilderToModify?.setConfigMetadataForRule(configNameToInsertMetadataTo, {
            plugin: pluginPrefixCanonical as PluginPrefix,
            ruleName,
            ruleEntryName: ruleNameWithDisableAutofixPrefix,
            severity: disableAutofix ? ruleSeverity : OFF,
          });
        });
      }

      if (ruleSeverity !== OFF && !disableAutofix) {
        context.usedPlugins.add(pluginPrefixCanonical);

        context.disabledAutofixes[pluginPrefixCanonical as PluginPrefix] = [
          ...(context.disabledAutofixes[pluginPrefixCanonical as PluginPrefix] || []),
          ruleName,
        ];
      }

      const shouldCreateDistinctConfigForRule =
        isRuleEntryRawObject &&
        (ruleEntryRaw.files?.length || ruleEntryRaw.ignores?.length) &&
        config.files?.length !== 0;
      if (shouldCreateDistinctConfigForRule) {
        /* v8 ignore next - A config an override is applied to is always named */
        const parentConfigName = config.name || '';

        const extraConfig: SetRequired<EslintFlatConfigEntry, 'name'> = {
          name: `${parentConfigName}/@rule/${ruleEntryName}`,
          ...((ruleEntryRaw.files?.length || config.files?.length) && {
            files:
              ruleEntryRaw.files?.length && config.files?.length
                ? intersectParentConfigFilesWithProvidedFiles(config.files, ruleEntryRaw.files)
                : ruleEntryRaw.files || config.files,
          }),
          ...((ruleEntryRaw.ignores?.length || config.ignores?.length) && {
            ignores: (ruleEntryRaw.ignores?.length ? ruleEntryRaw : config).ignores,
          }),
          rules: Object.fromEntries(newRuleEntries),
        };

        configNameToInsertMetadataTo = extraConfig.name;
        const extraConfigMetadata = configBuilderToModify?.addFlatConfig(extraConfig);
        if (
          extraConfigMetadata &&
          configBuilderToModify?.getConfig(config.name)?.[1].skipTypeInfoSplit
        ) {
          extraConfigMetadata.skipTypeInfoSplit = true;
        }

        extraConfigs.push(extraConfig);
        removedRules.push(...newRuleEntries.map(([ruleNameToRemove]) => ruleNameToRemove));
      }

      insertMetadataFns.forEach((fn) => {
        fn();
      });

      return shouldCreateDistinctConfigForRule ? [] : newRuleEntries;
    }),
  );

  if (configBuilderToModify) {
    Object.assign((config.rules ||= {}), overridesResolved);
    removedRules.forEach((removedRule) => {
      config.rules && Reflect.deleteProperty(config.rules, removedRule);
    });
  }

  return {
    rules: overridesResolved,
    extraConfigs,
    removedRules,
  };
};
