import type {ConsolaInstance} from 'consola';
import type {FlatGitignoreOptions} from 'eslint-config-flat-gitignore';
import type {detect as detectPackageManager} from 'package-manager-detector/detect';
import type {UnConfigOptions, UnConfigs} from '../configs';
import type {FastImportPluginSettings} from '../configs/fast-import';
import type {PACKAGES_TO_GET_INFO_FOR} from '../constants';
import {
  type AllEslintFixableRuleNames,
  ConfigEntryBuilder,
  type EslintPlugin,
  type EslintSeverity,
  type FlatConfigEntry,
  type RulesRecord,
  type UnFlagConfigEntry,
} from '../eslint';
import type {
  LoadablePackagePrefix,
  LoadablePluginPrefix,
  PackageToLoadInfo,
  ParserPrefix,
  PluginPrefix,
  pluginsLoaders,
} from '../loaders';
import type {OmitIndexSignature, OmitStrict, Promisable} from '../types';
import type {MaybeArray, MaybeFn, fetchPackageInfo} from '../utils';
import type {ImportPluginReplaceableRules} from './fast-import';

export type ExtraPluginsType = Record<string, () => Promisable<EslintPlugin>>;

export interface EslintConfigUnOptions<ExtraPlugins extends ExtraPluginsType = never> {
  // 🟠 FREQUENTLY USED OPTIONS

  configs?: {
    [Key in keyof UnConfigs<ExtraPlugins>]?: boolean | UnConfigs<ExtraPlugins>[Key];
  };

  /**
   * **Global** ignore patterns. By default will be merged with our ignore patterns, unless the object notation is used and `override` option is set to `true`
   */
  ignores?:
    | FlatConfigEntry['ignores']
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

  // 🟠 OTHER CONFIGS RELATED OPTIONS

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
   *   * `depend`
   *   * `json`
   *   * `jsonSchemaValidator`
   *   * `nodeDependencies`
   *   * `packageJson`
   *   * `security`
   *   * `toml`
   *   * `yaml`
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

  // 🟠 OTHER PLUGINS OPTIONS

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
    [Plugin in Exclude<PluginPrefix, ''>]?: Plugin extends keyof typeof pluginsLoaders
      ? Awaited<ReturnType<(typeof pluginsLoaders)[Plugin]>>['module'] & {}
      : EslintPlugin;
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

  // 🟠 OTHER OPTIONS

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
   *   'ts/method-signature-style': true,
   *   'ts/no-unnecessary-type-arguments': true,
   *   'unicorn/catch-error-name': true,
   *   'unicorn/consistent-existence-index-check': true,
   *   'unicorn/explicit-length-check': true,
   *   'unicorn/no-useless-undefined': true,
   *   'unicorn/prefer-spread': true,
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
        rules?: Partial<Record<AllEslintFixableRuleNames, boolean>>;
      };

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

  /**
   * Enables `eslint-config-prettier` at the end of the ruleset.
   * @default true <=> `prettier` package is installed
   * @see https://github.com/prettier/eslint-config-prettier
   */
  disablePrettierIncompatibleRules?: boolean;

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
}

export interface EslintConfigUnInternalOptions {
  disableAutofixForAllFixableRulesOnly?: boolean;
  testMode?: boolean;
}

export function createConfigBuilder<
  ExtraPlugins extends ExtraPluginsType,
  P extends PluginPrefix | null,
>(
  this: UnConfigContext<ExtraPlugins>,
  options: NoInfer<
    UnConfigOptions<ExtraPlugins, P extends null ? OmitIndexSignature<RulesRecord> : P> | boolean
  >,
  rulesPrefix: P,
  disabledIfEmptyFiles = true,
) {
  const optionsResolved = typeof options === 'object' ? options : {};
  if (
    !options ||
    (Array.isArray(optionsResolved.files) &&
      optionsResolved.files.length === 0 &&
      disabledIfEmptyFiles)
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
  usedParsers: Map<ParserPrefix, FlatConfigEntry[]>;

  /**
   * NOTE: mutable
   */
  usedPackages: Map<
    LoadablePackagePrefix,
    {config: FlatConfigEntry; path: string; info: PackageToLoadInfo}[]
  >;

  /**
   * NOTE: mutable
   */
  missingPackages: Set<string>;

  meta: {
    usedPackageManager: Awaited<ReturnType<typeof detectPackageManager>>;
  };

  logger: ConsolaInstance;
  debug: debug.Debugger;
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
    | OmitStrict<UnConfigs<ExtraPlugins>[ConfigKey], 'overrides' | 'overridesAny'>
    | undefined,
  extraArgument: ExtraArgument,
) => Promisable<
  | null
  | ({
      configs: (ConfigEntryBuilder<ExtraPlugins> | null)[];
      optionsResolved: Record<string, unknown>;
    } & ExtraReturnedData)
>;
