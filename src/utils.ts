import path from 'node:path';
import {objectEntries as objectEntriesUnsafe} from '@antfu/utils';
import {getPackageInfo, isPackageExists} from 'local-pkg';
import type {FalsyValue, Promisable} from './types';

export {objectEntries as objectEntriesUnsafe, objectKeys as objectKeysUnsafe} from '@antfu/utils';

export {defu as assignDefaults} from 'defu';

export {klona as cloneDeep} from 'klona';

export {invert as invertObject, mapKeys, memoize} from 'es-toolkit';

export const assignOptions = <T>(options: T, key: keyof T) => ({
  ...(typeof options[key] === 'object' && options[key]),
});

export type MaybeArray<T> = T | T[];
export const arraify = <T>(value?: MaybeArray<T> | null): T[] =>
  Array.isArray(value) ? value : value == null ? [] : [value];

export const isNonEmptyArray = <T>(value?: T[] | null): value is [T, ...T[]] =>
  Array.isArray(value) && value.length > 0;

// eslint-disable-next-line ts/no-redundant-type-constituents
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

export const fetchPackageInfo = async (
  packageName: string,
): Promise<{
  info: Awaited<ReturnType<typeof getPackageInfo>> & {};
  versions: {
    full: string;
    major: number | null;
    majorAndMinor: number | null;
  };
} | null> => {
  const packageInfo = await getPackageInfo(packageName);
  if (!packageInfo) {
    return null;
  }

  const fullVersion = packageInfo.version || '';

  const majorVersionRaw = Number.parseInt(fullVersion, 10);
  const majorVersion = Number.isNaN(majorVersionRaw) ? null : majorVersionRaw;

  const majorAndMinorVersionRaw = Number.parseFloat(fullVersion);
  const majorAndMinorVersion = Number.isNaN(majorAndMinorVersionRaw)
    ? null
    : majorAndMinorVersionRaw;

  return {
    info: packageInfo,
    versions: {
      full: fullVersion,
      major: majorVersion,
      majorAndMinor: majorAndMinorVersion,
    },
  };
};

export const doesPackageExist = (packageName: string) =>
  Promise.resolve(isPackageExists(packageName));

export function interopDefault<T>(module: Promisable<T | {default: T}>): Promise<T>;
export function interopDefault<T>(
  module: Promisable<T | {default: T}>,
  ignoreErrors: MaybeArray<string>,
): Promise<T | null>;
export async function interopDefault<T>(
  module: Promisable<T | {default: T}>,
  ignoreErrors?: MaybeArray<string>,
): Promise<T | null> {
  try {
    const resolvedModule = await module;
    // TODO report?
    // eslint-disable-next-line ts/no-unnecessary-condition
    return resolvedModule && typeof resolvedModule === 'object' && 'default' in resolvedModule
      ? resolvedModule.default
      : resolvedModule;
  } catch (error: unknown) {
    const ignoreErrorsArray = arraify(ignoreErrors);
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      typeof error.code === 'string' &&
      ignoreErrorsArray.includes(error.code)
    ) {
      return null;
    }
    throw error;
  }
}

export function getKeysOfTruthyValues<T extends Record<string, boolean>>(object: T): (keyof T)[];
export function getKeysOfTruthyValues<T extends Record<string, unknown>>(
  object: T,
  requireAtLeastOneTruthyValue: true,
): [keyof T, ...(keyof T)[]] | undefined;
export function getKeysOfTruthyValues<T extends Record<string, unknown>>(
  object: T,
  requireAtLeastOneTruthyValue?: boolean,
) {
  const result = objectEntriesUnsafe(object)
    .filter(([, value]) => value)
    .map(([key]) => key);
  if (requireAtLeastOneTruthyValue && result.length === 0) {
    // eslint-disable-next-line disable-autofix/unicorn/no-useless-undefined
    return undefined;
  }
  return result;
}
