import type {
  ConfigObject as EslintConfigObject,
  Plugin as EslintPlugin,
  Severity as EslintSeverity,
} from '@eslint/core';
import type Eslint from 'eslint';
import {builtinRules as eslintBuiltinRules} from 'eslint/use-at-your-own-risk';
// @ts-expect-error no typings
import ruleComposer from 'eslint-rule-composer';
import type {ExtraPluginsType, UnConfigContext} from './config-un/shared';
import {
  ERROR,
  GLOB_CSS,
  GLOB_HTM_HTML,
  GLOB_MARKDOWN,
  GLOB_MDX,
  GLOB_TOML,
  OFF,
  type RuleSeverity,
  WARNING,
} from './constants';
import type {FixableRuleNames as AllEslintFixableRuleNames} from './eslint-types-fixable-only.gen';
import type {RuleOptionsPerPlugin} from './eslint-types-per-plugin.gen';
import type {RuleOptions} from './eslint-types.gen';
import {
  PLUGIN_PREFIXES_LIST,
  type PackageToLoadInfo,
  type ParserPrefix,
  type PluginPrefix,
  packageToLoadSymbol,
} from './loaders';
import type {
  EmptyObject,
  FalsyValue,
  NonEmptyString,
  NonEmptyTuple,
  Nullable,
  ObjectValues,
  OmitIndexSignature,
  OmitStrict,
  PickKeysNotStartingWith,
  ReadonlyDeep,
  SetRequired,
  UnionToIntersection,
} from './types';
import {
  type MaybeArray,
  type MaybeFn,
  arraify,
  arrayMap,
  cloneDeep,
  createTraverser,
  findArrayInversions,
  groupBy,
  maybeCall,
  objectEntriesUnsafe,
  partition,
  styleConfigName,
  styleText,
} from './utils';

type EslintRuleEntry<Options extends readonly unknown[] = readonly unknown[]> =
  Eslint.Linter.RuleEntry<// @ts-expect-error "The type 'readonly unknown[]' is 'readonly' and cannot be assigned to the mutable type 'any[]'" - this is fine, options are not mutated by ESLint
  Options>;
export type {EslintPlugin, EslintSeverity};

interface FlatConfigEntryFiles {
  /**
   * Pass an empty array to disable the config. Note that if the config has
   * "sub-configs", *most of the time* WON'T disabled unless otherwise stated in the config docs.
   * The good example of the config which doesn't follow this rule is `ts` config,
   * which disables type-aware sub-config too if `files` is empty array and no files
   * are passed explicitly to the sub-config.
   */
  files?: string[];
}

export interface FlatConfigEntryFilesOrIgnores extends FlatConfigEntryFiles {
  ignores?: string[];
}

export type ExtraPluginsRules<ExtraPlugins extends ExtraPluginsType> = ObjectValues<{
  [PluginKey in keyof ExtraPlugins & string]: `${PluginKey}/${keyof (Awaited<
    ExtraPlugins[PluginKey] extends (...args: unknown[]) => EslintPlugin
      ? ReturnType<ExtraPlugins[PluginKey]>
      : ExtraPlugins[PluginKey] & EslintPlugin
  >['rules'] & {}) &
    string}`;
}>;

type RulesRecordForExtraPlugins<ExtraPlugins extends ExtraPluginsType> = Partial<
  Record<ExtraPluginsRules<ExtraPlugins>, EslintRuleEntry>
>;

export type RulesRecord = Record<string, EslintRuleEntry> & RuleOptions;
export type FlatConfigEntry<T extends RulesRecord = RulesRecord> = EslintConfigObject<T>;
export type UnFlagConfigEntry<ExtraPlugins extends ExtraPluginsType = never> = OmitStrict<
  FlatConfigEntry,
  'rules'
> & {
  rules?: UnConfigOptionsOverrides<RuleOptions> & RulesRecordForExtraPlugins<ExtraPlugins>;
};

export const DISABLE_AUTOFIX = 'disable-autofix';
export type DisableAutofixPrefix = typeof DISABLE_AUTOFIX;
const DISABLE_AUTOFIX_WITH_SLASH = `${DISABLE_AUTOFIX}/`;

