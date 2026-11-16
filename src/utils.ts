import crypto from 'node:crypto';
import path from 'node:path';
import url from 'node:url';
import {type StyleTextOptions, styleText as styleTextOriginal} from 'node:util';
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
import {coerce, satisfies} from 'verkit';
import type {Falsy, Nullable} from './types';

export {
  allUnionMembers,
  type AllUnionMembers,
  arrayDifference,
  arrayFindDuplicates,
  arrayify,
  arrayIncludes,
  arrayIsSubset,
  arrayLast,
  arrayMap,
  arrayPartition,
  arrayUnion,
  arrayUnique,
  arrayWithoutFalsy,
  attempt,
  callAll,
  capitalize,
  cartesianProduct,
  castToSafe,
  castToWritableUnsafe,
  cloneDeep,
  getByPath,
  getErrorMessage,
  identity,
  interopDefault,
  invariant,
  isArray,
  isEmptyValue,
  isKeyIn,
  isPlainObject,
  isSafeRelativePath,
  jsonParseSafe,
  keyedBy,
  mapEntries,
  mapGetOrInsert,
  mapGetOrInsertComputed,
  mapKeys,
  mapMapValues,
  mapValues,
  type MaybeArray,
  type MaybeFn,
  maybeCall,
  memoize,
  Mutex,
  objectEntriesUnsafe,
  objectFromKeys,
  objectHasOwn,
  objectKeysUnsafe,
  omit,
  once,
  parseNpmPackageSpecifier,
  pick,
  regexEscape,
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

/**
 * Like the function from `node:util`, but checks stderr instead of stdout by default to decide
 * whether to use colors: the logger's warnings and errors and the debug output are printed there.
 * Pass another stream if the text is printed elsewhere
 */
export const styleText = (...[format, text, options]: Parameters<typeof styleTextOriginal>) =>
  styleTextOriginal(format, text, {...options, stream: options?.stream || process.stderr});

const generateStyleFn =
  (format: Parameters<typeof styleText>[0]) => (text: string, options?: StyleTextOptions) =>
    styleText(format, text, options);

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

export const isNonEmptyArray = <Item>(value?: readonly Item[] | null): value is [Item, ...Item[]] =>
  arrayHasMinElements(value || [], 1);

export function findArrayInversions<Item>(
  array: readonly Item[],
  compareFn: (a: Item, b: Item) => number,
): readonly (readonly [Item, Item])[];
export function findArrayInversions<Item>(
  array: readonly Item[],
  compareFn: (a: Item, b: Item) => number,
  shouldGroup: true,
): ReadonlyMap<Item, readonly Item[]>;
export function findArrayInversions<Item>(
  array: readonly Item[],
  compareFn: (a: Item, b: Item) => number,
  shouldGroup?: boolean,
): readonly (readonly [Item, Item])[] | ReadonlyMap<Item, readonly Item[]> {
  const result: (readonly [Item, Item])[] = [];
  const addedPairsCompoundIndexes = new Set<`${number}-${number}`>();

  array
    .map((value, index) => ({value, index}))
    .sort((a, b) => {
      const aIndex = a.index;
      const bIndex = b.index;

      /* v8 ignore start The comparator argument order is implementation-defined */
      const aForComparator = (aIndex < bIndex ? a : b).value;
      const bForComparator = (aIndex < bIndex ? b : a).value;
      /* v8 ignore stop */
      const comparatorResult = compareFn(aForComparator, bForComparator);

      if (comparatorResult === 1) {
        /* v8 ignore next */
        const pairIndex =
          aIndex < bIndex ? (`${aIndex}-${bIndex}` as const) : (`${bIndex}-${aIndex}` as const);
        /* v8 ignore else Reachability depends on the engine's sort algorithm: V8's TimSort does compare the same pair twice, while a plain insertion sort never does */
        if (!addedPairsCompoundIndexes.has(pairIndex)) {
          addedPairsCompoundIndexes.add(pairIndex);
          result.push([aForComparator, bForComparator]);
        }
      }

      /* v8 ignore next */
      return aIndex < bIndex ? comparatorResult : -comparatorResult;
    });

  if (shouldGroup) {
    const resultMap = new Map<Item, Item[]>();
    result.forEach(([key, value]) => {
      mapGetOrInsert(resultMap, key, []).push(value);
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

// TODO should report?
// eslint-disable-next-line ts/no-redundant-type-constituents -- False positive
export const joinPaths = (...paths: readonly (string | Falsy)[]) =>
  path.posix.join(...arrayWithoutFalsy(paths));

/**
 * Whether the version is at least the minimum one
 */
export const isVersionAtLeast = (version: number | string, minimumVersion: string) => {
  const versionCoerced = coerce(String(version));
  return versionCoerced != null && satisfies(versionCoerced, `>=${minimumVersion}`);
};

export const readAndParseJson = async <Result>(
  filePath: string | URL | undefined,
): Promise<Result | null> =>
  filePath
    ? jsonParseSafe<Result | null>(
        await readFileSafe(typeof filePath === 'string' ? filePath : url.fileURLToPath(filePath)),
      )
    : null;

export function getKeysOfTruthyValues<
  ObjectOrArray extends string[] | Partial<Record<string, boolean | string>>,
>(objectOrArray: Nullable<ObjectOrArray>): (keyof ObjectOrArray & string)[];
export function getKeysOfTruthyValues<
  ObjectOrArray extends string[] | Partial<Record<string, boolean | string>>,
>(
  objectOrArray: Nullable<ObjectOrArray>,
  mode: 'nonEmptyArray',
): [keyof ObjectOrArray & string, ...(keyof ObjectOrArray & string)[]] | undefined;
export function getKeysOfTruthyValues<
  ObjectOrArray extends string[] | Partial<Record<string, boolean | string>>,
>(objectOrArray: Nullable<ObjectOrArray>, mode: 'object'): Exclude<ObjectOrArray, string[]>;
export function getKeysOfTruthyValues<
  ObjectOrArray extends string[] | Partial<Record<string, boolean | string>>,
>(objectOrArray: Nullable<ObjectOrArray>, mode?: 'array' | 'nonEmptyArray' | 'object') {
  if (Array.isArray(objectOrArray)) {
    return mode === 'nonEmptyArray' && objectOrArray.length === 0
      ? undefined
      : // eslint-disable-next-line un/no-typeof-like-comparisons -- Not the `typeof` comparison
        mode === 'object'
        ? objectFromKeys(objectOrArray, () => true)
        : objectOrArray;
  }

  const result = objectEntriesUnsafe(
    // eslint-disable-next-line ts/no-non-null-assertion, ts/no-unnecessary-condition -- For correct types
    objectOrArray! || {},
  ).filter(([, value]) => value);
  if (mode === 'nonEmptyArray' && result.length === 0) {
    // eslint-disable-next-line unicorn/no-useless-undefined -- The nonempty-array overload uses undefined for an empty result
    return undefined;
  }
  // eslint-disable-next-line un/no-typeof-like-comparisons -- Not the `typeof` comparison
  return mode === 'object' ? Object.fromEntries(result) : result.map(([key]) => key);
}
