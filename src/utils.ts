import path from 'node:path';
import {objectEntries as objectEntriesUnsafe} from '@antfu/utils';
import type {getPackageInfoSync} from 'local-pkg';
import type {FalsyValue} from './types';

export {objectEntries as objectEntriesUnsafe, objectKeys as objectKeysUnsafe} from '@antfu/utils';

export {defu as assignDefaults} from 'defu';

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

export type PackageInfo = ReturnType<typeof getPackageInfoSync>;

export const getPackageMajorVersion = (packageInfo: PackageInfo) => {
  const majorVersion = Number.parseInt(packageInfo?.version || '', 10);
  return Number.isNaN(majorVersion) ? null : majorVersion;
};

export const getPackageSemverVersion = (packageInfo: PackageInfo) => {
  const majorVersion = Number.parseFloat(packageInfo?.version || '');
  return Number.isNaN(majorVersion) ? null : majorVersion;
};

export const interopDefault = <T>(module: T | {default: T}) =>
  module && typeof module === 'object' && 'default' in module ? module.default : module;

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
