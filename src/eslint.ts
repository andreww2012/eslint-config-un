import type Eslint from 'eslint';
import type {ESLintRules as BuiltinEslintRulesMaybeAugmented} from 'eslint/rules';
import {builtinRules} from 'eslint/use-at-your-own-risk';
// @ts-expect-error no typings
import ruleComposer from 'eslint-rule-composer';
import type {DisableAutofixMethod, UnConfigContext} from './configs';
import {
  GLOB_CSS,
  GLOB_HTML_ALL,
  GLOB_MARKDOWN,
  GLOB_MARKDOWN_ALL_CODE_BLOCKS,
  OFF,
  type RuleSeverity,
} from './constants';
import type {FixableRuleNames} from './eslint-types-fixable-only.gen';
import type {RuleOptionsPerPlugin} from './eslint-types-per-plugin.gen';
import type {RuleOptions} from './eslint-types.gen';
import {PLUGIN_PREFIXES_LIST, type PluginPrefix} from './plugins';
import type {
  FalsyValue,
  OmitIndexSignature,
  PickKeysNotStartingWith,
  PrettifyShallow,
  ReadonlyDeep,
  SetRequired,
  UnionToIntersection,
} from './types';
import {type MaybeFn, cloneDeep, maybeCall} from './utils';

export type EslintSeverity = Eslint.Linter.RuleSeverity;
export type EslintRuleEntry<Options extends unknown[] = unknown[]> =
  Eslint.Linter.RuleEntry<Options>;
export type EslintPlugin = Eslint.ESLint.Plugin;

export interface FlatConfigEntryFiles {
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

export type AllRulesRecordKeys = keyof RuleOptions;
export type RulesRecord = Record<string, EslintRuleEntry> & RuleOptions;
export type FlatConfigEntry<T extends RulesRecord = RulesRecord> = PrettifyShallow<
  Eslint.Linter.Config<T>
>;
export type UnFlagConfigEntry<T extends RulesRecord = RulesRecord> = PrettifyShallow<
  Omit<FlatConfigEntry<T>, 'rules'> & {
    rules?: UnConfigOptionsOverrides<T>;
  }
>;

export type DisableAutofixPrefix = 'disable-autofix';
export const DISABLE_AUTOFIX = 'disable-autofix' satisfies DisableAutofixPrefix;
const DISABLE_AUTOFIX_WITH_SLASH = `${DISABLE_AUTOFIX}/`;

export type AllEslintRules = OmitIndexSignature<FlatConfigEntry['rules'] & {}>;
export type BuiltinEslintRulesFixed = OmitIndexSignature<
  Pick<
    AllEslintRules,
    // Some plugins, like `eslint-plugin-svelte` may augment `Eslint.Linter.RulesRecord` type with custom rules, which we must exclude for this type
    keyof PickKeysNotStartingWith<
      OmitIndexSignature<BuiltinEslintRulesMaybeAugmented>,
      `${string}/`
    >
  >
>;

export type RuleNamesForPlugin<P extends PluginPrefix | null> = P extends null
  ? keyof RuleOptionsPerPlugin[keyof RuleOptionsPerPlugin]
  : keyof OmitIndexSignature<RuleOptionsPerPlugin[P & keyof RuleOptionsPerPlugin]>;
export type GetRuleOptions<
  Prefix extends PluginPrefix,
  RuleName extends keyof RuleOptionsPerPlugin[Prefix],
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
      ? FlatConfigEntry<P>['rules'] & {}
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
       * This option has a caveat: it's not possible to disable autofix only on subset
       * of files *without* the `disable-autofix` prefix in the rule name.
       *
       * If you set this to `true`, the autofix method is going to be the one resulting from
       * `disableAutofixMethod` root option, and if it is `unprefixed` (create a copy of
       * the plugin and disable autofix for the specified rules), autofix for this rule
       * will be disabled for **all** files.
       */
      disableAutofix?: RuleName extends FixableRuleNames ? boolean | DisableAutofixMethod : false;
    }
>;
export type UnConfigOptionsOverrides<T extends Partial<Record<string, EslintRuleEntry>>> = {
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
      overrides?: OmitIndexSignature<
        PrettifyShallow<UnConfigOptionsOverrides<UnionToIntersection<RulesRecordPartial<T>>>>
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
  rules: Object.fromEntries(builtinRules.entries()),
});

