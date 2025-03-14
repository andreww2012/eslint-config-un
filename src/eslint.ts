import type Eslint from 'eslint';
import type {ESLintRules as BuiltinEslintRules} from 'eslint/rules';
import {builtinRules} from 'eslint/use-at-your-own-risk';
// @ts-expect-error no typings
import ruleComposer from 'eslint-rule-composer';
import {klona} from 'klona';
import type {SetRequired} from 'type-fest';
import type {InternalConfigOptions} from './configs';
import {
  ERROR,
  GLOB_HTML,
  GLOB_MARKDOWN,
  GLOB_MARKDOWN_ALL_CODE_BLOCKS,
  type RuleSeverity,
  WARNING,
} from './constants';
import type {RuleOptions} from './eslint-types';
import type {
  ConstantKeys,
  FalsyValue,
  PickKeysNotStartingWith,
  PickKeysStartingWith,
  PrettifyShallow,
  RemovePrefix,
} from './types';

type EslintSeverity = Eslint.Linter.RuleSeverity;

export interface FlatConfigEntryFiles {
  files?: string[];
}

export interface FlatConfigEntryFilesOrIgnores extends FlatConfigEntryFiles {
  ignores?: string[];
}

export type RulesRecord = Eslint.Linter.RulesRecord & RuleOptions;
// What's going on with this type? `FlatConfig` needs to be used to be compatible with eslint v8 types (v8's `Config` type is different from v9's `Config` so we can't just use `Config`). But `FlatConfig` was not made generic in v9 types so we need to add extra property that utilizes the generic parameter.
export type FlatConfigEntry<T extends RulesRecord = RulesRecord> = PrettifyShallow<
  Omit<Eslint.Linter.FlatConfig, 'files'> &
    Pick<Eslint.Linter.Config<T>, 'rules'> &
    FlatConfigEntryFilesOrIgnores
>;

export type DisableAutofixPrefix = 'disable-autofix';

export type AllEslintRulesWithDisableAutofix = ConstantKeys<FlatConfigEntry['rules'] & {}>;
// Need to exclude `disable-autofix` rules to avoid TS issues related to big unions
export type AllEslintRulesWithoutDisableAutofix = PickKeysNotStartingWith<
  AllEslintRulesWithDisableAutofix,
  `${DisableAutofixPrefix}/`
>;

export type BuiltinEslintRulesFixed = Pick<
  AllEslintRulesWithoutDisableAutofix,
  keyof ConstantKeys<BuiltinEslintRules>
>;

export type GetRuleOptions<RuleName extends keyof AllEslintRulesWithoutDisableAutofix> =
  Exclude<AllEslintRulesWithoutDisableAutofix[RuleName], undefined> extends Eslint.Linter.RuleEntry<
    infer Options
  >
    ? Options
    : never;

export type AllRulesWithPrefix<
  Prefix extends string | null,
  IncludeDisableAutofix = false,
> = PickKeysStartingWith<
  Prefix extends ''
    ? BuiltinEslintRulesFixed
    : IncludeDisableAutofix extends true
      ? AllEslintRulesWithDisableAutofix
      : AllEslintRulesWithoutDisableAutofix,
  Prefix extends null | ''
    ? string
    :
        | `${Prefix}/`
        | (IncludeDisableAutofix extends true ? `${DisableAutofixPrefix}/${Prefix}` : never)
>;

export type RuleOverrides<T extends null | string | RulesRecord> = T extends string
  ? AllRulesWithPrefix<T, true>
  : T extends RulesRecord
    ? FlatConfigEntry<T>['rules']
    : never;

export type ConfigSharedOptions<T extends null | string | RulesRecord = RulesRecord> = Partial<
  FlatConfigEntryFilesOrIgnores & {
    overrides?: RuleOverrides<T>;

    /** If severity is forced, `errorsInsteadOfWarnings` option will be completely ignored */
    forceSeverity?: Exclude<EslintSeverity, 0 | 'off'>;
  }
>;

export const genFlatConfigEntryName = (name: string) => `eslint-config-un/${name}`;

// TODO report
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export const createPluginObjectRenamer = <From extends string, To extends string>(
  from: From,
  to: To,
) => {
  const fromRegex = new RegExp(`^${from}/`);

  return <T extends Record<string, unknown>>(object: T | FalsyValue) =>
    Object.fromEntries(
      Object.entries(object || {}).map(([ruleName, v]) => [
        ruleName.replace(fromRegex, `${to}/`),
        v,
      ]),
    ) as {
      [Key in keyof T as Key extends `${From}/${infer Rest}` ? `${To}/${Rest}` : Key]: T[Key];
    };
};

export const bulkChangeRuleSeverity = <T extends Partial<RulesRecord>>(
  rules: T,
  severity: RuleSeverity,
): T =>
  Object.fromEntries(
    Object.entries(rules).map(
      ([ruleName, ruleOptions]): [keyof RulesRecord, RulesRecord[keyof RulesRecord]] => [
        ruleName,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        Array.isArray(ruleOptions) ? [severity, ...ruleOptions.slice(1)] : severity,
      ],
    ),
  ) as T;

export type EslintPlugin = Eslint.ESLint.Plugin;

