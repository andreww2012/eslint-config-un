import path from 'node:path';
import {
  ERROR,
  GLOB_MARKDOWN,
  GLOB_MARKDOWN_ALL_CODE_BLOCKS,
  type RuleSeverity,
  WARNING,
} from './constants';
import type {
  AllEslintRules,
  AllRulesWithPrefix,
  ConfigSharedOptions,
  FlatConfigEntry,
  GetRuleOptions,
  InternalConfigOptions,
} from './types/eslint';
import type {FalsyValue} from './types/utils';

export {objectEntries as objectEntriesUnsafe, objectKeys as objectKeysUnsafe} from '@antfu/utils';

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

export const assignOptions = <T>(options: T, key: keyof T) => ({
  ...(typeof options[key] === 'object' && options[key]),
});

export type MaybeArray<T> = T | T[];
export const arraify = <T>(value?: MaybeArray<T> | null): T[] =>
  Array.isArray(value) ? value : value == null ? [] : [value];

export const isNonEmptyArray = <T>(value?: T[] | null): value is [T, ...T[]] =>
  Array.isArray(value) && value.length > 0;

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export const joinPaths = (...paths: (string | FalsyValue)[]) =>
  // eslint-disable-next-line unicorn/prefer-native-coercion-functions
  path.posix.join(...arraify(paths).filter((v): v is string => Boolean(v)));

export type MaybeFn<ReturnType, Args extends readonly unknown[] = []> =
  | ((...args: Args) => ReturnType)
  | ReturnType;

export const maybeCall = <ReturnType = unknown, Args extends readonly unknown[] = []>(
  fnOrValue: MaybeFn<ReturnType, Args>,
  ...args: Args
): ReturnType =>
  typeof fnOrValue === 'function'
    ? (fnOrValue as (...args: Args) => ReturnType)(...args)
    : fnOrValue;

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
          overrideBaseRule?: boolean;
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
          const baseRuleName = ruleName.split('/').slice(1).join('/');
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
