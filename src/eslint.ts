import type Eslint from 'eslint';
import {builtinRules as eslintBuiltinRules} from 'eslint/use-at-your-own-risk';
// @ts-expect-error no typings
import ruleComposer from 'eslint-rule-composer';
import type {UnConfigContext} from './configs';
import {
  GLOB_CSS,
  GLOB_HTML_ALL,
  GLOB_MARKDOWN,
  GLOB_MARKDOWN_ALL_CODE_BLOCKS,
  GLOB_MDX,
  OFF,
  type RuleSeverity,
} from './constants';
import type {FixableRuleNames as AllEslintFixableRuleNames} from './eslint-types-fixable-only.gen';
import type {RuleOptionsPerPlugin} from './eslint-types-per-plugin.gen';
import type {RuleOptions} from './eslint-types.gen';
import {PLUGIN_PREFIXES_LIST, type ParserPrefix, type PluginPrefix} from './plugins';
import type {
  EmptyObject,
  FalsyValue,
  NonEmptyString,
  OmitIndexSignature,
  PickKeysNotStartingWith,
  PrettifyShallow,
  ReadonlyDeep,
  SetRequired,
  UnionToIntersection,
} from './types';
import {
  type MaybeFn,
  arrayMap,
  cloneDeep,
  findArrayInversions,
  groupBy,
  maybeCall,
  partition,
  styleText,
} from './utils';

export type EslintSeverity = Eslint.Linter.RuleSeverity;
type EslintRuleEntry<Options extends unknown[] = unknown[]> = Eslint.Linter.RuleEntry<Options>;
export type EslintPlugin = Eslint.ESLint.Plugin;

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

export type RulesRecord = Record<string, EslintRuleEntry> & RuleOptions;
export type FlatConfigEntry<T extends RulesRecord = RulesRecord> = PrettifyShallow<
  Eslint.Linter.Config<T>
>;
export type UnFlagConfigEntry<T extends RulesRecord = RulesRecord> = PrettifyShallow<
  Omit<FlatConfigEntry<T>, 'rules'> & {
    rules?: UnConfigOptionsOverrides<T>;
  }
>;

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
> = RuleOptionsPerPlugin[Prefix][RuleName] & unknown[];
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
type UnConfigOptionsOverridesEntry<
  RuleName extends string,
  EslintEntry extends EslintRuleEntry,
  Options,
> = MaybeFn<
  [severity: EslintSeverity & number, options?: ReadonlyDeep<Options>],
  | ReadonlyDeep<EslintEntry>
  | {
      severity: EslintSeverity;
      options?: ReadonlyDeep<Options>;

      /**
       * Disables autofix for this rule only for this config with a caveat
       * that the rule name will be prepended with `disable-autofix/`.
       *
       * If you'd like to disable autofix without changing the rule name,
       * it's only currently possible to do so globally (for all configs at once).
       * For that, please use `autofixDisabledGloballyFor` root option.
       */
      disableAutofix?: RuleName extends AllEslintFixableRuleNames ? boolean : false;
    }
>;
type UnConfigOptionsOverrides<T extends Partial<Record<string, EslintRuleEntry>>> = {
  [RuleName in keyof T]?: UnConfigOptionsOverridesEntry<
    RuleName & string,
    T[RuleName] & {},
    T[RuleName] & {} extends EslintRuleEntry<infer Options> ? ReadonlyDeep<Options> : never
  >;
};
export type UnConfigOptions<
  T extends null | PluginPrefix | RulesRecord = RulesRecord,
  // eslint-disable-next-line ts/no-empty-object-type
  ExtraOptions = {},
> = PrettifyShallow<
  // eslint-disable-next-line ts/no-empty-object-type
  (ExtraOptions extends object ? ExtraOptions : {}) &
    FlatConfigEntryFilesOrIgnores & {
      overrides?: PrettifyShallow<
        UnConfigOptionsOverrides<UnionToIntersection<RulesRecordPartial<T>>>
      >;

      overridesAny?: PrettifyShallow<
        UnConfigOptionsOverrides<UnionToIntersection<RulesRecordPartial>>
      >;

      /**
       * Force non-zero severity of all the rules to be `error` or `warning`.
       * The severity forced here will take precedence over the severity forced on the root level.
       */
      forceSeverity?: Exclude<EslintSeverity, 0 | 'off'>;
    }
>;

export const genFlatConfigEntryName = (name: string) => `eslint-config-un/${name}`;

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
          (!isFixable || (onlyRules && invertOnlyRules === onlyRules.includes(fullRuleName)))
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

