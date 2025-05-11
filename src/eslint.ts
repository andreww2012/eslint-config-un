import type Eslint from 'eslint';
import type {ESLintRules as BuiltinEslintRulesMaybeAugmented} from 'eslint/rules';
import {builtinRules} from 'eslint/use-at-your-own-risk';
// @ts-expect-error no typings
import ruleComposer from 'eslint-rule-composer';
import type {UnConfigContext} from './configs';
import {
  ERROR,
  GLOB_CSS,
  GLOB_HTML,
  GLOB_MARKDOWN,
  GLOB_MARKDOWN_ALL_CODE_BLOCKS,
  OFF,
  type RuleSeverity,
  WARNING,
} from './constants';
import type {RuleOptions} from './eslint-types';
import type {LoadablePluginPrefix} from './plugins';
import type {
  FalsyValue,
  OmitIndexSignature,
  PickKeysNotStartingWith,
  PickKeysStartingWith,
  PrettifyShallow,
  ReadonlyDeep,
  RemovePrefix,
  SetRequired,
} from './types';
import {type MaybeFn, cloneDeep, maybeCall, objectEntriesUnsafe} from './utils';

type EslintSeverity = Eslint.Linter.RuleSeverity;

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

export type RulesRecord = Record<string, Eslint.Linter.RuleEntry> & RuleOptions;
export type FlatConfigEntry<T extends RulesRecord = RulesRecord> = PrettifyShallow<
  Eslint.Linter.Config<T>
>;

export type DisableAutofixPrefix = 'disable-autofix';
export const DISABLE_AUTOFIX = 'disable-autofix' satisfies DisableAutofixPrefix;
export const DISABLE_AUTOFIX_WITH_SLASH = `${DISABLE_AUTOFIX}/`;

export type AllEslintRulesWithDisableAutofix = OmitIndexSignature<FlatConfigEntry['rules'] & {}>;
// Need to exclude `disable-autofix` rules to avoid TS issues related to big unions
export type AllEslintRulesWithoutDisableAutofix = PickKeysNotStartingWith<
  AllEslintRulesWithDisableAutofix,
  `${DisableAutofixPrefix}/`
>;

export type BuiltinEslintRulesFixed = Pick<
  AllEslintRulesWithoutDisableAutofix,
  // Some plugins, like `eslint-plugin-svelte` may augment `Eslint.Linter.RulesRecord` type with custom rules, which we must exclude for this type
  keyof PickKeysNotStartingWith<OmitIndexSignature<BuiltinEslintRulesMaybeAugmented>, `${string}/`>
>;

export type GetRuleOptions<RuleName extends keyof AllEslintRulesWithoutDisableAutofix> =
  AllEslintRulesWithoutDisableAutofix[RuleName] & {} extends Eslint.Linter.RuleEntry<infer Options>
    ? Options
    : never;

export type AllRulesWithPrefix<
  Prefix extends string | null,
  IncludeDisableAutofix = false,
  AutoIncludeSlashAfterPrefix = true,
> = PickKeysStartingWith<
  Prefix extends ''
    ? BuiltinEslintRulesFixed
    : IncludeDisableAutofix extends true
      ? AllEslintRulesWithDisableAutofix
      : AllEslintRulesWithoutDisableAutofix,
  Prefix extends null | ''
    ? string
    : `${IncludeDisableAutofix extends true ? `${DisableAutofixPrefix}/` | '' : ''}${Prefix}${AutoIncludeSlashAfterPrefix extends true ? '/' : ''}`
>;

export type AllRulesWithPrefixNames<
  Prefix extends string | null,
  IncludeDisableAutofix = false,
> = keyof AllRulesWithPrefix<Prefix, IncludeDisableAutofix>;

export type AllRulesWithPrefixUnprefixedNames<
  Prefix extends string | null,
  IncludeDisableAutofix = false,
  // I don't know why `& string` is required. TypeScript thinks that `AllRulesWithPrefix` (after I've added `Prefix extends ''` branch to it) may return non-string keys
> = RemovePrefix<AllRulesWithPrefixNames<Prefix, IncludeDisableAutofix> & string, `${Prefix}/`>;

export type RuleOverrides<T extends null | string | RulesRecord> = T extends string
  ? AllRulesWithPrefix<T, true>
  : T extends RulesRecord
    ? FlatConfigEntry<T>['rules']
    : never;

type OverridesWithMaybeFunction<T extends object> = {
  [K in keyof T]: T[K] & {} extends Eslint.Linter.RuleEntry<infer Options>
    ? MaybeFn<
        ReadonlyDeep<T[K] & {}>,
        [severity: EslintSeverity & number, options?: ReadonlyDeep<Options>]
      >
    : never;
};
export type ConfigSharedOptions<T extends null | string | RulesRecord = RulesRecord> = Partial<
  FlatConfigEntryFilesOrIgnores & {
    overrides?: OverridesWithMaybeFunction<OmitIndexSignature<RuleOverrides<T>>>;

    /** If severity is forced, `errorsInsteadOfWarnings` option will be completely ignored */
    forceSeverity?: Exclude<EslintSeverity, 0 | 'off'>;
  }
