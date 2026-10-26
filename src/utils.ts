import crypto from 'node:crypto';
import path from 'node:path';
import url from 'node:url';
import {styleText} from 'node:util';
import {isInEditor as isInEditorOriginal} from 'is-in-editor';
import {
  arrayHasMinElements,
  arrayWithoutFalsy,
  jsonParseSafe,
  mapGetOrInsert,
  objectEntriesUnsafe,
  objectFromKeys,
} from 'utilery';
import {readFileSafe} from 'utilery/server';
import type {Falsy, Nullable} from './types';

export {
  allUnionMembers,
  type AllUnionMembers,
  arrayDifference,
  arrayify,
  arrayIncludes,
  arrayLast,
  arrayMap,
  arrayPartition,
  arrayUnion,
  arrayUnique,
  arrayWithoutFalsy,
  capitalize,
  castToSafe,
  castToWritableUnsafe,
  cloneDeep,
  getByPath,
  getErrorMessage,
  identity,
  interopDefault,
  isKeyIn,
  isPlainObject,
  jsonParseSafe,
  mapGetOrInsert,
  mapGetOrInsertComputed,
  mapKeys,
  mapValues,
  type MaybeArray,
  type MaybeFn,
  maybeCall,
  memoize,
  Mutex,
  objectEntriesUnsafe,
  objectFromKeys,
  objectKeysUnsafe,
  omit,
  once,
  parseNpmPackageSpecifier,
  pick,
  setByPath,
  substringAfter,
  substringAfterLast,
  substringBefore,
  toForwardSlashes,
  toKebabCase,
  traverseForEach,
} from 'utilery';

export {exec, isNodeError, pathExists, readFileSafe, writeJsonFile} from 'utilery/server';

export const isInEditor = () => isInEditorOriginal({mode: 'strict'});

export {isCI as isInCi} from 'ci-info';

const generateStyleFn = (color: Parameters<typeof styleText>[0]) => (string: string) =>
  styleText(color, string);

export {styleText} from 'node:util';

export const styleConfigName = generateStyleFn('magenta');
export const stylePackageName = generateStyleFn('yellow');
export const stylePluginPrefix = generateStyleFn('blue');
export const styleRuleName = generateStyleFn('green');

export const isObject = (value: unknown): value is object =>
  typeof value === 'object' && value != null && !Array.isArray(value);

export {
  type ArrayOrBooleanRecord,
  mergeArrayOrBooleanRecords,
} from './utils/array-or-boolean-record';
export {assignDefaults} from './utils/assign-defaults';

export const isNonEmptyArray = <T>(value?: readonly T[] | null): value is [T, ...T[]] =>
  arrayHasMinElements(value || [], 1);

export function findArrayInversions<T>(
  array: readonly T[],
  compareFn: (a: T, b: T) => number,
): readonly (readonly [T, T])[];
export function findArrayInversions<T>(
  array: readonly T[],
  compareFn: (a: T, b: T) => number,
  // eslint-disable-next-line unicorn/consistent-boolean-name
  group: true,
): ReadonlyMap<T, readonly T[]>;
export function findArrayInversions<T>(
  array: readonly T[],
  compareFn: (a: T, b: T) => number,
  // eslint-disable-next-line unicorn/consistent-boolean-name
  group?: boolean,
): readonly (readonly [T, T])[] | ReadonlyMap<T, readonly T[]> {
  const result: (readonly [T, T])[] = [];
  const addedPairsCompoundIndexes = new Set<`${number}-${number}`>();

  array
    .map((value, index) => ({value, index}))
    .sort((a, b) => {
      const aIndex = a.index;
      const bIndex = b.index;

      /* v8 ignore start - The comparator argument order is implementation-defined */
      const aForComparator = (aIndex < bIndex ? a : b).value;
      const bForComparator = (aIndex < bIndex ? b : a).value;
      /* v8 ignore stop */
      const comparatorResult = compareFn(aForComparator, bForComparator);

      if (comparatorResult === 1) {
        /* v8 ignore next */
        const pairIndex =
          aIndex < bIndex ? (`${aIndex}-${bIndex}` as const) : (`${bIndex}-${aIndex}` as const);
        /* v8 ignore else - Reachability depends on the engine's sort algorithm: V8's TimSort does compare the same pair twice, while a plain insertion sort never does */
        if (!addedPairsCompoundIndexes.has(pairIndex)) {
          addedPairsCompoundIndexes.add(pairIndex);
          result.push([aForComparator, bForComparator]);
        }
      }

      /* v8 ignore next */
      return aIndex < bIndex ? comparatorResult : -comparatorResult;
    });

  if (group) {
    const resultMap = new Map<T, T[]>();
    result.forEach(([a, b]) => {
      mapGetOrInsert(resultMap, a, []).push(b);
    });
    return resultMap;
  }

  return result;
}

export const sha256 = (input: string | Buffer) => {
  const hashInstance = crypto.createHash('sha256');
  if (typeof input === 'string') {
    hashInstance.update(input, 'utf8');
  } else {
    hashInstance.update(input);
  }
  return hashInstance.digest('hex');
};

// eslint-disable-next-line ts/no-redundant-type-constituents
export const joinPaths = (...paths: readonly (string | Falsy)[]) =>
  path.posix.join(...arrayWithoutFalsy(paths));

export const readAndParseJson = async <T>(filePath: string | URL | undefined): Promise<T | null> =>
  filePath
    ? jsonParseSafe<T | null>(
        await readFileSafe(typeof filePath === 'string' ? filePath : url.fileURLToPath(filePath)),
      )
    : null;

export function getKeysOfTruthyValues<
  T extends string[] | Partial<Record<string, boolean | string>>,
>(objectOrArray: Nullable<T>): (keyof T & string)[];
export function getKeysOfTruthyValues<
  T extends string[] | Partial<Record<string, boolean | string>>,
>(
  objectOrArray: Nullable<T>,
  mode: 'nonEmptyArray',
): [keyof T & string, ...(keyof T & string)[]] | undefined;
export function getKeysOfTruthyValues<
  T extends string[] | Partial<Record<string, boolean | string>>,
>(objectOrArray: Nullable<T>, mode: 'object'): Exclude<T, string[]>;
export function getKeysOfTruthyValues<
  T extends string[] | Partial<Record<string, boolean | string>>,
>(objectOrArray: Nullable<T>, mode?: 'array' | 'nonEmptyArray' | 'object') {
  if (Array.isArray(objectOrArray)) {
    return mode === 'nonEmptyArray' && objectOrArray.length === 0
      ? undefined
      : // eslint-disable-next-line un/no-typeof-like-comparisons
        mode === 'object'
        ? objectFromKeys(objectOrArray, () => true)
        : objectOrArray;
  }

  const result = objectEntriesUnsafe(
    // eslint-disable-next-line ts/no-non-null-assertion, ts/no-unnecessary-condition -- for correct types
    objectOrArray! || {},
  ).filter(([, value]) => value);
  if (mode === 'nonEmptyArray' && result.length === 0) {
    // eslint-disable-next-line unicorn/no-useless-undefined
    return undefined;
  }
  // eslint-disable-next-line un/no-typeof-like-comparisons
  return mode === 'object' ? Object.fromEntries(result) : result.map(([key]) => key);
}
