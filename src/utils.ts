import type Eslint from 'eslint';
import {ERROR, OFF, WARNING} from './constants';
import type {InternalConfigOptions} from './types';

export const genFlatConfigEntryName = (name: string) => `eslint-config-un/${name}`;

export const genRuleOverrideFn =
  <Prefix extends string>(prefix: Prefix) =>
  <
    BaseRuleName extends string,
    Severity extends Eslint.Linter.Severity,
    Options extends unknown[] = unknown[],
  >(
    baseRuleName: BaseRuleName,
    severity: Severity,
    ...options: Options
  ) =>
    ({
      [baseRuleName]: OFF,
      [`${prefix}/${baseRuleName}`]: [severity, ...options],
    }) as {[Key in BaseRuleName]: typeof OFF} & {
      [Key in `${Prefix}/${BaseRuleName}`]: [Severity, ...Options];
    };

export const disableAutofixForRule = genRuleOverrideFn('disable-autofix');

export const createPluginObjectRenamer = (from: string, to: string) => {
  const fromRegex = new RegExp(`^${from}/`);

  return <T extends Record<string, unknown>>(object: T): T =>
    Object.fromEntries(
      Object.entries(object).map(([ruleName, v]) => [ruleName.replace(fromRegex, `${to}/`), v]),
    ) as T;
};

export const assignOptions = <T>(options: T, key: keyof T) => ({
  ...(typeof options[key] === 'object' && options[key]),
});

export const warnUnlessForcedError = <Options extends unknown[] = unknown[]>(
  internalOptions: InternalConfigOptions,
  rule: string,
  ...options: Options
) => {
  const {errorsInsteadOfWarnings} = internalOptions.globalOptions || {};
  const level =
    errorsInsteadOfWarnings === true ||
    (Array.isArray(errorsInsteadOfWarnings) && errorsInsteadOfWarnings.includes(rule))
      ? ERROR
      : WARNING;
  return {
    [rule]: [level, ...options],
  } as const;
};

export type MaybeArray<T> = T | T[];
export const arraify = <T>(value?: MaybeArray<T> | null | undefined): T[] =>
  Array.isArray(value) ? value : value == null ? [] : [value];