>;

export const genFlatConfigEntryName = (name: string) => `eslint-config-un/${name}`;

export type EslintPlugin = Eslint.ESLint.Plugin;

export const eslintPluginVanillaRules: EslintPlugin = Object.freeze({
  // eslint-disable-next-line ts/no-deprecated
  rules: Object.fromEntries(builtinRules.entries()),
});

export const disableAutofixForAllRulesInPlugin = <Plugin extends EslintPlugin>(
  pluginNamespace: string,
  plugin: Plugin,
): Plugin['rules'] & {} =>
  Object.fromEntries(
    Object.entries(cloneDeep(plugin.rules || {}))
      .map(([ruleId, ruleImplementation]) => {
        if (!ruleImplementation.meta?.fixable) {
          return null;
        }
        // eslint-disable-next-line ts/no-unsafe-call, ts/no-unsafe-member-access
        const ruleWithAutofixDisabled = ruleComposer.mapReports(
          ruleImplementation,
          // eslint-disable-next-line ts/no-explicit-any
          (problem: any) => {
            // eslint-disable-next-line ts/no-unsafe-member-access
            delete problem.fix;
            // eslint-disable-next-line ts/no-unsafe-return
            return problem;
          },
        ) as typeof ruleImplementation;
        delete ruleWithAutofixDisabled.meta?.fixable;
        return [
          `${pluginNamespace ? `${pluginNamespace}/` : ''}${ruleId}`,
          ruleWithAutofixDisabled,
        ] as const;
      })
      .filter((v) => v != null),
  );

export type FlatConfigEntryForBuilder = Omit<FlatConfigEntry, 'name' | 'rules'>;

const STRING_SEVERITY_TO_NUMERIC: Record<EslintSeverity & string, EslintSeverity & number> = {
  off: 0,
  warn: 1,
  error: 2,
};

interface AddRuleOptions {
  overrideBaseRule?: boolean | keyof AllEslintRulesWithoutDisableAutofix;
  disableAutofix?: boolean;
}

export const resolveOverrides = (
  context: UnConfigContext,
  overrides: OverridesWithMaybeFunction<object>,
  existingRules?: Partial<RulesRecord>,
) =>
  Object.fromEntries(
    objectEntriesUnsafe(overrides).map(
      ([ruleNameRaw, ruleOptions]: [string, Eslint.Linter.RuleEntry]) => {
        const pluginRenames = Object.entries(context.rootOptions.pluginRenames || {});
        let ruleName = ruleNameRaw;
        for (const [from, to] of pluginRenames) {
          const isStartsWithFrom = ruleNameRaw.startsWith(`${from}/`);
          if (isStartsWithFrom) {
            ruleName = `${to}/${ruleNameRaw.slice(from.length + 1)}`;
            break;
          }
          const isStartsWithFromAndDisableAutofix = ruleNameRaw.startsWith(
            `${DISABLE_AUTOFIX}/${from}/`,
          );
          if (isStartsWithFromAndDisableAutofix) {
            ruleName = `${DISABLE_AUTOFIX}/${to}/${ruleNameRaw.slice(DISABLE_AUTOFIX.length + 1 + from.length + 1)}`;
            break;
          }
        }

        const existingRuleRecord = existingRules?.[ruleName];

        const rawSeverity = Array.isArray(existingRuleRecord)
          ? existingRuleRecord[0]
          : existingRuleRecord;
        const severity =
          typeof rawSeverity === 'string'
            ? STRING_SEVERITY_TO_NUMERIC[rawSeverity as EslintSeverity & string]
            : rawSeverity;

        const options = Array.isArray(existingRuleRecord) ? existingRuleRecord.slice(1) : undefined;
        return [ruleName, maybeCall(ruleOptions, severity, options)];
      },
    ),
  );

// eslint-disable-next-line ts/no-explicit-any
export class ConfigEntryBuilder<PluginPrefix extends LoadablePluginPrefix | null = any> {
  private readonly rulesPrefix: PluginPrefix;
  private readonly options: ConfigSharedOptions<
    PluginPrefix extends null ? RulesRecord : PluginPrefix
  >;
  private readonly context: UnConfigContext;