export const eslintPluginVanillaRules: EslintPlugin = Object.freeze({
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  rules: Object.fromEntries(builtinRules.entries()),
});

export const disableAutofixForAllRulesInPlugin = <Plugin extends EslintPlugin>(
  pluginNamespace: string,
  plugin: Plugin,
): Plugin['rules'] & {} =>
  Object.fromEntries(
    Object.entries(klona(plugin.rules || {})).map(([ruleId, ruleImplementation]) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const ruleWithAutofixDisabled = ruleComposer.mapReports(
        ruleImplementation,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (problem: any) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          delete problem.fix;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return problem;
        },
      ) as typeof ruleImplementation;
      if (ruleWithAutofixDisabled.meta?.fixable) {
        delete ruleWithAutofixDisabled.meta.fixable;
      }
      return [`${pluginNamespace ? `${pluginNamespace}/` : ''}${ruleId}`, ruleWithAutofixDisabled];
    }),
  );

export type FlatConfigEntryForBuilder = Omit<FlatConfigEntry, 'name' | 'rules'>;

export class ConfigEntryBuilder<RulesPrefix extends string | null> {
  constructor(
    private readonly rulesPrefix: RulesPrefix,
    private readonly options: ConfigSharedOptions<
      RulesPrefix extends null ? RulesRecord : RulesPrefix
    >,
    private readonly internalOptions: InternalConfigOptions,
  ) {}

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
    const ignores = [
      ...(internalOptions.doNotIgnoreMarkdown ? [] : [GLOB_MARKDOWN]),
      ...(internalOptions.doNotIgnoreHtml ? [] : [GLOB_HTML]),
      ...(internalOptions.ignoreMarkdownCodeBlocks ? [GLOB_MARKDOWN_ALL_CODE_BLOCKS] : []),
      ...(internalOptions.includeDefaultFilesAndIgnores ? configOptions.ignores || [] : []),
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

    const generateAddRuleFn =
      <AllowAnyRule extends boolean>(allowAnyRule: AllowAnyRule) =>
      <
        // prettier-ignore
        RuleName extends (AllowAnyRule extends true
          ? keyof AllEslintRulesWithoutDisableAutofix
          // I don't know why `& string` is required. TypeScript thinks that `AllRulesWithPrefix` (after I've added `Prefix extends ''` branch to it) may return non-string keys
          : RemovePrefix<keyof AllRulesWithPrefix<RulesPrefix> & string, `${RulesPrefix}/`>),
        Severity extends RuleSeverity,
      >(
        ruleName: RuleName,
        severity: Severity,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore ignores the following error during declaration file build: "error TS2859: Excessive complexity comparing types 'RuleName' and '"curly" | "unicorn/template-indent" | "@eslint-community/eslint-comments/disable-enable-pair" | "@eslint-community/eslint-comments/no-aggregating-enable" | "@eslint-community/eslint-comments/no-duplicate-disable" | ... 1725 more ... | "yoda"'"
        ruleOptions?: GetRuleOptions<
          (AllowAnyRule extends true ? RuleName : `${RulesPrefix}/${RuleName}`) &
            keyof AllEslintRulesWithoutDisableAutofix
        >,
        options?: {
          overrideBaseRule?: boolean | keyof AllEslintRulesWithoutDisableAutofix;
          disableAutofix?: boolean;
        },
      ) => {
        const ruleNameWithPrefix =
          allowAnyRule || !this.rulesPrefix
            ? ruleName
            : (`${this.rulesPrefix}/${ruleName}` as const);
        const errorsInsteadOfWarnings = this.internalOptions.globalOptions?.errorsInsteadOfWarnings;
        const severityFinal: RuleSeverity =
          (configOptions.forceSeverity as RuleSeverity | undefined) ??
          (severity === WARNING &&
          (errorsInsteadOfWarnings === true ||
            (Array.isArray(errorsInsteadOfWarnings) &&
              errorsInsteadOfWarnings.includes(ruleNameWithPrefix)))
            ? ERROR
            : severity);
        const ruleNameFinal =
          `${options?.disableAutofix ? ('disable-autofix/' satisfies `${DisableAutofixPrefix}/`) : ''}${ruleNameWithPrefix}` as const;
        configFinal.rules[ruleNameFinal] = [severityFinal, ...(ruleOptions || [])];
        if (options?.disableAutofix) {
          configFinal.rules[ruleNameWithPrefix] = 0 /* Off */;
        }
        if (options?.overrideBaseRule) {
          const baseRuleName =
            typeof options.overrideBaseRule === 'string'
              ? options.overrideBaseRule
              : ruleNameWithPrefix.split('/').slice(1).join('/');
          if (baseRuleName) {
            configFinal.rules[baseRuleName] = 0 /* Off */;
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return result;
      };

    const result = {
      config: configFinal,
      addRule: generateAddRuleFn(false),
      addAnyRule: generateAddRuleFn(true),
      addOverrides: () => {
        Object.assign(configFinal.rules, this.options.overrides);
        return result;
      },
      addBulkRules: (rules: AllRulesWithPrefix<RulesPrefix> | FalsyValue) => {
        Object.assign(configFinal.rules, rules);
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