type AllEslintRules = OmitIndexSignature<FlatConfigEntry['rules'] & {}>;
export type AllEslintRuleNames = keyof AllEslintRules;
export type BuiltinEslintRules = PickKeysNotStartingWith<AllEslintRules, `${string}/`>;
export type {AllEslintFixableRuleNames};

export type {RuleOptionsPerPlugin};

export type RuleNamesForPlugin<P extends PluginPrefix | null> = P extends null
  ? keyof RuleOptionsPerPlugin[keyof RuleOptionsPerPlugin]
  : keyof OmitIndexSignature<RuleOptionsPerPlugin[P & keyof RuleOptionsPerPlugin]>;

export type GetRuleOptions<
  Prefix extends PluginPrefix,
  RuleName extends keyof RuleOptionsPerPlugin[Prefix] = keyof RuleOptionsPerPlugin[Prefix],
  Index extends (keyof RuleOptionsPerPlugin[Prefix][RuleName] & number) | 0 | 'all' = 0,
  _AllOptions = RuleOptionsPerPlugin[Prefix][RuleName],
> = Exclude<
  Index extends 'all'
    ? _AllOptions & unknown[]
    : _AllOptions extends readonly unknown[]
      ? Index extends keyof _AllOptions & number
        ? _AllOptions[Index]
        : never
      : _AllOptions,
  undefined
>;

type PluginAndPrefixToFullRuleName<P extends PluginPrefix, N extends string> = P extends ''
  ? N
  : `${P}/${N}`;

export type RulesRecordPartial<P extends null | PluginPrefix | RulesRecord = PluginPrefix> =
  P extends PluginPrefix
    ? {
        [N in keyof OmitIndexSignature<RuleOptionsPerPlugin[P]> as PluginAndPrefixToFullRuleName<
          P,
          N
        >]?: RuleOptionsPerPlugin[P][N] extends unknown[]
          ? EslintRuleEntry<RuleOptionsPerPlugin[P][N]>
          : never;
      }
    : P extends RulesRecord
      ? OmitIndexSignature<FlatConfigEntry<P>['rules'] & {}>
      : never;

interface DisabledAutofixOption {
  /**
   * Disables autofix for this rule only for this config with a caveat
   * that the rule name will be prepended with `disable-autofix/`.
   *
   * If you'd like to disable autofix without changing the rule name,
   * it's only currently possible to do so globally (for all configs at once).
   * For that, please use `autofixDisabledGloballyFor` root option.
   */
  disableAutofix?: boolean;
}

type UnConfigOptionsOverridesEntry<
  RuleName extends string = string,
  Options extends readonly unknown[] = readonly unknown[],
> = MaybeFn<
  | ReadonlyDeep<EslintRuleEntry<Options>>
  | ({
      severity: EslintSeverity;
      options?: Options;

      files?: string[];
      ignores?: string[];
    } & (RuleName extends AllEslintFixableRuleNames
      ? DisabledAutofixOption
      : string extends RuleName
        ? DisabledAutofixOption
        : unknown)),
  [severity: EslintSeverity & number, options?: Options]
>;
type UnConfigOptionsOverrides<T> = {
  [RuleName in keyof T]?: T[RuleName] & {} extends EslintRuleEntry<infer Options>
    ? UnConfigOptionsOverridesEntry<RuleName & string, ReadonlyDeep<Options>>
    : never;
};

export interface UnConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
  T extends null | PluginPrefix | RulesRecord = RulesRecord,
> extends FlatConfigEntryFilesOrIgnores {
  overrides?: UnConfigOptionsOverrides<UnionToIntersection<RulesRecordPartial<T>>>;

  overridesAny?: UnConfigOptionsOverrides<UnionToIntersection<RulesRecordPartial>> &
    RulesRecordForExtraPlugins<ExtraPlugins>;

  /**
   * Force non-zero severity of all the rules to be `error` or `warning`.
   * The severity forced here will take precedence over the severity forced on the root level.
   */
  forceSeverity?: Exclude<EslintSeverity, 0 | 'off'>;
}

export const genFlatConfigEntryName = (name: string) => `eslint-config-un/${name}`;
export const isUnFlatConfigEntry = (flatConfigEntry: FlatConfigEntry) =>
  (flatConfigEntry.name || '').startsWith('eslint-config-un/');