  constructor(
    rulesPrefix: PluginPrefix,
    options: ConfigSharedOptions<PluginPrefix extends null ? RulesRecord : PluginPrefix>,
    context: UnConfigContext,
  ) {
    this.rulesPrefix = rulesPrefix
      ? (context.rootOptions.pluginRenames?.[rulesPrefix] as PluginPrefix) || rulesPrefix
      : rulesPrefix;
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
      ...(internalOptions.doNotIgnoreHtml ? [] : [GLOB_HTML]),
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

    const addRule = <RuleName extends keyof AllEslintRulesWithoutDisableAutofix>(
      ruleName: RuleName,
      severity: RuleSeverity | null,
      // eslint-disable-next-line ts/ban-ts-comment
      // @ts-ignore ignores the following error during declaration file build: "error TS2859: Excessive complexity comparing types 'RuleName' and '"curly" | "unicorn/template-indent" | "@eslint-community/eslint-comments/disable-enable-pair" | "@eslint-community/eslint-comments/no-aggregating-enable" | "@eslint-community/eslint-comments/no-duplicate-disable" | ... 1725 more ... | "yoda"'"
      ruleOptions?: GetRuleOptions<RuleName & keyof AllEslintRulesWithoutDisableAutofix>,
      options?: AddRuleOptions,
    ) => {
      if (severity == null) {
        // eslint-disable-next-line ts/no-use-before-define
        return result;
      }

      const {errorsInsteadOfWarnings} = this.context.rootOptions;

      const severityFinal: RuleSeverity =
        (configOptions.forceSeverity as RuleSeverity | undefined) ??
        (severity === WARNING &&
        (errorsInsteadOfWarnings === true ||
          (Array.isArray(errorsInsteadOfWarnings) && errorsInsteadOfWarnings.includes(ruleName)))
          ? ERROR
          : severity);

      const ruleNameFinal =
        `${options?.disableAutofix ? DISABLE_AUTOFIX_WITH_SLASH : ''}${ruleName}` as const;
      configFinal.rules[ruleNameFinal] = [severityFinal, ...(ruleOptions || [])];
      // If the rule is disabled, disable its autofix counterpart rule as well
      if (severityFinal === OFF && !ruleNameFinal.startsWith(DISABLE_AUTOFIX_WITH_SLASH)) {
        configFinal.rules[`${DISABLE_AUTOFIX_WITH_SLASH}${ruleNameFinal}`] = OFF;
      }

      if (options?.disableAutofix) {
        // @ts-expect-error "Expression produces a union type that is too complex to represent.ts(2590)"
        configFinal.rules[ruleName] = 0 /* Off */;
      }

      if (options?.overrideBaseRule) {
        const baseRuleName =
          typeof options.overrideBaseRule === 'string'
            ? options.overrideBaseRule
            : ruleName.split('/').slice(1).join('/');
        if (baseRuleName) {
          configFinal.rules[baseRuleName] = 0 /* Off */;
        }
      }
      // eslint-disable-next-line ts/no-use-before-define
      return result;
    };

    const result = {
      config: configFinal,

      addRule: <
        N extends AllRulesWithPrefixUnprefixedNames<PluginPrefix>,
        Severity extends RuleSeverity,
      >(
        ruleName: N,
        severity: Severity | null,
        ruleOptions?: NoInfer<
          GetRuleOptions<
            (PluginPrefix extends '' ? N : `${PluginPrefix}/${N}`) &
              keyof AllEslintRulesWithoutDisableAutofix
          >
        >,
        options?: AddRuleOptions,
      ) =>
        // @ts-expect-error "Expression produces a union type that is too complex to represent"
        addRule(
          (this.rulesPrefix
            ? `${this.rulesPrefix}/${ruleName}`
            : ruleName) as keyof AllEslintRulesWithoutDisableAutofix,
          severity,
          ruleOptions,
          options,
        ),

      addAnyRule: <
        P extends LoadablePluginPrefix,
        N extends AllRulesWithPrefixUnprefixedNames<P>,
        Severity extends RuleSeverity,
      >(
        prefix: P,
        ruleName: N,
        severity: Severity,
        ruleOptions?: NoInfer<
          GetRuleOptions<
            (P extends '' ? N : `${P}/${N}`) & keyof AllEslintRulesWithoutDisableAutofix
          >
        >,
        options?: AddRuleOptions,
      ) => {
        const prefixFinal = (this.context.rootOptions.pluginRenames?.[prefix] || prefix) as P;
        return addRule(
          (prefixFinal
            ? `${prefixFinal}/${ruleName}`
            : ruleName) as keyof AllEslintRulesWithoutDisableAutofix,
          severity,
          ruleOptions,
          options,
        );
      },

      disableAnyRule: <P extends LoadablePluginPrefix>(
        prefix: P,
        ruleName: AllRulesWithPrefixUnprefixedNames<P>,
      ) => {
        const prefixFinal = this.context.rootOptions.pluginRenames?.[prefix] || prefix;
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

      addBulkRules: (rules: AllRulesWithPrefix<null> | FalsyValue) => {
        Object.assign(configFinal.rules, resolveOverrides(this.context, rules || {}));
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

export const createConfigBuilder = <PluginPrefix extends LoadablePluginPrefix | null>(
  context: UnConfigContext,
  options: ConfigSharedOptions<PluginPrefix extends null ? RulesRecord : PluginPrefix> | boolean,
  rulesPrefix: PluginPrefix,
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