export const disableAutofixForAllRulesInPlugin = <Plugin extends EslintPlugin>(
  pluginNamespace: string,
  plugin: Plugin,
  {
    includeRulesWithoutAutofix,
    onlyRules,
  }: {includeRulesWithoutAutofix?: boolean; onlyRules?: string[]} = {},
): Plugin['rules'] & {} =>
  Object.fromEntries(
    Object.entries(cloneDeep(plugin.rules || {}))
      .map(([ruleId, ruleImplementation]) => {
        const fullRuleName = `${pluginNamespace ? `${pluginNamespace}/` : ''}${ruleId}`;
        const isFixable = ruleImplementation.meta?.fixable;
        if (
          includeRulesWithoutAutofix &&
          (!isFixable || (onlyRules && !onlyRules.includes(fullRuleName)))
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

interface AddRuleInternalOptions {
  disableAutofix?: boolean | DisableAutofixMethod;
}

const getPluginPrefixByFullRuleName = (ruleName: string) => {
  const ruleNameSplitted = ruleName.split('/');
  for (let i = 0; i < ruleNameSplitted.length; i++) {
    const possiblePrefix = ruleNameSplitted.slice(0, ruleNameSplitted.length - i - 1).join('/');
    if (PLUGIN_PREFIXES_LIST.includes(possiblePrefix as PluginPrefix)) {
      return possiblePrefix as PluginPrefix;
    }
  }
  return null;
};

export const resolveOverrides = (
  context: UnConfigContext,
  overrides: UnConfigOptions['overrides'] & {},
  existingRules?: Partial<RulesRecord>,
) => {
  const pluginRenames = context.rootOptions.pluginRenames || {};

  return Object.fromEntries(
    Object.entries(overrides).flatMap(([ruleNameRaw, ruleOptions]) => {
      const pluginPrefix = getPluginPrefixByFullRuleName(ruleNameRaw);
      const pluginPrefixFinal =
        pluginPrefix && pluginPrefix in pluginRenames
          ? pluginRenames[pluginPrefix] || pluginPrefix
          : pluginPrefix;
      const ruleNameUnprefixed = pluginPrefix
        ? ruleNameRaw.slice(pluginPrefix.length + 1 /* "/" character */)
        : ruleNameRaw;
      let ruleName =
        pluginPrefix && pluginPrefixFinal
          ? `${pluginPrefixFinal}/${ruleNameUnprefixed}`
          : ruleNameRaw;

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

      const result: [string, EslintRuleEntry][] = [];
      let ruleEntry: EslintRuleEntry;
      let disableAutofix: boolean | DisableAutofixMethod = false;
      if (ruleEntryRaw && typeof ruleEntryRaw === 'object' && 'severity' in ruleEntryRaw) {
        // eslint-disable-next-line ts/no-unsafe-assignment
        ruleEntry =
          // @ts-expect-error "Expression produces a union type that is too complex to represent"
          ruleEntryRaw.options == null
            ? ruleEntryRaw.severity
            : [ruleEntryRaw.severity, ...ruleEntryRaw.options];
        if (ruleEntryRaw.disableAutofix && pluginPrefix != null) {
          const disableAutofixMethod: DisableAutofixMethod =
            typeof ruleEntryRaw.disableAutofix === 'string'
              ? ruleEntryRaw.disableAutofix
              : (context.rootOptions.disableAutofixMethod[pluginPrefix] ??
                context.rootOptions.disableAutofixMethod.default);
          if (disableAutofixMethod === 'prefixed') {
            result.push([ruleName, OFF]);
            ruleName = `${DISABLE_AUTOFIX_WITH_SLASH}${ruleName}`;
          }
          disableAutofix = ruleEntryRaw.disableAutofix;
        }
      } else {
        ruleEntry = ruleEntryRaw as EslintRuleEntry;
      }
      result.push([ruleName, ruleEntry]);

      if (
        pluginPrefix != null &&
        ruleEntry !== 0 &&
        ruleEntry !== 'off' &&
        // eslint-disable-next-line de-morgan/no-negated-conjunction
        !(Array.isArray(ruleEntry) && (ruleEntry[0] === 0 || ruleEntry[0] === 'off'))
      ) {
        context.usedPlugins.add(pluginPrefix);

        if (disableAutofix) {
          context.disabledAutofixes[pluginPrefix] = [
            ...(context.disabledAutofixes[pluginPrefix] || []),
            disableAutofix === true
              ? ruleNameUnprefixed
              : {ruleName: ruleNameUnprefixed, method: disableAutofix},
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
    severityOrOptionsOverride?.[1] ?? (Array.isArray(entry) ? (entry.slice(1) as Options) : []),
  ];
};

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

            /** Some rules (for example, `regexp/no-legacy-features`) crash when linting `*.md` files (only if `language` option is specified for the markdown config). We cannot ignore such files globally as that is irreversible, so we ignore them in every single config with the option to not ignore. */
            doNotIgnoreMarkdown?: boolean;

            /**
             * Some rules (for example, [`strict`](https://eslint.org/docs/latest/rules/strict))
             * crash when linting `*.html` files, so they are ignored by default.
             *
             * Set this to `true` if you're actually writing a config for `*.html` files.
             */
            doNotIgnoreHtml?: boolean;

            /**
             * Some rules (for example, [`no-irregular-whitespace`](https://eslint.org/docs/latest/rules/no-irregular-whitespace))
             * crash when linting `*.css` files, so they are ignored by default.
             *
             * Set this to `true` if you're actually writing a config for `*.css` files.
             */
            doNotIgnoreCss?: boolean;

            /** Do not apply this config to "fenced code blocks" inside *.md files */
            ignoreMarkdownCodeBlocks?: boolean;
          },
        ],
    config?: FlatConfigEntryForBuilder,
  ) {
    const [name, internalOptions = {}] =
      typeof nameAndMaybeOptions === 'string' ? [nameAndMaybeOptions, {}] : nameAndMaybeOptions;
    const {options: configOptions} = this;

    const configName = genFlatConfigEntryName(name);

    const userFiles = configOptions.files || [];
    const fallbackFiles = internalOptions.filesFallback || [];
    const files =
      userFiles.length > 0 && internalOptions.includeDefaultFilesAndIgnores
        ? internalOptions.mergeUserFilesWithFallback
          ? [...fallbackFiles, ...userFiles]
          : userFiles
        : fallbackFiles;

    const userIgnores = configOptions.ignores || [];
    const fallbackIgnores = internalOptions.ignoresFallback || [];
    const ignores = [
      ...(internalOptions.doNotIgnoreMarkdown ? [] : [GLOB_MARKDOWN]),
      ...(internalOptions.doNotIgnoreHtml ? [] : GLOB_HTML_ALL),
      ...(internalOptions.doNotIgnoreCss ? [] : [GLOB_CSS]),
      ...(internalOptions.ignoreMarkdownCodeBlocks ? [GLOB_MARKDOWN_ALL_CODE_BLOCKS] : []),
      ...(userIgnores.length > 0 && internalOptions.includeDefaultFilesAndIgnores
        ? userIgnores
        : fallbackIgnores),
    ];

    // We require the presence of `rules`:
    // - to avoid likely adding it anyway later on
    // - to avoid (mostly likely accidental) "global ignores" configs (https://eslint.org/docs/latest/use/configure/configuration-files#globally-ignoring-files-with-ignores)
    const configFinal: SetRequired<FlatConfigEntry, 'rules'> = {
      ...(files.length > 0 && {files}),
      ...(ignores.length > 0 && {ignores}),
      ...config,
      name: configName,
      rules: {},
    };

    this.configs.push(configFinal);
    this.configsDict.set(configName, configFinal);

    const addRule = <P extends PluginPrefix, N extends RuleNamesForPlugin<P>>(
      prefix: P,
      ruleNameUnprefixed: N,
      severity: RuleSeverity | null,
      // eslint-disable-next-line ts/ban-ts-comment
      // @ts-ignore ignores the following error during declaration file build: "error TS2859: Excessive complexity comparing types 'RuleName' and '"curly" | "unicorn/template-indent" | "@eslint-community/eslint-comments/disable-enable-pair" | "@eslint-community/eslint-comments/no-aggregating-enable" | "@eslint-community/eslint-comments/no-duplicate-disable" | ... 1725 more ... | "yoda"'"
      ruleOptions?: GetRuleOptions<P, N>,
      options?: AddRuleInternalOptions,
    ) => {
      if (severity == null) {
        // eslint-disable-next-line ts/no-use-before-define
        return result;
      }

      const severityFinal: RuleSeverity =
        (configOptions.forceSeverity as RuleSeverity | undefined) ??
        (this.context.rootOptions.forceSeverity as RuleSeverity | undefined) ??
        severity;

      // eslint-disable-next-line ts/no-unnecessary-type-assertion
      const ruleNameWithResolvedPrefix = `${prefix === '' ? '' : `${(prefix === '' ? '' : this.context.rootOptions.pluginRenames?.[prefix as Exclude<PluginPrefix, ''>] || null) || prefix}/`}${ruleNameUnprefixed}`;
      let ruleNameFinal = ruleNameWithResolvedPrefix;
      if (options?.disableAutofix) {
        const disableAutofixMethod: DisableAutofixMethod =
          typeof options.disableAutofix === 'string'
            ? options.disableAutofix
            : (this.context.rootOptions.disableAutofixMethod[prefix] ??
              this.context.rootOptions.disableAutofixMethod.default);
        if (disableAutofixMethod === 'prefixed') {
          configFinal.rules[ruleNameFinal] = OFF;
          ruleNameFinal = `${DISABLE_AUTOFIX_WITH_SLASH}${ruleNameFinal}`;
        }
        if (severityFinal !== OFF) {
          this.context.disabledAutofixes[prefix] = [
            ...(this.context.disabledAutofixes[prefix] || []),
            typeof options.disableAutofix === 'string'
              ? {
                  ruleName: ruleNameUnprefixed,
                  method: options.disableAutofix,
                }
              : ruleNameUnprefixed,
          ];
        }
      }
      configFinal.rules[ruleNameFinal] = [severityFinal, ...(ruleOptions || [])];
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