export const eslintPluginVanillaRules: EslintPlugin = Object.freeze({
  // eslint-disable-next-line ts/no-deprecated
  rules: Object.fromEntries(eslintBuiltinRules.entries()),
});

export const disableAutofixForAllRulesInPlugin = <Plugin extends EslintPlugin>(
  pluginNamespace: string,
  plugin: Plugin,
  {
    includeRulesWithoutAutofix,
    onlyRules,
    invertOnlyRules = false,
  }: {includeRulesWithoutAutofix?: boolean; onlyRules?: string[]; invertOnlyRules?: boolean} = {},
): Plugin['rules'] & {} =>
  Object.fromEntries(
    Object.entries(cloneDeep(plugin.rules || {}))
      .map(([ruleId, ruleImplementation]) => {
        const fullRuleName = `${pluginNamespace ? `${pluginNamespace}/` : ''}${ruleId}`;
        const isFixable = ruleImplementation.meta?.fixable;
        if (
          includeRulesWithoutAutofix &&
          (!isFixable || invertOnlyRules === onlyRules?.includes(fullRuleName))
        ) {
          return [fullRuleName, ruleImplementation] as const;
        }
        if (!isFixable && !includeRulesWithoutAutofix) {
          return null;
        }
        // eslint-disable-next-line ts/no-unsafe-call, ts/no-unsafe-member-access
        const ruleImplementationWithAutofixDisabled = ruleComposer.mapReports(
          ruleImplementation,
          // eslint-disable-next-line ts/no-explicit-any
          (problem: any) => {
            // eslint-disable-next-line ts/no-unsafe-member-access
            delete problem.fix;
            // eslint-disable-next-line ts/no-unsafe-return
            return problem;
          },
        ) as typeof ruleImplementation;
        delete ruleImplementationWithAutofixDisabled.meta?.fixable;
        return [fullRuleName, ruleImplementationWithAutofixDisabled] as const;
      })
      .filter((v) => v != null),
  );

export type FlatConfigEntryForBuilder = OmitStrict<
  FlatConfigEntry,
  'name' | 'rules' | 'language' | 'settings'
>;

const STRING_SEVERITY_TO_NUMERIC: Record<EslintSeverity & string, RuleSeverity> = {
  off: OFF,
  warn: WARNING,
  error: ERROR,
};

export const eslintToUnRuleSeverity = (
  maybeEslintSeverity: EslintSeverity | undefined,
  defaultSeverity: RuleSeverity = OFF,
): RuleSeverity =>
  typeof maybeEslintSeverity === 'string'
    ? STRING_SEVERITY_TO_NUMERIC[maybeEslintSeverity]
    : maybeEslintSeverity == null
      ? defaultSeverity
      : (maybeEslintSeverity as RuleSeverity);

type AddRuleInternalOptions = EmptyObject;

const getPluginPrefixByFullRuleName = <ExtraPlugins extends ExtraPluginsType>(
  context: UnConfigContext<ExtraPlugins>,
  ruleName: string,
): PluginPrefix | keyof ExtraPlugins => {
  const ruleNameSplitted = ruleName.split('/');
  if (ruleNameSplitted.length === 1) {
    return '';
  }
  for (let i = 0; i < ruleNameSplitted.length; i++) {
    const possiblePrefix = ruleNameSplitted.slice(0, ruleNameSplitted.length - i - 1).join('/');
    if (
      possiblePrefix &&
      (PLUGIN_PREFIXES_LIST.includes(possiblePrefix as PluginPrefix) ||
        (context.rootOptions.extraPlugins && possiblePrefix in context.rootOptions.extraPlugins))
    ) {
      return possiblePrefix as PluginPrefix | keyof ExtraPlugins;
    }
  }
  return '';
};

export const getRuleNameAndPluginPrefixByFullName = (
  context: UnConfigContext,
  fullRuleName: string,
) => {
  const pluginRenames = context.rootOptions.pluginRenames || {};

  const pluginPrefixCanonical = getPluginPrefixByFullRuleName(context, fullRuleName);
  const pluginPrefixResolved =
    pluginPrefixCanonical && pluginPrefixCanonical in pluginRenames
      ? pluginRenames[pluginPrefixCanonical as Exclude<PluginPrefix, ''>] || pluginPrefixCanonical
      : pluginPrefixCanonical;
  const ruleNameUnprefixed = pluginPrefixCanonical
    ? fullRuleName.slice(pluginPrefixCanonical.length + 1 /* `/` character */)
    : fullRuleName;
  const fullRuleNameWithResolvedPrefix =
    pluginPrefixCanonical && pluginPrefixResolved
      ? `${pluginPrefixResolved}/${ruleNameUnprefixed}`
      : fullRuleName;

  return {
    pluginPrefixCanonical,
    pluginPrefixResolved,
    ruleNameUnprefixed,
    fullRuleNameWithResolvedPrefix,
  };
};

