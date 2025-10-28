import fs from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';
import {objectEntries as objectEntriesUnsafe} from '@antfu/utils';
import {createDefu, type defu} from 'defu';
import {destr as jsonParse} from 'destr';
import {resolve as resolvePackage} from 'import-meta-resolve';
import {getLastResolvedPackageJsonUrl} from 'import-meta-resolve/resolve';
import * as R from 'remeda';
import type {PackageJson} from 'zod-package-json';
import type {FalsyValue, Promisable} from './types';

export {styleText} from 'node:util';

export {objectEntries as objectEntriesUnsafe, objectKeys as objectKeysUnsafe} from '@antfu/utils';

export {klona as cloneDeep} from 'klona';

export {
  capitalize,
  groupBy,
  memoize,
  omit,
  partition,
  pick,
  pickBy,
  uniq as unique,
  uniqBy as uniqueBy,
} from 'es-toolkit';

export const assignDefaults = createDefu((object, key, value) => {
  if (Array.isArray(object[key]) && Array.isArray(value)) {
    // @ts-expect-error this is fine
    object[key] = [...value];
    return true;
  }
  return false;
}) as typeof defu;

export type MaybeArray<T> = T | T[];
export const arraify = <T>(value?: MaybeArray<T> | null): T[] =>
  Array.isArray(value) ? value : value == null ? [] : [value];

export const isNonEmptyArray = <T>(value?: T[] | null): value is [T, ...T[]] =>
  Array.isArray(value) && value.length > 0;

export const arrayMap = R.map;

export function findArrayInversions<T>(array: T[], compareFn: (a: T, b: T) => number): [T, T][];
export function findArrayInversions<T>(
  array: T[],
  compareFn: (a: T, b: T) => number,
  group: true,
): Map<T, T[]>;
export function findArrayInversions<T>(
  array: T[],
  compareFn: (a: T, b: T) => number,
  group?: boolean,
): [T, T][] | Map<T, T[]> {
  const result: [T, T][] = [];
  const addedPairsCompoundIndexes = new Set<`${number}-${number}`>();

  array
    .map((value, index) => ({value, index}))
    .sort((a, b) => {
      const aIndex = a.index;
      const bIndex = b.index;

      const aForComparator = aIndex < bIndex ? a.value : b.value;
      const bForComparator = aIndex < bIndex ? b.value : a.value;
      const comparatorResult = compareFn(aForComparator, bForComparator);

      if (comparatorResult === 1) {
        const pairIndex =
          aIndex < bIndex ? (`${aIndex}-${bIndex}` as const) : (`${bIndex}-${aIndex}` as const);
        if (!addedPairsCompoundIndexes.has(pairIndex)) {
          addedPairsCompoundIndexes.add(pairIndex);
          result.push([aForComparator, bForComparator]);
        }
      }

      return aIndex < bIndex ? comparatorResult : -comparatorResult;
    });

  if (group) {
    const resultMap = new Map<T, T[]>();
    result.forEach(([a, b]) => {
      resultMap.set(a, [...(resultMap.get(a) || []), b]);
    });
    return resultMap;
  }

  return result;
}

// eslint-disable-next-line ts/no-redundant-type-constituents
export const joinPaths = (...paths: (string | FalsyValue)[]) =>
  // eslint-disable-next-line unicorn/prefer-native-coercion-functions
  path.posix.join(...arraify(paths).filter((v): v is string => Boolean(v)));

export type MaybeFn<Args extends readonly unknown[], ReturnType> =
  | ((...args: Args) => ReturnType)
  | ReturnType;

export const maybeCall = <Args extends readonly unknown[], ReturnType>(
  fnOrValue: MaybeFn<Args, ReturnType>,
  ...args: Args
): ReturnType =>
  typeof fnOrValue === 'function'
    ? (fnOrValue as (...args: Args) => ReturnType)(...args)
    : fnOrValue;

export const fetchPackageInfo = async (
  packageName: string,
): Promise<{
  info: PackageJson;
  versions: {
    full: string;
    major: number | null;
    majorAndMinor: number | null;
  };
} | null> => {
  // `getPackageInfo` from `local-pkg` isn't always able to find the correct package.json: https://github.com/antfu-collective/local-pkg/issues/16
  // This trick uses the patched version of `import-meta-resolve` that after calling `resolvePackage` updates the last resolved package's package.json path
  try {
    resolvePackage(packageName, import.meta.url);
  } catch {
    // If module is not resolved, the error is thrown
  }
  const packageJsonUrl = getLastResolvedPackageJsonUrl();

  const packageInfo = packageJsonUrl
    ? jsonParse<PackageJson>(await fs.readFile(url.fileURLToPath(packageJsonUrl), 'utf8'))
    : null;
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

export const doesPackageExist = (packageName: string): Promise<boolean> => {
  let exists = true;
  try {
    resolvePackage(packageName, import.meta.url);
  } catch {
    exists = false;
  }
  return Promise.resolve(exists);
};

export const interopDefault = async <T>(module: Promisable<T | {default: T}>): Promise<T> => {
  const resolvedModule = await module;
  // TODO report?
  // eslint-disable-next-line ts/no-unnecessary-condition
  return resolvedModule && typeof resolvedModule === 'object' && 'default' in resolvedModule
    ? resolvedModule.default
    : resolvedModule;
};

export function getKeysOfTruthyValues<T extends Record<string, boolean>>(
  object: T,
): (keyof T & string)[];
export function getKeysOfTruthyValues<T extends Record<string, boolean>>(
  object: T,
  requireAtLeastOneTruthyValue: true,
): [keyof T & string, ...(keyof T & string)[]] | undefined;
export function getKeysOfTruthyValues<T extends Record<string, boolean>>(
  object: T,
  requireAtLeastOneTruthyValue?: boolean,
) {
  const result = objectEntriesUnsafe(object)
    .filter(([, value]) => value)
    .map(([key]) => key);
  if (requireAtLeastOneTruthyValue && result.length === 0) {
    // eslint-disable-next-line unicorn/no-useless-undefined
    return undefined;
  }
  return result;
}

export const isIn = <T extends object>(key: PropertyKey, object: T): key is keyof T =>
  key in object;
