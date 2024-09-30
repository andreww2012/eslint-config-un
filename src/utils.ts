import path from 'node:path';
import {ERROR, type RuleSeverity, WARNING} from './constants';
import type {FalsyValue} from './type-utils';
import type {
  AllEslintRules,
  AllRulesWithPrefix,
  ConfigSharedOptions,
  FlatConfigEntry,
  GetRuleOptions,
  InternalConfigOptions,
} from './types';

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
export const joinPaths = (paths: string | (string | FalsyValue)[] | FalsyValue) =>
  // eslint-disable-next-line unicorn/prefer-native-coercion-functions
  path.posix.join(...arraify(paths).filter((v): v is string => Boolean(v)));

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
          },
        ],
    config?: FlatConfigEntryForBuilder,
  ) {
    const [name, internalOptions = {}] =
      typeof nameAndMaybeOptions === 'string' ? [nameAndMaybeOptions, {}] : nameAndMaybeOptions;
    const {options: configOptions} = this;
    const configName = genFlatConfigEntryName(name);
    const configFinal: FlatConfigEntry = {
      ...(internalOptions.includeDefaultFilesAndIgnores && {
        ...(configOptions.files && {files: configOptions.files}),
        ...(configOptions.ignores && {ignores: configOptions.ignores}),
      }),
      ...config,
      name: configName,
      rules: {},
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
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        configFinal.rules![ruleNameFinal] = [severityFinal, ...(ruleOptions || [])];
        if (options?.disableAutofix) {
          // @ts-expect-error "Expression produces a union type that is too complex to represent."
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          configFinal.rules![ruleName] = 0 /* Off */;
        }
        if (options?.overrideBaseRule) {
          const baseRuleName = ruleName.split('/').slice(1).join('/');
          if (baseRuleName) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            configFinal.rules![baseRuleName] = 0 /* Off */;
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
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        Object.assign(configFinal.rules!, this.options.overrides);
        return result;
      },
      addBulkRules: (rules: AllRulesWithPrefix<RulesPrefix> | FalsyValue) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        Object.assign(configFinal.rules!, rules);
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