export type FlatConfigEntryForBuilder = Omit<FlatConfigEntry, 'name' | 'rules'>;

const STRING_SEVERITY_TO_NUMERIC: Record<EslintSeverity & string, EslintSeverity & number> = {
  off: 0,
  warn: 1,
  error: 2,
};

type AddRuleInternalOptions = EmptyObject;

const getPluginPrefixByFullRuleName = (ruleName: string) => {
  const ruleNameSplitted = ruleName.split('/');
  for (let i = 0; i < ruleNameSplitted.length; i++) {
    const possiblePrefix = ruleNameSplitted.slice(0, ruleNameSplitted.length - i - 1).join('/');
    if (possiblePrefix && PLUGIN_PREFIXES_LIST.includes(possiblePrefix as PluginPrefix)) {
      return possiblePrefix as PluginPrefix;
    }
  }
  return null;
};

export const getRuleNameAndPluginPrefixByFullName = (
  context: UnConfigContext,
  fullRuleName: string,
) => {
  const pluginRenames = context.rootOptions.pluginRenames || {};

  const pluginPrefixCanonical = getPluginPrefixByFullRuleName(fullRuleName);
  const pluginPrefixResolved =
    pluginPrefixCanonical && pluginPrefixCanonical in pluginRenames
      ? pluginRenames[pluginPrefixCanonical] || pluginPrefixCanonical
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
  overrides: UnConfigOptions['overrides'] & {},
  existingRules?: Partial<RulesRecord>,
) => {
  return Object.fromEntries(
    Object.entries(overrides).flatMap(([ruleNameRaw, ruleOptions]) => {
      const {pluginPrefixCanonical, ruleNameUnprefixed, fullRuleNameWithResolvedPrefix} =
        getRuleNameAndPluginPrefixByFullName(context, ruleNameRaw);

      let ruleName = fullRuleNameWithResolvedPrefix;

      const existingRuleRecord = existingRules?.[ruleName];

      const rawSeverityInitial = Array.isArray(existingRuleRecord)
        ? existingRuleRecord[0]
        : existingRuleRecord;
      const severityInitial: EslintSeverity =
        typeof rawSeverityInitial === 'string'
          ? STRING_SEVERITY_TO_NUMERIC[rawSeverityInitial as EslintSeverity & string]
          : (rawSeverityInitial ?? 0);

      const options = Array.isArray(existingRuleRecord) ? existingRuleRecord.slice(1) : undefined;
      // @ts-expect-error "Excessive complexity comparing types"
      const ruleEntryRaw = maybeCall(ruleOptions, severityInitial, options);

      const result: [ruleName: string, EslintRuleEntry][] = [];
      let ruleEntry = ruleEntryRaw as EslintRuleEntry;
      let disableAutofix = false;
      if (ruleEntryRaw && typeof ruleEntryRaw === 'object' && 'severity' in ruleEntryRaw) {
        // eslint-disable-next-line ts/no-unsafe-assignment
        ruleEntry =
          // @ts-expect-error "Expression produces a union type that is too complex to represent"
          ruleEntryRaw.options == null
            ? ruleEntryRaw.severity
            : [ruleEntryRaw.severity, ...ruleEntryRaw.options];
        if (ruleEntryRaw.disableAutofix != null && pluginPrefixCanonical != null) {
          disableAutofix = ruleEntryRaw.disableAutofix;
          const ruleNameWithDisableAutofixPrefix = `${DISABLE_AUTOFIX_WITH_SLASH}${ruleName}`;
          if (disableAutofix) {
            result.push([ruleName, OFF]);
            ruleName = ruleNameWithDisableAutofixPrefix;
          } else {
            result.push([ruleNameWithDisableAutofixPrefix, OFF]);
          }
        }
      }
      result.push([ruleName, ruleEntry]);

      if (
        pluginPrefixCanonical != null &&
        ruleEntry !== 0 &&
        ruleEntry !== 'off' &&
        // eslint-disable-next-line de-morgan/no-negated-conjunction
        !(Array.isArray(ruleEntry) && (ruleEntry[0] === 0 || ruleEntry[0] === 'off'))
      ) {
        context.usedPlugins.add(pluginPrefixCanonical);

        if (disableAutofix) {
          context.disabledAutofixes[pluginPrefixCanonical] = [
            ...(context.disabledAutofixes[pluginPrefixCanonical] || []),
            ruleNameUnprefixed,
          ];
        }
      }
      return result;
    }),
  );
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

// eslint-disable-next-line ts/no-explicit-any
export class ConfigEntryBuilder<DefaultPrefix extends PluginPrefix | null = any> {
  private readonly pluginPrefix: DefaultPrefix;
  private readonly options: UnConfigOptions<
    DefaultPrefix extends null ? RulesRecord : DefaultPrefix
  >;
  private readonly context: UnConfigContext;

  constructor(
    rulesPrefix: DefaultPrefix,
    options: UnConfigOptions<DefaultPrefix extends null ? RulesRecord : DefaultPrefix>,
    context: UnConfigContext,
  ) {
    this.pluginPrefix = rulesPrefix;
    this.options = options;
    this.context = context;
  }

  private readonly configs: FlatConfigEntry[] = [];
  private readonly configsDict = new Map<string, FlatConfigEntry>();

  /**
   * Note: `rules` will **always** be added to the resulting config, meaning that this method
   * is not able to create a ["global ignores" config](https://eslint.org/docs/latest/use/configure/configuration-files#globally-ignoring-files-with-ignores).
   *
   * `rules` and `name` keys cannot be overridden.
   */
  addConfig(
    nameAndMaybeOptions:
      | string
      | [
          name: string,
          options: {
            includeDefaultFilesAndIgnores?: boolean;
            filesFallback?: string[];
            ignoresFallback?: string[];
            mergeUserFilesWithFallback?: boolean;
            mergeUserIgnoresWithFallback?: boolean;

            parser?: ParserPrefix;

            /**
             * Some rules (for example, [`no-irregular-whitespace`](https://eslint.org/docs/latest/rules/no-irregular-whitespace))
             * crash when linting `*.css` files, so they are ignored by default.
             *
             * Set this to `true` if you're actually writing a config for `*.css` files.
             */
            doNotIgnoreCss?: boolean;

            /** Some rules (for example, `regexp/no-legacy-features`) crash when linting `*.md` files (only if `language` option is specified for the markdown config). We cannot ignore such files globally as that is irreversible, so we ignore them in every single config with the option to not ignore. */
            doNotIgnoreMarkdown?: boolean;

            doNotIgnoreMdx?: boolean;

            /**
             * Some rules (for example, [`strict`](https://eslint.org/docs/latest/rules/strict))
             * crash when linting `*.html` files, so they are ignored by default.
             *
             * Set this to `true` if you're actually writing a config for `*.html` files.
             */
            doNotIgnoreHtml?: boolean;

            /** Do not apply this config to "fenced code blocks" inside *.md files */
            ignoreMarkdownCodeBlocks?: boolean;
          },
        ],
    config?: FlatConfigEntryForBuilder,
  ) {
    const [configName, internalOptions = {}] =
      typeof nameAndMaybeOptions === 'string' ? [nameAndMaybeOptions, {}] : nameAndMaybeOptions;
    const {options: configOptions} = this;

    const configNameFinal = genFlatConfigEntryName(configName);

    const userFiles = configOptions.files || [];
    const fallbackFiles = internalOptions.filesFallback || [];
    const files =
      userFiles.length > 0 && internalOptions.includeDefaultFilesAndIgnores
        ? internalOptions.mergeUserFilesWithFallback
          ? [...fallbackFiles, ...userFiles]
          : userFiles
        : fallbackFiles;

    const userIgnores = configOptions.ignores;
    const fallbackIgnores = internalOptions.ignoresFallback || [];
    const ignores = (internalOptions.includeDefaultFilesAndIgnores
      ? internalOptions.mergeUserIgnoresWithFallback &&
        fallbackIgnores.length + (userIgnores?.length || 0) > 0
        ? [...fallbackIgnores, ...(userIgnores || [])]
        : userIgnores
      : null) || [
      ...(internalOptions.doNotIgnoreMarkdown ? [] : [GLOB_MARKDOWN]),
      ...(internalOptions.doNotIgnoreMdx ? [] : [GLOB_MDX]),
      ...(internalOptions.doNotIgnoreHtml ? [] : GLOB_HTML_ALL),
      ...(internalOptions.doNotIgnoreCss ? [] : [GLOB_CSS]),
      ...(internalOptions.ignoreMarkdownCodeBlocks ? [GLOB_MARKDOWN_ALL_CODE_BLOCKS] : []),
      ...(internalOptions.ignoresFallback || []),
    ];

    // We require the presence of `rules`:
    // - to avoid likely adding it anyway later on
    // - to avoid (mostly likely accidental) "global ignores" configs (https://eslint.org/docs/latest/use/configure/configuration-files#globally-ignoring-files-with-ignores)
    const configFinal: SetRequired<FlatConfigEntry, 'rules'> = {
      ...(files.length > 0 && {files}),
      ...(ignores.length > 0 && {ignores}),
      ...config,
      name: configNameFinal,
      rules: {},
    };

    this.configs.push(configFinal);
    this.configsDict.set(configNameFinal, configFinal);

    const {parser} = internalOptions;
    if (parser != null) {
      this.context.usedParsers.set(parser, [
        ...(this.context.usedParsers.get(parser) || []),
        configFinal,
      ]);
    }

    let currentCategory = '';
    const addedRules: Partial<Record<PluginPrefix, Record<string, string /* Category */>>> = {};
    const duplicateRules: Partial<Record<PluginPrefix, Set<string>>> = {};

    const addRule = <P extends PluginPrefix, N extends RuleNamesForPlugin<P>>(
      prefix: P,
      ruleNameUnprefixed: N,
      severity: RuleSeverity | null,
      // eslint-disable-next-line ts/ban-ts-comment
      // @ts-ignore ignores the following error during declaration file build: "error TS2859: Excessive complexity comparing types 'RuleName' and '"curly" | "unicorn/template-indent" | "@eslint-community/eslint-comments/disable-enable-pair" | "@eslint-community/eslint-comments/no-aggregating-enable" | "@eslint-community/eslint-comments/no-duplicate-disable" | ... 1725 more ... | "yoda"'"
      ruleOptions?: GetRuleOptions<P, N>,
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
        ruleOptions?: NoInfer<GetRuleOptions<DefaultPrefix & PluginPrefix, N>>,
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
        ruleOptions?: NoInfer<GetRuleOptions<P, N>>,
        options?: AddRuleInternalOptions,
      ) => {
        return addRule(prefix, ruleName, severity, ruleOptions, options);
      },

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
        Object.assign(
          ourRules,
          resolveOverrides(this.context, this.options.overrides || {}, ourRules),
          resolveOverrides(this.context, this.options.overridesAny || {}, ourRules),
        );
        return result;
      },

      addBulkRules: (rules: AllEslintRules | FalsyValue) => {
        Object.assign(configFinal.rules, resolveOverrides(this.context, rules || {}));
        return result;
      },

      disableBulkRules: (rules: (keyof AllEslintRules | (string & {}))[] | FalsyValue) => {
        Object.assign(
          configFinal.rules,
          resolveOverrides(
            this.context,
            Object.fromEntries(
              (rules || []).flatMap(
                (ruleName) =>
                  [
                    [ruleName, OFF],
                    [`${DISABLE_AUTOFIX}/${ruleName}`, OFF],
                  ] as const,
              ),
            ),
          ),
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
        if (this.context.isTestMode) {
          this.context.tests.push(({plugins}) => {
            const commonErrorMessagePrefix = `[config:${styleText('yellow', configName)}] [plugin:${styleText('blue', pluginPrefixToTest)}]`;

            const plugin = plugins[pluginPrefixToTest];
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

            const errorMessages: ReturnType<(typeof this.context.tests)[number]> & unknown[] = [];

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
                // eslint-disable-next-line de-morgan/no-negated-conjunction
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
                if (rulesToSwapPositionsOf.size > 0) {
                  errorMessages.push(
                    `↔️ Rules out of order${groupName ? ` in group ${styleText('cyan', groupName)}` : ''}:\n${[
                      ...rulesToSwapPositionsOf,
                    ]
                      // Show only the last rule on the right which is the one after which the left rule must be put
                      .map(([a, b]) => `${styleRuleName(a)} <-> ${styleRuleName(b.at(-1) || '')}`)
                      .join('\n')}`,
                  );
                }
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

export const createConfigBuilder = <P extends PluginPrefix | null>(
  context: UnConfigContext,
  options: UnConfigOptions<P extends null ? OmitIndexSignature<RulesRecord> : P> | boolean,
  rulesPrefix: P,
  disabledIfEmptyFiles = true,
) => {
  const optionsResolved = typeof options === 'object' ? options : {};
  if (
    !options ||
    (Array.isArray(optionsResolved.files) &&
      optionsResolved.files.length === 0 &&
      disabledIfEmptyFiles)
  ) {
    return null;
  }
  return new ConfigEntryBuilder(
    rulesPrefix,
    // eslint-disable-next-line ts/no-unnecessary-condition
    options && typeof options === 'object' ? options : {},
    context,
  );
};