export const resolveOverrides = (
  context: UnConfigContext,
  config: FlatConfigEntry | UnFlagConfigEntry,
  overrides: Record<string, UnConfigOptionsOverridesEntry | undefined> | undefined,
  existingRules?: Partial<RulesRecord>,
) => {
  const extraConfigs: SetRequired<FlatConfigEntry, 'name'>[] = [];
  const removedRules: string[] = [];

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
          ...(ruleEntryRaw.files && {
            files: config.files ? [config.files.flat(), ruleEntryRaw.files] : ruleEntryRaw.files,
          }),
          ...(ruleEntryRaw.ignores?.length && {
            ignores: [...(config.ignores || []), ...ruleEntryRaw.ignores],
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

export const getRuleUnSeverityAndOptionsFromEntry = <Options extends unknown[]>(
  entry: Eslint.Linter.RuleEntry<Options>,
  severityOrOptionsOverride?: [RuleSeverity?, Options?],
): [severity: RuleSeverity, options: Options | []] => {
  const severityRaw = Array.isArray(entry) ? entry[0] : entry;
  const severity =
    severityOrOptionsOverride?.[0] ??
    ((typeof severityRaw === 'string'
      ? STRING_SEVERITY_TO_NUMERIC[severityRaw]
      : severityRaw) as RuleSeverity);
  return [
    severity,
    severityOrOptionsOverride?.[1] ??
      (Array.isArray(entry) ? structuredClone(entry.slice(1) as Options) : []),
  ];
};

const styleRuleName = (ruleName: string) => styleText('green', ruleName);
const styleRuleNames = (ruleNames: string[]) => ruleNames.map(styleRuleName).join(', ');

export const configIndexProperty = Symbol('ConfigIndex');

const FILE_EXTENSIONS_IMPLICITLY_IGNORED_BY_DEFAULT_IN_UN_CONFIGS_GLOBS = {
  css: [GLOB_CSS],
  md: [GLOB_MARKDOWN],
  mdx: [GLOB_MDX],
  html: [GLOB_HTM_HTML],
  toml: [GLOB_TOML],
} as const satisfies Record<string, [string, ...string[]]>;

// eslint-disable-next-line ts/no-unused-vars -- come up with sth better
const PLUGINS_PROVIDING_LANGUAGES = {
  css: ['css'],
  'markdown-preferences': ['extended-syntax'],
  markdown: ['gfm', 'commonmark'],
  toml: ['toml'],
  yaml: ['yaml'],
} as const satisfies Partial<Record<PluginPrefix, [string, ...string[]]>>;

export class ConfigEntryBuilder<
  ExtraPlugins extends ExtraPluginsType = never,
  // eslint-disable-next-line ts/no-explicit-any
  DefaultPrefix extends PluginPrefix | null = any,
> {
  private readonly pluginPrefix: DefaultPrefix;
  private readonly options: UnConfigOptions<
    ExtraPlugins,
    DefaultPrefix extends null ? RulesRecord : DefaultPrefix
  > & {[configIndexProperty]?: number};
  private readonly context: UnConfigContext;

  constructor(
    rulesPrefix: DefaultPrefix,
    options: UnConfigOptions<
      ExtraPlugins,
      DefaultPrefix extends null ? RulesRecord : DefaultPrefix
    >,
    context: UnConfigContext,
  ) {
    this.pluginPrefix = rulesPrefix;
    this.options = options;
    this.context = context;
  }

  private readonly configs: FlatConfigEntry[] = [];
  private readonly configsDict = new Map<string, FlatConfigEntry>();

  private addFlatConfig(configs: MaybeArray<SetRequired<FlatConfigEntry, 'name'>>) {
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
            filesDefaultMergedWithUserIgnores?: boolean;

            /**
             * Will be merged with internal `ignores`, and,
             * if `ignoresDefaultMergedWithUserIgnores` set to `true`, with the user provided ones.
             */
            ignoresDefault?: string[];
            ignoresDefaultMergedWithUserIgnores?: boolean;

            parser?: ParserPrefix;

            /**
             * Some rules crash when linting certain file types.
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
        ? internalOptions.filesDefaultMergedWithUserIgnores
          ? [...filesDefault, ...filesFromUser]
          : filesFromUser
        : filesDefault;

    const ignoresFromUser = configOptions.ignores;
    const ignoresInternal = objectEntriesUnsafe(
      FILE_EXTENSIONS_IMPLICITLY_IGNORED_BY_DEFAULT_IN_UN_CONFIGS_GLOBS,
    ).flatMap(([fileType, globs]) =>
      internalOptions.ignoresInternal === false ||
      (internalOptions.ignoresInternal !== true &&
        internalOptions.ignoresInternal?.[fileType] === false)
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
    const configFinal: SetRequired<FlatConfigEntry, 'rules' | 'name'> = {
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

    const addRule = <P extends PluginPrefix, N extends RuleNamesForPlugin<P>>(
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

      addRule: <N extends RuleNamesForPlugin<DefaultPrefix>, Severity extends RuleSeverity>(
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
        N extends RuleNamesForPlugin<P>,
        Severity extends RuleSeverity,
      >(
        prefix: P,
        ruleName: N,
        severity: Severity,
        ruleOptions?: NoInfer<GetRuleOptions<P, N, 'all'>>,
        options?: AddRuleInternalOptions,
      ) => addRule(prefix, ruleName, severity, ruleOptions, options),

      disableAnyRule: <P extends PluginPrefix>(prefix: P, ruleName: RuleNamesForPlugin<P>) => {
        const prefixFinal =
          prefix === ''
            ? ''
            : // eslint-disable-next-line ts/no-unnecessary-type-assertion
              this.context.rootOptions.pluginRenames?.[prefix as Exclude<PluginPrefix, ''>] ||
              prefix;
        const ruleNameFinal = prefixFinal ? `${prefixFinal}/${ruleName}` : ruleName;
        Object.assign(configFinal.rules, {
          [ruleNameFinal]: 0,
          [`${DISABLE_AUTOFIX}/${ruleNameFinal}`]: 0,
        });
        return result;
      },

      addOverrides: () => {
        const ourRules = configFinal.rules;

        const overridesResolved = resolveOverrides(
          this.context,
          configFinal,
          this.options.overrides,
          ourRules,
        );
        const overridesAnyResolved = resolveOverrides(
          this.context,
          configFinal,
          this.options.overridesAny,
          ourRules,
        );

        Object.assign(ourRules, overridesResolved.rules, overridesAnyResolved.rules);
        this.addFlatConfig([
          ...overridesResolved.extraConfigs,
          ...overridesAnyResolved.extraConfigs,
        ]);
        [...overridesResolved.removedRules, ...overridesAnyResolved.removedRules].forEach(
          (ruleName) => {
            Reflect.deleteProperty(ourRules, ruleName);
          },
        );

        return result;
      },

      addBulkRules: (rules: AllEslintRules | FalsyValue) => {
        const overridesResolved = resolveOverrides(this.context, configFinal, rules || {});

        Object.assign(configFinal.rules, overridesResolved.rules);
        this.addFlatConfig(overridesResolved.extraConfigs);
        [...overridesResolved.removedRules].forEach((ruleName) => {
          Reflect.deleteProperty(configFinal.rules, ruleName);
        });

        return result;
      },

      disableBulkRules: (rules: (AllEslintRuleNames | (string & {}))[] | FalsyValue) => {
        const overridesResolved = resolveOverrides(
          this.context,
          configFinal,
          Object.fromEntries(
            (rules || []).flatMap(
              (ruleName) =>
                [
                  [ruleName, OFF],
                  [`${DISABLE_AUTOFIX}/${ruleName}`, OFF],
                ] as const,
            ),
          ),
        );

        Object.assign(configFinal.rules, overridesResolved.rules);
        this.addFlatConfig(overridesResolved.extraConfigs);
        [...overridesResolved.removedRules].forEach((ruleName) => {
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
