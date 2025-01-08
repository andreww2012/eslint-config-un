import type Eslint from 'eslint';
import type {InternalConfigOptions} from './configs';
import {
  ERROR,
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

// Need to exclude `disable-autofix` rules to avoid TS issues related to big unions
export type AllEslintRules = PickKeysNotStartingWith<
  ConstantKeys<FlatConfigEntry['rules'] & {}>,
  'disable-autofix/'
>;

export type GetRuleOptions<RuleName extends keyof AllEslintRules> =
  AllEslintRules[RuleName] & {} extends Eslint.Linter.RuleEntry<infer Options> ? Options : never;

export type AllRulesWithPrefix<T extends string> = PickKeysStartingWith<AllEslintRules, T>;

export type RuleOverrides<T extends string | RulesRecord> = T extends string
  ? AllRulesWithPrefix<T>
  : T extends RulesRecord
    ? FlatConfigEntry<T>['rules']
    : never;

export type ConfigSharedOptions<T extends string | RulesRecord = RulesRecord> = Partial<
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

export type FlatConfigEntryForBuilder = Omit<FlatConfigEntry, 'name' | 'rules'>;

export class ConfigEntryBuilder<RulesPrefix extends string> {
  constructor(
    private readonly options: ConfigSharedOptions<RulesPrefix>,
    private readonly internalOptions: InternalConfigOptions,
  ) {}

  private readonly configs: FlatConfigEntry[] = [];
  private readonly configsDict = new Map<string, FlatConfigEntry>();

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
      ...(internalOptions.ignoreMarkdownCodeBlocks ? [GLOB_MARKDOWN_ALL_CODE_BLOCKS] : []),
      ...(internalOptions.includeDefaultFilesAndIgnores ? configOptions.ignores || [] : []),
    ];

    const configFinal: FlatConfigEntry = {
      ...(files.length > 0 && {files}),
      ...(ignores.length > 0 && {ignores}),
      ...config,
      name: configName,
    };

    this.configs.push(configFinal);
    this.configsDict.set(configName, configFinal);

    const generateAddRuleFn =
      // prettier-ignore
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
      <AllowAnyRule extends boolean>() =>
      <
        RuleName extends AllowAnyRule extends true
          ? keyof AllEslintRules
          : keyof AllRulesWithPrefix<RulesPrefix>,
        Severity extends RuleSeverity,
      >(
        ruleName: RuleName,
        severity: Severity,
        ruleOptions?: GetRuleOptions<RuleName>,
        options?: {
          overrideBaseRule?: boolean | keyof AllEslintRules;
          disableAutofix?: boolean;
        },
      ) => {
        const errorsInsteadOfWarnings = this.internalOptions.globalOptions?.errorsInsteadOfWarnings;
        const severityFinal: RuleSeverity =
        (configOptions.forceSeverity as RuleSeverity | undefined)??
          (severity === WARNING &&
          (errorsInsteadOfWarnings === true ||
            (Array.isArray(errorsInsteadOfWarnings) && errorsInsteadOfWarnings.includes(ruleName)))
            ? ERROR
            : severity);
        const ruleNameFinal = `${options?.disableAutofix ? 'disable-autofix/' : ''}${ruleName}`;
        (configFinal.rules ||= {})[ruleNameFinal] = [severityFinal, ...(ruleOptions || [])];
        if (options?.disableAutofix) {
          // @ts-expect-error "Expression produces a union type that is too complex to represent."
          (configFinal.rules ||= {})[ruleName] = 0 /* Off */;
        }
        if (options?.overrideBaseRule) {
          const baseRuleName = typeof options.overrideBaseRule === 'string' ? options.overrideBaseRule : ruleName.split('/').slice(1).join('/');
          if (baseRuleName) {
            (configFinal.rules ||= {})[baseRuleName] = 0 /* Off */;
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return result;
      };

    const result = {
      config: configFinal,
      addRule: generateAddRuleFn<false>(),
      addAnyRule: generateAddRuleFn<true>(),
      addOverrides: () => {
        Object.assign((configFinal.rules ||= {}), this.options.overrides);
        return result;
      },
      addBulkRules: (rules: AllRulesWithPrefix<RulesPrefix> | FalsyValue) => {
        Object.assign((configFinal.rules ||= {}), rules);
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
